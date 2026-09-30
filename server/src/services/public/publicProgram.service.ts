import { ProgramModel } from '../../models/program.model.js';
import { ApiError } from '../../utils/ApiError.js';
import type {
  ContentCta,
  ContentFact,
  ContentHighlight,
  ContentImage,
  ContentSection,
} from '../../types/content.js';

/**
 * Public programs service.
 *
 * Public contract is deliberately narrower than the admin-facing one:
 *  - unauthenticated access
 *  - only PUBLISHED programs are exposed
 *  - query validation is strict and bounded
 *  - response DTO is a whitelist, not a raw MongoDB document
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 12;
const MAX_PAGE_LIMIT = 40;
const MAX_PAGE = 10_000;
const PUBLIC_STATUS = 'PUBLISHED' as const;

export interface PublicProgramListQuery {
  page: number;
  limit: number;
  search: string | undefined;
  program: string | undefined;
}

export interface PublicProgramListResult {
  items: PublicProgram[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicProgram {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  tagline: string | null;
  coverImage: ContentImage | null;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta: ContentCta | null;
  createdAt: string;
  updatedAt: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateListPublicProgramsQuery(query: {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  program?: unknown;
}): PublicProgramListQuery {
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

  let program: string | undefined;
  if (query.program !== undefined) {
    if (typeof query.program !== 'string') {
      throw new ApiError(400, 'Program must be a string.');
    }
    const trimmed = query.program.trim();
    if (trimmed.length === 0) {
      throw new ApiError(400, 'Program must not be empty.');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
      throw new ApiError(
        400,
        'Program must be URL-safe: lowercase letters, numbers and hyphens only.',
      );
    }
    if (trimmed.length > 200) {
      throw new ApiError(400, `Program must not exceed 200 characters.`);
    }
    program = trimmed;
  }

  return { page, limit, search, program };
}

export async function listPublicPrograms(query: PublicProgramListQuery): Promise<PublicProgramListResult> {
  const match = {
    status: PUBLIC_STATUS,
    ...(query.search
      ? {
          $or: [
            { title: new RegExp(escapeRegExp(query.search), 'i') },
            { shortDescription: new RegExp(escapeRegExp(query.search), 'i') },
            { description: new RegExp(escapeRegExp(query.search), 'i') },
          ],
        }
      : {}),
    ...(query.program
      ? {
          slug: query.program,
        }
      : {}),
  };

  const [total, programs] = await Promise.all([
    ProgramModel.countDocuments(match),
    ProgramModel.find(match)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items: programs.map((program) => serializePublicProgram(program as unknown as Parameters<typeof serializePublicProgram>[0])),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export interface LeanPublicProgramDocument {
  id?: string;
  _id: import('mongoose').Types.ObjectId;
  __v?: number;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  tagline?: string | null;
  coverImage?: ContentImage | null;
  gallery?: ContentImage[];
  sections?: ContentSection[];
  highlights?: ContentHighlight[];
  facts?: ContentFact[];
  cta?: ContentCta | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export function serializePublicProgram(program: LeanPublicProgramDocument): PublicProgram {
  return {
    id: program.id ?? String(program._id),
    title: program.title,
    slug: program.slug,
    shortDescription: program.shortDescription,
    description: program.description,
    displayOrder: program.displayOrder,
    tagline: program.tagline ?? null,
    coverImage: program.coverImage ?? null,
    gallery: program.gallery ?? [],
    sections: program.sections ?? [],
    highlights: program.highlights ?? [],
    facts: program.facts ?? [],
    cta: program.cta ?? null,
    createdAt: program.createdAt?.toISOString() ?? '',
    updatedAt: program.updatedAt?.toISOString() ?? '',
  };
}

/**
 * Returns one PUBLISHED program by slug, or null when it does not exist or is
 * not public. Used by the dynamic public detail route.
 */
export async function getPublicProgramBySlug(slug: string): Promise<PublicProgram | null> {
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }
  const program = await ProgramModel.findOne({ slug, status: PUBLIC_STATUS }).lean();
  if (!program) return null;
  return serializePublicProgram(program as unknown as LeanPublicProgramDocument);
}
