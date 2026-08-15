import type { RequestHandler } from 'express';
import {
  deleteMedia as mediaDelete,
  getMediaById,
  uploadMedia as mediaUpload,
  type SafeMedia,
} from '../services/media.service.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Media controllers - thin HTTP adapters. All routes are guarded by
 * requireAuth + requireRole('SUPER_ADMIN', 'ADMIN') in the route definitions;
 * controllers only translate request data into service calls and results into
 * responses.
 */

function mediaPayload(media: SafeMedia): ApiSuccessResponse<{ media: SafeMedia }> {
  return { success: true, data: { media } };
}

/** POST /api/v1/media - upload an image (multipart field: `file`). */
export const uploadMedia: RequestHandler = async (req, res) => {
  const authUser = (req as AuthenticatedRequest).authUser;
  const media = await mediaUpload({
    buffer: req.file?.buffer ?? Buffer.alloc(0),
    originalFilename: req.file?.originalname,
    uploadedBy: authUser.id,
  });
  res.status(201).json(mediaPayload(media));
};

/** GET /api/v1/media/:id - media metadata (never the binary). */
export const getMedia: RequestHandler = async (req, res) => {
  const media = await getMediaById(req.params.id);
  res.status(200).json(mediaPayload(media));
};

/** DELETE /api/v1/media/:id - Cloudinary asset + MongoDB metadata. */
export const deleteMedia: RequestHandler = async (req, res) => {
  const id = await mediaDelete(req.params.id);
  res.status(200).json({ success: true, data: { id } } satisfies ApiSuccessResponse<{ id: string }>);
};
