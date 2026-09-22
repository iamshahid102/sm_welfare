import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../../utils/ApiError.js';
import {
  validateFormSubmissionInput,
  validateListSubmissionsQuery,
} from './form.routes.js';

/**
 * Validation-level tests - pure in-memory, no MongoDB or network required.
 * They cover the public form submission payload: required fields, field types,
 * the form-type whitelist, email/phone formats and length limits. The
 * database-backed submission flow is exercised through the model schema.
 */

const VALID_PAYLOAD = {
  formType: 'quran-academy',
  name: '  Muhammad Ali  ',
  email: '  Applicant@Example.COM ',
  phone: '+92 315 2616482',
  message: 'I would like to join the academy.',
};

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

describe('form submission validation', () => {
  it('accepts a valid payload and normalizes name/email', () => {
    const result = validateFormSubmissionInput(VALID_PAYLOAD);
    assert.deepEqual(result, {
      formType: 'quran-academy',
      name: 'Muhammad Ali',
      email: 'applicant@example.com',
      phone: '+92 315 2616482',
      message: 'I would like to join the academy.',
    });
  });

  it('ignores unexpected fields', () => {
    const result = validateFormSubmissionInput({
      ...VALID_PAYLOAD,
      role: 'SUPER_ADMIN',
      _id: '000000000000000000000000',
    });
    assert.equal('role' in result, false);
    assert.equal('_id' in result, false);
  });

  it('rejects a non-object body', () => {
    expectsError(400, () => validateFormSubmissionInput(null), 'null body');
    expectsError(400, () => validateFormSubmissionInput('x'), 'string body');
    expectsError(400, () => validateFormSubmissionInput([]), 'array body');
  });

  it('rejects a missing or unknown form type', () => {
    const { formType: _omitted, ...withoutFormType } = VALID_PAYLOAD;
    expectsError(400, () => validateFormSubmissionInput(withoutFormType), 'missing form type');
    expectsError(
      400,
      () => validateFormSubmissionInput({ ...VALID_PAYLOAD, formType: 'unknown-form' }),
      'unknown form type',
    );
  });

  it('accepts every documented form type', () => {
    for (const formType of [
      'hunarmand-beti-vocational',
      'it-courses-vocational',
      'employee',
      'free-education',
      'quran-academy',
    ]) {
      const result = validateFormSubmissionInput({ ...VALID_PAYLOAD, formType });
      assert.equal(result.formType, formType);
    }
  });

  it('rejects missing or whitespace-only required fields', () => {
    for (const field of ['name', 'email', 'phone', 'message'] as const) {
      expectsError(
        400,
        () => validateFormSubmissionInput({ ...VALID_PAYLOAD, [field]: undefined }),
        `missing ${field}`,
      );
      expectsError(
        400,
        () => validateFormSubmissionInput({ ...VALID_PAYLOAD, [field]: '   ' }),
        `whitespace ${field}`,
      );
      expectsError(
        400,
        () => validateFormSubmissionInput({ ...VALID_PAYLOAD, [field]: 123 }),
        `non-string ${field}`,
      );
    }
  });

  it('rejects a malformed email', () => {
    expectsError(
      400,
      () => validateFormSubmissionInput({ ...VALID_PAYLOAD, email: 'not-an-email' }),
      'no @ or dot',
    );
  });

  it('rejects a malformed phone number', () => {
    expectsError(
      400,
      () => validateFormSubmissionInput({ ...VALID_PAYLOAD, phone: 'call me' }),
      'letters in phone',
    );
    expectsError(
      400,
      () => validateFormSubmissionInput({ ...VALID_PAYLOAD, phone: '12345' }),
      'too short',
    );
  });

  it('rejects over-long fields', () => {
    expectsError(
      400,
      () => validateFormSubmissionInput({ ...VALID_PAYLOAD, name: 'x'.repeat(101) }),
      'name over 100 chars',
    );
    expectsError(
      400,
      () => validateFormSubmissionInput({ ...VALID_PAYLOAD, message: 'x'.repeat(2_001) }),
      'message over 2000 chars',
    );
  });
});

describe('submission list query validation', () => {
  it('applies defaults when the query is empty', () => {
    assert.deepEqual(validateListSubmissionsQuery({}), { page: 1, limit: 10 });
  });

  it('accepts numeric strings and a known form type', () => {
    assert.deepEqual(
      validateListSubmissionsQuery({ page: '3', limit: '25', formType: 'employee' }),
      { page: 3, limit: 25, formType: 'employee' },
    );
  });

  it('rejects malformed pagination', () => {
    expectsError(400, () => validateListSubmissionsQuery({ page: '0' }), 'page below 1');
    expectsError(400, () => validateListSubmissionsQuery({ page: 'abc' }), 'non-numeric page');
    expectsError(400, () => validateListSubmissionsQuery({ page: 99_999 }), 'non-string page');
    expectsError(400, () => validateListSubmissionsQuery({ limit: '101' }), 'limit above 100');
    expectsError(400, () => validateListSubmissionsQuery({ limit: '-1' }), 'negative limit');
  });

  it('rejects an unknown form type filter', () => {
    expectsError(
      400,
      () => validateListSubmissionsQuery({ formType: 'unknown-form' }),
      'unknown form type filter',
    );
  });
});
