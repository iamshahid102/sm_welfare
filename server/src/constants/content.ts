/**
 * Shared content-block constants.
 *
 * Programs and Projects both render a public detail page composed of the same
 * building blocks (a cover photo, a gallery, narrative sections, highlight
 * cards and quick facts). Keeping the limits and allowed vocabularies in one
 * place means the Mongoose schemas, the service validation and the client
 * editor can never drift apart.
 */

/**
 * Icon vocabulary shared by highlight cards and facts. The client maps each
 * key to a concrete `react-icons` glyph, so the API only ever carries a stable
 * key — never a component name or raw SVG.
 */
export const CONTENT_ICON_KEYS = [
  'heart',
  'hand-heart',
  'map-pin',
  'clock',
  'phone',
  'academic-cap',
  'book-open',
  'briefcase',
  'sparkles',
  'scissors',
  'paint-brush',
  'home',
  'sun',
  'snowflake',
  'truck',
  'shield',
  'users',
  'star',
  'gift',
  'tree',
  'stethoscope',
  'ambulance',
  'mosque',
  'utensils',
  'graduation',
  'water',
  'leaf',
  'building',
  'currency',
  'medical',
] as const;

export type ContentIcon = (typeof CONTENT_ICON_KEYS)[number];

/** Which side the section photo sits on for the two-column layout. */
export const CONTENT_IMAGE_SIDES = ['left', 'right'] as const;
export type ContentImageSide = (typeof CONTENT_IMAGE_SIDES)[number];

/** Hard caps — the service rejects payloads that exceed them. */
export const MAX_CONTENT_SECTIONS = 12;
export const MAX_CONTENT_HIGHLIGHTS = 12;
export const MAX_CONTENT_FACTS = 8;
export const MAX_CONTENT_GALLERY = 12;

export const MAX_CONTENT_KICKER_LENGTH = 80;
export const MAX_CONTENT_TITLE_LENGTH = 200;
export const MAX_CONTENT_BODY_LENGTH = 4_000;
export const MAX_CONTENT_TEXT_LENGTH = 300;
export const MAX_CONTENT_URL_LENGTH = 1_024;
export const MAX_CONTENT_ALT_LENGTH = 300;
export const MAX_CONTENT_PUBLIC_ID_LENGTH = 300;
