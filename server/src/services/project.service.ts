import { Types } from 'mongoose';
import {
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_DISPLAY_ORDER,
  MAX_PROJECT_SHORT_DESCRIPTION_LENGTH,
  MAX_PROJECT_SLUG_LENGTH,
  MAX_PROJECT_TITLE_LENGTH,
  PROJECT_SLUG_PATTERN,
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../constants/project.js';
import { ProjectModel, type Project } from '../models/project.model.js';
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
 * Project service - welfare initiatives that belong to exactly one Program.
 *
 * Business rules enforced here (routes/controllers stay thin):
 *  - every project belongs to an existing Program; the Program must not be
 *    ARCHIVED when a project is created or moved under it (400). Existing
 *    projects under an archived Program remain untouched.
 *  - slug strategy: the admin never types a slug. It is derived from the title
 *    at creation time, scoped to the program, and made unique automatically
 *    (slug, slug-2, slug-3 ...). Slug uniqueness is scoped to the program
 *    (compound unique index programId + slug): the same slug may exist under
 *    different programs, never twice within one. The index is the final
 *    authority; the unique-derivation loop plus an E11000 guard handle races.
 *  - new projects always start as DRAFT; status changes only via the
 *    dedicated status endpoint (never from a create/update body)
 *  - unknown request fields are never persisted; only whitelisted project
 *    fields (plus a minimal program summary) are ever returned
 *  - projects are never deleted - ARCHIVED retains the document
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;
const MAX_PAGE = 10_000;

const VALID_STATUSES = new Set<string>(PROJECT_STATUSES);

export interface CreateProjectInput {
  programId: Types.ObjectId;
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

export interface UpdateProjectInput {
  programId?: Types.ObjectId;
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

export interface ProjectListQuery {
  page: number;
  limit: number;
  search: string | undefined;
  status: ProjectStatus | undefined;
  programId: Types.ObjectId | undefined;
}

export interface ProjectListResult {
  items: ProjectResponse[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Minimal safe Program info embedded in each project response. */
export interface ProjectProgramSummary {
  id: string;
  title: string;
  slug: string;
  status: Program['status'];
}

/** The only project fields a client ever sees - no _id, __v or metadata. */
export interface ProjectResponse {
  id: string;
  programId: string;
  program: ProjectProgramSummary | null;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProjectStatus;
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

/** Identifies MongoDB duplicate-key (E11000) errors from the unique index. */
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

function assertValidProgramId(value: unknown): Types.ObjectId {
  if (typeof value !== 'string' || !/^[0-9a-fA-F]{24}$/.test(value)) {
    throw new ApiError(400, 'Invalid program id.');
  }
  return new Types.ObjectId(value);
}

function assertValidTitle(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Title is required.');
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_PROJECT_TITLE_LENGTH) {
    throw new ApiError(400, `Title must not exceed ${MAX_PROJECT_TITLE_LENGTH} characters.`);
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
  if (!PROJECT_SLUG_PATTERN.test(trimmed)) {
    throw new ApiError(
      400,
      'Slug must be URL-safe: lowercase letters, numbers and hyphens only.',
    );
  }
  if (trimmed.length > MAX_PROJECT_SLUG_LENGTH) {
    throw new ApiError(400, `Slug must not exceed ${MAX_PROJECT_SLUG_LENGTH} characters.`);
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
  if (trimmed.length > MAX_PROJECT_SHORT_DESCRIPTION_LENGTH) {
    throw new ApiError(
      400,
      `Short description must not exceed ${MAX_PROJECT_SHORT_DESCRIPTION_LENGTH} characters.`,
    );
  }
  return trimmed;
}

function assertValidDescription(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Description is required.');
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_PROJECT_DESCRIPTION_LENGTH) {
    throw new ApiError(
      400,
      `Description must not exceed ${MAX_PROJECT_DESCRIPTION_LENGTH} characters.`,
    );
  }
  return trimmed;
}

function assertValidDisplayOrder(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new ApiError(400, 'Display order must be a non-negative integer.');
  }
  if (value < 0 || value > MAX_PROJECT_DISPLAY_ORDER) {
    throw new ApiError(
      400,
      `Display order must be between 0 and ${MAX_PROJECT_DISPLAY_ORDER}.`,
    );
  }
  return value;
}

function assertValidStatus(value: unknown): ProjectStatus {
  if (typeof value !== 'string' || !VALID_STATUSES.has(value)) {
    throw new ApiError(400, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
  }
  return value as ProjectStatus;
}

/**
 * Validates a create payload. `status` is deliberately not accepted here -
 * every new project starts as DRAFT and changes status only through the
 * dedicated status endpoint. Unknown fields are ignored.
 */
export function validateCreateProjectInput(body: unknown): CreateProjectInput {
  assertBodyObject(body);
  const programId = assertValidProgramId(body.programId);
  const title = assertValidTitle(body.title);
  // Slug strategy: explicit slug must be URL-safe; otherwise generate from
  // the title. A title that cannot produce a slug is rejected.
  const slug =
    body.slug !== undefined ? assertValidSlug(body.slug) : slugifyTitle(title, MAX_PROJECT_SLUG_LENGTH);
  if (slug.length === 0) {
    throw new ApiError(400, 'Could not generate a valid slug from the title.');
  }
  return {
    programId,
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
export function validateUpdateProjectInput(body: unknown): UpdateProjectInput {
  assertBodyObject(body);
  const input: UpdateProjectInput = {};
  if (body.programId !== undefined) {
    input.programId = assertValidProgramId(body.programId);
  }
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
 * Validates list query parameters (page/limit/search/status/programId).
 * Strict about types: arrays or non-integer values are rejected instead of
 * being silently coerced.
 */
export function validateListProjectsQuery(query: {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  status?: unknown;
  programId?: unknown;
}): ProjectListQuery {
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

  let status: ProjectStatus | undefined;
  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !VALID_STATUSES.has(query.status)) {
      throw new ApiError(400, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
    }
    status = query.status as ProjectStatus;
  }

  let programId: Types.ObjectId | undefined;
  if (query.programId !== undefined) {
    if (typeof query.programId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(query.programId)) {
      throw new ApiError(400, 'Invalid program id.');
    }
    programId = new Types.ObjectId(query.programId);
  }

  return { page, limit, search, status, programId };
}

/** Escapes regex metacharacters so user search input cannot inject patterns. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Loads the Program for a project (the reference always exists - programs
 * are never deleted; null is defensive only). */
async function loadProgram(
  project: Project & { id: string },
): Promise<ProjectProgramSummary | null> {
  const program = await ProgramModel.findById(project.programId);
  return program ? toProgramSummary(program) : null;
}

/** Loads Programs for a whole page in a single batched query. */
async function loadPrograms(
  projects: Array<Project & { id: string }>,
): Promise<Map<string, ProjectProgramSummary>> {
  const programIds = [...new Set(projects.map((project) => project.programId.toString()))];
  if (programIds.length === 0) {
    return new Map();
  }
  const programs = await ProgramModel.find({ _id: { $in: programIds } });
  return new Map(programs.map((program) => [program.id, toProgramSummary(program)]));
}

/**
 * Creates a project under an existing, non-ARCHIVED Program. The compound
 * unique index (programId, slug) is the authoritative guard: if the pre-check
 * races with another request, the E11000 catch returns the same 409.
 */
export async function createProject(body: unknown): Promise<ProjectResponse> {
  const input = validateCreateProjectInput(body);

  const program = await ProgramModel.findById(input.programId);
  if (!program) {
    throw ApiError.notFound('Program not found.');
  }
  if (program.status === 'ARCHIVED') {
    throw new ApiError(400, 'Projects cannot be created under an archived program.');
  }

  const explicitSlug = hasExplicitSlug(body);

  // The admin never types a slug. A derived slug is made unique within the
  // program automatically, so creating a second project with an existing
  // title succeeds instead of failing on a field the editor cannot see.
  const slug = explicitSlug
    ? input.slug
    : await generateUniqueSlug(
        input.title,
        async (candidate) =>
          (await ProjectModel.exists({ programId: input.programId, slug: candidate })) !==
          null,
        MAX_PROJECT_SLUG_LENGTH,
      );

  if (explicitSlug) {
    const existing = await ProjectModel.exists({
      programId: input.programId,
      slug,
    });
    if (existing) {
      throw new ApiError(409, 'A project with this slug already exists in this program.');
    }
  }

  try {
    const project = await ProjectModel.create({
      ...input,
      slug,
      status: 'DRAFT',
    });
    return serializeProject(project, toProgramSummary(program));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A project with this slug already exists in this program.');
    }
    throw error;
  }
}

/**
 * Lists projects with pagination and optional search (title/shortDescription),
 * status filter and programId filter. Ordered by displayOrder then newest
 * first. Program summaries are loaded in one batched query for the page.
 */
export async function listProjects(query: ProjectListQuery): Promise<ProjectListResult> {
  const match = {
    ...(query.status !== undefined ? { status: query.status } : {}),
    ...(query.programId !== undefined ? { programId: query.programId } : {}),
    ...(query.search
      ? {
          $or: [
            { title: new RegExp(escapeRegExp(query.search), 'i') },
            { shortDescription: new RegExp(escapeRegExp(query.search), 'i') },
          ],
        }
      : {}),
  };

  const [total, projects] = await Promise.all([
    ProjectModel.countDocuments(match),
    ProjectModel.find(match)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
  ]);

  const programs = await loadPrograms(projects);

  return {
    items: projects.map((project) =>
      serializeProject(project, programs.get(project.programId.toString()) ?? null),
    ),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

/** Returns a single project by id, with its Program summary. */
export async function getProjectById(id: unknown): Promise<ProjectResponse> {
  const projectId = validateProjectId(id);
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw ApiError.notFound('Project not found.');
  }
  return serializeProject(project, await loadProgram(project));
}

/**
 * Updates a project's fields. Status is not modifiable here. Changing
 * programId requires the new Program to exist and not be ARCHIVED; slug
 * changes are validated for uniqueness within the program the project will
 * end up in (excluding this project itself).
 */
export async function updateProject(
  id: unknown,
  body: unknown,
): Promise<ProjectResponse> {
  const projectId = validateProjectId(id);
  const input = validateUpdateProjectInput(body);

  const current = await ProjectModel.findById(projectId);
  if (!current) {
    throw ApiError.notFound('Project not found.');
  }

  // If programId is being changed, the new Program must exist and must not be
  // ARCHIVED. Otherwise the project stays under its current Program.
  const targetProgramId = input.programId ?? current.programId;
  const program = await ProgramModel.findById(targetProgramId);
  if (!program) {
    throw ApiError.notFound('Program not found.');
  }
  if (input.programId !== undefined && program.status === 'ARCHIVED') {
    throw new ApiError(400, 'Projects cannot be moved to an archived program.');
  }

  // Slug uniqueness is scoped to the program the project will end up in.
  if (input.slug !== undefined) {
    const conflict = await ProjectModel.exists({
      programId: targetProgramId,
      slug: input.slug,
      _id: { $ne: projectId },
    });
    if (conflict) {
      throw new ApiError(409, 'A project with this slug already exists in this program.');
    }
  }

  try {
    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      { $set: input },
      { new: true },
    );
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }
    return serializeProject(project, toProgramSummary(program));
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'A project with this slug already exists in this program.');
    }
    throw error;
  }
}

/** Dedicated status operation - only the ProjectStatus union is accepted. */
export async function setProjectStatus(
  id: unknown,
  status: unknown,
): Promise<ProjectResponse> {
  const projectId = validateProjectId(id);
  const nextStatus = assertValidStatus(status);

  const project = await ProjectModel.findOneAndUpdate(
    { _id: projectId },
    { $set: { status: nextStatus } },
    { new: true },
  );
  if (!project) {
    throw ApiError.notFound('Project not found.');
  }
  return serializeProject(project, await loadProgram(project));
}

/**
 * Accepts only a strict 24-hex-character MongoDB ObjectId; anything else is a
 * 400. (Types.ObjectId.isValid alone also accepts 12-byte strings.)
 */
export function validateProjectId(id: unknown): Types.ObjectId {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, 'Invalid project id.');
  }
  return new Types.ObjectId(id);
}

function toProgramSummary(program: Program & { id: string }): ProjectProgramSummary {
  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
    status: program.status,
  };
}

/**
 * The single place that shapes a project for API responses - the client needs
 * the id for the /:id routes, but never _id/__v or internal metadata. The
 * embedded program summary is the minimal Program info the frontend needs to
 * render a project without extra requests.
 */
export function serializeProject(
  project: Project & { id: string },
  program: ProjectProgramSummary | null | undefined,
): ProjectResponse {
  return {
    id: project.id,
    programId: project.programId.toString(),
    program: program ?? null,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    status: project.status,
    displayOrder: project.displayOrder,
    tagline: project.tagline ?? null,
    coverImage: project.coverImage ?? null,
    gallery: project.gallery ?? [],
    sections: project.sections ?? [],
    highlights: project.highlights ?? [],
    facts: project.facts ?? [],
    cta: project.cta ?? null,
    ...(project.createdAt !== undefined && { createdAt: project.createdAt }),
    ...(project.updatedAt !== undefined && { updatedAt: project.updatedAt }),
  };
}
