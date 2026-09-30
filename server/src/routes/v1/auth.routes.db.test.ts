import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
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

interface CookieJar {
  [name: string]: string;
}

interface ApiResult {
  status: number;
  body: unknown;
  res: Response;
}

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

describeDb('Auth API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  const jar: CookieJar = {};
  const createdUserIds: string[] = [];

  /** Creates a real user in MongoDB; the id is tracked for after-test cleanup. */
  async function createTestUser(
    overrides: { status?: 'ACTIVE' | 'INACTIVE' } = {},
  ): Promise<{ id: string; email: string }> {
    const email = `auth-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
    const user = await UserModel.create({
      name: 'Auth Test User',
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role: 'ADMIN',
      status: 'ACTIVE',
      ...overrides,
    });
    createdUserIds.push(user.id);
    return { id: user.id, email };
  }

  /** Merges Set-Cookie headers into the jar (empty value = delete). */
  function applySetCookies(res: Response): void {
    for (const header of res.headers.getSetCookie()) {
      const [pair = ''] = header.split(';');
      const eq = pair.indexOf('=');
      if (eq === -1) {
        continue;
      }
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (value === '') {
        delete jar[name];
      } else {
        jar[name] = value;
      }
    }
  }

  /** Sends a request with the current cookie jar and captures response cookies. */
  async function api(path: string, init: RequestInit = {}): Promise<ApiResult> {
    const headers = new Headers(init.headers);
    const cookieHeader = Object.entries(jar)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
    if (init.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    applySetCookies(res);
    const body = await res.json().catch(() => null);
    return { status: res.status, body, res };
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
  });

  after(async () => {
    if (createdUserIds.length > 0) {
      await RefreshSessionModel.deleteMany({ userId: { $in: createdUserIds } });
      await UserModel.deleteMany({ _id: { $in: createdUserIds } });
    }
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  });

  it('rejects missing login input with 400', async () => {
    const result = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'x', password: '' }),
    });
    assert.equal(result.status, 400);
  });

  it('logs in with valid credentials and sets HttpOnly cookies', async () => {
    const { id, email } = await createTestUser();

    const result = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });

    assert.equal(result.status, 200);
    const body = result.body as { success: boolean; data: { user: Record<string, unknown> } };
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, email);
    assert.equal(body.data.user.role, 'ADMIN');
    // The password hash must never leave the server - not even as a field name.
    assert.equal('passwordHash' in body.data.user, false);
    assert.equal(JSON.stringify(body).includes('passwordHash'), false);

    // Both credentials arrive as HttpOnly cookies with secure flags.
    assert.ok(jar.smw_access_token, 'access cookie set');
    assert.ok(jar.smw_refresh_token, 'refresh cookie set');
    const setCookies = result.res.headers.getSetCookie().join('\n');
    assert.match(setCookies, /HttpOnly/i);
    assert.match(setCookies, /SameSite=lax/i);
    assert.match(setCookies, /Path=\//i);

    // The session hint is readable by design (frontend skips an anonymous
    // auth probe) so it must NOT carry HttpOnly.
    assert.equal(jar.smw_session, '1', 'session hint set');
    const hintHeader = result.res.headers
      .getSetCookie()
      .find((header) => header.startsWith('smw_session='));
    assert.ok(hintHeader, 'session hint cookie present');
    assert.doesNotMatch(hintHeader, /HttpOnly/i);

    // lastLoginAt is updated after a successful login.
    const stored = await UserModel.findById(id);
    assert.ok(stored?.lastLoginAt instanceof Date);
  });

  it('rejects a wrong password with a generic 401', async () => {
    const { email } = await createTestUser();

    const result = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: 'definitely-wrong' }),
    });

    assert.equal(result.status, 401);
    const body = result.body as { error: { message: string } };
    assert.equal(body.error.message, 'Invalid email or password.');
  });

  it('returns the same generic message for an unknown email', async () => {
    const result = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'auth-test-does-not-exist@example.test',
        password: TEST_PASSWORD,
      }),
    });

    assert.equal(result.status, 401);
    const body = result.body as { error: { message: string } };
    assert.equal(body.error.message, 'Invalid email or password.');
  });

  it('rejects an INACTIVE user with the generic message', async () => {
    const { email } = await createTestUser({ status: 'INACTIVE' });

    const result = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });

    assert.equal(result.status, 401);
    const body = result.body as { error: { message: string } };
    assert.equal(body.error.message, 'Invalid email or password.');
  });

  it('returns the current user from /me with the authenticated credential', async () => {
    const { email } = await createTestUser();
    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });

    const result = await api('/api/v1/auth/me');

    assert.equal(result.status, 200);
    const body = result.body as { data: { user: { email: string; role: string } } };
    assert.equal(body.data.user.email, email);
    assert.equal(body.data.user.role, 'ADMIN');
  });

  it('refreshes credentials and rotates the refresh session', async () => {
    const { email } = await createTestUser();
    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    const oldRefreshToken = jar.smw_refresh_token;
    assert.ok(oldRefreshToken);

    const result = await api('/api/v1/auth/refresh', { method: 'POST' });

    assert.equal(result.status, 200);
    assert.ok(jar.smw_refresh_token);
    assert.notEqual(jar.smw_refresh_token, oldRefreshToken, 'refresh token rotated');
    assert.equal(jar.smw_session, '1', 'session hint refreshed');

    // Rotation: the previous refresh credential is now rejected.
    const reused = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `smw_refresh_token=${oldRefreshToken}` },
    });
    assert.equal(reused.status, 401);
  });

  it('consumes a refresh token atomically under concurrent use', async () => {
    const { email } = await createTestUser();
    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    const refreshToken = jar.smw_refresh_token;
    assert.ok(refreshToken);

    // Two parallel refreshes present the SAME token: exactly one must win.
    const results = await Promise.all([
      api('/api/v1/auth/refresh', { method: 'POST' }),
      api('/api/v1/auth/refresh', { method: 'POST' }),
    ]);
    assert.deepEqual(
      results.map((result) => result.status).sort(),
      [200, 401],
      'one concurrent refresh succeeds, the other is rejected',
    );

    // The consumed token stays dead afterwards.
    const reused = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `smw_refresh_token=${refreshToken}` },
    });
    assert.equal(reused.status, 401);
  });

  it('logs out, clears cookies, and /me fails afterwards', async () => {
    const { email } = await createTestUser();
    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    assert.ok(jar.smw_access_token && jar.smw_refresh_token);

    const result = await api('/api/v1/auth/logout', { method: 'POST' });

    assert.equal(result.status, 200);
    assert.equal(jar.smw_access_token, undefined, 'access cookie cleared');
    assert.equal(jar.smw_refresh_token, undefined, 'refresh cookie cleared');
    assert.equal(jar.smw_session, undefined, 'session hint cleared');

    const me = await api('/api/v1/auth/me');
    assert.equal(me.status, 401);
  });

  it('is safe to call logout when already logged out', async () => {
    const result = await api('/api/v1/auth/logout', { method: 'POST' });
    assert.equal(result.status, 200);
  });

  it('returns 401 for /me without any credential', async () => {
    const result = await api('/api/v1/auth/me');
    assert.equal(result.status, 401);
  });
});
