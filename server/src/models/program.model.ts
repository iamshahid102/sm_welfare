import { Schema, model } from 'mongoose';
import {
  MAX_PROGRAM_DESCRIPTION_LENGTH,
  MAX_PROGRAM_DISPLAY_ORDER,
  MAX_PROGRAM_SHORT_DESCRIPTION_LENGTH,
  MAX_PROGRAM_SLUG_LENGTH,
  MAX_PROGRAM_TITLE_LENGTH,
  PROGRAM_SLUG_PATTERN,
  PROGRAM_STATUSES,
  type ProgramStatus,
} from '../constants/program.js';
import {
  contentCtaSchema,
  contentFactSchema,
  contentHighlightSchema,
  contentImageSchema,
  contentSectionSchema,
} from './content.schema.js';
import type {
  ContentCta,
  ContentFact,
  ContentHighlight,
  ContentImage,
  ContentSection,
} from '../types/content.js';

/**
 * Shape of a program (long-term welfare initiative) document.
 *
 * `slug` carries a unique index - the database is the final authority against
 * duplicate slugs. `status` uses the ProgramStatus union (DRAFT/PUBLISHED/
 * ARCHIVED). Programs are never physically deleted; ARCHIVED keeps the
 * document while removing it from public visibility (a future phase).
 *
 * Rich content: alongside the plain title/description fields every program
 * carries the same page-building blocks the public detail page renders - a
 * cover photo, a gallery, narrative sections, highlight cards, quick facts and
 * an optional closing call to action. Images are stored as lightweight
 * Cloudinary references (url + publicId + intrinsic size), never as bytes.
 */
export interface Program {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProgramStatus;
  displayOrder: number;
  tagline?: string;
  coverImage?: ContentImage;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta?: ContentCta;
  createdAt?: Date;
  updatedAt?: Date;
}

const programSchema = new Schema<Program>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_PROGRAM_TITLE_LENGTH,
    },
    // Unique index enforces slug uniqueness at the database level, so
    // concurrent creation can never produce duplicate slugs (one wins, the
    // other hits E11000). Normalized to lowercase on write.
    slug: {
      type: String,
      required: [true, 'slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        PROGRAM_SLUG_PATTERN,
        'slug must be URL-safe (lowercase letters, numbers and hyphens)',
      ],
      maxlength: MAX_PROGRAM_SLUG_LENGTH,
    },
    shortDescription: {
      type: String,
      required: [true, 'shortDescription is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_PROGRAM_SHORT_DESCRIPTION_LENGTH,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_PROGRAM_DESCRIPTION_LENGTH,
    },
    status: {
      type: String,
      enum: {
        values: [...PROGRAM_STATUSES],
        message: '{VALUE} is not a supported program status',
      },
      required: [true, 'status is required'],
      default: 'DRAFT',
    },
    displayOrder: {
      type: Number,
      min: 0,
      max: MAX_PROGRAM_DISPLAY_ORDER,
      default: 0,
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: MAX_PROGRAM_TITLE_LENGTH,
    },
    coverImage: { type: contentImageSchema },
    gallery: { type: [contentImageSchema], default: [] },
    sections: { type: [contentSectionSchema], default: [] },
    highlights: { type: [contentHighlightSchema], default: [] },
    facts: { type: [contentFactSchema], default: [] },
    cta: { type: contentCtaSchema },
  },
  {
    timestamps: true,
    collection: 'programs',
  },
);

// Supports the admin and public list endpoints (status filter, sorted by
// displayOrder then newest first). The unique slug index covers slug lookups.
programSchema.index({ status: 1, displayOrder: 1, createdAt: -1 });

export const ProgramModel = model<Program>('Program', programSchema);
