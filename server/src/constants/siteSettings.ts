/**
 * Site settings domain constants.
 *
 * The singleton key is a fixed value: exactly one SiteSettings document can
 * ever exist in the database (enforced by a unique index on `key`). The model
 * schema and the service validation share these limits so they can never
 * drift apart.
 */

/** Fixed key of the single SiteSettings document. */
export const SITE_SETTINGS_KEY = 'site_settings' as const;

export const MAX_ORGANIZATION_NAME_LENGTH = 120;
export const MAX_TAGLINE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2_000;

export const MAX_CONTACT_EMAIL_LENGTH = 254;
export const MAX_PHONE_LENGTH = 30;
export const MAX_ADDRESS_LENGTH = 500;

export const MAX_SOCIAL_URL_LENGTH = 500;

export const MAX_FOOTER_SHORT_DESCRIPTION_LENGTH = 500;
export const MAX_COPYRIGHT_TEXT_LENGTH = 200;
