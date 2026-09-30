/**
 * Shared rich-content types — mirrors server/src/types/content.ts exactly.
 *
 * Programs and Projects both carry these page-building blocks: a hero tagline,
 * a cover photo, a gallery, narrative sections, highlight cards, quick facts
 * and an optional closing call to action.
 */

export interface ContentImage {
  publicId?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type ContentImageSide = "left" | "right";

export interface ContentSection {
  kicker?: string;
  title?: string;
  body?: string;
  image?: ContentImage;
  imageSide?: ContentImageSide;
}

export interface ContentHighlight {
  icon?: string;
  title: string;
  description: string;
}

export interface ContentFact {
  icon?: string;
  label: string;
  value: string;
}

export interface ContentCta {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

/** Every rich-content field, always present on a fetched document. */
export interface ContentFields {
  tagline: string | null;
  coverImage: ContentImage | null;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta: ContentCta | null;
}

/** The editable (all-optional) shape used by the admin forms. */
export interface ContentFieldsInput {
  tagline?: string;
  coverImage?: ContentImage | null;
  gallery?: ContentImage[];
  sections?: ContentSection[];
  highlights?: ContentHighlight[];
  facts?: ContentFact[];
  cta?: ContentCta | null;
}

/**
 * Icon vocabulary the API accepts for highlight cards and facts. The renderer
 * maps these keys to concrete icons; the editor only ever offers these.
 */
export const CONTENT_ICON_KEYS = [
  "heart",
  "hand-heart",
  "map-pin",
  "clock",
  "phone",
  "academic-cap",
  "book-open",
  "briefcase",
  "sparkles",
  "scissors",
  "paint-brush",
  "home",
  "sun",
  "snowflake",
  "truck",
  "shield",
  "users",
  "star",
  "gift",
  "tree",
  "stethoscope",
  "ambulance",
  "mosque",
  "utensils",
  "graduation",
  "water",
  "leaf",
  "building",
  "currency",
  "medical",
] as const;

export type ContentIconKey = (typeof CONTENT_ICON_KEYS)[number];
