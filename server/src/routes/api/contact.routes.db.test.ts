import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { ContactMessageModel } from '../../models/contactMessage.model.js';
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

interface ContactShape {
  id: string;
  name: string;
  subject: string;
  submittedAt: string;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

function asContact(body: unknown): ContactShape {
  return (body as { data: ContactShape }).data;
}

describeDb('Contact API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let adminCookies = '';
  const trackedMessageIds: string[] = [];
  const trackedUserIds: string[] = [];

  /** Unique per-run token so parallel suite runs never collide. */
  function uniqueToken(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

  /** A valid contact payload; email is mixed-case on purpose to test normalization. */
  function validPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      name: `Contact ${uniqueToken('test')}`,
      email: '  Sender@Example.COM  ',
      topic: 'Donation',
      message: 'I would like to donate to the ration programme.',
      ...overrides,
    };
  }

  async function createUser(role: 'ADMIN'): Promise<string> {
    const email = `${uniqueToken(`contact-${role.toLowerCase()}`)}@example.test`;
    const user = await UserModel.create({
      name: `Contact Test ${role}`,
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
    return res
      .headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ');
  }

  before(async () => {
    await connectToDatabase();
    await UserModel.init();

    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    adminCookies = await loginCookies(await createUser('ADMIN'));
  });

  after(async () => {
    if (trackedMessageIds.length > 0) {
      await ContactMessageModel.deleteMany({ _id: { $in: trackedMessageIds } });
    }
    if (trackedUserIds.length > 0) {
      await UserModel.deleteMany({ _id: { $in: trackedUserIds } });
    }
    if (server) {
      server.close();
      await once(server, 'close');
    }
    await disconnectFromDatabase();
  });

  it('stores a valid message, normalizes the email and ignores unknown fields', async () => {
    const payload = validPayload({ role: 'SUPER_ADMIN' });
    const result = await request('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    assert.equal(result.status, 201);
    const contact = asContact(result.body);
    trackedMessageIds.push(contact.id);
    assert.equal(contact.subject, 'Donation');

    const stored = await ContactMessageModel.findById(contact.id).lean();
    assert.ok(stored, 'message must be persisted');
    assert.equal(stored.email, 'sender@example.com', 'email is stored lowercased');
    assert.equal('role' in stored, false, 'unknown fields are never persisted');
  });

  it('defaults a missing topic to an empty string', async () => {
    const { topic: _omitted, ...withoutTopic } = validPayload();
    const result = await request('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(withoutTopic),
    });

    assert.equal(result.status, 201);
    const contact = asContact(result.body);
    trackedMessageIds.push(contact.id);
    assert.equal(contact.subject, '');
  });

  it('rejects a malformed email with 400 and stores nothing', async () => {
    const result = await request('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(validPayload({ email: 'not-an-email' })),
    });

    assert.equal(result.status, 400);
    assert.equal(asError(result.body).message, 'Provide a valid email address.');
  });

  it('rejects a missing message with 400', async () => {
    const { message: _omitted, ...withoutMessage } = validPayload();
    const result = await request('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(withoutMessage),
    });

    assert.equal(result.status, 400);
    assert.equal(asError(result.body).message, 'Message is required.');
  });

  it('refuses an unauthenticated read with 401', async () => {
    const created = await request('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(validPayload()),
    });
    assert.equal(created.status, 201);
    const contact = asContact(created.body);
    trackedMessageIds.push(contact.id);

    const read = await request(`/api/v1/contact/${contact.id}`);
    assert.equal(read.status, 401);
  });

  it('lets an ADMIN read a stored message and rejects a malformed id', async () => {
    const created = await request('/api/v1/contact', {
      method: 'POST',
      body: JSON.stringify(validPayload()),
    });
    assert.equal(created.status, 201);
    const contact = asContact(created.body);
    trackedMessageIds.push(contact.id);

    const read = await request(`/api/v1/contact/${contact.id}`, {}, adminCookies);
    assert.equal(read.status, 200);

    const invalid = await request('/api/v1/contact/not-an-id', {}, adminCookies);
    assert.equal(invalid.status, 400);
    assert.equal(asError(invalid.body).message, 'Invalid message id.');

    const missing = await request(
      '/api/v1/contact/000000000000000000000000',
      {},
      adminCookies,
    );
    assert.equal(missing.status, 404);
  });
});
