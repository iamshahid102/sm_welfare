import { Router } from 'express';
import * as mediaController from '../../controllers/media.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { uploadSingleFile } from '../../middlewares/upload.middleware.js';

const mediaRouter = Router();

// Every media endpoint requires the single admin session; unauthenticated
// requests get 401. There is no endpoint for arbitrary Cloudinary
// administration, and Cloudinary credentials never leave the server.
mediaRouter.get('/', requireAuth, mediaController.listMedia);
mediaRouter.post('/', requireAuth, uploadSingleFile, mediaController.uploadMedia);
mediaRouter.get('/:id', requireAuth, mediaController.getMedia);
mediaRouter.patch('/:id', requireAuth, mediaController.updateMedia);
mediaRouter.delete('/:id', requireAuth, mediaController.deleteMedia);

export { mediaRouter };
