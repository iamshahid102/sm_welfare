import { Schema, model, Types } from 'mongoose';
import {
  MEDIA_RESOURCE_TYPES,
  type MediaResourceType,
} from '../constants/media.js';

/**
 * Shape of a media metadata document.
 *
 * Deliberately generic so every future module (Programs, Projects, Site
 * Settings, Campaigns, ...) can reference Media records. It stores only
 * Cloudinary metadata - never binary image data; the actual bytes live in
 * Cloudinary and are addressed by `publicId`.
 */
export interface Media {
  /** Cloudinary public id - unique per cloud, used for delete/destroy. */
  publicId: string;
  /** HTTPS URL served from Cloudinary's CDN. */
  secureUrl: string;
  resourceType: MediaResourceType;
  /** Normalized extension reported by Cloudinary, e.g. jpg, png, webp. */
  format: string;
  width: number;
  height: number;
  /** Size in bytes of the uploaded asset (as reported by Cloudinary). */
  bytes: number;
  /** Cloudinary folder the asset lives in (e.g. sm-welfare). */
  folder: string;
  /** Original client filename, kept for reference only - never trusted. */
  originalFilename?: string;
  /** Admin-assigned display title for the media asset. */
  title?: string;
  /** Admin-provided description / alt-text for the media asset. */
  description?: string;
  /** Id of the User document that uploaded the asset. */
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const mediaSchema = new Schema<Media>(
  {
    publicId: {
      type: String,
      required: [true, 'publicId is required'],
      unique: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      required: [true, 'secureUrl is required'],
      trim: true,
    },
    resourceType: {
      type: String,
      enum: {
        values: [...MEDIA_RESOURCE_TYPES],
        message: '{VALUE} is not a supported resource type',
      },
      required: [true, 'resourceType is required'],
    },
    format: {
      type: String,
      required: [true, 'format is required'],
      trim: true,
    },
    width: {
      type: Number,
      required: [true, 'width is required'],
      min: 1,
    },
    height: {
      type: Number,
      required: [true, 'height is required'],
      min: 1,
    },
    bytes: {
      type: Number,
      required: [true, 'bytes is required'],
      min: 0,
    },
    folder: {
      type: String,
      required: [true, 'folder is required'],
      trim: true,
    },
    originalFilename: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'createdBy is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'media',
  },
);

// Both the admin and public media lists sort by createdAt (newest first).
mediaSchema.index({ createdAt: -1 });

export const MediaModel = model<Media>('Media', mediaSchema);
