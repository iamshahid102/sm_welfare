import { ApiError } from '../../utils/ApiError.js';
import { ProgramModel } from '../../models/program.model.js';
import { ProjectModel } from '../../models/project.model.js';

/**
 * Public projects service.
 *
 * Public contract is narrower than the admin-facing one:
 *  - unauthenticated access
 *  - only PUBLISHED projects are exposed
 *  - program filter accepts a program slug, not a raw id
 *  - program summary is embedded and limited to public-safe fields
 *  - response DTO is a whitelist, not a raw MongoDB document
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 12;
const MAX_PAGE_LIMIT = 40;
const MAX_PAGE = 10_000;
const PUBLIC_STATUS = 'PUBLISHED' as const;

export interface PublicProjectListQuery {
  page: number;
  limit: number;
  search: string | undefined;
  program: string | undefined;
}

export interface PublicProjectListResult {
  items: PublicProject[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicProgramSummary {
  id: string;
  title: string;
  slug: string;
}

export interface PublicProject {
  id: string;
  programId: string;
  program: PublicProgramSummary;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

type PublicProjectDocument = {
  id?: string;
  _id: import('mongoose').Types.ObjectId;
  __v?: number;
  programId: import('mongoose').Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
};

type PublicProgramDocument = {
  id: string;
  title: string;
  slug: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toProgramSummary(program: PublicProgramDocument): PublicProgramSummary {
  return {
    id: program.id,
    title: program.title,
    slug: program.slug,
  };
}

export function validateListPublicProjectsQuery(query: {
  page?: unknown;
  limit?: unknown;
  search?: unknown;
  program?: unknown;
}): PublicProjectListQuery {
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

export async function listPublicProjects(query: PublicProjectListQuery): Promise<PublicProjectListResult> {
  const programFilter =
    query.program !== undefined
      ? { slug: query.program }
      : undefined;

  const program = programFilter !== undefined
    ? await ProgramModel.findOne(programFilter)
    : undefined;

  if (program === null || program === undefined) {
    return {
      items: [],
      page: query.page,
      limit: query.limit,
      total: 0,
      totalPages: 0,
    };
  }

  if (program.status !== PUBLIC_STATUS) {
    return {
      items: [],
      page: query.page,
      limit: query.limit,
      total: 0,
      totalPages: 0,
    };
  }

  const programSummary = toProgramSummary(program as unknown as PublicProgramDocument);
  const programId = program.id;

  const match = {
    status: PUBLIC_STATUS,
    programId,
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
    ProjectModel.find(match, {
      _id: 0,
      id: 1,
      programId: 1,
      title: 1,
      slug: 1,
      shortDescription: 1,
      description: 1,
      status: 1,
      displayOrder: 1,
      createdAt: 1,
      updatedAt: 1,
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  const items = (projects as unknown as PublicProjectDocument[])
    .map((project) => serializePublicProject(project, programSummary))
    .sort((a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt));

  return {
    items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export function serializePublicProject(
  project: PublicProjectDocument,
  program: PublicProgramSummary,
): PublicProject {
  return {
    id: project.id ?? String(project._id),
    programId: project.programId.toString(),
    program,
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    description: project.description,
    displayOrder: project.displayOrder,
    createdAt: project.createdAt?.toISOString() ?? '',
    updatedAt: project.updatedAt?.toISOString() ?? '',
  };
}
