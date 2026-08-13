import { Schema, Types, model } from 'mongoose';
import {
  MAX_PROJECT_DESCRIPTION_LENGTH,
  MAX_PROJECT_DISPLAY_ORDER,
  MAX_PROJECT_SHORT_DESCRIPTION_LENGTH,
  MAX_PROJECT_SLUG_LENGTH,
  MAX_PROJECT_TITLE_LENGTH,
  PROJECT_SLUG_PATTERN,
  PROJECT_STATUSES,
  type ProjectStatus,
} from '../constants/project.js';

/**
 * Shape of a project (welfare initiative under exactly one program) document.
 *
 * Slug uniqueness is deliberately scoped to the program: the same project
 * title/slug may exist under different programs, but never twice within one
 * program. The compound unique index (programId, slug) is the database-level
 * authority for that rule - concurrent creation can never produce duplicates
 * (one wins, the other hits E11000).
 *
 * A project's `programId` references a Program document. Projects are never
 * physically deleted; ARCHIVED keeps the document. No binary/image fields -
 * media management is a dedicated future phase.
 */
export interface Project {
  programId: Types.ObjectId;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProjectStatus;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const projectSchema = new Schema<Project>(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'programId is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_PROJECT_TITLE_LENGTH,
    },
    // No `unique: true` on the field itself - uniqueness is compound with
    // programId, declared via schema.index below. Normalized to lowercase on
    // write.
    slug: {
      type: String,
      required: [true, 'slug is required'],
      trim: true,
      lowercase: true,
      match: [
        PROJECT_SLUG_PATTERN,
        'slug must be URL-safe (lowercase letters, numbers and hyphens)',
      ],
      maxlength: MAX_PROJECT_SLUG_LENGTH,
    },
    shortDescription: {
      type: String,
      required: [true, 'shortDescription is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_PROJECT_SHORT_DESCRIPTION_LENGTH,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_PROJECT_DESCRIPTION_LENGTH,
    },
    status: {
      type: String,
      enum: {
        values: [...PROJECT_STATUSES],
        message: '{VALUE} is not a supported project status',
      },
      required: [true, 'status is required'],
      default: 'DRAFT',
    },
    displayOrder: {
      type: Number,
      min: 0,
      max: MAX_PROJECT_DISPLAY_ORDER,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'projects',
  },
);

// Slug uniqueness is scoped to the program: the same slug may exist under
// different programs, but never twice within one program. This is the final
// authority against duplicate-slug races (E11000).
projectSchema.index({ programId: 1, slug: 1 }, { unique: true });

// Supports the list endpoint's programId + status filters sorted by
// displayOrder. (The compound unique index already covers plain programId
// equality queries via its prefix.)
projectSchema.index({ programId: 1, status: 1, displayOrder: 1 });

export const ProjectModel = model<Project>('Project', projectSchema);
