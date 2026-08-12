import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import cookieParser from 'cookie-parser';
import express from 'express';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { RefreshSessionModel } from '../models/refreshSession.model.js';
import { UserModel } from '../models/user.model.js';
import { apiRouter } from '../routes/index.js';
import { hashPassword } from '../utils/password.js';
import { requireAuth } from './auth.middleware.js';
import { errorHandler, notFoundHandler } from './errorHandler.js';
import { requireRole } from './role.middleware.js';

// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

/** Typed shape of the harness responses used by the assertions below. */
interface HarnessBody {
  data?: { granted?: boolean };
  error?: { statusCode?: number; message?: string };
}

interface RequestResult {
  status: number;
  body: HarnessBody;
}

/**
 * Test-only authorization harness. Reuses the real API router (real login flow,
 * HttpOnly cookies), the real requireAuth + requireRole middleware and the real
 * error handler, then mounts two protected test-only routes. Nothing here ships
 * to production.
 */
function buildHarness(): express.Express {
  const harness = express();
  harness.use(cookieParser());
  harness.use(express.json());
  harness.use(apiRouter);

  harness.get(
    '/test/rbac/super-admin-only',
    requireAuth,
    requireRole('SUPER_ADMIN'),
    (_req, res) => {
      res.status(200).json({ success: true, data: { granted: true } });
    },
  );

  harness.get(
    '/test/rbac/admin-or-super-admin',
    requireAuth,
    requireRole('ADMIN', 'SUPER_ADMIN'),
    (_req, res) => {
      res.status(200).json({ success: true, data: { granted: true } });
    },
  );

  harness.use(notFoundHandler);
  harness.use(errorHandler);
  return harness;
}

describeDb('requireRole (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  const createdUserIds: string[] = [];

  async function createUser(
    role: 'SUPER_ADMIN' | 'ADMIN',
    status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
  ): Promise<{ id: string; email: string }> {
    const email = `rbac-test-${Date.now()}-${Math.random().toString(36).slice(2)}-${role.toLowerCase()}@example.test`;
    const user = await UserModel.create({
      name: `RBAC ${role}`,
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role,
      status,
    });
    createdUserIds.push(user.id);
    return { id: user.id, email };
  }

  /** Authenticates through the real login flow and returns the cookie header. */
  async function loginCookies(email: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    assert.equal(res.status, 200, 'login must succeed for a valid ACTIVE test user');
    return res.headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ');
  }

  async function request(path: string, cookieHeader?: string): Promise<RequestResult> {
    const res = await fetch(`${baseUrl}${path}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });
    const body = (await res.json().catch(() => null)) as HarnessBody;
    return { status: res.status, body };
  }

  before(async () => {
    await connectToDatabase();
    await UserModel.init();
    await RefreshSessionModel.init();
    server = createServer(buildHarness());
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
    // The cleanup must be complete: every user/session this suite created is gone.
    const remainingUsers = await UserModel.countDocuments({ _id: { $in: createdUserIds } });
    const remainingSessions = await RefreshSessionModel.countDocuments({
      userId: { $in: createdUserIds },
    });
    assert.equal(remainingUsers, 0, 'all test users must be cleaned up');
    assert.equal(remainingSessions, 0, 'all test refresh sessions must be cleaned up');

    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  });

  it('lets a SUPER_ADMIN pass a SUPER_ADMIN-only route', async () => {
    const { email } = await createUser('SUPER_ADMIN');
    const cookies = await loginCookies(email);

    const result = await request('/test/rbac/super-admin-only', cookies);

    assert.equal(result.status, 200);
    assert.equal(result.body.data?.granted, true);
  });

  it('rejects an ADMIN with 403 on a SUPER_ADMIN-only route', async () => {
    const { email } = await createUser('ADMIN');
    const cookies = await loginCookies(email);

    const result = await request('/test/rbac/super-admin-only', cookies);

    assert.equal(result.status, 403);
    assert.equal(result.body.error?.message, 'Insufficient permissions.');
  });

  it('lets an ADMIN pass an ADMIN-or-SUPER_ADMIN route', async () => {
    const { email } = await createUser('ADMIN');
    const cookies = await loginCookies(email);

    const result = await request('/test/rbac/admin-or-super-admin', cookies);

    assert.equal(result.status, 200);
    assert.equal(result.body.data?.granted, true);
  });

  it('lets a SUPER_ADMIN pass an ADMIN-or-SUPER_ADMIN route', async () => {
    const { email } = await createUser('SUPER_ADMIN');
    const cookies = await loginCookies(email);

    const result = await request('/test/rbac/admin-or-super-admin', cookies);

    assert.equal(result.status, 200);
  });

  it('returns 401 for an unauthenticated request', async () => {
    const result = await request('/test/rbac/super-admin-only');

    assert.equal(result.status, 401);
    assert.equal(result.body.error?.message, 'Authentication required.');
  });

  it('keeps rejecting INACTIVE users at the authentication layer', async () => {
    const { email } = await createUser('ADMIN', 'INACTIVE');

    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });

    assert.equal(res.status, 401);
  });
});
