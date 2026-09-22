import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../../utils/ApiError.js';
import {
  validateContactMessageInput,
  validateListMessagesQuery,
} from './contact.routes.js';

/**
 * Validation-level tests - pure in-memory, no MongoDB or network required.
 * They cover the public contact payload: required fields, field types, the
 * optional topic and the length limits.
 */

const VALID_PAYLOAD = {
  name: '  Ayesha Khan  ',
  email: '  Donor@Example.COM ',
  topic: '  Donation  ',
  message: '  I would like to donate for the ration programme.  ',
};

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

describe('contact message validation', () => {
  it('accepts a valid payload and normalizes name/email/topic/message', () => {
    const result = validateContactMessageInput(VALID_PAYLOAD);
    assert.deepEqual(result, {
      name: 'Ayesha Khan',
      email: 'donor@example.com',
      topic: 'Donation',
      message: 'I would like to donate for the ration programme.',
    });
  });

  it('treats a missing topic as an empty string', () => {
    const { topic: _omitted, ...withoutTopic } = VALID_PAYLOAD;
    const result = validateContactMessageInput(withoutTopic);
    assert.equal(result.topic, '');
  });

  it('ignores unexpected fields', () => {
    const result = validateContactMessageInput({
      ...VALID_PAYLOAD,
      role: 'SUPER_ADMIN',
      _id: '000000000000000000000000',
    });
    assert.equal('role' in result, false);
    assert.equal('_id' in result, false);
  });

  it('rejects a non-object body', () => {
    expectsError(400, () => validateContactMessageInput(null), 'null body');
    expectsError(400, () => validateContactMessageInput('x'), 'string body');
    expectsError(400, () => validateContactMessageInput([]), 'array body');
  });

  it('rejects missing or whitespace-only required fields', () => {
    for (const field of ['name', 'email', 'message'] as const) {
      expectsError(
        400,
        () => validateContactMessageInput({ ...VALID_PAYLOAD, [field]: undefined }),
        `missing ${field}`,
      );
      expectsError(
        400,
        () => validateContactMessageInput({ ...VALID_PAYLOAD, [field]: '   ' }),
        `whitespace ${field}`,
      );
      expectsError(
        400,
        () => validateContactMessageInput({ ...VALID_PAYLOAD, [field]: 123 }),
        `non-string ${field}`,
      );
    }
  });

  it('rejects a malformed email', () => {
    expectsError(
      400,
      () => validateContactMessageInput({ ...VALID_PAYLOAD, email: 'not-an-email' }),
      'no @ or dot',
    );
  });

  it('rejects a non-string topic', () => {
    expectsError(
      400,
      () => validateContactMessageInput({ ...VALID_PAYLOAD, topic: 42 }),
      'numeric topic',
    );
  });

  it('rejects over-long fields', () => {
    expectsError(
      400,
      () => validateContactMessageInput({ ...VALID_PAYLOAD, name: 'x'.repeat(101) }),
      'name over 100 chars',
    );
    expectsError(
      400,
      () => validateContactMessageInput({ ...VALID_PAYLOAD, topic: 'x'.repeat(121) }),
      'topic over 120 chars',
    );
    expectsError(
      400,
      () => validateContactMessageInput({ ...VALID_PAYLOAD, message: 'x'.repeat(2_001) }),
      'message over 2000 chars',
    );
  });
});

describe('contact list query validation', () => {
  it('applies defaults when the query is empty', () => {
    assert.deepEqual(validateListMessagesQuery({}), { page: 1, limit: 10 });
  });

  it('accepts numeric strings', () => {
    assert.deepEqual(validateListMessagesQuery({ page: '2', limit: '50' }), {
      page: 2,
      limit: 50,
    });
  });

  it('rejects malformed pagination', () => {
    expectsError(400, () => validateListMessagesQuery({ page: '0' }), 'page below 1');
    expectsError(400, () => validateListMessagesQuery({ page: 'abc' }), 'non-numeric page');
    expectsError(400, () => validateListMessagesQuery({ limit: '101' }), 'limit above 100');
    expectsError(400, () => validateListMessagesQuery({ limit: 'x' }), 'non-numeric limit');
  });
});
