import { Types } from 'mongoose';
import {
  MAX_PROGRAM_DESCRIPTION_LENGTH,
  MAX_PROGRAM_DISPLAY_ORDER,
  MAX_PROGRAM_SHORT_DESCRIPTION_LENGTH,
  MAX_PROGRAM_SLUG_LENGTH,
  MAX_PROGRAM_TITLE_LENGTH,
  PROGRAM_SLUG_PATTERN,
  PROGRAM_STATUSES,
  type ProgramStatus,
} from '../constants/program.js';
import { ProgramModel, type Program } from '../models/program.model.js';
import { ApiError } from '../utils/ApiError.js';
import { generateUniqueSlug, slugifyTitle } from '../utils/slug.js';
import {
  extractContentPayload,
  extractContentUpdate,
} from '../utils/contentFields.js';
import type {
  ContentCta,
  ContentFact,
  ContentHighlight,
  ContentImage,
  ContentSection,
} from '../types/content.js';

/**
 * Program service - long-term welfare initiatives.
 *
 * Business rules enforced here (routes/controllers stay thin):
 *  - slug strategy: the admin never types a slug. It is derived from the title
 *    at creation time and made unique automatically (slug, slug-2, slug-3 ...).
 *    An explicit slug is only accepted from seed/tooling and must be URL-safe.
 *  - the unique slug index is the final authority against duplicates - the
 *    unique-derivation loop plus an E11000 race guard handle concurrent
 *    creation safely
 *  - new programs start as DRAFT; status changes only via the dedicated
 *    status endpoint
 *  - unknown request fields are never persisted; only whitelisted program
 *    fields are ever returned
 *  - programs are never deleted - ARCHIVED retains the document
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;
const MAX_PAGE = 10_000;

const VALID_STATUSES = new Set<string>(PROGRAM_STATUSES);

export interface CreateProgramInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder?: number;
  tagline?: string;
  coverImage?: ContentImage;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta?: ContentCta;
}

export interface UpdateProgramInput {
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  displayOrder?: number;
  tagline?: string;
  coverImage?: ContentImage;
  gallery?: ContentImage[];
  sections?: ContentSection[];
  highlights?: ContentHighlight[];
  facts?: ContentFact[];
  cta?: ContentCta;
}

export interface ProgramListQuery {
  page: number;
  limit: number;
  search: string | undefined;
  status: ProgramStatus | undefined;
}

export interface ProgramListResult {
  items: ProgramResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** The only program fields a client ever sees - no _id, __v or metadata. */
export interface ProgramResponse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProgramStatus;
  displayOrder: number;
  tagline: string | null;
  coverImage: ContentImage | null;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta: ContentCta | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Identifies MongoDB duplicate-key (E11000) errors from the unique slug index. */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  );
}

function assertBodyObject(body: unknown): asserts body is Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Request body must be an object.');
  }
}

function assertValidTitle(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Title is required.');
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_PROGRAM_TITLE_LENGTH) {
    throw new ApiError(400, `Title must not exceed ${MAX_PROGRAM_TITLE_LENGTH} characters.`);
  }
  return trimmed;
}

/**
 * Explicit slugs must already be URL-safe (lowercase letters, numbers and
 * single hyphens). Anything else is rejected rather than silently mangled.
 */
function assertValidSlug(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Slug must not be empty.');
  }
  const trimmed = value.trim();
  if (!PROGRAM_SLUG_PATTERN.test(trimmed)) {
    throw new ApiError(
      400,
      'Slug must be URL-safe: lowercase letters, numbers and hyphens only.',
    );
  }
  if (trimmed.length > MAX_PROGRAM_SLUG_LENGTH) {
    throw new ApiError(400, `Slug must not exceed ${MAX_PROGRAM_SLUG_LENGTH} characters.`);
  }
  return trimmed;
}

/** Whether the request carried an explicit slug (tools/seeds only - the
 * admin UI never sends one). */
function hasExplicitSlug(body: unknown): boolean {
  return (
    body !== null &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    (body as Record<string, unknown>).slug !== undefined
  );
}

function assertValidShortDescription(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Short description is required.');
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_PROGRAM_SHORT_DESCRIPTION_LENGTH) {
    throw new ApiError(
      400,
      `Short description must not exceed ${MAX_PROGRAM_SHORT_DESCRIPTION_LENGTH} characters.`,
    );
  }
  return trimmed;
}

function assertValidDescription(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Description is required.');
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_PROGRAM_DESCRIPTION_LENGTH) {
    throw new ApiError(
      400,
      `Description must not exceed ${MAX_PROGRAM_DESCRIPTION_LENGTH} characters.`,
    );
  }
  return trimmed;
}

function assertValidDisplayOrder(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ApiError(400, 'Display order must be a non-negative integer.');
  }
  if (value < 0 || value > MAX_PROGRAM_DISPLAY_ORDER) {
    throw new ApiError(
      400,
      `Display order must be between 0 and ${MAX_PROGRAM_DISPLAY_ORDER}.`,
    );
  }
  return value;
}

function assertValidStatus(value: unknown): ProgramStatus {
  if (typeof value !== 'string' || !VALID_STATUSES.has(value)) {
    throw new ApiError(400, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
  }
  return value as ProgramStatus;
}

/**
 * Validates a create payload. `status` is deliberately not accepted here -
 * every new program starts as DRAFT and changes status only through the
 * dedicated status endpoint. Unknown fields are ignored.
 */
export function validateCreateProgramInput(body: unknown): CreateProgramInput {
  assertBodyObject(body);
  const title = assertValidTitle(body.title);
  // Slug strategy: explicit slug must be URL-safe; otherwise generate from
  // the title. A title that cannot produce a slug is rejected.
  const slug =
    body.slug !== undefined ? assertValidSlug(body.slug) : slugifyTitle(title, MAX_PROGRAM_SLUG_LENGTH);
  if (slug.length === 0) {
    throw new ApiError(400, 'Could not generate a valid slug from the title.');
  }
  return {
    title,
    slug,
    shortDescription: assertValidShortDescription(body.shortDescription),
    description: assertValidDescription(body.description),
    ...(body.displayOrder !== undefined && {
      displayOrder: assertValidDisplayOrder(body.displayOrder),
    }),
    ...extractContentPayload(body),
  };
}

/**
 * Validates a partial update payload. Status changes are intentionally
 * unsupported here (dedicated endpoint); unknown fields are ignored.
 */
export function validateUpdateProgramInput(body: unknown): UpdateProgramInput {
  assertBodyObject(body);
  const input: UpdateProgramInput = {};
  if (body.title !== undefined) {
    input.title = assertValidTitle(body.title);
  }
  if (body.slug !== undefined) {
    input.slug = assertValidSlug(body.slug);
  }
  if (body.shortDescription !== undefined) {
    input.shortDescription = assertValidShortDescription(body.shortDescription);
  }
  if (body.description !== undefined) {
    input.description = assertValidDescription(body.description);
  }
  if (body.displayOrder !== undefined) {
    input.displayOrder = assertValidDisplayOrder(body.displayOrder);
  }
  Object.assign(input, extractContentUpdate(body));
  if (Object.keys(input).length === 0) {
    if (body.status !== undefined) {
      throw new ApiError(400, 'Status changes must use the dedicated status endpoint.');
    }
    throw new ApiError(400, 'Provide at least one field to update.');
  }
  return input;
}

/**
 * Validates list query parameters (page/limit/search/status). Strict about
 * types: arrays or non-integer values are rejected instead of being silently
 * coerced.
 */
export function validateListProgramsQuery(query: {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  status?: unknown;
}): ProgramListQuery {
  let page = DEFAULT_PAGE;
  if (query.page !== undefined) {
    if (
      typeof query.page !== 'string' ||
      !/^\d+$/.test(query.page) ||
      Number(query.page) < 1 ||
      Number(query.page) > MAX_PAGE
    ) {
      throw new ApiError(400, `Page must be between 1 and ${MAX_PAGE}.`);
    }
    page = Number(query.page);
  }

  let limit = DEFAULT_PAGE_LIMIT;
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'string' || !/^\d+$/.test(query.limit)) {
      throw new ApiError(400, `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`);
    }
    limit = Number(query.limit);
    if (limit < 1 || limit > MAX_PAGE_LIMIT) {
      throw new ApiError(400, `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`);
    }
  }

  let search: string | undefined;
  if (query.search !== undefined) {
    if (typeof query.search !== 'string') {
      throw new ApiError(400, 'Search must be a string.');
    }
    search = query.search.trim() || undefined;
  }

  let status: ProgramStatus | undefined;
  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !VALID_STATUSES.has(query.status)) {
      throw new ApiError(400, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
    }
    status = query.status as ProgramStatus;
  }

  return { page, limit, search, status };
}

/** Escapes regex metacharacters so user search input cannot inject patterns. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a program. The unique slug index is the authoritative guard: if the
 * pre-check races with another request, the E11000 catch returns the same 409.
 */
export async function createProgram(body: unknown): Promise<ProgramResponse> {
  const input = validateCreateProgramInput(body);
  const explicitSlug = hasExplicitSlug(body);

  // The admin never types a slug. A derived slug is made unique automatically
  // (title -> slug, then slug-2, slug-3, ...) so creating a second program
  // with an existing title succeeds instead of failing on a field the editor
  // cannot see or fix.
  const slug = explicitSlug
    ? input.slug
    : await generateUniqueSlug(
        input.title,
        async (candidate) => (await ProgramModel.exists({ slug: candidate })) !== null,
        MAX_PROGRAM_SLUG_LENGTH,
      );

  if (explicitSlug) {
    const existing = await ProgramModel.exists({ slug });
    if (existing) {
      throw new ApiError(409, 'A program with this slug already exists.');
    }
  }

  try {
    const program = await ProgramModel.create({
      ...input,
      slug,
      status: 'DRAFT',
    });
    return serializeProgram(program);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A program with this slug already exists.');
    }
    throw error;
  }
}

/**
 * Lists programs with pagination, optional search (title/shortDescription/
 * description) and optional status filter. Ordered by displayOrder then
 * newest first.
 */
export async function listPrograms(query: ProgramListQuery): Promise<ProgramListResult> {
  const match = {
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(query.search
      ? {
          $or: [
            { title: new RegExp(escapeRegExp(query.search), 'i') },
            { shortDescription: new RegExp(escapeRegExp(query.search), 'i') },
            { description: new RegExp(escapeRegExp(query.search), 'i') },
          ],
        }
      : {}),
  };

  const [total, programs] = await Promise.all([
    ProgramModel.countDocuments(match),
    ProgramModel.find(match)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
  ]);

  return {
    items: programs.map(serializeProgram),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

/** Returns a single program by id. */
export async function getProgramById(id: unknown): Promise<ProgramResponse> {
  const programId = validateProgramId(id);
  const program = await ProgramModel.findById(programId);
  if (!program) {
    throw ApiError.notFound('Program not found.');
  }
  return serializeProgram(program);
}

/**
 * Updates a program's fields. Status is not modifiable here; slug changes are
 * validated and checked for uniqueness (excluding this program itself).
 */
export async function updateProgram(
  id: unknown,
  body: unknown,
): Promise<ProgramResponse> {
  const programId = validateProgramId(id);
  const input = validateUpdateProgramInput(body);

  if (input.slug !== undefined) {
    const conflict = await ProgramModel.exists({
      slug: input.slug,
      _id: { $ne: programId },
    });
    if (conflict) {
      throw new ApiError(409, 'A program with this slug already exists.');
    }
  }

  try {
    const program = await ProgramModel.findOneAndUpdate(
      { _id: programId },
      { $set: input },
      { new: true },
    );
    if (!program) {
      throw ApiError.notFound('Program not found.');
    }
    return serializeProgram(program);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A program with this slug already exists.');
    }
    throw error;
  }
}

/** Dedicated status operation - only the ProgramStatus union is accepted. */
export async function setProgramStatus(id: unknown, status: unknown): Promise<ProgramResponse> {
  const programId = validateProgramId(id);
  const nextStatus = assertValidStatus(status);

  const program = await ProgramModel.findOneAndUpdate(
    { _id: programId },
    { $set: { status: nextStatus } },
    { new: true },
  );
  if (!program) {
    throw ApiError.notFound('Program not found.');
  }
  return serializeProgram(program);
}

/**
 * Accepts only a strict 24-hex-character MongoDB ObjectId; anything else is a
 * 400. (Types.ObjectId.isValid alone also accepts 12-byte strings.)
 */
export function validateProgramId(id: unknown): Types.ObjectId {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, 'Invalid program id.');
  }
  return new Types.ObjectId(id);
}

/**
 * The single place that shapes a program for API responses - the client needs
 * the id for the /:id routes, but never _id/__v or internal metadata.
 */
export function serializeProgram(program: Program & { id: string }): ProgramResponse {
  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
    shortDescription: program.shortDescription,
    description: program.description,
    status: program.status,
    displayOrder: program.displayOrder,
    tagline: program.tagline ?? null,
    coverImage: program.coverImage ?? null,
    gallery: program.gallery ?? [],
    sections: program.sections ?? [],
    highlights: program.highlights ?? [],
    facts: program.facts ?? [],
    cta: program.cta ?? null,
    ...(program.createdAt !== undefined && { createdAt: program.createdAt }),
    ...(program.updatedAt !== undefined && { updatedAt: program.updatedAt }),
  };
}
