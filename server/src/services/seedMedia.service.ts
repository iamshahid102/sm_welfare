import { readdir } from 'node:fs/promises';
import path from 'node:path';
import type { Types } from 'mongoose';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';
import { MEDIA_UPLOAD_FOLDER } from '../constants/media.js';
import { MediaModel } from '../models/media.model.js';
import type { ContentImage } from '../types/content.js';

/**
 * Seed media helper.
 *
 * Uploads the curated local photos in `client/public/images` to Cloudinary and
 * records a Media document for each, so the admin Media library and every
 * program/project point at the same CDN asset. Used only by the seed service
 * (the normal upload path is the authenticated media endpoint).
 *
 * The upload folder and the unique-publicId rule mirror the media module, and
 * an asset that already exists (same original filename) is reused instead of
 * being uploaded twice.
 */

const IMAGE_FILE_PATTERN = /\.(?:jpe?g|png|webp)$/i;

/** Absolute path to the curated image folder (server runs from server/). */
export function resolveLocalImagesDir(): string {
  return path.resolve(process.cwd(), '..', 'client', 'public', 'images');
}

/** Every image file in the curated folder, sorted for stable output. */
export async function listLocalImageFiles(): Promise<string[]> {
  try {
    const entries = await readdir(resolveLocalImagesDir());
    return entries.filter((entry) => IMAGE_FILE_PATTERN.test(entry)).sort();
  } catch {
    return [];
  }
}

export interface UploadedImage {
  file: string;
  image: ContentImage;
}

/**
 * Uploads the given files to Cloudinary and upserts one Media document per
 * asset. Returns a filename → ContentImage map for the seed to attach.
 */
export async function uploadImagesToCloudinary(
  files: readonly string[],
  createdBy: Types.ObjectId,
): Promise<Map<string, ContentImage>> {
  const images = new Map<string, ContentImage>();
  if (!cloudinaryConfigured || files.length === 0) {
    return images;
  }

  const dir = resolveLocalImagesDir();

  for (const file of files) {
    const existing = await MediaModel.findOne({ originalFilename: file }).lean();
    if (existing) {
      images.set(file, {
        publicId: existing.publicId,
        url: existing.secureUrl,
        width: existing.width,
        height: existing.height,
      });
      continue;
    }

    const result = await cloudinary.uploader.upload(path.join(dir, file), {
      folder: MEDIA_UPLOAD_FOLDER,
      resource_type: 'image',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    const image: ContentImage = {
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };

    await MediaModel.updateOne(
      { publicId: result.public_id },
      {
        $set: {
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: 'image',
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          folder: MEDIA_UPLOAD_FOLDER,
          originalFilename: file,
          title: file,
          createdBy,
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    images.set(file, image);
  }

  return images;
}

/**
 * Destroys every stored Cloudinary asset (best effort) so a reset does not
 * leave orphaned files behind. A failure on one asset never aborts the reset.
 */
export async function destroyAllMediaAssets(): Promise<number> {
  if (!cloudinaryConfigured) return 0;
  const docs = await MediaModel.find().select('publicId resourceType').lean();
  let destroyed = 0;
  for (const doc of docs) {
    try {
      await cloudinary.uploader.destroy(doc.publicId, {
        resource_type: doc.resourceType,
        invalidate: true,
      });
      destroyed += 1;
    } catch {
      // Best effort — the Media document is removed regardless.
    }
  }
  return destroyed;
}
