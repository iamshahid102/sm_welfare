import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../utils/ApiError.js';
import {
  validateAdminId,
  validateCreateAdminInput,
  validateListAdminsQuery,
} from './admin.service.js';

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

describe('admin service - create admin input validation', () => {
  it('accepts valid input and normalizes the email', () => {
    const result = validateCreateAdminInput(' Jane Admin ', ' Jane@Example.COM ', 'secret123');
    assert.deepEqual(result, { name: 'Jane Admin', email: 'jane@example.com', password: 'secret123' });
  });

  it('accepts a name of exactly 100 characters', () => {
    const name = 'a'.repeat(100);
    const result = validateCreateAdminInput(name, 'jane@example.com', 'secret123');
    assert.equal(result.name, name);
  });

  it('rejects a missing or whitespace-only name', () => {
    expectsError(400, () => validateCreateAdminInput('   ', 'jane@example.com', 'secret123'), 'whitespace name');
    expectsError(400, () => validateCreateAdminInput(undefined, 'jane@example.com', 'secret123'), 'missing name');
  });

  it('rejects an over-long name', () => {
    expectsError(
      400,
      () => validateCreateAdminInput('a'.repeat(101), 'jane@example.com', 'secret123'),
      'name longer than 100 chars',
    );
  });

  it('rejects a malformed email', () => {
    expectsError(
      400,
      () => validateCreateAdminInput('Jane', 'not-an-email', 'secret123'),
      'malformed email',
    );
  });

  it('rejects a non-string email', () => {
    expectsError(
      400,
      () => validateCreateAdminInput('Jane', 123, 'secret123'),
      'non-string email',
    );
  });

  it('rejects a missing password', () => {
    expectsError(
      400,
      () => validateCreateAdminInput('Jane', 'jane@example.com', undefined),
      'missing password',
    );
  });

  it('rejects an empty or whitespace-only password', () => {
    expectsError(
      400,
      () => validateCreateAdminInput('Jane', 'jane@example.com', '   '),
      'whitespace password',
    );
  });

  it('rejects a password longer than the bcrypt 72-byte limit', () => {
    expectsError(
      400,
      () => validateCreateAdminInput('Jane', 'jane@example.com', 'x'.repeat(73)),
      'password over 72 bytes',
    );
  });
});

describe('admin service - admin id validation', () => {
  it('accepts a well-formed ObjectId', () => {
    const id = '64b7f2c4a1b2c3d4e5f6a7b8';
    const objectId = validateAdminId(id);
    assert.equal(objectId.toString(), id);
  });

  it('rejects a non-string id', () => {
    expectsError(400, () => validateAdminId(undefined), 'missing id');
    expectsError(400, () => validateAdminId(123), 'numeric id');
  });

  it('rejects a malformed ObjectId', () => {
    expectsError(400, () => validateAdminId('not-an-id'), 'malformed id');
    expectsError(400, () => validateAdminId(''), 'empty id');
    // 12-byte strings pass Types.ObjectId.isValid but are not canonical ids.
    expectsError(400, () => validateAdminId('abcdefghijkl'), '12-char id');
  });
});

describe('admin service - list query validation', () => {
  it('applies defaults when no parameters are provided', () => {
    assert.deepEqual(validateListAdminsQuery({}), {
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
    });
  });

  it('accepts explicit valid pagination, search and status', () => {
    assert.deepEqual(
      validateListAdminsQuery({
        page: '2',
        limit: '25',
        search: '  sm  ',
        status: 'INACTIVE',
      }),
      { page: 2, limit: 25, search: 'sm', status: 'INACTIVE' },
    );
  });

  it('rejects non-integer, negative, zero or over-cap page values', () => {
    for (const page of ['0', '-1', '2.5', 'abc', '1e2', '10001']) {
      expectsError(
        400,
        () => validateListAdminsQuery({ page }),
        `page=${page} must be rejected`,
      );
    }
  });

  it('rejects limit values outside 1..100', () => {
    for (const limit of ['0', '-5', '101', '2.5', 'abc']) {
      expectsError(
        400,
        () => validateListAdminsQuery({ limit }),
        `limit=${limit} must be rejected`,
      );
    }
  });

  it('accepts the maximum allowed limit', () => {
    const result = validateListAdminsQuery({ limit: '100' });
    assert.equal(result.limit, 100);
  });

  it('rejects an invalid status value', () => {
    expectsError(
      400,
      () => validateListAdminsQuery({ status: 'BANNED' }),
      'unknown status',
    );
  });

  it('treats an empty search as no search', () => {
    const result = validateListAdminsQuery({ search: '   ' });
    assert.equal(result.search, undefined);
  });

  it('rejects a non-string search', () => {
    expectsError(
      400,
      () => validateListAdminsQuery({ search: ['a'] }),
      'array search',
    );
  });
});
