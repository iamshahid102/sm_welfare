import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
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
  _id: string;
  slug: string;
  status: string;
}

interface PublicProgramShape {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface PublicListResult {
  items: PublicProgramShape[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asList(body: unknown): PublicListResult {
  return (body as { data: PublicListResult }).data;
}


function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

function asPublicList(body: unknown): PublicListResult {
  const parsed = body as { success: boolean; data?: unknown; error?: unknown };
  if (!parsed.success || !parsed.data) {
    return { items: [], page: 0, limit: 0, total: 0, totalPages: 0 };
  }
  return parsed.data as PublicListResult;
}

describeDb('Public programs API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  const trackedProgramIds: string[] = [];
  const trackedUserIds: string[] = [];

  function uniqueToken(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  async function createProgramFixture(overrides: Record<string, unknown> = {}): Promise<ProgramShape> {
    const token = uniqueToken('prog');
    const program = await ProgramModel.create({
      title: `Program ${token}`,
      slug: `program-${token}`,
      shortDescription: 'Short',
      description: 'Longer',
      ...overrides,
    });
    trackedProgramIds.push(program.id);
    return { _id: program.id, slug: program.slug, status: program.status };
  }

  async function createUser(role: 'SUPER_ADMIN' | 'ADMIN'): Promise<string> {
    const email = `${uniqueToken(`user-${role.toLowerCase()}`)}@example.test`;
    const user = await UserModel.create({
      name: `Public Program Test ${role}`,
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
    await ProgramModel.init();
    await UserModel.init();
    await RefreshSessionModel.init();
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    const superEmail = await createUser('SUPER_ADMIN');
    superCookies = await loginCookies(superEmail);
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

  it('is reachable without authentication', async () => {
    const result = await request('/api/v1/public/programs');
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.ok(Array.isArray(list.items));
  });

  it('returns only PUBLISHED programs', async () => {
    const published = await createProgramFixture({ status: 'PUBLISHED' });
    await createProgramFixture({ status: 'DRAFT' });
    await createProgramFixture({ status: 'ARCHIVED' });

    const result = await request('/api/v1/public/programs');
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.equal(list.total, 1);
    const item = list.items[0];
    assert.ok(item, 'expected exactly one public program');
    assert.equal(item.slug, published.slug);
  });

  it('supports a program slug filter', async () => {
    const program = await createProgramFixture({ status: 'PUBLISHED' });
    await createProgramFixture({ status: 'PUBLISHED' });

    const result = await request(`/api/v1/public/programs?program=${program.slug}`);
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.equal(list.total, 1);
    const item = list.items[0];
    assert.ok(item, 'expected exactly one public program');
    assert.equal(item.slug, program.slug);
  });

  it('returns an empty list when a program slug filter matches nothing', async () => {
    await ProgramModel.deleteMany({});
    const result = await request('/api/v1/public/programs?program=no-such-program');
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.equal(list.total, 0);
    assert.equal(list.items.length, 0);
  });

  it('supports bounded pagination', async () => {
    for (let i = 0; i < 3; i += 1) {
      await createProgramFixture({ status: 'PUBLISHED' });
    }

    const page1 = await request('/api/v1/public/programs?limit=2');
    assert.equal(page1.status, 200);
    const list1 = asPublicList(page1.body);
    assert.ok(list1.items.length <= 2);
    assert.equal(list1.limit, 2);
    assert.ok(list1.total >= 3);

    const page2 = await request('/api/v1/public/programs?limit=2&page=2');
    assert.equal(page2.status, 200);
    const list2 = asPublicList(page2.body);
    assert.ok(list2.items.length <= 2);
    assert.equal(list2.page, 2);
  });

  it('rejects an over-large limit', async () => {
    const result = await request('/api/v1/public/programs?limit=1000');
    assert.equal(result.status, 400);
    assert.match(asError(result.body).message, /Limit must be an integer between 1 and 40/);
  });

  it('returns a public-safe response shape', async () => {
    const program = await createProgramFixture({ status: 'PUBLISHED' });

    const result = await request('/api/v1/public/programs');
    assert.equal(result.status, 200);
    const json = JSON.stringify(result.body);
    assert.equal(json.includes('_id'), false);
    assert.equal(json.includes('__v'), false);
    assert.equal(json.includes('passwordHash'), false);
    assert.equal(json.includes('status'), false);

    const list = asPublicList(result.body);
    const item = list.items.find((item) => item.slug === program.slug);
    assert.ok(item, 'expected matching public program in list');
    assert.equal(item.id, program._id);
    assert.equal(typeof item.createdAt, 'string');
    assert.equal(typeof item.updatedAt, 'string');
  });

  it('returns an empty list when no programs exist', async () => {
    await ProgramModel.deleteMany({});
    const result = await request('/api/v1/public/programs');
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.equal(list.total, 0);
    assert.equal(list.items.length, 0);
  });

  it('preserves the protected admin programs endpoint behavior', async () => {
    const anon = await request('/api/v1/programs');
    assert.equal(anon.status, 401);

    const admin = await request('/api/v1/programs', {}, superCookies);
    assert.equal(admin.status, 200);
  });
});
