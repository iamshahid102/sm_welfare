import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../utils/ApiError.js';
import { validateAdminCredentials } from './adminAccount.service.js';

/**
 * Validation-level tests - pure in-memory, no MongoDB or network required.
 * They cover the missing-credential, invalid-email and invalid-password rules.
 * Database-backed behaviour (creation, the one-admin guard, serialization,
 * the auth flow) is exercised through the auth route tests.
 */

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

describe('administrator provisioning - credential validation', () => {
  it('accepts valid credentials and normalizes the email', () => {
    const result = validateAdminCredentials(' Admin@Example.COM ', 'secret123');
    assert.deepEqual(result, { email: 'admin@example.com', password: 'secret123' });
  });

  it('rejects a missing email', () => {
    expectsError(400, () => validateAdminCredentials(undefined, 'secret123'), 'missing email');
    expectsError(400, () => validateAdminCredentials('', 'secret123'), 'empty email');
    expectsError(400, () => validateAdminCredentials('   ', 'secret123'), 'whitespace email');
  });

  it('rejects a non-string email', () => {
    expectsError(400, () => validateAdminCredentials(123, 'secret123'), 'numeric email');
  });

  it('rejects a malformed email', () => {
    expectsError(400, () => validateAdminCredentials('not-an-email', 'secret123'), 'no @');
    expectsError(400, () => validateAdminCredentials('a@b', 'secret123'), 'no dot in domain');
    expectsError(400, () => validateAdminCredentials('a b@example.com', 'secret123'), 'space in email');
  });

  it('rejects a missing password', () => {
    expectsError(400, () => validateAdminCredentials('admin@example.com', undefined), 'missing password');
    expectsError(400, () => validateAdminCredentials('admin@example.com', ''), 'empty password');
    expectsError(400, () => validateAdminCredentials('admin@example.com', '   '), 'whitespace password');
  });

  it('rejects a non-string password', () => {
    expectsError(400, () => validateAdminCredentials('admin@example.com', 123), 'numeric password');
  });

  it('rejects a password longer than the bcrypt 72-byte limit', () => {
    expectsError(
      400,
      () => validateAdminCredentials('admin@example.com', 'x'.repeat(73)),
      'password over 72 bytes',
    );
  });

  it('accepts a password at exactly the 72-byte limit', () => {
    const password = 'x'.repeat(72);
    const result = validateAdminCredentials('admin@example.com', password);
    assert.equal(result.password, password);
  });
});
