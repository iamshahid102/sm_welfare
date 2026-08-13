import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { Types } from 'mongoose';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { ProgramModel } from '../../models/program.model.js';
import { RefreshSessionModel } from '../../models/refreshSession.model.js';
import { UserModel } from '../../models/user.model.js';
import { hashPassword } from '../../utils/password.js';

// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

interface ProgramShape {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: string;
  displayOrder: number;
}

interface ListData {
  items: ProgramShape[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asProgram(body: unknown): ProgramShape {
  return (body as { data: { program: ProgramShape } }).data.program;
}

function asList(body: unknown): ListData {
  return (body as { data: ListData }).data;
}

function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

describeDb('Programs API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  let adminCookies = '';
  const trackedProgramIds: string[] = [];
  const trackedUserIds: string[] = [];

  /** Unique per-run token so parallel suite runs never collide. */
  function uniqueToken(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function validProgramBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    const token = uniqueToken('program');
    return {
      title: `Program ${token}`,
      slug: `program-${token}`,
      shortDescription: 'A short description of the welfare initiative.',
      description: 'A longer description of the initiative and its goals.',
      displayOrder: 0,
      ...overrides,
    };
  }

  /** Creates a program through the real API as SUPER_ADMIN; tracks the id. */
  async function createProgramViaApi(
    overrides: Record<string, unknown> = {},
  ): Promise<ProgramShape> {
    const result = await request(
      '/api/v1/programs',
      { method: 'POST', body: JSON.stringify(validProgramBody(overrides)) },
      superCookies,
    );
    assert.equal(result.status, 201, `create program expected 201, got ${result.status}`);
    const program = asProgram(result.body);
    trackedProgramIds.push(program.id);
    return program;
  }

  async function createUser(role: 'SUPER_ADMIN' | 'ADMIN'): Promise<string> {
    const email = `${uniqueToken(`program-${role.toLowerCase()}`)}@example.test`;
    const user = await UserModel.create({
      name: `Program Test ${role}`,
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role,
      status: 'ACTIVE',
    });
    trackedUserIds.push(user.id);
    return email;
  }

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

  before(async () => {
    await connectToDatabase();
    await UserModel.init();
    await RefreshSessionModel.init();
    // Build the unique slug index before the duplicate-slug tests run.
    await ProgramModel.init();
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    const superEmail = await createUser('SUPER_ADMIN');
    superCookies = await loginCookies(superEmail);
    const adminEmail = await createUser('ADMIN');
    adminCookies = await loginCookies(adminEmail);
  });

  after(async () => {
    if (trackedProgramIds.length > 0) {
      await ProgramModel.deleteMany({ _id: { $in: trackedProgramIds } });
    }
    const remainingPrograms = await ProgramModel.countDocuments({
      _id: { $in: trackedProgramIds },
    });
    assert.equal(remainingPrograms, 0, 'all test programs must be cleaned up');

    if (trackedUserIds.length > 0) {
      await RefreshSessionModel.deleteMany({ userId: { $in: trackedUserIds } });
      await UserModel.deleteMany({ _id: { $in: trackedUserIds } });
    }
    const remainingUsers = await UserModel.countDocuments({ _id: { $in: trackedUserIds } });
    const remainingSessions = await RefreshSessionModel.countDocuments({
      userId: { $in: trackedUserIds },
    });
    assert.equal(remainingUsers, 0, 'all test users must be cleaned up');
    assert.equal(remainingSessions, 0, 'all test refresh sessions must be cleaned up');

    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  });

  it('rejects an anonymous create with 401', async () => {
    const result = await request('/api/v1/programs', {
      method: 'POST',
      body: JSON.stringify(validProgramBody()),
    });
    assert.equal(result.status, 401);
  });

  it('rejects an ADMIN create with 403', async () => {
    const result = await request(
      '/api/v1/programs',
      { method: 'POST', body: JSON.stringify(validProgramBody()) },
      adminCookies,
    );
    assert.equal(result.status, 403);
    assert.equal(asError(result.body).message, 'Insufficient permissions.');
  });

  it('SUPER_ADMIN creates a program that starts as DRAFT', async () => {
    const result = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(
          validProgramBody({ title: '  New Initiative  ', displayOrder: 7 }),
        ),
      },
      superCookies,
    );

    assert.equal(result.status, 201);
    const program = asProgram(result.body);
    trackedProgramIds.push(program.id);
    assert.equal(program.title, 'New Initiative');
    assert.equal(program.status, 'DRAFT');
    assert.equal(program.displayOrder, 7);
    assert.equal('_id' in program, false);
    assert.equal(JSON.stringify(result.body).includes('__v'), false);
    assert.equal(JSON.stringify(result.body).includes('passwordHash'), false);

    const stored = await ProgramModel.findById(program.id);
    assert.ok(stored);
    assert.equal(stored.status, 'DRAFT');
    assert.equal(stored.slug, program.slug);
  });

  it('generates a URL-safe slug from the title when slug is omitted', async () => {
    const result = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(
          validProgramBody({ title: 'Food & Community Support', slug: undefined }),
        ),
      },
      superCookies,
    );

    assert.equal(result.status, 201);
    const program = asProgram(result.body);
    trackedProgramIds.push(program.id);
    assert.equal(program.slug, 'food-community-support');
  });

  it('rejects an invalid explicit slug with 400', async () => {
    const result = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(validProgramBody({ slug: 'Not A Slug' })),
      },
      superCookies,
    );
    assert.equal(result.status, 400);
    assert.match(asError(result.body).message, /URL-safe/);
  });

  it('rejects a duplicate slug with 409', async () => {
    const first = await createProgramViaApi();
    const duplicate = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(validProgramBody({ slug: first.slug })),
      },
      superCookies,
    );
    assert.equal(duplicate.status, 409);
    assert.equal(asError(duplicate.body).message, 'A program with this slug already exists.');
  });

  it('enforces slug uniqueness with the database unique index', async () => {
    const existing = await createProgramViaApi();
    await assert.rejects(
      ProgramModel.create({
        title: 'Direct Create',
        slug: existing.slug,
        shortDescription: 'S',
        description: 'D',
      }),
      (error: unknown) => {
        assert.ok(error !== null && typeof error === 'object' && 'code' in error);
        assert.equal(error.code, 11000, 'duplicate key error');
        return true;
      },
    );
  });

  it('handles concurrent creation of the same slug safely', async () => {
    const body = JSON.stringify(validProgramBody());
    const [first, second] = await Promise.all([
      request('/api/v1/programs', { method: 'POST', body }, superCookies),
      request('/api/v1/programs', { method: 'POST', body }, superCookies),
    ]);
    // Track any winner before asserting, so a failed assertion can never
    // leak an untracked program past the after() cleanup.
    if (first.status === 201) {
      trackedProgramIds.push(asProgram(first.body).id);
    }
    if (second.status === 201) {
      trackedProgramIds.push(asProgram(second.body).id);
    }
    assert.deepEqual(
      [first.status, second.status].sort(),
      [201, 409],
      'one concurrent create wins, the other is rejected',
    );
  });

  it('rejects missing or over-long title with 400', async () => {
    const empty = await request(
      '/api/v1/programs',
      { method: 'POST', body: JSON.stringify(validProgramBody({ title: '' })) },
      superCookies,
    );
    assert.equal(empty.status, 400);

    const overLong = await request(
      '/api/v1/programs',
      { method: 'POST', body: JSON.stringify(validProgramBody({ title: 'a'.repeat(151) })) },
      superCookies,
    );
    assert.equal(overLong.status, 400);
  });

  it('rejects missing or over-long descriptions with 400', async () => {
    const missing = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(validProgramBody({ shortDescription: undefined, description: undefined })),
      },
      superCookies,
    );
    assert.equal(missing.status, 400);

    const overLong = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(validProgramBody({ description: 'a'.repeat(5_001) })),
      },
      superCookies,
    );
    assert.equal(overLong.status, 400);
  });

  it('rejects invalid displayOrder values with 400', async () => {
    for (const displayOrder of [-1, 10_001, 1.5, '3']) {
      const result = await request(
        '/api/v1/programs',
        { method: 'POST', body: JSON.stringify(validProgramBody({ displayOrder })) },
        superCookies,
      );
      assert.equal(result.status, 400, `displayOrder=${String(displayOrder)} must be rejected`);
    }
  });

  it('lists programs for SUPER_ADMIN and ADMIN with pagination', async () => {
    const token = uniqueToken('page');
    const first = await createProgramViaApi({
      title: `${token} One`,
      slug: `${token}-one`,
      displayOrder: 2,
    });
    const second = await createProgramViaApi({
      title: `${token} Two`,
      slug: `${token}-two`,
      displayOrder: 1,
    });

    for (const cookies of [superCookies, adminCookies]) {
      const page1 = await request(`/api/v1/programs?search=${token}&limit=1`, {}, cookies);
      assert.equal(page1.status, 200);
      const list1 = asList(page1.body);
      assert.equal(list1.items.length, 1);
      assert.equal(list1.total, 2);
      assert.equal(list1.totalPages, 2);
      assert.equal(list1.page, 1);
      assert.equal(list1.limit, 1);

      const page2 = await request(
        `/api/v1/programs?search=${token}&page=2&limit=1`,
        {},
        cookies,
      );
      const list2 = asList(page2.body);
      assert.equal(list2.items.length, 1);

      const ids = [list1.items[0]?.id, list2.items[0]?.id].sort();
      assert.deepEqual(ids, [first.id, second.id].sort(), 'both programs appear across pages');
    }
  });

  it('filters programs by status and searches title/description', async () => {
    const token = uniqueToken('filter');
    const created = await createProgramViaApi({ title: `${token} Education` });
    await request(
      `/api/v1/programs/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }) },
      superCookies,
    );

    const byStatus = await request(
      `/api/v1/programs?search=${token}&status=ARCHIVED`,
      {},
      superCookies,
    );
    assert.equal(asList(byStatus.body).total, 0);

    const published = await request(
      `/api/v1/programs?search=${token}&status=PUBLISHED`,
      {},
      superCookies,
    );
    assert.equal(asList(published.body).total, 1);

    const byDescription = await request(
      `/api/v1/programs?search=${token}`,
      {},
      superCookies,
    );
    assert.equal(asList(byDescription.body).total, 1);
  });

  it('returns 400 for an invalid id and 404 for an unknown id', async () => {
    const invalid = await request('/api/v1/programs/not-an-id', {}, superCookies);
    assert.equal(invalid.status, 400);
    assert.equal(asError(invalid.body).message, 'Invalid program id.');

    const missing = new Types.ObjectId().toString();
    const notFound = await request(`/api/v1/programs/${missing}`, {}, superCookies);
    assert.equal(notFound.status, 404);
    assert.equal(asError(notFound.body).message, 'Program not found.');
  });

  it('gets a single program for SUPER_ADMIN and ADMIN', async () => {
    const created = await createProgramViaApi();

    for (const cookies of [superCookies, adminCookies]) {
      const result = await request(`/api/v1/programs/${created.id}`, {}, cookies);
      assert.equal(result.status, 200);
      const program = asProgram(result.body);
      assert.equal(program.id, created.id);
      assert.equal(program.title, created.title);
      assert.equal(program.status, 'DRAFT');
    }
  });

  it('updates a program partially without wiping other fields', async () => {
    const created = await createProgramViaApi();

    const result = await request(
      `/api/v1/programs/${created.id}`,
      {
        method: 'PATCH',
        // A status field in the body is ignored - status changes only happen
        // through the dedicated status endpoint.
        body: JSON.stringify({ title: 'Renamed Program', status: 'PUBLISHED' }),
      },
      superCookies,
    );

    assert.equal(result.status, 200);
    const program = asProgram(result.body);
    assert.equal(program.title, 'Renamed Program');
    assert.equal(program.slug, created.slug, 'slug preserved on partial update');
    assert.equal(program.shortDescription, created.shortDescription);
    assert.equal(program.description, created.description);
    assert.equal(program.status, 'DRAFT', 'status in PATCH body is ignored');
    assert.equal(program.displayOrder, created.displayOrder);
  });

  it('updates slug with uniqueness enforcement', async () => {
    const first = await createProgramViaApi();
    const second = await createProgramViaApi();

    // Changing to the other program's slug is a conflict.
    const conflict = await request(
      `/api/v1/programs/${first.id}`,
      { method: 'PATCH', body: JSON.stringify({ slug: second.slug }) },
      superCookies,
    );
    assert.equal(conflict.status, 409);

    // Changing to a fresh slug works.
    const newSlug = `${uniqueToken('renamed')}-slug`;
    const ok = await request(
      `/api/v1/programs/${first.id}`,
      { method: 'PATCH', body: JSON.stringify({ slug: newSlug }) },
      superCookies,
    );
    assert.equal(ok.status, 200);
    assert.equal(asProgram(ok.body).slug, newSlug);
  });

  it('rejects an update with no fields or unknown-only fields', async () => {
    const created = await createProgramViaApi();

    const empty = await request(
      `/api/v1/programs/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({}) },
      superCookies,
    );
    assert.equal(empty.status, 400);

    const unknown = await request(
      `/api/v1/programs/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({ hacker: 'x', role: 'SUPER_ADMIN' }) },
      superCookies,
    );
    assert.equal(unknown.status, 400);
  });

  it('does not persist unknown fields on create or update', async () => {
    const result = await request(
      '/api/v1/programs',
      {
        method: 'POST',
        body: JSON.stringify(
          validProgramBody({ hacker: 'field', role: 'SUPER_ADMIN', status: 'PUBLISHED' }),
        ),
      },
      superCookies,
    );
    assert.equal(result.status, 201);
    const program = asProgram(result.body);
    trackedProgramIds.push(program.id);
    assert.equal(program.status, 'DRAFT', 'create-body status is ignored');
    const stored = await ProgramModel.findById(program.id);
    assert.ok(stored);
    assert.equal('hacker' in stored, false);
    assert.equal('role' in stored, false);
  });

  it('transitions status through the dedicated endpoint and archives retain the document', async () => {
    const created = await createProgramViaApi();

    const published = await request(
      `/api/v1/programs/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }) },
      superCookies,
    );
    assert.equal(published.status, 200);
    assert.equal(asProgram(published.body).status, 'PUBLISHED');

    const archived = await request(
      `/api/v1/programs/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'ARCHIVED' }) },
      superCookies,
    );
    assert.equal(archived.status, 200);
    assert.equal(asProgram(archived.body).status, 'ARCHIVED');

    // ARCHIVED programs remain in the database.
    const stored = await ProgramModel.findById(created.id);
    assert.ok(stored, 'archived program must remain in the database');
    assert.equal(stored.status, 'ARCHIVED');
  });

  it('rejects an invalid status value with 400', async () => {
    const created = await createProgramViaApi();
    const result = await request(
      `/api/v1/programs/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'BANNED' }) },
      superCookies,
    );
    assert.equal(result.status, 400);
    assert.equal(asError(result.body).message, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
  });

  it('has no DELETE endpoint', async () => {
    const created = await createProgramViaApi();
    const del = await request(`/api/v1/programs/${created.id}`, { method: 'DELETE' }, superCookies);
    assert.equal(del.status, 404);
    const stored = await ProgramModel.findById(created.id);
    assert.ok(stored, 'program still exists after attempted DELETE');
  });
});
