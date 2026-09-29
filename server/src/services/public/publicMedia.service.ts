import { MediaModel } from '../../models/media.model.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Public media service.
 *
 * Public contract:
 *  - unauthenticated access
 *  - bounded pagination
 *  - public-safe metadata only (no Cloudinary credentials, no upload secrets)
 *
 * The Media model has no visibility field, so the existing business rule is:
 * all persisted media metadata is intended to be publicly addressable via the
 * Cloudinary CDN URLs that the admin media API already returns. This service
 * therefore exposes the same public-safe fields the admin endpoint already
 * returns, minus any Admin/SUPER_ADMIN context.
 */

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 12;
const MAX_PAGE_LIMIT = 40;
const MAX_PAGE = 10_000;

export interface PublicMediaListQuery {
  page: number;
  limit: number;
}

export interface PublicMedia {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: 'image';
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  originalFilename: string | null;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicMediaListEnvelope {
  items: PublicMedia[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function validatePublicMediaListQuery(query: {
  page?: unknown;
  limit?: unknown;
}): PublicMediaListQuery {
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

  return { page, limit };
}

export async function listPublicMedia(query: PublicMediaListQuery): Promise<PublicMediaListEnvelope> {
  const [total, media] = await Promise.all([
    MediaModel.countDocuments(),
    MediaModel.find()
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items: media.map((raw) => serializePublicMedia(raw as unknown as Parameters<typeof serializePublicMedia>[0])),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export function serializePublicMedia(
  media: {
    _id: import('mongoose').Types.ObjectId;
    __v: number;
    id?: string;
    publicId: string;
    secureUrl: string;
    resourceType: 'image';
    format: string;
    width: number;
    height: number;
    bytes: number;
    folder: string;
    originalFilename: string | null;
    title?: string | null;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  },
): PublicMedia {
  return {
    id: String(media.id ?? media._id),
    publicId: media.publicId,
    secureUrl: media.secureUrl,
    resourceType: 'image',
    format: media.format,
    width: media.width,
    height: media.height,
    bytes: media.bytes,
    folder: media.folder,
    originalFilename: media.originalFilename ?? null,
    title: media.title ?? null,
    description: media.description ?? null,
    createdAt: media.createdAt?.toISOString() ?? '',
    updatedAt: media.updatedAt?.toISOString() ?? '',
  };
}
