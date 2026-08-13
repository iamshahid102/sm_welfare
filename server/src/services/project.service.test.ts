import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import {
  serializeProject,
  validateCreateProjectInput,
  validateListProjectsQuery,
  validateProjectId,
  validateUpdateProjectInput,
} from './project.service.js';

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

const VALID_PROGRAM_ID = '64b7f2c4a1b2c3d4e5f6a7b8';

const VALID_BODY = {
  programId: VALID_PROGRAM_ID,
  title: ' School Support Program ',
  shortDescription: 'Access to quality education for underprivileged children.',
  description: 'A long-form description of the school support initiative.',
  displayOrder: 3,
};

describe('project service - create input validation', () => {
  it('accepts valid input and trims/normalizes values', () => {
    const input = validateCreateProjectInput(VALID_BODY);
    assert.equal(input.programId.toString(), VALID_PROGRAM_ID);
    assert.equal(input.title, 'School Support Program');
    assert.equal(input.shortDescription.trim(), input.shortDescription);
    assert.equal(input.description.trim(), input.description);
    assert.equal(input.displayOrder, 3);
  });

  it('generates a URL-safe slug from the title when slug is omitted', () => {
    assert.equal(
      validateCreateProjectInput({
        programId: VALID_PROGRAM_ID,
        title: 'School Support Program',
        shortDescription: 'S',
        description: 'D',
      }).slug,
      'school-support-program',
    );
    assert.equal(
      validateCreateProjectInput({
        programId: VALID_PROGRAM_ID,
        title: 'Ramadan Ration & Food Distribution',
        shortDescription: 'S',
        description: 'D',
      }).slug,
      'ramadan-ration-food-distribution',
    );
    assert.equal(
      validateCreateProjectInput({
        programId: VALID_PROGRAM_ID,
        title: '  Orphan   Support  2024 ',
        shortDescription: 'S',
        description: 'D',
      }).slug,
      'orphan-support-2024',
    );
  });

  it('accepts an explicit URL-safe slug', () => {
    const input = validateCreateProjectInput({
      programId: VALID_PROGRAM_ID,
      title: 'X',
      slug: 'medical-camp-2024',
      shortDescription: 'S',
      description: 'D',
    });
    assert.equal(input.slug, 'medical-camp-2024');
  });

  it('rejects a title that cannot produce a slug', () => {
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          title: '!!!',
        }),
      'title slugifies to empty string',
    );
  });

  it('rejects non-URL-safe explicit slugs', () => {
    for (const slug of [
      'School Support',
      'SCHOOL-SUPPORT',
      'sch--sup',
      '-sch',
      'sch-',
      'sch_sup',
      'école',
      'sch/sup',
      '',
      '  ',
    ]) {
      expectsError(
        400,
        () =>
          validateCreateProjectInput({
            programId: VALID_PROGRAM_ID,
            title: 'X',
            slug,
          }),
        `slug=${JSON.stringify(slug)} must be rejected`,
      );
    }
  });

  it('rejects a missing, invalid or malformed programId', () => {
    expectsError(
      400,
      () => validateCreateProjectInput({ title: 'X', shortDescription: 'S', description: 'D' }),
      'missing programId',
    );
    for (const programId of ['not-an-id', 'abcdefghijkl', 42, null, ['64b7f2c4a1b2c3d4e5f6a7b8']]) {
      expectsError(
        400,
        () =>
          validateCreateProjectInput({
            programId,
            title: 'X',
            shortDescription: 'S',
            description: 'D',
          }),
        `programId=${String(programId)} must be rejected`,
      );
    }
  });

  it('rejects a missing or whitespace-only title', () => {
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          shortDescription: 'S',
          description: 'D',
        }),
      'missing title',
    );
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          title: '   ',
          shortDescription: 'S',
          description: 'D',
        }),
      'whitespace title',
    );
  });

  it('rejects a non-string or over-long title', () => {
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          title: 42,
          shortDescription: 'S',
          description: 'D',
        }),
      'numeric title',
    );
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          title: 'a'.repeat(151),
          shortDescription: 'S',
          description: 'D',
        }),
      'title over 150 chars',
    );
  });

  it('rejects missing or over-long shortDescription', () => {
    expectsError(
      400,
      () =>
        validateCreateProjectInput({ programId: VALID_PROGRAM_ID, title: 'X' }),
      'missing shortDescription',
    );
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          title: 'X',
          shortDescription: 'a'.repeat(301),
        }),
      'shortDescription over 300 chars',
    );
  });

  it('rejects missing or over-long description', () => {
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
          title: 'X',
          shortDescription: 'S',
        }),
      'missing description',
    );
    expectsError(
      400,
      () =>
        validateCreateProjectInput({
          programId: VALID_PROGRAM_ID,
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
          validateCreateProjectInput({
            programId: VALID_PROGRAM_ID,
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
    const input = validateCreateProjectInput({
      programId: VALID_PROGRAM_ID,
      title: 'X',
      shortDescription: 'S',
      description: 'D',
      displayOrder: 10_000,
    });
    assert.equal(input.displayOrder, 10_000);
  });

  it('ignores unknown fields and status in the create body', () => {
    const input = validateCreateProjectInput({
      programId: VALID_PROGRAM_ID,
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
      'programId',
      'shortDescription',
      'slug',
      'title',
    ]);
    assert.equal('status' in input, false);
  });
});

describe('project service - update input validation', () => {
  it('rejects a body with no recognized fields', () => {
    expectsError(400, () => validateUpdateProjectInput({}), 'empty object');
    expectsError(400, () => validateUpdateProjectInput({ unknown: 'x' }), 'only unknown fields');
    expectsError(400, () => validateUpdateProjectInput(undefined), 'missing body');
  });

  it('rejects status changes through the update endpoint with a clear message', () => {
    assert.throws(
      () => validateUpdateProjectInput({ status: 'PUBLISHED' }),
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
    assert.deepEqual(validateUpdateProjectInput({ title: 'New Title' }), {
      title: 'New Title',
    });
  });

  it('accepts partial field combinations including programId', () => {
    const input = validateUpdateProjectInput({
      shortDescription: 'New short',
      displayOrder: 5,
      programId: VALID_PROGRAM_ID,
    });
    assert.equal(input.shortDescription, 'New short');
    assert.equal(input.displayOrder, 5);
    assert.equal(input.programId?.toString(), VALID_PROGRAM_ID);
  });

  it('validates updated values like create values', () => {
    expectsError(400, () => validateUpdateProjectInput({ title: '' }), 'empty title');
    expectsError(400, () => validateUpdateProjectInput({ slug: 'Bad Slug' }), 'bad slug');
    expectsError(
      400,
      () => validateUpdateProjectInput({ displayOrder: -1 }),
      'negative displayOrder',
    );
    expectsError(
      400,
      () => validateUpdateProjectInput({ programId: 'not-an-id' }),
      'bad programId',
    );
  });
});

describe('project service - list query validation', () => {
  it('applies defaults when no parameters are provided', () => {
    const result = validateListProjectsQuery({});
    assert.equal(result.page, 1);
    assert.equal(result.limit, 10);
    assert.equal(result.search, undefined);
    assert.equal(result.status, undefined);
    assert.equal(result.programId, undefined);
  });

  it('accepts explicit valid pagination, search, status and programId', () => {
    const result = validateListProjectsQuery({
      page: '2',
      limit: '25',
      search: '  edu  ',
      status: 'PUBLISHED',
      programId: VALID_PROGRAM_ID,
    });
    assert.equal(result.page, 2);
    assert.equal(result.limit, 25);
    assert.equal(result.search, 'edu');
    assert.equal(result.status, 'PUBLISHED');
    assert.equal(result.programId?.toString(), VALID_PROGRAM_ID);
  });

  it('rejects invalid page/limit/status/search/programId values', () => {
    for (const page of ['0', '-1', '2.5', 'abc', '10001']) {
      expectsError(400, () => validateListProjectsQuery({ page }), `page=${page}`);
    }
    for (const limit of ['0', '101', 'x']) {
      expectsError(400, () => validateListProjectsQuery({ limit }), `limit=${limit}`);
    }
    expectsError(400, () => validateListProjectsQuery({ status: 'BANNED' }), 'bad status');
    expectsError(400, () => validateListProjectsQuery({ search: ['a'] }), 'array search');
    for (const programId of ['not-an-id', 'abcdefghijkl', ['64b7f2c4a1b2c3d4e5f6a7b8']]) {
      expectsError(
        400,
        () => validateListProjectsQuery({ programId }),
        `programId=${String(programId)} must be rejected`,
      );
    }
  });

  it('treats an empty search as no search', () => {
    const result = validateListProjectsQuery({ search: '   ' });
    assert.equal(result.search, undefined);
  });
});

describe('project service - id validation', () => {
  it('accepts a well-formed ObjectId', () => {
    const id = '64b7f2c4a1b2c3d4e5f6a7b8';
    assert.equal(validateProjectId(id).toString(), id);
  });

  it('rejects malformed ids', () => {
    expectsError(400, () => validateProjectId(undefined), 'missing id');
    expectsError(400, () => validateProjectId('not-an-id'), 'malformed id');
    expectsError(400, () => validateProjectId('abcdefghijkl'), '12-char id');
  });
});

describe('project service - serialization', () => {
  it('returns only intended fields with a string id - never _id or __v', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const programId = new Types.ObjectId('64b7f2c4a1b2c3d4e5f6a7b8');
    const project = serializeProject(
      {
        id: '64b7f2c4a1b2c3d4e5f6a7b8',
        programId,
        title: 'School Support',
        slug: 'school-support',
        shortDescription: 'Short',
        description: 'Long',
        status: 'DRAFT',
        displayOrder: 1,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: '64b7f2c4a1b2c3d4e5f6a7b8',
        title: 'Education',
        slug: 'education',
        status: 'PUBLISHED',
      },
    );

    assert.deepEqual(Object.keys(project).sort(), [
      'createdAt',
      'description',
      'displayOrder',
      'id',
      'program',
      'programId',
      'shortDescription',
      'slug',
      'status',
      'title',
      'updatedAt',
    ]);
    assert.equal(project.id, '64b7f2c4a1b2c3d4e5f6a7b8');
    assert.equal(project.programId, '64b7f2c4a1b2c3d4e5f6a7b8');
    assert.deepEqual(project.program, {
      id: '64b7f2c4a1b2c3d4e5f6a7b8',
      title: 'Education',
      slug: 'education',
      status: 'PUBLISHED',
    });
    assert.equal(JSON.stringify(project).includes('_id'), false);
    assert.equal(JSON.stringify(project).includes('__v'), false);
    assert.equal(JSON.stringify(project).includes('passwordHash'), false);
  });

  it('serializes a null program summary defensively', () => {
    const project = serializeProject(
      {
        id: '64b7f2c4a1b2c3d4e5f6a7b8',
        programId: new Types.ObjectId('64b7f2c4a1b2c3d4e5f6a7b8'),
        title: 'X',
        slug: 'x',
        shortDescription: 'S',
        description: 'D',
        status: 'DRAFT',
        displayOrder: 0,
      },
      null,
    );
    assert.equal(project.program, null);
  });
});
