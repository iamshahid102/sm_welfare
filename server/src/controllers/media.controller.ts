import type { RequestHandler } from 'express';
import {
  deleteMedia as mediaDelete,
  getMediaById,
  listMedia as mediaList,
  updateMedia as mediaUpdate,
  uploadMedia as mediaUpload,
  type SafeMedia,
} from '../services/media.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiSuccessResponse } from '../types/index.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Media controllers - thin HTTP adapters. All routes are guarded by
 * requireAuth + requireRole('SUPER_ADMIN', 'ADMIN') in the route definitions;
 * controllers only translate request data into service calls and results into
 * responses.
 */

function mediaPayload(media: SafeMedia): ApiSuccessResponse<{ media: SafeMedia }> {
  return { success: true, data: { media } };
}

/** GET /api/v1/media - paginated list of all media (admin). */
export const listMedia: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const result = await mediaList({ page, limit });
  res.status(200).json({ success: true, data: result });
};

/** POST /api/v1/media - upload an image (multipart field: `file`). */
export const uploadMedia: RequestHandler = async (req, res) => {
  const authUser = (req as AuthenticatedRequest).authUser;
  const title = typeof req.body?.title === 'string' ? req.body.title : undefined;
  const description = typeof req.body?.description === 'string' ? req.body.description : undefined;
  const media = await mediaUpload({
    buffer: req.file?.buffer ?? Buffer.alloc(0),
    originalFilename: req.file?.originalname,
    title,
    description,
    uploadedBy: authUser.id,
  });
  res.status(201).json(mediaPayload(media));
};

/** GET /api/v1/media/:id - media metadata (never the binary). */
export const getMedia: RequestHandler = async (req, res) => {
  const media = await getMediaById(req.params.id);
  res.status(200).json(mediaPayload(media));
};

/** PATCH /api/v1/media/:id - update media title/description. */
export const updateMedia: RequestHandler = async (req, res) => {
  const title = typeof req.body?.title === 'string' ? req.body.title : undefined;
  const description = typeof req.body?.description === 'string' ? req.body.description : undefined;

  if (title === undefined && description === undefined) {
    throw new ApiError(400, 'Nothing to update. Provide title or description.');
  }

  const media = await mediaUpdate(req.params.id, { title, description });
  res.status(200).json(mediaPayload(media));
};

/** DELETE /api/v1/media/:id - Cloudinary asset + MongoDB metadata. */
export const deleteMedia: RequestHandler = async (req, res) => {
  const id = await mediaDelete(req.params.id);
  res.status(200).json({ success: true, data: { id } } satisfies ApiSuccessResponse<{ id: string }>);
};
