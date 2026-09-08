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

interface PublicSettingsShape {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: Record<string, string>;
  socialLinks: Record<string, string>;
  footer: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asPublicSettings(body: unknown): PublicSettingsShape {
  return (body as { data: { settings: PublicSettingsShape } }).data.settings;
}

function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

describeDb('Public site settings API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  const trackedUserIds: string[] = [];
  let originalSettings: Record<string, unknown> | null = null;

  async function createUser(role: 'SUPER_ADMIN' | 'ADMIN'): Promise<string> {
    const email = `public-settings-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
    const user = await UserModel.create({
      name: `Public Settings Test ${role}`,
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
    await SiteSettingsModel.init();
    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    const existing = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY }).lean();
    originalSettings = existing as unknown as { _id?: string } | null;
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });

    const superEmail = await createUser('SUPER_ADMIN');
    superCookies = await loginCookies(superEmail);
  });

  after(async () => {
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });
    if (originalSettings !== null) {
      await SiteSettingsModel.collection.insertOne(originalSettings as unknown as Parameters<typeof SiteSettingsModel.collection.insertOne>[0]);
    }
    const count = await SiteSettingsModel.countDocuments({ key: SITE_SETTINGS_KEY });
    assert.equal(count, originalSettings === null ? 0 : 1, 'singleton restored to original state');

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

  it('always exposes a reachable public site settings endpoint', async () => {
    const result = await request('/api/v1/public/site-settings');
    assert.ok(result.status === 200 || result.status === 404);
  });

  it('returns 200 when public site settings exist and are publicly readable', async () => {
    await SiteSettingsModel.create({
      key: SITE_SETTINGS_KEY,
      organizationName: 'Public Site Settings Test Org',
    });
    const result = await request('/api/v1/public/site-settings');
    assert.equal(result.status, 200);
    const settings = result.body;
    assert.equal(typeof settings, 'object');
  });

  it('returns 404 when public site settings do not exist', async () => {
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });
    const result = await request('/api/v1/public/site-settings');
    assert.equal(result.status, 404);
    assert.equal(asError(result.body).message, 'Site settings not found.');
  });

  it('returns a public-safe response shape', async () => {
    await SiteSettingsModel.deleteMany({ key: SITE_SETTINGS_KEY });
    const created = await SiteSettingsModel.create({
      key: SITE_SETTINGS_KEY,
      organizationName: 'SM Welfare Public',
      tagline: 'Public tagline',
      contact: { email: 'public@example.test' },
      socialLinks: { website: 'https://example.test' },
      footer: { copyrightText: '© 2026' },
    });
    await created.save();

    const result = await request('/api/v1/public/site-settings');
    assert.equal(result.status, 200);
    const json = JSON.stringify(result.body);
    assert.equal(json.includes('_id'), false);
    assert.equal(json.includes('__v'), false);
    assert.equal(json.includes('passwordHash'), false);
    assert.equal(json.includes('key'), false);
    assert.equal(json.includes(SITE_SETTINGS_KEY), false);

    const settings = asPublicSettings(result.body);
    assert.equal(settings.organizationName, 'SM Welfare Public');
    assert.equal(settings.tagline, 'Public tagline');
    assert.equal(settings.contact.email, 'public@example.test');
    assert.ok('createdAt' in settings);
    assert.ok('updatedAt' in settings);
  });

  it('preserves the protected admin site settings endpoint behavior only when settings exist', async () => {
    const anon = await request('/api/v1/site-settings');
    assert.equal(anon.status, 401);

    const admin = await request('/api/v1/site-settings', {}, superCookies);
    assert.equal(admin.status, 200);
  });
});
