import { Types } from 'mongoose';
import { assertCloudinaryConfigured, cloudinary } from '../config/cloudinary.js';
import {
  ALLOWED_IMAGE_FORMATS,
  MAX_MEDIA_BYTES,
  MEDIA_UPLOAD_FOLDER,
  type AllowedImageFormat,
  type MediaResourceType,
} from '../constants/media.js';
import { MediaModel } from '../models/media.model.js';
import type { Media } from '../models/media.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Media service - all media business rules live here; controllers stay thin.
 *
 * Upload pipeline: validate bytes -> upload to Cloudinary -> persist metadata.
 * On a persistence failure the just-uploaded Cloudinary asset is destroyed so
 * an orphaned file is never left behind.
 *
 * Delete pipeline: load metadata -> delete from Cloudinary -> only then remove
 * the MongoDB record. If Cloudinary deletion fails, the metadata record is kept
 * so the caller can retry - the record is never silently dropped.
 */

/** Client-safe media representation - never exposes _id, __v or Cloudinary internals. */
export interface SafeMedia {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: MediaResourceType;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  originalFilename: string | null;
  title: string | null;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMediaInput {
  buffer: Buffer;
  originalFilename?: string;
  title?: string;
  description?: string;
  uploadedBy: string;
}

/**
 * Detects the real image format from the file's magic bytes.
 * Returns null for anything that is not a supported image. The client-provided
 * filename/MIME type is never used for this decision.
 */
export function detectImageFormat(buffer: Buffer): AllowedImageFormat | null {
  if (buffer.length < 12) {
    return null;
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'jpg';
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer.toString('latin1', 1, 4) === 'PNG') {
    return 'png';
  }
  // WebP: "RIFF" + 4 size bytes + "WEBP"
  if (
    buffer.toString('latin1', 0, 4) === 'RIFF' &&
    buffer.toString('latin1', 8, 12) === 'WEBP'
  ) {
    return 'webp';
  }
  return null;
}

/**
 * Validates an uploaded image buffer: non-empty, within the size limit, and a
 * recognized image signature. Returns the detected format on success.
 */
export function validateImageBuffer(buffer: Buffer): AllowedImageFormat {
  if (buffer.length === 0) {
    throw new ApiError(400, 'No file uploaded.');
  }
  if (buffer.length > MAX_MEDIA_BYTES) {
    throw new ApiError(
      413,
      `File must not exceed ${MAX_MEDIA_BYTES / (1024 * 1024)} MB.`,
    );
  }
  const format = detectImageFormat(buffer);
  if (format === null) {
    throw new ApiError(
      400,
      `Unsupported file type. Allowed: ${ALLOWED_IMAGE_FORMATS.join(', ')}.`,
    );
  }
  return format;
}

/** Accepts only a strict 24-hex-character MongoDB ObjectId (same rule as admins). */
export function validateMediaId(id: unknown): Types.ObjectId {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, 'Invalid media id.');
  }
  return new Types.ObjectId(id);
}

/** Streams a validated buffer to Cloudinary and resolves with the upload result. */
function uploadToCloudinary(buffer: Buffer): Promise<{
  publicId: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
}> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: MEDIA_UPLOAD_FOLDER,
        resource_type: 'image',
      },
      (error, result) => {
        if (error !== undefined || result === undefined) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        const { public_id, secure_url, format, width, height, bytes, folder } = result;
        if (
          typeof public_id !== 'string' ||
          typeof secure_url !== 'string' ||
          typeof width !== 'number' ||
          typeof height !== 'number' ||
          typeof bytes !== 'number'
        ) {
          reject(new Error('Cloudinary returned an incomplete upload result'));
          return;
        }
        resolve({
          publicId: public_id,
          secureUrl: secure_url,
          format: format ?? 'image',
          width,
          height,
          bytes,
          folder: folder ?? MEDIA_UPLOAD_FOLDER,
        });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Uploads a validated image buffer to Cloudinary and persists its metadata.
 * If MongoDB persistence fails, the just-uploaded Cloudinary asset is destroyed
 * (best effort) so no orphaned file is left behind, then the error is rethrown.
 */
export async function uploadMedia(input: UploadMediaInput): Promise<SafeMedia> {
  validateImageBuffer(input.buffer);
  assertCloudinaryConfigured();

  let upload;
  try {
    upload = await uploadToCloudinary(input.buffer);
  } catch {
    // Generic message - Cloudinary error details may contain internal URLs.
    throw new ApiError(502, 'Failed to upload media to the media service.');
  }

  try {
    const media = await MediaModel.create({
      publicId: upload.publicId,
      secureUrl: upload.secureUrl,
      resourceType: 'image',
      format: upload.format,
      width: upload.width,
      height: upload.height,
      bytes: upload.bytes,
      folder: upload.folder,
      originalFilename: input.originalFilename?.trim() || undefined,
      title: input.title?.trim() || undefined,
      description: input.description?.trim() || undefined,
      createdBy: input.uploadedBy,
    });
    return serializeSafeMedia(media);
  } catch (error) {
    // Rollback: remove the asset that just landed in Cloudinary. A failed
    // rollback must not mask the original persistence error.
    await cloudinary.uploader.destroy(upload.publicId).catch(() => undefined);
    throw error;
  }
}

/** Loads one media metadata record (metadata only - never the binary). */
export async function getMediaById(id: unknown): Promise<SafeMedia> {
  const mediaId = validateMediaId(id);
  const media = await MediaModel.findById(mediaId);
  if (!media) {
    throw ApiError.notFound('Media not found.');
  }
  return serializeSafeMedia(media);
}

/** Paginated list of all media (admin). */
export interface ListMediaQuery {
  page: number;
  limit: number;
}

export interface ListMediaResult {
  items: SafeMedia[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function listMedia(query: ListMediaQuery): Promise<ListMediaResult> {
  const [total, media] = await Promise.all([
    MediaModel.countDocuments(),
    MediaModel.find()
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
  ]);

  return {
    items: media.map((raw) => serializeSafeMedia(raw as unknown as Parameters<typeof serializeSafeMedia>[0])),
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

/** Update mutable fields (title, description) of a media record. */
export async function updateMedia(
  id: unknown,
  updates: { title?: string; description?: string },
): Promise<SafeMedia> {
  const mediaId = validateMediaId(id);
  const media = await MediaModel.findById(mediaId);
  if (!media) {
    throw ApiError.notFound('Media not found.');
  }

  if (updates.title !== undefined) {
    media.title = updates.title.trim() || undefined;
  }
  if (updates.description !== undefined) {
    media.description = updates.description.trim() || undefined;
  }

  await media.save();
  return serializeSafeMedia(media);
}

/**
 * Destroys the Cloudinary asset for a public id.
 *
 * Cloudinary reports `ok` when the asset was deleted and `not found` when it is
 * already gone - both mean "no asset remains", so both are treated as success.
 * Any other outcome throws, keeping the MongoDB record intact for a retry.
 */
async function destroyCloudinaryAsset(
  publicId: string,
  resourceType: MediaResourceType,
): Promise<void> {
  assertCloudinaryConfigured();
  let result: { result: string };
  try {
    result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch {
    throw new ApiError(502, 'Failed to delete media from the media service.');
  }
  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new ApiError(502, 'Failed to delete media from the media service.');
  }
}

/**
 * Deletes a media asset: Cloudinary first, MongoDB metadata only afterwards.
 * When the Cloudinary asset is already missing the deletion still completes
 * (the metadata record is removed), so a stale record can be cleaned up.
 */
export async function deleteMedia(id: unknown): Promise<string> {
  const mediaId = validateMediaId(id);
  const media = await MediaModel.findById(mediaId);
  if (!media) {
    throw ApiError.notFound('Media not found.');
  }

  await destroyCloudinaryAsset(media.publicId, media.resourceType);

  // Only after a successful Cloudinary deletion is the metadata removed.
  // findOneAndDelete (not deleteOne) so a concurrent double-delete yields 404
  // for the second caller instead of a misleading success.
  const deleted = await MediaModel.findOneAndDelete({ _id: mediaId });
  if (!deleted) {
    throw ApiError.notFound('Media not found.');
  }
  return deleted.id;
}

/** Picks only client-safe fields from a loaded media document. */
export function serializeSafeMedia(media: Media & { id: string }): SafeMedia {
  return {
    id: String((media as unknown as { _id?: import('mongoose').Types.ObjectId })._id ?? media.id),
    publicId: media.publicId,
    secureUrl: media.secureUrl,
    resourceType: media.resourceType,
    format: media.format,
    width: media.width,
    height: media.height,
    bytes: media.bytes,
    folder: media.folder,
    originalFilename: media.originalFilename ?? null,
    title: media.title ?? null,
    description: media.description ?? null,
    createdBy: media.createdBy.toString(),
    createdAt: media.createdAt?.toISOString() ?? '',
    updatedAt: media.updatedAt?.toISOString() ?? '',
  };
}
