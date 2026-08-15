import type { RequestHandler } from 'express';
import multer from 'multer';
import { MAX_MEDIA_BYTES } from '../constants/media.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Parses a single `file` field from a multipart/form-data request into
 * `req.file` as an in-memory Buffer - the raw bytes never touch disk.
 *
 * Multer errors are translated to safe JSON errors: oversize uploads become
 * 413 (Payload Too Large), everything else becomes 400. The raw bytes are
 * validated further down in the media service (magic-byte detection), so
 * nothing here trusts the client filename or MIME type.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES },
});

export const uploadSingleFile: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        next(new ApiError(413, `File must not exceed ${MAX_MEDIA_BYTES / (1024 * 1024)} MB.`));
        return;
      }
      next(new ApiError(400, 'Invalid file upload.'));
      return;
    }
    if (error) {
      next(new ApiError(400, 'Invalid file upload.'));
      return;
    }
    next();
  });
};
