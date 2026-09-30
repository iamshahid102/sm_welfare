import { Schema } from 'mongoose';
import {
  CONTENT_ICON_KEYS,
  CONTENT_IMAGE_SIDES,
  MAX_CONTENT_ALT_LENGTH,
  MAX_CONTENT_BODY_LENGTH,
  MAX_CONTENT_KICKER_LENGTH,
  MAX_CONTENT_PUBLIC_ID_LENGTH,
  MAX_CONTENT_TEXT_LENGTH,
  MAX_CONTENT_TITLE_LENGTH,
  MAX_CONTENT_URL_LENGTH,
} from '../constants/content.js';

/**
 * Reusable Mongoose sub-schemas for the rich content shared by Programs and
 * Projects. All of them use `_id: false` so the embedded arrays stay lean and
 * serialize exactly as the plain TypeScript shapes in types/content.ts.
 */

export const contentImageSchema = new Schema(
  {
    publicId: { type: String, trim: true, maxlength: MAX_CONTENT_PUBLIC_ID_LENGTH },
    url: { type: String, required: true, trim: true, maxlength: MAX_CONTENT_URL_LENGTH },
    alt: { type: String, trim: true, maxlength: MAX_CONTENT_ALT_LENGTH },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
  },
  { _id: false },
);

export const contentSectionSchema = new Schema(
  {
    kicker: { type: String, trim: true, maxlength: MAX_CONTENT_KICKER_LENGTH },
    title: { type: String, trim: true, maxlength: MAX_CONTENT_TITLE_LENGTH },
    body: { type: String, trim: true, maxlength: MAX_CONTENT_BODY_LENGTH },
    image: { type: contentImageSchema },
    imageSide: {
      type: String,
      enum: { values: [...CONTENT_IMAGE_SIDES], message: '{VALUE} is not a valid image side' },
    },
  },
  { _id: false },
);

export const contentHighlightSchema = new Schema(
  {
    icon: {
      type: String,
      enum: { values: [...CONTENT_ICON_KEYS], message: '{VALUE} is not a supported icon' },
    },
    title: { type: String, required: true, trim: true, maxlength: MAX_CONTENT_TITLE_LENGTH },
    description: { type: String, required: true, trim: true, maxlength: MAX_CONTENT_TEXT_LENGTH },
  },
  { _id: false },
);

export const contentFactSchema = new Schema(
  {
    icon: {
      type: String,
      enum: { values: [...CONTENT_ICON_KEYS], message: '{VALUE} is not a supported icon' },
    },
    label: { type: String, required: true, trim: true, maxlength: MAX_CONTENT_KICKER_LENGTH },
    value: { type: String, required: true, trim: true, maxlength: MAX_CONTENT_TITLE_LENGTH },
  },
  { _id: false },
);

export const contentCtaSchema = new Schema(
  {
    title: { type: String, trim: true, maxlength: MAX_CONTENT_TITLE_LENGTH },
    body: { type: String, trim: true, maxlength: MAX_CONTENT_BODY_LENGTH },
    buttonLabel: { type: String, trim: true, maxlength: MAX_CONTENT_KICKER_LENGTH },
    buttonHref: { type: String, trim: true, maxlength: MAX_CONTENT_URL_LENGTH },
  },
  { _id: false },
);
