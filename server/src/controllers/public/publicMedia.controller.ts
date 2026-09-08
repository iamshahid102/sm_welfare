import type { RequestHandler } from 'express';
import { listPublicMedia, validatePublicMediaListQuery } from '../../services/public/publicMedia.service.js';

/** GET /api/v1/public/media - unauthenticated list of public media metadata. */
export const listPublicMediaHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = validatePublicMediaListQuery(req.query);
    const result = await listPublicMedia(query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
