/**
 * Program domain constants.
 *
 * Statuses are defined as an `as const` array so the Mongoose schema enum and
 * the derived union type stay in sync automatically - the same convention as
 * constants/user.ts. The slug pattern and length limits are shared by the
 * schema and the service validation so they can never drift apart.
 */

export const PROGRAM_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ProgramStatus = (typeof PROGRAM_STATUSES)[number];

export const MAX_PROGRAM_TITLE_LENGTH = 150;
export const MAX_PROGRAM_SLUG_LENGTH = 200;
export const MAX_PROGRAM_SHORT_DESCRIPTION_LENGTH = 300;
export const MAX_PROGRAM_DESCRIPTION_LENGTH = 5_000;
export const MAX_PROGRAM_DISPLAY_ORDER = 10_000;

/**
 * URL-safe slug shape: lowercase letters/numbers separated by single hyphens,
 * no leading/trailing/double hyphens. "education-program", "food-support-2024".
 */
export const PROGRAM_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
