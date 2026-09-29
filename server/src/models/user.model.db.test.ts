import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import dns from 'node:dns';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { UserModel } from './user.model.js';

/**
 * Database-backed User model tests.
 *
 * These require a real MongoDB instance and are skipped (reported as skipped,
 * never failing) when MONGODB_URI is not set. They reuse the centralized
 * connection from config/database.js - no second connection is created.
 * `node:test` has no describe.skipIf, so the suite is conditionally declared
 * with describe.skip.
 */
// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

describeDb('User model (MongoDB-backed)', () => {
  // Only documents created by these tests are cleaned up afterwards - the
  // connected database is otherwise left untouched.
  const createdIds: string[] = [];

  before(async () => {
    await connectToDatabase();
    // Ensure the unique email index exists before the duplicate test runs.
    await UserModel.init();
  });

  after(async () => {
    if (createdIds.length > 0) {
      await UserModel.deleteMany({ _id: { $in: createdIds } });
    }
    await disconnectFromDatabase();
  });

  it('persists a valid user with timestamps', async () => {
    const user = await UserModel.create({
      name: 'Db Admin',
      email: `db-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: 'hashed-password-value',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    createdIds.push(user.id);

    assert.ok(user.createdAt instanceof Date);
    assert.ok(user.updatedAt instanceof Date);

    const fetched = await UserModel.findById(user.id);
    assert.ok(fetched, 'expected the user to be readable after save');
  });

  it('keeps passwordHash out of default queries unless requested explicitly', async () => {
    const user = await UserModel.create({
      name: 'Hash Check',
      email: `hash-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      passwordHash: 'hashed-password-value',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    createdIds.push(user.id);

    // Default query: select: false keeps the hash out of the projection.
    const fetched = await UserModel.findById(user.id);
    assert.equal(fetched?.passwordHash, undefined);

    // Explicit request: the hash is retrievable for password verification.
    const withHash = await UserModel.findById(user.id).select('+passwordHash');
    assert.equal(withHash?.passwordHash, 'hashed-password-value');

    // Serialization is safe even on a freshly loaded document.
    const serialized = fetched?.toJSON();
    assert.equal('passwordHash' in (serialized ?? {}), false);
  });

  it('enforces email uniqueness case-insensitively via normalization', async () => {
    const email = `dup-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    const first = await UserModel.create({
      name: 'Dup One',
      email: email.toUpperCase(),
      passwordHash: 'hash-one',
      role: 'ADMIN',
      status: 'ACTIVE',
    });
    createdIds.push(first.id);

    // Stored normalized to lowercase, so the uppercase form deduplicates.
    assert.equal(first.email, email);

    await assert.rejects(
      UserModel.create({
        name: 'Dup Two',
        email: email.toUpperCase(),
        passwordHash: 'hash-two',
        role: 'ADMIN',
        status: 'ACTIVE',
      }),
      (error: unknown) =>
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000,
    );
  });
});
