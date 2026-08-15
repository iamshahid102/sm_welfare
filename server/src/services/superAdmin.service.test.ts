import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../utils/ApiError.js';
import { validateSuperAdminCredentials } from './superAdmin.service.js';

/**
 * Validation-level tests - pure in-memory, no MongoDB or network required.
 * They cover requirements A (missing credentials), B (invalid email) and
 * C (invalid password). Database-backed behavior (creation, one-time guard,
 * serialization, auth flow) is covered in superAdmin.service.db.test.ts and
 * provisionSuperAdmin.db.test.ts.
 */

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

describe('super admin provisioning - credential validation', () => {
  it('accepts valid credentials and normalizes the email', () => {
    const result = validateSuperAdminCredentials(' Super.Admin@Example.COM ', 'secret123');
    assert.deepEqual(result, { email: 'super.admin@example.com', password: 'secret123' });
  });

  it('rejects a missing email', () => {
    expectsError(400, () => validateSuperAdminCredentials(undefined, 'secret123'), 'missing email');
    expectsError(400, () => validateSuperAdminCredentials('', 'secret123'), 'empty email');
    expectsError(400, () => validateSuperAdminCredentials('   ', 'secret123'), 'whitespace email');
  });

  it('rejects a non-string email', () => {
    expectsError(400, () => validateSuperAdminCredentials(123, 'secret123'), 'numeric email');
  });

  it('rejects a malformed email', () => {
    expectsError(400, () => validateSuperAdminCredentials('not-an-email', 'secret123'), 'no @');
    expectsError(400, () => validateSuperAdminCredentials('a@b', 'secret123'), 'no dot in domain');
    expectsError(400, () => validateSuperAdminCredentials('a b@example.com', 'secret123'), 'space in email');
  });

  it('rejects a missing password', () => {
    expectsError(400, () => validateSuperAdminCredentials('admin@example.com', undefined), 'missing password');
    expectsError(400, () => validateSuperAdminCredentials('admin@example.com', ''), 'empty password');
    expectsError(400, () => validateSuperAdminCredentials('admin@example.com', '   '), 'whitespace password');
  });

  it('rejects a non-string password', () => {
    expectsError(400, () => validateSuperAdminCredentials('admin@example.com', 123), 'numeric password');
  });

  it('rejects a password longer than the bcrypt 72-byte limit', () => {
    expectsError(
      400,
      () => validateSuperAdminCredentials('admin@example.com', 'x'.repeat(73)),
      'password over 72 bytes',
    );
  });

  it('accepts a password at exactly the 72-byte limit', () => {
    const password = 'x'.repeat(72);
    const result = validateSuperAdminCredentials('admin@example.com', password);
    assert.equal(result.password, password);
  });
});
