import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { Types } from 'mongoose';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { RefreshSessionModel } from '../../models/refreshSession.model.js';
import { UserModel } from '../../models/user.model.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';

// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

/** Safe user shape returned by the API (passwordHash is never present). */
interface SafeUserShape {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface ListData {
  admins: SafeUserShape[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asUser(body: unknown): SafeUserShape {
  return (body as { data: { user: SafeUserShape } }).data.user;
}

function asList(body: unknown): ListData {
  return (body as { data: ListData }).data;
}

function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

describeDb('Admin management API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  let superAdminId = '';
  const trackedIds: string[] = [];

  function uniqueEmail(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  }

  /** Creates a user directly in MongoDB (used for the SUPER_ADMIN and the ADMIN). */
  async function createUser(
    role: 'SUPER_ADMIN' | 'ADMIN',
  ): Promise<{ id: string; email: string }> {
    const email = uniqueEmail(`admin-db-${role.toLowerCase()}`);
    const user = await UserModel.create({
      name: `DB Test ${role}`,
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role,
      status: 'ACTIVE',
    });
    trackedIds.push(user.id);
    return { id: user.id, email };
  }

  /** Authenticates through the real login flow and returns the cookie header. */
  async function loginCookies(email: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    assert.equal(res.status, 200, 'login must succeed for an ACTIVE test user');
    return res.headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ');
  }

  /** Sends a request; cookies are only attached when provided (default: anonymous). */
  async function request(
    path: string,
    init: RequestInit = {},
    cookieHeader?: string,
  ): Promise<ApiResult> {
    const headers = new Headers(init.headers);
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
    if (init.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  }

  /** Creates an admin through the real API as the SUPER_ADMIN; tracks the id. */
  async function createAdminViaApi(
    overrides: Record<string, unknown> = {},
  ): Promise<SafeUserShape> {
    const result = await request(
      '/api/v1/admins',
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'API Created Admin',
          email: uniqueEmail('api-admin'),
          password: TEST_PASSWORD,
          ...overrides,
        }),
      },
      superCookies,
    );
    assert.equal(result.status, 201, `create admin expected 201, got ${result.status}`);
    const user = asUser(result.body);
    trackedIds.push(user.id);
    return user;
  }

  before(async () => {
    await connectToDatabase();
    await UserModel.init();
    await RefreshSessionModel.init();
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    const superAdmin = await createUser('SUPER_ADMIN');
    superAdminId = superAdmin.id;
    superCookies = await loginCookies(superAdmin.email);
  });

  after(async () => {
    if (trackedIds.length > 0) {
      await RefreshSessionModel.deleteMany({ userId: { $in: trackedIds } });
      await UserModel.deleteMany({ _id: { $in: trackedIds } });
    }
    // The cleanup must be complete: every user/session this suite created is gone.
    const remainingUsers = await UserModel.countDocuments({ _id: { $in: trackedIds } });
    const remainingSessions = await RefreshSessionModel.countDocuments({
      userId: { $in: trackedIds },
    });
    assert.equal(remainingUsers, 0, 'all test users must be cleaned up');
    assert.equal(remainingSessions, 0, 'all test refresh sessions must be cleaned up');

    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  });

  it('rejects an unauthenticated request with 401', async () => {
    const result = await request('/api/v1/admins');
    assert.equal(result.status, 401);
    assert.equal(asError(result.body).message, 'Authentication required.');
  });

  it('rejects an ADMIN with 403 on admin management', async () => {
    const admin = await createUser('ADMIN');
    const adminCookies = await loginCookies(admin.email);

    const create = await request(
      '/api/v1/admins',
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Nope',
          email: uniqueEmail('nope'),
          password: TEST_PASSWORD,
        }),
      },
      adminCookies,
    );
    assert.equal(create.status, 403);
    assert.equal(asError(create.body).message, 'Insufficient permissions.');

    const list = await request('/api/v1/admins', {}, adminCookies);
    assert.equal(list.status, 403);
  });

  it('creates an ADMIN with role ADMIN and status ACTIVE (no passwordHash)', async () => {
    // Unique base + surrounding whitespace + mixed case: proves normalization
    // while staying collision-free across parallel test-suite runs.
    const rawEmail = ` New.Admin-${Date.now()}-${Math.random().toString(36).slice(2)}@Example.Test `;
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const result = await request(
      '/api/v1/admins',
      {
        method: 'POST',
        body: JSON.stringify({
          name: '  New Admin  ',
          email: rawEmail,
          password: TEST_PASSWORD,
        }),
      },
      superCookies,
    );

    assert.equal(result.status, 201);
    const user = asUser(result.body);
    // Track immediately (before the remaining assertions) so a failure here can
    // never leak an untracked test user past the after() cleanup.
    trackedIds.push(user.id);
    assert.equal(user.name, 'New Admin');
    assert.equal(user.email, normalizedEmail, 'email normalized like the schema');
    assert.equal(user.role, 'ADMIN');
    assert.equal(user.status, 'ACTIVE');
    assert.equal('passwordHash' in user, false);
    assert.equal(JSON.stringify(result.body).includes('passwordHash'), false);

    // The stored document has a real bcrypt hash - never the plaintext.
    const stored = await UserModel.findById(user.id).select('+passwordHash');
    assert.ok(stored);
    assert.equal(stored.role, 'ADMIN');
    assert.equal(stored.status, 'ACTIVE');
    assert.notEqual(stored.passwordHash, TEST_PASSWORD);
    assert.equal(await verifyPassword(TEST_PASSWORD, stored.passwordHash), true);
    assert.equal(await verifyPassword('wrong-password', stored.passwordHash), false);
  });

  it('ignores a client-supplied SUPER_ADMIN role', async () => {
    const created = await createAdminViaApi({ role: 'SUPER_ADMIN' });

    assert.equal(created.role, 'ADMIN');
    const stored = await UserModel.findById(created.id);
    assert.equal(stored?.role, 'ADMIN');
  });

  it('rejects a duplicate email with 409', async () => {
    const first = await createAdminViaApi();
    const duplicate = await request(
      '/api/v1/admins',
      {
        method: 'POST',
        body: JSON.stringify({
          name: 'Duplicate',
          email: first.email,
          password: TEST_PASSWORD,
        }),
      },
      superCookies,
    );

    assert.equal(duplicate.status, 409);
    assert.equal(asError(duplicate.body).message, 'An admin with this email already exists.');
  });

  it('lists only ADMIN users and supports pagination', async () => {
    const token = `page-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const first = await createAdminViaApi({
      name: 'Page Admin One',
      email: `${token}-one@example.test`,
    });
    const second = await createAdminViaApi({
      name: 'Page Admin Two',
      email: `${token}-two@example.test`,
    });

    const page1 = await request(`/api/v1/admins?search=${token}&limit=1`, {}, superCookies);
    assert.equal(page1.status, 200);
    const list1 = asList(page1.body);
    assert.equal(list1.admins.length, 1);
    assert.equal(list1.total, 2);
    assert.equal(list1.totalPages, 2);
    assert.equal(list1.page, 1);
    assert.equal(list1.limit, 1);
    const page1Admin = list1.admins[0];
    assert.ok(page1Admin, 'first page must contain an admin');
    assert.equal(page1Admin.role, 'ADMIN');

    const page2 = await request(`/api/v1/admins?search=${token}&page=2&limit=1`, {}, superCookies);
    const list2 = asList(page2.body);
    assert.equal(list2.admins.length, 1);
    const page2Admin = list2.admins[0];
    assert.ok(page2Admin, 'second page must contain an admin');
    const ids = [page1Admin.id, page2Admin.id].sort();
    assert.deepEqual(ids, [first.id, second.id].sort(), 'both admins appear across pages');

    // The unfiltered list contains only ADMIN accounts - never the SUPER_ADMIN.
    const all = await request('/api/v1/admins?limit=100', {}, superCookies);
    const allAdmins = asList(all.body).admins;
    assert.ok(allAdmins.length >= 2);
    assert.ok(allAdmins.every((admin) => admin.role === 'ADMIN'));
    assert.ok(
      !allAdmins.some((admin) => admin.id === superAdminId),
      'SUPER_ADMIN account must not be listed',
    );
  });

  it('filters admins by search and status', async () => {
    const token = `filter-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const created = await createAdminViaApi({ email: `${token}@example.test` });

    const byStatus = await request(
      `/api/v1/admins?search=${token}&status=INACTIVE`,
      {},
      superCookies,
    );
    assert.equal(asList(byStatus.body).total, 0);

    const found = await request(`/api/v1/admins?search=${token}`, {}, superCookies);
    const list = asList(found.body);
    assert.equal(list.total, 1);
    const foundAdmin = list.admins[0];
    assert.ok(foundAdmin, 'search must find the admin');
    assert.equal(foundAdmin.id, created.id);
  });

  it('gets a single admin', async () => {
    const created = await createAdminViaApi();

    const result = await request(`/api/v1/admins/${created.id}`, {}, superCookies);

    assert.equal(result.status, 200);
    const user = asUser(result.body);
    assert.equal(user.id, created.id);
    assert.equal(user.role, 'ADMIN');
    assert.equal('passwordHash' in user, false);
  });

  it('returns 400 for an invalid admin id', async () => {
    const get = await request('/api/v1/admins/not-an-id', {}, superCookies);
    assert.equal(get.status, 400);
    assert.equal(asError(get.body).message, 'Invalid admin id.');

    const status = await request(
      '/api/v1/admins/not-an-id/status',
      { method: 'PATCH', body: JSON.stringify({ status: 'ACTIVE' }) },
      superCookies,
    );
    assert.equal(status.status, 400);
  });

  it('returns 404 for an unknown admin id', async () => {
    const missing = new Types.ObjectId().toString();
    const result = await request(`/api/v1/admins/${missing}`, {}, superCookies);

    assert.equal(result.status, 404);
    assert.equal(asError(result.body).message, 'Admin not found.');
  });

  it('updates an admin name and email without touching role', async () => {
    const created = await createAdminViaApi();
    const rawEmail = ` Renamed-${Date.now()}-${Math.random().toString(36).slice(2)}@Example.Test `;
    const normalizedEmail = rawEmail.trim().toLowerCase();

    const result = await request(
      `/api/v1/admins/${created.id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Renamed Admin',
          email: rawEmail,
        }),
      },
      superCookies,
    );

    assert.equal(result.status, 200);
    const user = asUser(result.body);
    assert.equal(user.name, 'Renamed Admin');
    assert.equal(user.email, normalizedEmail);
    assert.equal(user.role, 'ADMIN');
    assert.equal(user.status, 'ACTIVE');
  });

  it('rejects an update with no fields', async () => {
    const created = await createAdminViaApi();
    const result = await request(
      `/api/v1/admins/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({}) },
      superCookies,
    );
    assert.equal(result.status, 400);
  });

  it('rejects an email already used by another account with 409', async () => {
    const first = await createAdminViaApi();
    const second = await createAdminViaApi();

    const result = await request(
      `/api/v1/admins/${first.id}`,
      { method: 'PATCH', body: JSON.stringify({ email: second.email }) },
      superCookies,
    );

    assert.equal(result.status, 409);
  });

  it('deactivates and reactivates an admin', async () => {
    const created = await createAdminViaApi();

    const deactivate = await request(
      `/api/v1/admins/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'INACTIVE' }) },
      superCookies,
    );
    assert.equal(deactivate.status, 200);
    assert.equal(asUser(deactivate.body).status, 'INACTIVE');
    const storedInactive = await UserModel.findById(created.id);
    assert.equal(storedInactive?.status, 'INACTIVE');

    const activate = await request(
      `/api/v1/admins/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'ACTIVE' }) },
      superCookies,
    );
    assert.equal(activate.status, 200);
    assert.equal(asUser(activate.body).status, 'ACTIVE');
  });

  it('rejects an invalid status value with 400', async () => {
    const created = await createAdminViaApi();
    const result = await request(
      `/api/v1/admins/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'BANNED' }) },
      superCookies,
    );
    assert.equal(result.status, 400);
    assert.equal(asError(result.body).message, 'Status must be ACTIVE or INACTIVE.');
  });

  it('cannot get or modify a SUPER_ADMIN account through admin endpoints', async () => {
    const get = await request(`/api/v1/admins/${superAdminId}`, {}, superCookies);
    assert.equal(get.status, 404);

    const update = await request(
      `/api/v1/admins/${superAdminId}`,
      { method: 'PATCH', body: JSON.stringify({ name: 'Hacked' }) },
      superCookies,
    );
    assert.equal(update.status, 404);

    const status = await request(
      `/api/v1/admins/${superAdminId}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'INACTIVE' }) },
      superCookies,
    );
    assert.equal(status.status, 404);

    // The SUPER_ADMIN account is untouched.
    const stored = await UserModel.findById(superAdminId);
    assert.equal(stored?.role, 'SUPER_ADMIN');
    assert.equal(stored?.status, 'ACTIVE');
  });
});
