import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Centralized Cloudinary configuration.
 *
 * Credentials are server-only (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET) and never leave the server. They are read from the
 * centralized env module and applied to the official SDK client exactly once.
 *
 * Failure policy:
 *  - production: the server refuses to boot without all three credentials -
 *    media endpoints must never half-work in production
 *  - development: the server still starts so local work is possible, but media
 *    operations call assertCloudinaryConfigured() and fail with a clear 500
 *
 * The API secret is never logged.
 */

const CLOUDINARY_ENV_VARS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

export const cloudinaryConfigured = Boolean(
  env.cloudinaryCloudName &&
    env.cloudinaryApiKey &&
    env.cloudinaryApiSecret,
);

if (env.isProduction && !cloudinaryConfigured) {
  throw new Error(
    `Cloudinary is not configured. Set ${CLOUDINARY_ENV_VARS.join(', ')} in server/.env (see .env.example).`,
  );
}

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

/** Throws a clear 500 when the server has no usable Cloudinary credentials. */
export function assertCloudinaryConfigured(): void {
  if (!cloudinaryConfigured) {
    throw new ApiError(500, 'Media storage is not configured on this server.');
  }
}

export { cloudinary };
