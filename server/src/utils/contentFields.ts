import {
  CONTENT_ICON_KEYS,
  CONTENT_IMAGE_SIDES,
  MAX_CONTENT_ALT_LENGTH,
  MAX_CONTENT_BODY_LENGTH,
  MAX_CONTENT_FACTS,
  MAX_CONTENT_GALLERY,
  MAX_CONTENT_HIGHLIGHTS,
  MAX_CONTENT_KICKER_LENGTH,
  MAX_CONTENT_PUBLIC_ID_LENGTH,
  MAX_CONTENT_SECTIONS,
  MAX_CONTENT_TEXT_LENGTH,
  MAX_CONTENT_TITLE_LENGTH,
  MAX_CONTENT_URL_LENGTH,
  type ContentIcon,
  type ContentImageSide,
} from '../constants/content.js';
import { ApiError } from './ApiError.js';
import type {
  ContentCta,
  ContentFact,
  ContentHighlight,
  ContentImage,
  ContentPayload,
  ContentSection,
} from '../types/content.js';

/**
 * Validation helpers for the rich content shared by Programs and Projects.
 *
 * The admin editor posts the whole content payload alongside the plain title
 * fields, so every value here is validated and trimmed before it reaches
 * Mongoose. Unknown keys are dropped, arrays are capped, and any wrong type is
 * rejected with a 400 rather than silently coerced — the same strictness the
 * rest of the services apply.
 */

const ICON_SET = new Set<string>(CONTENT_ICON_KEYS);
const IMAGE_SIDE_SET = new Set<string>(CONTENT_IMAGE_SIDES);

function optionalString(
  value: unknown,
  label: string,
  maxLength: number,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} must be a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  if (trimmed.length > maxLength) {
    throw new ApiError(400, `${label} must not exceed ${maxLength} characters.`);
  }
  return trimmed;
}

function requiredString(value: unknown, label: string, maxLength: number): string {
  const parsed = optionalString(value, label, maxLength);
  if (parsed === undefined) {
    throw new ApiError(400, `${label} is required.`);
  }
  return parsed;
}

function assertArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ApiError(400, `${label} must be an array.`);
  }
  return value;
}

function validateIcon(value: unknown, label: string): ContentIcon | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !ICON_SET.has(value)) {
    throw new ApiError(400, `${label} is not a supported icon.`);
  }
  return value as ContentIcon;
}

export function validateContentImage(value: unknown, label: string): ContentImage {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `${label} must be an object.`);
  }
  const raw = value as Record<string, unknown>;
  const url = requiredString(raw.url, `${label}.url`, MAX_CONTENT_URL_LENGTH);
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    throw new ApiError(400, `${label}.url must be an http(s) URL or a root-relative path.`);
  }
  const image: ContentImage = { url };
  const publicId = optionalString(raw.publicId, `${label}.publicId`, MAX_CONTENT_PUBLIC_ID_LENGTH);
  if (publicId !== undefined) image.publicId = publicId;
  const alt = optionalString(raw.alt, `${label}.alt`, MAX_CONTENT_ALT_LENGTH);
  if (alt !== undefined) image.alt = alt;
  if (raw.width !== undefined) {
    if (typeof raw.width !== 'number' || !Number.isInteger(raw.width) || raw.width < 1) {
      throw new ApiError(400, `${label}.width must be a positive integer.`);
    }
    image.width = raw.width;
  }
  if (raw.height !== undefined) {
    if (typeof raw.height !== 'number' || !Number.isInteger(raw.height) || raw.height < 1) {
      throw new ApiError(400, `${label}.height must be a positive integer.`);
    }
    image.height = raw.height;
  }
  return image;
}

function validateOptionalContentImage(
  value: unknown,
  label: string,
): ContentImage | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'object' && !Array.isArray(value) && !('url' in (value as object))) {
    // Empty editor row — treat as "no image" instead of a hard error.
    const raw = value as Record<string, unknown>;
    if (Object.keys(raw).length === 0) return undefined;
  }
  return validateContentImage(value, label);
}

export function validateContentSections(value: unknown): ContentSection[] {
  const list = assertArray(value, 'sections');
  if (list.length > MAX_CONTENT_SECTIONS) {
    throw new ApiError(400, `sections must not contain more than ${MAX_CONTENT_SECTIONS} items.`);
  }
  return list.map((item, index) => {
    const label = `sections[${index}]`;
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ApiError(400, `${label} must be an object.`);
    }
    const raw = item as Record<string, unknown>;
    const section: ContentSection = {};
    const kicker = optionalString(raw.kicker, `${label}.kicker`, MAX_CONTENT_KICKER_LENGTH);
    if (kicker !== undefined) section.kicker = kicker;
    const title = optionalString(raw.title, `${label}.title`, MAX_CONTENT_TITLE_LENGTH);
    if (title !== undefined) section.title = title;
    const body = optionalString(raw.body, `${label}.body`, MAX_CONTENT_BODY_LENGTH);
    if (body !== undefined) section.body = body;
    const image = validateOptionalContentImage(raw.image, `${label}.image`);
    if (image !== undefined) section.image = image;
    if (raw.imageSide !== undefined && raw.imageSide !== null && raw.imageSide !== '') {
      if (typeof raw.imageSide !== 'string' || !IMAGE_SIDE_SET.has(raw.imageSide)) {
        throw new ApiError(400, `${label}.imageSide must be "left" or "right".`);
      }
      section.imageSide = raw.imageSide as ContentImageSide;
    }
    if (Object.keys(section).length === 0) {
      throw new ApiError(400, `${label} must contain at least one field.`);
    }
    return section;
  });
}

export function validateContentHighlights(value: unknown): ContentHighlight[] {
  const list = assertArray(value, 'highlights');
  if (list.length > MAX_CONTENT_HIGHLIGHTS) {
    throw new ApiError(
      400,
      `highlights must not contain more than ${MAX_CONTENT_HIGHLIGHTS} items.`,
    );
  }
  return list.map((item, index) => {
    const label = `highlights[${index}]`;
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ApiError(400, `${label} must be an object.`);
    }
    const raw = item as Record<string, unknown>;
    const highlight: ContentHighlight = {
      title: requiredString(raw.title, `${label}.title`, MAX_CONTENT_TITLE_LENGTH),
      description: requiredString(raw.description, `${label}.description`, MAX_CONTENT_TEXT_LENGTH),
    };
    const icon = validateIcon(raw.icon, `${label}.icon`);
    if (icon !== undefined) highlight.icon = icon;
    return highlight;
  });
}

export function validateContentFacts(value: unknown): ContentFact[] {
  const list = assertArray(value, 'facts');
  if (list.length > MAX_CONTENT_FACTS) {
    throw new ApiError(400, `facts must not contain more than ${MAX_CONTENT_FACTS} items.`);
  }
  return list.map((item, index) => {
    const label = `facts[${index}]`;
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new ApiError(400, `${label} must be an object.`);
    }
    const raw = item as Record<string, unknown>;
    const fact: ContentFact = {
      label: requiredString(raw.label, `${label}.label`, MAX_CONTENT_KICKER_LENGTH),
      value: requiredString(raw.value, `${label}.value`, MAX_CONTENT_TITLE_LENGTH),
    };
    const icon = validateIcon(raw.icon, `${label}.icon`);
    if (icon !== undefined) fact.icon = icon;
    return fact;
  });
}

export function validateContentGallery(value: unknown): ContentImage[] {
  const list = assertArray(value, 'gallery');
  if (list.length > MAX_CONTENT_GALLERY) {
    throw new ApiError(400, `gallery must not contain more than ${MAX_CONTENT_GALLERY} items.`);
  }
  return list.map((item, index) => validateContentImage(item, `gallery[${index}]`));
}

export function validateContentCta(value: unknown): ContentCta | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, 'cta must be an object.');
  }
  const raw = value as Record<string, unknown>;
  const cta: ContentCta = {};
  const title = optionalString(raw.title, 'cta.title', MAX_CONTENT_TITLE_LENGTH);
  if (title !== undefined) cta.title = title;
  const body = optionalString(raw.body, 'cta.body', MAX_CONTENT_BODY_LENGTH);
  if (body !== undefined) cta.body = body;
  const buttonLabel = optionalString(raw.buttonLabel, 'cta.buttonLabel', MAX_CONTENT_KICKER_LENGTH);
  if (buttonLabel !== undefined) cta.buttonLabel = buttonLabel;
  const buttonHref = optionalString(raw.buttonHref, 'cta.buttonHref', MAX_CONTENT_URL_LENGTH);
  if (buttonHref !== undefined) cta.buttonHref = buttonHref;
  return Object.keys(cta).length > 0 ? cta : undefined;
}

/** True when the request body actually carried the given key. */
function has(body: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(body, key);
}

/**
 * Extracts and validates the rich-content fields present in a create payload.
 * Arrays default to `[]`; `coverImage` / `cta` are optional.
 */
export function extractContentPayload(body: Record<string, unknown>): ContentPayload {
  const payload: ContentPayload = {
    ...(optionalString(body.tagline, 'tagline', MAX_CONTENT_TITLE_LENGTH) !== undefined && {
      tagline: optionalString(body.tagline, 'tagline', MAX_CONTENT_TITLE_LENGTH),
    }),
    gallery: has(body, 'gallery') ? validateContentGallery(body.gallery) : [],
    sections: has(body, 'sections') ? validateContentSections(body.sections) : [],
    highlights: has(body, 'highlights') ? validateContentHighlights(body.highlights) : [],
    facts: has(body, 'facts') ? validateContentFacts(body.facts) : [],
  };
  if (has(body, 'coverImage')) {
    const cover = validateOptionalContentImage(body.coverImage, 'coverImage');
    if (cover !== undefined) payload.coverImage = cover;
  }
  if (has(body, 'cta')) {
    const cta = validateContentCta(body.cta);
    if (cta !== undefined) payload.cta = cta;
  }
  return payload;
}

/** Validates only the rich-content keys actually present in a partial update. */
export function extractContentUpdate(body: Record<string, unknown>): Partial<ContentPayload> {
  const update: Partial<ContentPayload> = {};
  if (has(body, 'tagline')) {
    update.tagline = optionalString(body.tagline, 'tagline', MAX_CONTENT_TITLE_LENGTH);
  }
  if (has(body, 'coverImage')) {
    update.coverImage = validateOptionalContentImage(body.coverImage, 'coverImage');
  }
  if (has(body, 'gallery')) update.gallery = validateContentGallery(body.gallery);
  if (has(body, 'sections')) update.sections = validateContentSections(body.sections);
  if (has(body, 'highlights')) update.highlights = validateContentHighlights(body.highlights);
  if (has(body, 'facts')) update.facts = validateContentFacts(body.facts);
  if (has(body, 'cta')) update.cta = validateContentCta(body.cta);
  return update;
}

/** Whether the body carried at least one rich-content key. */
export function hasContentFields(body: Record<string, unknown>): boolean {
  return (
    has(body, 'tagline') ||
    has(body, 'coverImage') ||
    has(body, 'gallery') ||
    has(body, 'sections') ||
    has(body, 'highlights') ||
    has(body, 'facts') ||
    has(body, 'cta')
  );
}
