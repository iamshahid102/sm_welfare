import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../utils/ApiError.js';
import {
  serializeProgram,
  validateCreateProgramInput,
  validateListProgramsQuery,
  validateProgramId,
  validateUpdateProgramInput,
} from './program.service.js';

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

const VALID_BODY = {
  title: ' Education Program ',
  shortDescription: 'Access to quality education for underprivileged children.',
  description: 'A long-form description of the education initiative.',
  displayOrder: 3,
};

describe('program service - create input validation', () => {
  it('accepts valid input and trims/normalizes values', () => {
    const input = validateCreateProgramInput(VALID_BODY);
    assert.equal(input.title, 'Education Program');
    assert.equal(input.shortDescription.trim(), input.shortDescription);
    assert.equal(input.description.trim(), input.description);
    assert.equal(input.displayOrder, 3);
  });

  it('generates a URL-safe slug from the title when slug is omitted', () => {
    assert.equal(
      validateCreateProgramInput({ title: 'Education Program', shortDescription: 'S', description: 'D' }).slug,
      'education-program',
    );
    assert.equal(
      validateCreateProgramInput({ title: 'Food & Community Support', shortDescription: 'S', description: 'D' }).slug,
      'food-community-support',
    );
    assert.equal(
      validateCreateProgramInput({ title: '  Orphan   Support  2024 ', shortDescription: 'S', description: 'D' }).slug,
      'orphan-support-2024',
    );
  });

  it('accepts an explicit URL-safe slug', () => {
    const input = validateCreateProgramInput({
      title: 'X',
      slug: 'healthcare-initiative',
      shortDescription: 'S',
      description: 'D',
    });
    assert.equal(input.slug, 'healthcare-initiative');
  });

  it('rejects a title that cannot produce a slug', () => {
    expectsError(
      400,
      () => validateCreateProgramInput({ title: '!!!' }),
      'title slugifies to empty string',
    );
  });

  it('rejects non-URL-safe explicit slugs', () => {
    for (const slug of [
      'Education Program',
      'EDUCATION-PROGRAM',
      'edu--prog',
      '-edu',
      'edu-',
      'edu_prog',
      'édu',
      'edu/prog',
      '',
      '  ',
    ]) {
      expectsError(
        400,
        () => validateCreateProgramInput({ title: 'X', slug }),
        `slug=${JSON.stringify(slug)} must be rejected`,
      );
    }
  });

  it('rejects a missing or whitespace-only title', () => {
    expectsError(400, () => validateCreateProgramInput({}), 'missing title');
    expectsError(
      400,
      () => validateCreateProgramInput({ title: '   ' }),
      'whitespace title',
    );
  });

  it('rejects a non-string or over-long title', () => {
    expectsError(400, () => validateCreateProgramInput({ title: 42 }), 'numeric title');
    expectsError(
      400,
      () => validateCreateProgramInput({ title: 'a'.repeat(151) }),
      'title over 150 chars',
    );
  });

  it('rejects missing or over-long shortDescription', () => {
    expectsError(
      400,
      () => validateCreateProgramInput({ title: 'X' }),
      'missing shortDescription',
    );
    expectsError(
      400,
      () => validateCreateProgramInput({ title: 'X', shortDescription: 'a'.repeat(301) }),
      'shortDescription over 300 chars',
    );
  });

  it('rejects missing or over-long description', () => {
    expectsError(
      400,
      () => validateCreateProgramInput({ title: 'X', shortDescription: 'S' }),
      'missing description',
    );
    expectsError(
      400,
      () => validateCreateProgramInput({
        title: 'X',
        shortDescription: 'S',
        description: 'a'.repeat(5_001),
      }),
      'description over 5000 chars',
    );
  });

  it('rejects invalid displayOrder values', () => {
    for (const order of [-1, 10_001, 2.5, '3', NaN, null]) {
      // ShortDescription/description are included so the error genuinely comes
      // from the displayOrder validator (it is validated last).
      expectsError(
        400,
        () =>
          validateCreateProgramInput({
            title: 'X',
            shortDescription: 'S',
            description: 'D',
            displayOrder: order,
          }),
        `displayOrder=${String(order)} must be rejected`,
      );
    }
  });

  it('accepts the maximum displayOrder', () => {
    const input = validateCreateProgramInput({
      title: 'X',
      shortDescription: 'S',
      description: 'D',
      displayOrder: 10_000,
    });
    assert.equal(input.displayOrder, 10_000);
  });

  it('ignores unknown fields and status in the create body', () => {
    const input = validateCreateProgramInput({
      title: 'X',
      slug: 'x',
      shortDescription: 'S',
      description: 'D',
      status: 'PUBLISHED',
      hacker: 'field',
      role: 'SUPER_ADMIN',
    });
    assert.deepEqual(Object.keys(input).sort(), [
      'description',
      'facts',
      'gallery',
      'highlights',
      'sections',
      'shortDescription',
      'slug',
      'title',
    ]);
    assert.equal('status' in input, false);
  });
});

describe('program service - update input validation', () => {
  it('rejects a body with no recognized fields', () => {
    expectsError(400, () => validateUpdateProgramInput({}), 'empty object');
    expectsError(400, () => validateUpdateProgramInput({ unknown: 'x' }), 'only unknown fields');
    expectsError(400, () => validateUpdateProgramInput(undefined), 'missing body');
  });

  it('rejects status changes through the update endpoint with a clear message', () => {
    assert.throws(
      () => validateUpdateProgramInput({ status: 'PUBLISHED' }),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.statusCode, 400);
        assert.equal(
          error.message,
          'Status changes must use the dedicated status endpoint.',
        );
        return true;
      },
    );
  });

  it('accepts a single field', () => {
    assert.deepEqual(validateUpdateProgramInput({ title: 'New Title' }), {
      title: 'New Title',
    });
  });

  it('accepts partial field combinations', () => {
    assert.deepEqual(
      validateUpdateProgramInput({ shortDescription: 'New short', displayOrder: 5 }),
      { shortDescription: 'New short', displayOrder: 5 },
    );
  });

  it('validates updated values like create values', () => {
    expectsError(400, () => validateUpdateProgramInput({ title: '' }), 'empty title');
    expectsError(
      400,
      () => validateUpdateProgramInput({ slug: 'Bad Slug' }),
      'bad slug',
    );
    expectsError(
      400,
      () => validateUpdateProgramInput({ displayOrder: -1 }),
      'negative displayOrder',
    );
  });
});

describe('program service - list query validation', () => {
  it('applies defaults when no parameters are provided', () => {
    assert.deepEqual(validateListProgramsQuery({}), {
      page: 1,
      limit: 10,
      search: undefined,
      status: undefined,
    });
  });

  it('accepts explicit valid pagination, search and status', () => {
    assert.deepEqual(
      validateListProgramsQuery({
        page: '2',
        limit: '25',
        search: '  edu  ',
        status: 'PUBLISHED',
      }),
      { page: 2, limit: 25, search: 'edu', status: 'PUBLISHED' },
    );
  });

  it('rejects invalid page/limit/status/search values', () => {
    for (const page of ['0', '-1', '2.5', 'abc', '10001']) {
      expectsError(400, () => validateListProgramsQuery({ page }), `page=${page}`);
    }
    for (const limit of ['0', '101', 'x']) {
      expectsError(400, () => validateListProgramsQuery({ limit }), `limit=${limit}`);
    }
    expectsError(400, () => validateListProgramsQuery({ status: 'BANNED' }), 'bad status');
    expectsError(400, () => validateListProgramsQuery({ search: ['a'] }), 'array search');
  });

  it('treats an empty search as no search', () => {
    const result = validateListProgramsQuery({ search: '   ' });
    assert.equal(result.search, undefined);
  });
});

describe('program service - id validation', () => {
  it('accepts a well-formed ObjectId', () => {
    const id = '64b7f2c4a1b2c3d4e5f6a7b8';
    assert.equal(validateProgramId(id).toString(), id);
  });

  it('rejects malformed ids', () => {
    expectsError(400, () => validateProgramId(undefined), 'missing id');
    expectsError(400, () => validateProgramId('not-an-id'), 'malformed id');
    expectsError(400, () => validateProgramId('abcdefghijkl'), '12-char id');
  });
});

describe('program service - serialization', () => {
  it('returns only intended fields with a string id - never _id or __v', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const program = serializeProgram({
      id: '64b7f2c4a1b2c3d4e5f6a7b8',
      title: 'Education Program',
      slug: 'education-program',
      shortDescription: 'Short',
      description: 'Long',
      status: 'PUBLISHED',
      displayOrder: 1,
      gallery: [],
      sections: [],
      highlights: [],
      facts: [],
      createdAt,
      updatedAt: createdAt,
    });

    assert.deepEqual(Object.keys(program).sort(), [
      'coverImage',
      'createdAt',
      'cta',
      'description',
      'displayOrder',
      'facts',
      'gallery',
      'highlights',
      'id',
      'sections',
      'shortDescription',
      'slug',
      'status',
      'tagline',
      'title',
      'updatedAt',
    ]);
    assert.equal(program.id, '64b7f2c4a1b2c3d4e5f6a7b8');
    assert.equal(JSON.stringify(program).includes('_id'), false);
    assert.equal(JSON.stringify(program).includes('__v'), false);
    assert.equal(JSON.stringify(program).includes('passwordHash'), false);
  });
});
