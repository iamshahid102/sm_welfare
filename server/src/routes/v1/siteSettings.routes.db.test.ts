import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { RefreshSessionModel } from '../../models/refreshSession.model.js';
import { SiteSettingsModel } from '../../models/siteSettings.model.js';
import { UserModel } from '../../models/user.model.js';
import { hashPassword } from '../../utils/password.js';
import { SITE_SETTINGS_KEY } from '../../constants/siteSettings.js';

// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

interface SettingsShape {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: Record<string, string>;
  socialLinks: Record<string, string>;
  footer: Record<string, string>;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asSettings(body: unknown): SettingsShape {
  return (body as { data: { settings: SettingsShape } }).data.settings;
}

function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

/** A complete, valid settings payload used as the suite's fixture. */
function validSettingsPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    organizationName: 'SM Welfare',
    tagline: 'Serving communities',
    description: 'An organization dedicated to welfare.',
    contact: {
      email: 'hello@smwelfare.example',
      phone: '+1 555 000 1234',
      address: '456 Charity Lane',
    },
    socialLinks: {
      facebook: 'https://facebook.com/smwelfare',
      instagram: 'https://instagram.com/smwelfare',
      linkedin: 'https://linkedin.com/company/smwelfare',
      youtube: 'https://youtube.com/@smwelfare',
      twitter: 'https://x.com/smwelfare',
      website: 'https://www.smwelfare.example',
    },
    footer: {
      shortDescription: 'Supporting welfare initiatives.',
      copyrightText: '© 2026 SM Welfare',
    },
    ...overrides,
  };
}

describeDb('Site settings API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  let adminCookies = '';
  const trackedUserIds: string[] = [];
  // Snapshot of the settings document that existed before this suite ran, so
  // the singleton can be restored byte-for-byte in after() (or left empty).
  let originalSettings: Record<string, unknown> | null = null;

  function uniqueEmail(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
  }

  async function createUser(role: 'SUPER_ADMIN' | 'ADMIN'): Promise<string> {
    const email = uniqueEmail(`settings-${role.toLowerCase()}`);
    const user = await UserModel.create({
      name: `Settings Test ${role}`,
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
    // Build the unique index on `key` before the singleton tests run.
    await SiteSettingsModel.init();
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    // Capture and clear the singleton so this suite owns it for its duration.
    // Cleanup is scoped to the singleton key - any other document would be
    // left untouched.
    const existing = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY }).lean();
    originalSettings = existing as Record<string, unknown> | null;
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });

    const superEmail = await createUser('SUPER_ADMIN');
    superCookies = await loginCookies(superEmail);
    const adminEmail = await createUser('ADMIN');
    adminCookies = await loginCookies(adminEmail);
  });

  after(async () => {
    // Restore the singleton to its exact original state (or remove test data).
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });
    if (originalSettings !== null) {
      await SiteSettingsModel.collection.insertOne(originalSettings);
    }
    const count = await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY });
    assert.equal(count, originalSettings === null ? 0 : 1, 'singleton restored to original state');
    if (originalSettings !== null) {
      const restored = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY }).lean();
      assert.deepEqual(restored, originalSettings, 'restored settings match the original document');
    }

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

  it('rejects unauthenticated mutations with 401', async () => {
    const post = await request('/api/v1/site-settings', {
      method: 'POST',
      body: JSON.stringify(validSettingsPayload()),
    });
    assert.equal(post.status, 401);

    const patch = await request('/api/v1/site-settings', {
      method: 'PATCH',
      body: JSON.stringify({ tagline: 'x' }),
    });
    assert.equal(patch.status, 401);
  });

  it('rejects an unauthenticated read with 401', async () => {
    const result = await request('/api/v1/site-settings');
    assert.equal(result.status, 401);
    assert.equal(asError(result.body).message, 'Authentication required.');
  });

  it('rejects ADMIN mutations with 403', async () => {
    const post = await request(
      '/api/v1/site-settings',
      { method: 'POST', body: JSON.stringify(validSettingsPayload()) },
      adminCookies,
    );
    assert.equal(post.status, 403);
    assert.equal(asError(post.body).message, 'Insufficient permissions.');

    const patch = await request(
      '/api/v1/site-settings',
      { method: 'PATCH', body: JSON.stringify({ tagline: 'x' }) },
      adminCookies,
    );
    assert.equal(patch.status, 403);
  });

  it('SUPER_ADMIN creates settings with normalized values', async () => {
    const result = await request(
      '/api/v1/site-settings',
      { method: 'POST', body: JSON.stringify(validSettingsPayload()) },
      superCookies,
    );

    assert.equal(result.status, 201);
    const settings = asSettings(result.body);
    assert.equal(settings.organizationName, 'SM Welfare');
    assert.equal(settings.tagline, 'Serving communities');
    assert.equal(settings.contact.email, 'hello@smwelfare.example');
    assert.equal(settings.socialLinks.twitter, 'https://x.com/smwelfare');
    assert.equal(settings.footer.copyrightText, '© 2026 SM Welfare');

    // Never any secrets/database internals in the response.
    const json = JSON.stringify(result.body);
    assert.equal(json.includes('passwordHash'), false);
    assert.equal(json.includes('_id'), false);
    assert.equal(json.includes('site_settings'), false);

    // The stored document matches the response.
    const stored = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY });
    assert.ok(stored);
    assert.equal(stored.organizationName, 'SM Welfare');
    assert.equal(stored.contact?.email, 'hello@smwelfare.example');
  });

  it('allows exactly one settings document', async () => {
    const count = await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY });
    assert.equal(count, 1, 'the singleton holds exactly one document');
  });

  it('rejects duplicate initialization with 409', async () => {
    const result = await request(
      '/api/v1/site-settings',
      { method: 'POST', body: JSON.stringify(validSettingsPayload()) },
      superCookies,
    );
    assert.equal(result.status, 409);
    assert.equal(asError(result.body).message, 'Site settings already exist.');
    assert.equal(await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY }), 1);
  });

  it('SUPER_ADMIN reads the current settings', async () => {
    const result = await request('/api/v1/site-settings', {}, superCookies);
    assert.equal(result.status, 200);
    const settings = asSettings(result.body);
    assert.equal(settings.organizationName, 'SM Welfare');
    assert.equal(settings.contact.email, 'hello@smwelfare.example');
    assert.equal(settings.socialLinks.website, 'https://www.smwelfare.example');
  });

  it('ADMIN can read the current settings', async () => {
    const result = await request('/api/v1/site-settings', {}, adminCookies);
    assert.equal(result.status, 200);
    assert.equal(asSettings(result.body).organizationName, 'SM Welfare');
  });

  it('applies a partial PATCH without touching other fields', async () => {
    const result = await request(
      '/api/v1/site-settings',
      {
        method: 'PATCH',
        body: JSON.stringify({
          tagline: 'New tagline',
          contact: { email: 'new@smwelfare.example' },
        }),
      },
      superCookies,
    );

    assert.equal(result.status, 200);
    const settings = asSettings(result.body);
    assert.equal(settings.tagline, 'New tagline');
    assert.equal(settings.contact.email, 'new@smwelfare.example');
    // Untouched fields are preserved - including nested siblings.
    assert.equal(settings.organizationName, 'SM Welfare');
    assert.equal(settings.contact.phone, '+1 555 000 1234');
    assert.equal(settings.contact.address, '456 Charity Lane');
    assert.equal(settings.socialLinks.facebook, 'https://facebook.com/smwelfare');
    assert.equal(settings.footer.copyrightText, '© 2026 SM Welfare');
  });

  it('rejects invalid input with 400 and leaves settings unchanged', async () => {
    const invalidBodies = [
      { contact: { email: 'not-an-email' } },
      { socialLinks: { website: 'no-scheme' } },
      { contact: ['x'] },
      { organizationName: 42 },
      { tagline: '' },
      { description: 'a'.repeat(2_001) },
    ];

    for (const body of invalidBodies) {
      const result = await request(
        '/api/v1/site-settings',
        { method: 'PATCH', body: JSON.stringify(body) },
        superCookies,
      );
      assert.equal(result.status, 400, `expected 400 for ${JSON.stringify(body)}`);
    }

    const after = await request('/api/v1/site-settings', {}, superCookies);
    const settings = asSettings(after.body);
    assert.equal(settings.organizationName, 'SM Welfare');
    assert.equal(settings.tagline, 'New tagline');
    assert.equal(settings.contact.email, 'new@smwelfare.example');
  });

  it('does not persist unexpected fields on update', async () => {
    const result = await request(
      '/api/v1/site-settings',
      {
        method: 'PATCH',
        body: JSON.stringify({
          organizationName: 'Updated Org',
          hacker: 'x',
          contact: { email: 'a@b.com', evil: 'y' },
        }),
      },
      superCookies,
    );
    assert.equal(result.status, 200);

    const stored = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY });
    assert.ok(stored);
    assert.equal(stored.organizationName, 'Updated Org');
    assert.equal(stored.contact?.email, 'a@b.com');
    assert.equal('hacker' in stored, false);
    assert.equal('evil' in (stored.contact ?? {}), false);
  });

  it('does not persist unexpected fields or roles on create', async () => {
    // Reset the singleton so initialization can be exercised again.
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });

    const result = await request(
      '/api/v1/site-settings',
      {
        method: 'POST',
        body: JSON.stringify({
          organizationName: 'Fresh Org',
          hacker: 'x',
          role: 'SUPER_ADMIN',
          contact: { email: 'fresh@smwelfare.example', evil: 'z' },
        }),
      },
      superCookies,
    );
    assert.equal(result.status, 201);
    assert.equal(await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY }), 1);

    const stored = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY });
    assert.ok(stored);
    assert.equal(stored.organizationName, 'Fresh Org');
    assert.equal(stored.contact?.email, 'fresh@smwelfare.example');
    assert.equal('hacker' in stored, false);
    assert.equal('role' in stored, false);
    assert.equal('evil' in (stored.contact ?? {}), false);
  });

  it('enforces the singleton at the database level', async () => {
    // A second document with the fixed key is rejected by the unique index.
    await assert.rejects(
      SiteSettingsModel.create({ key: SITE_SETTINGS_KEY, organizationName: 'Second Org' }),
      (error: unknown) => {
        assert.ok(error !== null && typeof error === 'object' && 'code' in error);
        assert.equal(error.code, 11000, 'duplicate key error');
        return true;
      },
    );
    assert.equal(await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY }), 1);
  });

  it('returns 404 for read/update before initialization', async () => {
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });

    const get = await request('/api/v1/site-settings', {}, superCookies);
    assert.equal(get.status, 404);
    assert.equal(asError(get.body).message, 'Site settings not found.');

    const patch = await request(
      '/api/v1/site-settings',
      { method: 'PATCH', body: JSON.stringify({ tagline: 'x' }) },
      superCookies,
    );
    assert.equal(patch.status, 404);

    // Re-initialize so the singleton is present again.
    const post = await request(
      '/api/v1/site-settings',
      { method: 'POST', body: JSON.stringify(validSettingsPayload()) },
      superCookies,
    );
    assert.equal(post.status, 201);
  });

  it('serves the re-initialized settings afterwards', async () => {
    const result = await request('/api/v1/site-settings', {}, superCookies);
    assert.equal(result.status, 200);
    assert.equal(asSettings(result.body).organizationName, 'SM Welfare');
    assert.equal(await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY }), 1);
  });
});
