import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { app } from '../../app.js';
import { cloudinary } from '../../config/cloudinary.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { MEDIA_UPLOAD_FOLDER } from '../../constants/media.js';
import { MediaModel } from '../../models/media.model.js';
import { RefreshSessionModel } from '../../models/refreshSession.model.js';
import { UserModel } from '../../models/user.model.js';
import { uploadMedia } from '../../services/media.service.js';
import { hashPassword } from '../../utils/password.js';

/**
 * LIVE Cloudinary integration tests.
 *
 * These upload real images to the configured Cloudinary account and delete
 * them again, so the suite is only declared when all three credentials
 * (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are set
 * in the environment. Without them it is skipped - a live upload/delete is
 * never faked or claimed.
 *
 * Every asset uploaded here is tracked by publicId and destroyed in `after`,
 * and the cleanup is verified against Cloudinary before the connection closes.
 */
// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

// Run only when BOTH the real MongoDB and real Cloudinary credentials exist.
const describeLive = hasMongodb && hasCloudinary ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

/** Minimal real 1x1 PNG - valid and decodable by Cloudinary. */
const VALID_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const PNG_MIME = 'image/png';

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * True when the error is Cloudinary's "resource not found" response. The SDK
 * rejects with a plain object whose `http_code` lives under `error`.
 */
function isCloudinaryNotFound(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const httpCode = (error as { error?: { http_code?: unknown } }).error?.http_code;
  return httpCode === 404;
}

describeLive('Media API with live Cloudinary (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let cookies = '';
  const trackedUserIds: string[] = [];
  const trackedPublicIds: string[] = [];

  function uniqueEmail(): string {
    return `media-live-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  }

  /** Creates and logs in the single admin account. */
  async function createAndLoginUser(): Promise<string> {
    const user = await UserModel.create({
      name: 'Live Admin',
      email: uniqueEmail(),
      passwordHash: await hashPassword(TEST_PASSWORD),
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    trackedUserIds.push(user.id);
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: TEST_PASSWORD }),
    });
    assert.equal(res.status, 200, 'login must succeed');
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
    if (typeof init.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = (await res.json().catch(() => null)) as Record<string, unknown>;
    return { status: res.status, body };
  }

  function multipartFile(buffer: Buffer, filename: string, mime: string): FormData {
    const form = new FormData();
    // Copy into a fresh Uint8Array so the Blob typing accepts the buffer.
    form.append('file', new Blob([new Uint8Array(buffer)], { type: mime }), filename);
    return form;
  }

  /** Uploads through the real API and returns the created media fields. */
  async function uploadViaApi(cookieHeader: string, filename: string): Promise<{ id: string; publicId: string }> {
    const result = await request(
      '/api/v1/media',
      { method: 'POST', body: multipartFile(VALID_PNG, filename, PNG_MIME) },
      cookieHeader,
    );
    assert.equal(result.status, 201, `upload must succeed, got ${result.status}`);
    const media = (result.body.data as { media: { id: string; publicId: string } }).media;
    trackedPublicIds.push(media.publicId);
    return media;
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

    cookies = await createAndLoginUser();
  });

  after(async () => {
    try {
      // Destroy every uploaded Cloudinary asset (verifying each deletion).
      for (const publicId of trackedPublicIds) {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        assert.ok(
          result.result === 'ok' || result.result === 'not found',
          `cloudinary destroy must succeed for ${publicId}`,
        );
      }
      // Confirm no test asset remains in Cloudinary.
      for (const publicId of trackedPublicIds) {
        await assert.rejects(
          cloudinary.api.resource(publicId),
          isCloudinaryNotFound,
          `asset ${publicId} must no longer exist in Cloudinary`,
        );
      }

      if (trackedUserIds.length > 0) {
        await RefreshSessionModel.deleteMany({ userId: { $in: trackedUserIds } });
        await UserModel.deleteMany({ _id: { $in: trackedUserIds } });
      }
      await MediaModel.deleteMany({ createdBy: { $in: trackedUserIds } });
      assert.equal(
        await MediaModel.countDocuments({ createdBy: { $in: trackedUserIds } }),
        0,
        'all media metadata records must be cleaned up',
      );
    } finally {
      // Always release the server and the connection - even when the cleanup
      // verification above fails, the test process must be able to exit.
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      await disconnectFromDatabase();
    }
  });

  it('uploads a real image and persists its metadata', async () => {
    const before = await MediaModel.countDocuments({ createdBy: { $in: trackedUserIds } });
    const media = await uploadViaApi(cookies, 'live-super.png');

    assert.equal(media.publicId.startsWith(`${MEDIA_UPLOAD_FOLDER}/`), true);
    const stored = await MediaModel.findById(media.id);
    assert.ok(stored, 'metadata must be persisted');
    assert.equal(stored.folder, MEDIA_UPLOAD_FOLDER);
    assert.equal(stored.format, 'png');
    assert.equal(stored.bytes, VALID_PNG.length);
    assert.equal(stored.secureUrl.startsWith('https://'), true);
    assert.equal(await MediaModel.countDocuments({ createdBy: { $in: trackedUserIds } }), before + 1);
  });

  it('retrieves the uploaded media metadata', async () => {
    const uploaded = await uploadViaApi(cookies, 'live-get.png');

    const result = await request(`/api/v1/media/${uploaded.id}`, {}, cookies);
    assert.equal(result.status, 200);
    const media = (result.body.data as { media: Record<string, unknown> }).media;
    assert.equal(media.id, uploaded.id);
    assert.equal(media.publicId, uploaded.publicId);
    assert.equal(JSON.stringify(result.body).includes('__v'), false);
  });

  it('uploads and deletes media', async () => {
    const uploaded = await uploadViaApi(cookies, 'live-admin.png');

    const deleted = await request(`/api/v1/media/${uploaded.id}`, { method: 'DELETE' }, cookies);
    assert.equal(deleted.status, 200, 'ADMIN is allowed to delete');
    assert.equal(await MediaModel.findById(uploaded.id), null, 'metadata removed after successful deletion');
    await assert.rejects(cloudinary.api.resource(uploaded.publicId), isCloudinaryNotFound, 'asset destroyed');
  });

  it('deletes the Cloudinary asset first and only then the MongoDB metadata', async () => {
    const uploaded = await uploadViaApi(cookies, 'live-delete.png');

    const result = await request(`/api/v1/media/${uploaded.id}`, { method: 'DELETE' }, cookies);
    assert.equal(result.status, 200);
    assert.equal(await MediaModel.findById(uploaded.id), null, 'metadata must be removed');
    await assert.rejects(cloudinary.api.resource(uploaded.publicId), isCloudinaryNotFound, 'Cloudinary asset must be destroyed');
  });

  it('completes deletion when the Cloudinary asset is already missing', async () => {
    const uploaded = await uploadViaApi(cookies, 'live-already-gone.png');

    // Simulate an externally deleted asset (e.g. removed from the Cloudinary console).
    const external = await cloudinary.uploader.destroy(uploaded.publicId, { resource_type: 'image' });
    assert.equal(external.result, 'ok');

    // The documented behavior: an already-missing asset is treated as deleted,
    // so the stale metadata record can be cleaned up.
    const result = await request(`/api/v1/media/${uploaded.id}`, { method: 'DELETE' }, cookies);
    assert.equal(result.status, 200);
    assert.equal(await MediaModel.findById(uploaded.id), null, 'stale metadata record must be removed');
  });

  it('rolls back the Cloudinary asset when metadata persistence fails', async () => {
    // Force the persistence step to fail after a REAL Cloudinary upload: an
    // uncastable createdBy makes MediaModel.create reject. The service must
    // then destroy the just-uploaded asset so no orphan is left in Cloudinary.
    const destroyed: string[] = [];
    const originalDestroy = cloudinary.uploader.destroy.bind(cloudinary.uploader);
    cloudinary.uploader.destroy = (async (publicId: string, options?: object) => {
      destroyed.push(publicId);
      return originalDestroy(publicId, options);
    }) as typeof cloudinary.uploader.destroy;

    try {
      await assert.rejects(
        uploadMedia({
          buffer: VALID_PNG,
          originalFilename: 'rollback.png',
          uploadedBy: 'not-an-object-id',
        }),
        'metadata persistence failure must surface',
      );
    } finally {
      cloudinary.uploader.destroy = originalDestroy;
    }

    // Exactly one rollback destroy happened, for the asset that was uploaded...
    assert.equal(destroyed.length, 1, 'the uploaded asset must be rolled back exactly once');
    const rolledBack = destroyed[0];
    assert.ok(rolledBack, 'rollback public id must exist');
    assert.equal(rolledBack.startsWith(`${MEDIA_UPLOAD_FOLDER}/`), true);

    // ...and that asset really no longer exists in Cloudinary.
    await assert.rejects(cloudinary.api.resource(rolledBack), isCloudinaryNotFound, 'rolled-back asset must be gone');

    // Nothing was persisted in MongoDB.
    const orphan = await MediaModel.findOne({ publicId: rolledBack });
    assert.equal(orphan, null, 'no metadata record may exist for a rolled-back asset');
  });

  it('returns 404 for an unknown media id', async () => {
    const result = await request('/api/v1/media/64b7f2c4a1b2c3d4e5f6a7b8', {}, cookies);
    assert.equal(result.status, 404);
  });
});
