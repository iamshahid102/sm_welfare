/**
 * Media domain constants.
 *
 * Shared by the Media model schema, the upload middleware, and the media
 * service validation so the upload rules can never drift apart.
 */

/** Cloudinary folder namespace for every asset uploaded by this project. */
export const MEDIA_UPLOAD_FOLDER = 'sm-welfare';

/** Maximum accepted upload size (bytes). Enforced by multer and re-checked on the buffer. */
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Image formats the media foundation accepts. Detection is content-based
 * (magic bytes) - the client-declared filename/MIME type is never trusted.
 * JPEG and JPG share the same signature and are both reported as `jpg`.
 */
export const ALLOWED_IMAGE_FORMATS = ['jpg', 'png', 'webp'] as const;
export type AllowedImageFormat = (typeof ALLOWED_IMAGE_FORMATS)[number];

/** Resource types this project uploads. Images only for now; extend to add video/raw later. */
export const MEDIA_RESOURCE_TYPES = ['image'] as const;
export type MediaResourceType = (typeof MEDIA_RESOURCE_TYPES)[number];
