import { model, Schema } from 'mongoose';
import { FORM_TYPES, type FormType } from '../constants/form.js';

/**
 * Shape of a stored form submission.
 *
 * One document per submission from any of the public forms. `createdAt` /
 * `updatedAt` are managed by the timestamps plugin (an extra explicit
 * `createdAt` field would be redundant and could disagree with the plugin).
 */
export interface FormSubmission {
  formType: FormType;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const formSubmissionSchema = new Schema<FormSubmission>(
  {
    formType: {
      type: String,
      required: [true, 'Form type is required'],
      enum: {
        values: [...FORM_TYPES],
        message: '{VALUE} is not a supported form type',
      },
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
      maxlength: 254,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]{7,32}$/, 'Invalid phone number'],
      maxlength: 32,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: 1,
      maxlength: 2_000,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Supports reporting by form type, newest first.
formSubmissionSchema.index({ formType: 1, createdAt: -1 });

export const FormSubmissionModel = model<FormSubmission>(
  'FormSubmission',
  formSubmissionSchema,
);
