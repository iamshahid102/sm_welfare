import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { app } from '../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { RefreshSessionModel } from '../models/refreshSession.model.js';
import { UserModel } from '../models/user.model.js';
import { provisionInitialSuperAdmin } from '../services/superAdmin.service.js';
import type { SafeUser } from '../types/auth.js';
import { ApiError } from '../utils/ApiError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

/**
 * End-to-end provisioning tests against the real MongoDB database.
 *
 * Covers requirements D-M: creating the first SUPER_ADMIN, its role/status,
 * bcrypt-only password storage, serialization safety, the one-time guard, the
 * ADMIN non-conversion rule, and the full HTTP flow (login, HttpOnly cookies,
 * /auth/me, RBAC) through the real API router.
 *
 * Everything the suite creates is tracked by _id with a unique email and
 * removed in `after`, so the connected database is left as it was found.
 *
 * Because provisioning is a strict one-time operation, the account-dependent
 * tests can only run while no SUPER_ADMIN exists in the database. When one
 * already exists they are skipped (the fail-safe itself is still verified),
 * which keeps the suite safe to run against any database state.
 */
// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';
const TEST_ADMIN_PASSWORD = 'Another-Strong-Password-4!';

interface CookieJar {
  [name: string]: string;
}

interface ApiResult {
  status: number;
  body: {
    success?: boolean;
    data?: { user?: Record<string, unknown>; [key: string]: unknown };
    error?: { message?: string };
  };
  res: Response;
}

const SKIP_REASON = 'a SUPER_ADMIN already exists in the database; could not provision a test account';

// Other MongoDB-backed suites (user model, role middleware, admin routes)
// create SUPER_ADMIN users directly and hold them until their own after().
// Because provisioning is a strict one-time operation, this suite waits for a
// window with no SUPER_ADMIN before provisioning its own test account.
const PROVISION_WAIT_TIMEOUT_MS = 120_000;
const PROVISION_POLL_INTERVAL_MS = 250;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Unique email per run - a leftover from a crashed run can never collide. */
function testEmail(label: string): string {
  return `super-admin-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
}

/**
 * Resolves true once no SUPER_ADMIN exists in the database (or false on
 * timeout). Polling is bounded so the suite can never hang on a pathological
 * database state.
 */
async function waitUntilNoSuperAdmin(timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await UserModel.exists({ role: 'SUPER_ADMIN' })) === null) {
      return true;
    }
    await sleep(PROVISION_POLL_INTERVAL_MS);
  }
  return false;
}

/**
 * Waits for a quiet window (no SUPER_ADMIN in the database) and provisions a
 * test account inside it. Returns null when no window appears within the
 * timeout, or after repeatedly losing the race against parallel suites - the
 * caller then skips the account-dependent tests.
 */
async function provisionTestSuperAdmin(): Promise<SafeUser | null> {
  const deadline = Date.now() + PROVISION_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (!(await waitUntilNoSuperAdmin(deadline - Date.now()))) {
      return null;
    }
    try {
      return await provisionInitialSuperAdmin(testEmail('provisioned'), TEST_PASSWORD);
    } catch (error) {
      // A parallel suite grabbed the one SUPER_ADMIN slot between our check and
      // the insert - wait for the next quiet window and retry. Any other error
      // (e.g. MongoDB failure) propagates and fails the suite loudly.
      if (!(error instanceof ApiError && error.statusCode === 409)) {
        throw error;
      }
    }
  }
  return null;
}

describeDb('initial SUPER_ADMIN provisioning (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let provisioned: SafeUser | null = null;
  const jar: CookieJar = {};
  const createdIds: string[] = [];

  /** Asserts the callback rejects with a 409 conflict ApiError. */
  function expectsConflict(callback: () => Promise<unknown>): Promise<void> {
    return assert.rejects(callback, (error: unknown) => {
      assert.ok(error instanceof ApiError, 'expected an ApiError');
      assert.equal(error.statusCode, 409, 'expected a 409 conflict');
      return true;
    });
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
    const body = (await res.json().catch(() => null)) as ApiResult['body'];
    return { status: res.status, body, res };
  }

  before(async () => {
    await connectToDatabase();
    await UserModel.init();
    await RefreshSessionModel.init();

    // Provision our own SUPER_ADMIN once the database allows it. The account is
    // tracked by _id and removed in `after`, so nothing permanent is left behind.
    provisioned = await provisionTestSuperAdmin();
    if (provisioned) {
      createdIds.push(provisioned.id);
    } else {
      // No quiet window: another suite kept holding a SUPER_ADMIN. The
      // account-dependent tests skip (t.skip) and the fail-safe tests still run.
      console.warn(
        `[provision test] no quiet window within ${PROVISION_WAIT_TIMEOUT_MS}ms; skipping account-dependent tests`,
      );
    }

    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }
  });

  after(async () => {
    if (createdIds.length > 0) {
      await RefreshSessionModel.deleteMany({ userId: { $in: createdIds } });
      await UserModel.deleteMany({ _id: { $in: createdIds } });
    }
    // The cleanup must be complete: every user this suite created is gone.
    const remainingUsers = await UserModel.countDocuments({ _id: { $in: createdIds } });
    assert.equal(remainingUsers, 0, 'all test users must be cleaned up');

    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  });

  it('provisions the first SUPER_ADMIN with role SUPER_ADMIN, status ACTIVE and a bcrypt hash', async (t) => {
    if (!provisioned) {
      t.skip(SKIP_REASON);
      return;
    }

    // E. role and F. status are fixed by the mechanism, never taken from input.
    assert.equal(provisioned.role, 'SUPER_ADMIN');
    assert.equal(provisioned.status, 'ACTIVE');
    assert.equal(provisioned.name, 'Super Admin', 'default name applied when none is given');

    // G. the password is stored only as a bcrypt hash - never plaintext.
    const stored = await UserModel.findById(provisioned.id).select('+passwordHash');
    assert.ok(stored, 'expected the provisioned user to be readable');
    assert.notEqual(stored.passwordHash, TEST_PASSWORD, 'plaintext must never be stored');
    assert.match(stored.passwordHash, /^\$2[aby]\$\d{2}\$/, 'bcrypt format prefix');
    assert.equal(stored.passwordHash.length, 60, 'standard bcrypt hash length');
    assert.equal(await verifyPassword(TEST_PASSWORD, stored.passwordHash), true);
    assert.equal(await verifyPassword('Definitely-Wrong-123!', stored.passwordHash), false);
  });

  it('never exposes passwordHash through serialization', async (t) => {
    if (!provisioned) {
      t.skip(SKIP_REASON);
      return;
    }

    // H. the service return value (SafeUser) carries no hash - not even a key.
    assert.equal('passwordHash' in provisioned, false);
    assert.equal(JSON.stringify(provisioned).includes('passwordHash'), false);

    // H. a freshly loaded document is equally safe through toJSON()/toObject().
    const stored = await UserModel.findById(provisioned.id);
    assert.ok(stored);
    const serialized = stored.toJSON();
    assert.equal('passwordHash' in serialized, false);
    assert.equal(JSON.stringify(serialized).includes(TEST_PASSWORD), false);
  });

  it('rejects a second provisioning attempt and creates nothing', async () => {
    // A SUPER_ADMIN is guaranteed to exist here: either one pre-existed or the
    // suite provisioned its own above. Either way provisioning must fail (I).
    const email = testEmail('second');

    await expectsConflict(() => provisionInitialSuperAdmin(email, TEST_PASSWORD));

    assert.equal(
      await UserModel.exists({ email }),
      null,
      'no new user may be created by a rejected attempt',
    );
  });

  it('cannot convert an existing ADMIN into a SUPER_ADMIN', async () => {
    const email = testEmail('admin-collision');

    const admin = await UserModel.create({
      name: 'Existing Admin',
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    createdIds.push(admin.id);

    // Provisioning with the ADMIN's email must conflict - the existing account
    // is never promoted, shadowed or converted (J).
    await expectsConflict(() => provisionInitialSuperAdmin(email, TEST_PASSWORD));

    const reloaded = await UserModel.findById(admin.id).select('+passwordHash');
    assert.ok(reloaded, 'the existing admin must still exist');
    assert.equal(reloaded.role, 'ADMIN', 'role must be untouched');
    assert.equal(reloaded.status, 'ACTIVE');
    assert.equal(reloaded.passwordHash, admin.passwordHash, 'password must be untouched');
    assert.equal(
      await UserModel.countDocuments({ role: 'SUPER_ADMIN', email }),
      0,
      'no SUPER_ADMIN may be created for an existing email',
    );
  });

  it('logs in with the provisioned SUPER_ADMIN and sets HttpOnly cookies', async (t) => {
    if (!provisioned) {
      t.skip(SKIP_REASON);
      return;
    }

    const result = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: provisioned.email, password: TEST_PASSWORD }),
    });

    assert.equal(result.status, 200);
    assert.equal(result.body.data?.user?.role, 'SUPER_ADMIN');
    // K. the response body never carries the hash.
    assert.equal('passwordHash' in (result.body.data?.user ?? {}), false);

    // HttpOnly authentication cookies arrive with secure flags.
    assert.ok(jar.smw_access_token, 'access cookie set');
    assert.ok(jar.smw_refresh_token, 'refresh cookie set');
    const setCookies = result.res.headers.getSetCookie().join('\n');
    assert.match(setCookies, /HttpOnly/i);
    assert.match(setCookies, /SameSite=lax/i);
    assert.match(setCookies, /Path=\//i);
  });

  it('returns the provisioned user from /me with role SUPER_ADMIN', async (t) => {
    if (!provisioned) {
      t.skip(SKIP_REASON);
      return;
    }

    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: provisioned.email, password: TEST_PASSWORD }),
    });

    const result = await api('/api/v1/auth/me');

    assert.equal(result.status, 200);
    assert.equal(result.body.data?.user?.email, provisioned.email);
    assert.equal(result.body.data?.user?.role, 'SUPER_ADMIN');
    assert.equal(result.body.data?.user?.status, 'ACTIVE');
    assert.equal('passwordHash' in (result.body.data?.user ?? {}), false);
  });

  it('enforces RBAC: SUPER_ADMIN passes, ADMIN is rejected with 403', async (t) => {
    if (!provisioned) {
      t.skip(SKIP_REASON);
      return;
    }

    // M. the provisioned account passes a SUPER_ADMIN-only route.
    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: provisioned.email, password: TEST_PASSWORD }),
    });
    const superAdminList = await api('/api/v1/admins');
    assert.equal(superAdminList.status, 200, 'SUPER_ADMIN can list admins');

    // Create a real ADMIN through the SUPER_ADMIN-only API so it can be tested
    // for the 403 - the same flow the manual verification uses.
    const adminEmail = `provisioned-admin-${Date.now()}-${Math.random().toString(36).slice(2)}@example.test`;
    const create = await api('/api/v1/admins', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Provisioned Admin',
        email: adminEmail,
        password: TEST_ADMIN_PASSWORD,
      }),
    });
    assert.equal(create.status, 201, 'SUPER_ADMIN can create an ADMIN');
    const adminId = create.body?.data?.user?.id;
    assert.ok(typeof adminId === 'string', 'created ADMIN must have an id');
    createdIds.push(adminId);

    // An ADMIN must be rejected with 403 on the SUPER_ADMIN-only route.
    await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: adminEmail, password: TEST_ADMIN_PASSWORD }),
    });
    const adminList = await api('/api/v1/admins');
    assert.equal(adminList.status, 403, 'ADMIN cannot list admins');
    assert.equal(adminList.body.error?.message, 'Insufficient permissions.');
  });
});
