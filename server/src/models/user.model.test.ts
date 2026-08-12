import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Error as MongooseError } from 'mongoose';
import { UserModel } from './user.model.js';
import type { User } from './user.model.js';

/**
 * Schema-level tests - these require no MongoDB connection because they only
 * exercise document.validate() and toJSON() (Mongoose validation runs fully
 * in memory). Database-backed behavior (unique index, timestamps, projection)
 * is covered in user.model.db.test.ts.
 */

const VALID_USER = {
  name: 'Jane Admin',
  email: 'jane@example.com',
  passwordHash: 'hashed-password-value',
  role: 'ADMIN' as const,
  status: 'ACTIVE' as const,
  lastLoginAt: null,
};

function buildUser(overrides: Partial<User> = {}): InstanceType<typeof UserModel> {
  return new UserModel({ ...VALID_USER, ...overrides });
}

/** Resolves with the validation error, or undefined when validation passes. */
async function validationError(
  validation: Promise<void>,
): Promise<MongooseError.ValidationError | undefined> {
  return validation.then(
    () => undefined,
    (error: unknown) => error as MongooseError.ValidationError,
  );
}

describe('User model (schema-level)', () => {
  it('accepts a valid user document and normalizes the email', async () => {
    const user = buildUser({
      name: '  Jane Admin  ',
      email: ' JANE@Example.COM ',
    });

    await user.validate();

    assert.equal(user.name, 'Jane Admin');
    assert.equal(user.email, 'jane@example.com');
    assert.equal(user.role, 'ADMIN');
    assert.equal(user.status, 'ACTIVE');
    assert.equal(user.lastLoginAt, null);
  });

  it('accepts the SUPER_ADMIN role', async () => {
    const user = buildUser({ role: 'SUPER_ADMIN' });
    await user.validate();
    assert.equal(user.role, 'SUPER_ADMIN');
  });

  it('rejects a user without a name', async () => {
    const user = new UserModel({
      email: VALID_USER.email,
      passwordHash: VALID_USER.passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const error = await validationError(user.validate());
    assert.ok(error?.errors.name, 'expected a validation error on name');
  });

  it('rejects a user without an email', async () => {
    const user = new UserModel({
      name: VALID_USER.name,
      passwordHash: VALID_USER.passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const error = await validationError(user.validate());
    assert.ok(error?.errors.email, 'expected a validation error on email');
  });

  it('rejects a malformed email', async () => {
    const user = buildUser({ email: 'not-an-email' });

    const error = await validationError(user.validate());
    assert.ok(error?.errors.email, 'expected a validation error on email');
  });

  it('rejects a user without a passwordHash', async () => {
    const user = new UserModel({
      name: VALID_USER.name,
      email: VALID_USER.email,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    const error = await validationError(user.validate());
    assert.ok(error?.errors.passwordHash, 'expected a validation error on passwordHash');
  });

  it('rejects an unsupported role', async () => {
    const user = buildUser();
    user.set('role', 'EDITOR');

    const error = await validationError(user.validate());
    assert.ok(error?.errors.role, 'expected a validation error on role');
    assert.match(error?.errors.role?.message ?? '', /EDITOR/);
  });

  it('rejects an unsupported status', async () => {
    const user = buildUser();
    user.set('status', 'SUSPENDED');

    const error = await validationError(user.validate());
    assert.ok(error?.errors.status, 'expected a validation error on status');
    assert.match(error?.errors.status?.message ?? '', /SUSPENDED/);
  });

  it('does not expose passwordHash through normal serialization', () => {
    const user = buildUser();

    // The hash stays available on the document itself (future auth needs it)...
    assert.equal(user.passwordHash, 'hashed-password-value');

    // ...but it must never leave through toJSON()/JSON.stringify().
    const serialized = user.toJSON();
    assert.equal('passwordHash' in serialized, false);
    assert.equal('name' in serialized, true);
    assert.equal(JSON.stringify(user).includes('hashed-password-value'), false);
  });
});
