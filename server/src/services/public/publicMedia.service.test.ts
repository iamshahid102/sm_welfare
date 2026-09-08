import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { MEDIA_UPLOAD_FOLDER } from '../../constants/media.js';
import { MediaModel } from '../../models/media.model.js';
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

interface PublicMediaShape {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image';
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  originalFilename: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PublicListResult {
  items: PublicMediaShape[];
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

describeDb('Public media API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  const trackedMediaIds: string[] = [];
  const trackedUserIds: string[] = [];

  async function createUser(role: 'SUPER_ADMIN' | 'ADMIN'): Promise<string> {
    const email = `public-media-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
    const user = await UserModel.create({
      name: `Public Media Test ${role}`,
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role,
      status: 'ACTIVE',
    });
    trackedUserIds.push(user.id);
    return user.id;
  }

  async function loginCookies(userId: string): Promise<string> {
    const user = await UserModel.findById(userId).select('email');
    assert.ok(user, 'test user must exist');
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: TEST_PASSWORD }),
    });
    assert.equal(res.status, 200, 'login must succeed for an ACTIVE test user');
    return res.headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ');
  }

  async function createMediaFixture(): Promise<string> {
    const media = await MediaModel.create({
      publicId: `${MEDIA_UPLOAD_FOLDER}/public-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      secureUrl: 'https://res.cloudinary.com/example/image/upload/v1/sm-welfare/test.png',
      resourceType: 'image',
      format: 'png',
      width: 100,
      height: 100,
      bytes: 1000,
      folder: MEDIA_UPLOAD_FOLDER,
      originalFilename: 'test.png',
      createdBy: superAdminId,
    });
    trackedMediaIds.push(media.id);
    return media.id;
  }

  let superAdminId = '';

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
    await MediaModel.init();
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    superAdminId = await createUser('SUPER_ADMIN');
    const adminId = await createUser('ADMIN');
    superCookies = await loginCookies(superAdminId);
    await loginCookies(adminId);
  });

  after(async () => {
    if (trackedMediaIds.length > 0) {
      await MediaModel.deleteMany({ _id: { $in: trackedMediaIds } });
    }
    const remainingMedia = await MediaModel.countDocuments({ _id: { $in: trackedMediaIds } });
    assert.equal(remainingMedia, 0, 'all test media records must be cleaned up');

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
    const result = await request('/api/v1/public/media');
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.ok(Array.isArray(list.items));
  });

  it('supports bounded pagination', async () => {
    for (let i = 0; i < 3; i += 1) {
      await createMediaFixture();
    }

    const page1 = await request('/api/v1/public/media?limit=2');
    assert.equal(page1.status, 200);
    const list1 = asPublicList(page1.body);
    assert.ok(list1.items.length <= 2);
    assert.equal(list1.limit, 2);
    assert.ok(list1.total >= 3);

    const page2 = await request('/api/v1/public/media?limit=2&page=2');
    assert.equal(page2.status, 200);
    const list2 = asPublicList(page2.body);
    assert.ok(list2.items.length <= 2);
    assert.equal(list2.page, 2);
  });

  it('rejects an over-large limit', async () => {
    const result = await request('/api/v1/public/media?limit=1000');
    assert.equal(result.status, 400);
    assert.match(asError(result.body).message, /Limit must be an integer between 1 and 40/);
  });

  it('returns a public-safe response shape', async () => {
    const id = await createMediaFixture();

    const result = await request('/api/v1/public/media');
    assert.equal(result.status, 200);
    const json = JSON.stringify(result.body);
    assert.equal(json.includes('_id'), false);
    assert.equal(json.includes('__v'), false);
    assert.equal(json.includes('passwordHash'), false);

    const list = asPublicList(result.body);
    assert.ok(list.total >= 1);
    const item = list.items.find((item) => item.id === id);
    assert.ok(item);
    assert.equal(item.id, id);
    assert.equal(item.publicId.startsWith(MEDIA_UPLOAD_FOLDER), true);
    assert.equal(item.secureUrl.startsWith('https://'), true);
    assert.equal(item.resourceType, 'image');
    assert.equal(item.format, 'png');
    assert.equal(item.width, 100);
    assert.equal(item.height, 100);
    assert.equal(item.bytes, 1000);
    assert.equal(item.folder, MEDIA_UPLOAD_FOLDER);
    assert.equal(item.originalFilename, 'test.png');
    assert.equal(typeof item.createdAt, 'string');
    assert.equal(typeof item.updatedAt, 'string');
  });

  it('does not expose Cloudinary credentials or upload context', async () => {
    await createMediaFixture();

    const result = await request('/api/v1/public/media');
    assert.equal(result.status, 200);
    const json = JSON.stringify(result.body);
    assert.equal(json.includes('cloud_name'), false);
    assert.equal(json.includes('api_key'), false);
    assert.equal(json.includes('api_secret'), false);
  });

  it('returns an empty list when no media exist', async () => {
    await MediaModel.deleteMany({});
    const result = await request('/api/v1/public/media');
    assert.equal(result.status, 200);
    const list = asPublicList(result.body);
    assert.equal(list.total, 0);
    assert.equal(list.items.length, 0);
  });

  it('preserves the protected admin media endpoint behavior', async () => {
    const anon = await request('/api/v1/media/64b7f2c4a1b2c3d4e5f6a7b8');
    assert.equal(anon.status, 401);

    const admin = await request('/api/v1/media/64b7f2c4a1b2c3d4e5f6a7b8', {}, superCookies);
    assert.equal(admin.status, 404);
  });
});
