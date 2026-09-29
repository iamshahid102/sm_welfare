import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { Types } from 'mongoose';
import { app } from '../../app.js';
import { cloudinary } from '../../config/cloudinary.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { MEDIA_UPLOAD_FOLDER } from '../../constants/media.js';
import { MediaModel } from '../../models/media.model.js';
import { RefreshSessionModel } from '../../models/refreshSession.model.js';
import { UserModel } from '../../models/user.model.js';
import { deleteMedia } from '../../services/media.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashPassword } from '../../utils/password.js';

/**
 * Media API integration tests against the real MongoDB database.
 *
 * These require a real MongoDB instance and are skipped when MONGODB_URI is
 * not set. This suite is deliberately Cloudinary-agnostic: it never performs a
 * real upload (which would need live credentials), and it never fakes a
 * successful one. The one place an upstream failure is injected (a stubbed
 * Cloudinary destroy) exists only to prove the deletion-ordering guarantee:
 * MongoDB metadata is never removed when the Cloudinary deletion fails.
 *
 * Live Cloudinary behavior (real upload/delete round-trips) is covered in
 * media.cloudinary.test.ts, which only runs when credentials exist.
 *
 * Every user/media record created here is tracked and removed in `after`, so
 * the connected database is left as it was found.
 */
// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

/** Minimal real 1x1 PNG (valid signature). */
const VALID_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const PNG_MIME = 'image/png';

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

describeDb('Media API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let cookies = '';
  let adminId = '';
  const trackedUserIds: string[] = [];
  const trackedMediaIds: string[] = [];

  function uniqueEmail(): string {
    return `media-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  }

  /** Creates the single admin account every authenticated request uses. */
  async function createUser(): Promise<string> {
    const user = await UserModel.create({
      name: 'Media Admin',
      email: uniqueEmail(),
      passwordHash: await hashPassword(TEST_PASSWORD),
      role: 'ADMIN',
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

  /** Sends a request; the JSON content type is only set for string bodies. */
  async function request(
    path: string,
    init: RequestInit = {},
    cookieHeader?: string,
  ): Promise<ApiResult> {
    const headers = new Headers(init.headers);
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
    if (typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => null)) as Record<string, unknown>;
    return { status: res.status, body };
  }

  /** Builds a multipart body with one `file` part from a buffer. */
  function multipartFile(buffer: Buffer, filename: string, mime: string): FormData {
    const form = new FormData();
    // Copy into a fresh Uint8Array so the Blob typing accepts the buffer.
    form.append('file', new Blob([new Uint8Array(buffer)], { type: mime }), filename);
    return form;
  }

  /** Creates a media metadata record directly (Cloudinary-independent). */
  async function createMediaRecord(): Promise<string> {
    const media = await MediaModel.create({
      publicId: `${MEDIA_UPLOAD_FOLDER}/test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      secureUrl: 'https://res.cloudinary.com/example/image/upload/v1/sm-welfare/test.png',
      resourceType: 'image',
      format: 'png',
      width: 1,
      height: 1,
      bytes: 100,
      folder: MEDIA_UPLOAD_FOLDER,
      originalFilename: 'test.png',
      createdBy: adminId,
    });
    trackedMediaIds.push(media.id);
    return media.id;
  }

  before(async () => {
    await connectToDatabase();
    await UserModel.init();
    await RefreshSessionModel.init();
    await MediaModel.init();

    // Start the HTTP server before logging in - loginCookies needs baseUrl.
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    adminId = await createUser();
    cookies = await loginCookies(adminId);
  });

  after(async () => {
    try {
      if (trackedMediaIds.length > 0) {
        await MediaModel.deleteMany({ _id: { $in: trackedMediaIds } });
      }
      if (trackedUserIds.length > 0) {
        await RefreshSessionModel.deleteMany({ userId: { $in: trackedUserIds } });
        await UserModel.deleteMany({ _id: { $in: trackedUserIds } });
      }
      // Cleanup must be complete: every user/media record this suite created is gone.
      assert.equal(await MediaModel.countDocuments({ _id: { $in: trackedMediaIds } }), 0, 'all media records cleaned up');
      assert.equal(await UserModel.countDocuments({ _id: { $in: trackedUserIds } }), 0, 'all test users cleaned up');
    } finally {
      // Always release the server and the connection - even when the cleanup
      // verification above fails, the test process must be able to exit.
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await disconnectFromDatabase();
    }
  });

  it('rejects unauthenticated requests with 401 on all media endpoints', async () => {
    const post = await request('/api/v1/media', {
      method: 'POST',
      body: multipartFile(VALID_PNG, 'a.png', PNG_MIME),
    });
    assert.equal(post.status, 401);

    const get = await request('/api/v1/media/64b7f2c4a1b2c3d4e5f6a7b8');
    assert.equal(get.status, 401);

    const del = await request('/api/v1/media/64b7f2c4a1b2c3d4e5f6a7b8', { method: 'DELETE' });
    assert.equal(del.status, 401);
  });

  it('returns 400 when no file is uploaded', async () => {
    const form = new FormData(); // multipart request without a `file` part
    const result = await request('/api/v1/media', { method: 'POST', body: form }, cookies);
    assert.equal(result.status, 400);
    assert.match((result.body.error as { message: string }).message, /No file uploaded/);
  });

  it('returns 400 for an unsupported file type and persists nothing', async () => {
    const form = multipartFile(Buffer.from('this is not an image at all', 'utf8'), 'fake.png', PNG_MIME);
    const result = await request('/api/v1/media', { method: 'POST', body: form }, cookies);

    assert.equal(result.status, 400);
    assert.match((result.body.error as { message: string }).message, /Unsupported file type/);
    assert.equal(await MediaModel.countDocuments({ createdBy: { $in: trackedUserIds } }), 0, 'nothing persisted for a rejected file');
  });

  it('returns 413 for an oversize upload (multer size limit) and persists nothing', async () => {
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 1, 0x00);
    const form = multipartFile(oversized, 'huge.png', PNG_MIME);
    const result = await request('/api/v1/media', { method: 'POST', body: form }, cookies);

    assert.equal(result.status, 413);
    assert.equal(await MediaModel.countDocuments({ createdBy: { $in: trackedUserIds } }), 0, 'nothing persisted for an oversize file');
  });

  it('returns 400 for an invalid media id', async () => {
    const get = await request('/api/v1/media/not-an-id', {}, cookies);
    assert.equal(get.status, 400);
    const del = await request('/api/v1/media/not-an-id', { method: 'DELETE' }, cookies);
    assert.equal(del.status, 400);
  });

  it('returns 404 for an unknown media id', async () => {
    const missing = new Types.ObjectId().toString();
    const result = await request(`/api/v1/media/${missing}`, {}, cookies);
    assert.equal(result.status, 404);
    assert.equal((result.body.error as { message: string }).message, 'Media not found.');
  });

  it('returns existing metadata with only safe fields', async () => {
    const id = await createMediaRecord();

    const result = await request(`/api/v1/media/${id}`, {}, cookies);

    assert.equal(result.status, 200);
    const media = (result.body.data as { media: Record<string, unknown> }).media;
    assert.equal(media.id, id);
    assert.equal(media.resourceType, 'image');
    assert.equal(media.format, 'png');
    assert.equal(media.folder, MEDIA_UPLOAD_FOLDER);
    assert.equal(media.createdBy, adminId);
    const json = JSON.stringify(result.body);
    assert.equal(json.includes('_id'), false, 'internal _id must not be exposed');
    assert.equal(json.includes('__v'), false, 'internal __v must not be exposed');
    assert.equal(json.includes('passwordHash'), false);
  });

  it('lets the admin read media metadata', async () => {
    const id = await createMediaRecord();

    const result = await request(`/api/v1/media/${id}`, {}, cookies);
    assert.equal(result.status, 200, 'the admin is allowed to read media');
  });

  it('keeps the MongoDB record when the Cloudinary deletion fails', async () => {
    const id = await createMediaRecord();
    const record = await MediaModel.findById(id);
    assert.ok(record);

    // Inject an upstream Cloudinary failure (the only stubbed call in this
    // suite) to prove the ordering guarantee: a failed Cloudinary deletion must
    // NOT silently remove the MongoDB record.
    const originalDestroy = cloudinary.uploader.destroy.bind(cloudinary.uploader);
    cloudinary.uploader.destroy = (async () => {
      throw new Error('simulated Cloudinary outage');
    }) as typeof cloudinary.uploader.destroy;

    try {
      await assert.rejects(
        deleteMedia(id),
        (error: unknown) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.statusCode, 502);
          return true;
        },
        'a failed Cloudinary deletion must surface as an error',
      );
    } finally {
      cloudinary.uploader.destroy = originalDestroy;
    }

    assert.ok(await MediaModel.findById(id), 'the metadata record must survive a failed deletion');
  });
});
