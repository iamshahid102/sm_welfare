import { Router } from 'express';
import * as mediaController from '../../controllers/media.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { uploadSingleFile } from '../../middlewares/upload.middleware.js';

const mediaRouter = Router();

// Every media endpoint requires authentication. SUPER_ADMIN and ADMIN are both
// allowed to upload, read and delete media; unauthenticated requests get 401.
// There is no endpoint for arbitrary Cloudinary administration, and Cloudinary
// credentials never leave the server.
mediaRouter.post(
  '/',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  uploadSingleFile,
  mediaController.uploadMedia,
);
mediaRouter.get(
  '/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  mediaController.getMedia,
);
mediaRouter.delete(
  '/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  mediaController.deleteMedia,
);

export { mediaRouter };
