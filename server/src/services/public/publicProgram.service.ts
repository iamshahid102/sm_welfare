import { ProgramModel } from '../../models/program.model.js';
import { ApiError } from '../../utils/ApiError.js';

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
  createdAt: string;
  updatedAt: string;
}

const VALID_STATUSES = new Set<string>([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function validateListProgramsQuery(query: {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  status?: unknown;
}): {
  page: number;
  limit: number;
  search: string | undefined;
  status: string | undefined;
} {
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

  let status: string | undefined;
  if (query.status !== undefined) {
    if (typeof query.status !== 'string' || !VALID_STATUSES.has(query.status)) {
      throw new ApiError(400, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
    }
    status = query.status;
  }

  return { page, limit, search, status };
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

export function serializePublicProgram(
  program: {
    id?: string;
    _id: import('mongoose').Types.ObjectId;
    __v?: number;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    displayOrder: number;
    createdAt?: Date;
    updatedAt?: Date;
  },
): PublicProgram {
  return {
    id: program.id ?? String(program._id),
    title: program.title,
    slug: program.slug,
    shortDescription: program.shortDescription,
    description: program.description,
    displayOrder: program.displayOrder,
    createdAt: program.createdAt?.toISOString() ?? '',
    updatedAt: program.updatedAt?.toISOString() ?? '',
  };
}
