import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../utils/ApiError.js';
import { validateLoginInput } from './auth.service.js';

/** Asserts the callback throws an ApiError with the given status code. */
function expectsBadRequest(callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, 400, message);
    return true;
  });
}

describe('auth service - login input validation', () => {
  it('accepts valid input and normalizes the email', () => {
    const result = validateLoginInput(' Jane@Example.COM ', 'secret123');
    assert.deepEqual(result, { email: 'jane@example.com', password: 'secret123' });
  });

  it('rejects a missing email', () => {
    expectsBadRequest(() => validateLoginInput(undefined, 'secret123'), 'missing email');
  });

  it('rejects a non-string email', () => {
    expectsBadRequest(() => validateLoginInput(123, 'secret123'), 'non-string email');
  });

  it('rejects a malformed email', () => {
    expectsBadRequest(() => validateLoginInput('not-an-email', 'secret123'), 'malformed email');
  });

  it('rejects a missing password', () => {
    expectsBadRequest(
      () => validateLoginInput('jane@example.com', undefined),
      'missing password',
    );
  });

  it('rejects an empty or whitespace-only password', () => {
    expectsBadRequest(
      () => validateLoginInput('jane@example.com', '   '),
      'whitespace password',
    );
  });
});
