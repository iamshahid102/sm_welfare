import type { ContentIcon, ContentImageSide } from '../constants/content.js';

/**
 * Shared rich-content shapes used by both Program and Project documents.
 *
 * These are deliberately implementation-agnostic (no Mongoose types) so the
 * services, validators and API DTOs all speak the same vocabulary.
 */

/** A Cloudinary-backed photo (or any external HTTPS image). */
export interface ContentImage {
  /** Cloudinary public id — present when the image came from the media library. */
  publicId?: string;
  /** CDN URL actually rendered by the site. */
  url: string;
  /** Accessible description / alt text. */
  alt?: string;
  width?: number;
  height?: number;
}

/** One narrative block on a detail page (kicker + heading + body + photo). */
export interface ContentSection {
  kicker?: string;
  title?: string;
  body?: string;
  image?: ContentImage;
  imageSide?: ContentImageSide;
}

/** A highlight card (e.g. a course, a service, a benefit). */
export interface ContentHighlight {
  icon?: ContentIcon;
  title: string;
  description: string;
}

/** A quick fact / detail row (e.g. Location, Timing). */
export interface ContentFact {
  icon?: ContentIcon;
  label: string;
  value: string;
}

/** Optional closing call-to-action band. */
export interface ContentCta {
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

/** The full rich-content payload shared by programs and projects. */
export interface ContentPayload {
  /** Hero subtitle shown under the page title. */
  tagline?: string;
  coverImage?: ContentImage;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta?: ContentCta;
}
