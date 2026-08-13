/**
 * Project domain constants.
 *
 * Same convention as constants/program.ts: statuses are an `as const` array
 * so the Mongoose schema enum and the derived union type stay in sync, and
 * the slug pattern / length limits are shared by the schema and the service
 * validation so they can never drift apart.
 */

export const PROJECT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const MAX_PROJECT_TITLE_LENGTH = 150;
export const MAX_PROJECT_SLUG_LENGTH = 200;
export const MAX_PROJECT_SHORT_DESCRIPTION_LENGTH = 300;
export const MAX_PROJECT_DESCRIPTION_LENGTH = 5_000;
export const MAX_PROJECT_DISPLAY_ORDER = 10_000;

/**
 * URL-safe slug shape: lowercase letters/numbers separated by single hyphens,
 * no leading/trailing/double hyphens. "school-support", "ramadan-ration-2024".
 */
export const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
