import { EMAIL_PATTERN } from '../constants/user.js';
import {
  MAX_ADDRESS_LENGTH,
  MAX_CONTACT_EMAIL_LENGTH,
  MAX_COPYRIGHT_TEXT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_FOOTER_SHORT_DESCRIPTION_LENGTH,
  MAX_ORGANIZATION_NAME_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_SOCIAL_URL_LENGTH,
  MAX_TAGLINE_LENGTH,
  SITE_SETTINGS_KEY,
} from '../constants/siteSettings.js';
import {
  SiteSettingsModel,
  type SiteSettings,
  type SiteSettingsContact,
  type SiteSettingsFooter,
  type SiteSettingsSocialLinks,
} from '../models/siteSettings.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Site settings service - organization-wide website configuration.
 *
 * Business rules enforced here (routes/controllers stay thin):
 *  - exactly ONE settings document can exist (fixed `key` + unique index;
 *    concurrent initialization is rejected via the E11000 race guard)
 *  - input is validated field-by-field - unknown fields are never persisted
 *  - only the intended settings fields are ever returned (no _id, no key,
 *    no internal metadata)
 */

export interface ContactInput {
  email?: string;
  phone?: string;
  address?: string;
}

export interface SocialLinksInput {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
}

export interface FooterInput {
  shortDescription?: string;
  copyrightText?: string;
}

export interface CreateSiteSettingsInput {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: ContactInput;
  socialLinks: SocialLinksInput;
  footer: FooterInput;
}

export interface UpdateSiteSettingsInput {
  organizationName?: string;
  tagline?: string;
  description?: string;
  contact?: ContactInput;
  socialLinks?: SocialLinksInput;
  footer?: FooterInput;
}

/** The only fields a client ever sees - no database internals, no `key`. */
export interface SiteSettingsResponse {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: SiteSettingsContact;
  socialLinks: SiteSettingsSocialLinks;
  footer: SiteSettingsFooter;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Identifies MongoDB duplicate-key (E11000) errors from the unique `key` index. */
function isDuplicateKeyError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  );
}

function assertBodyObject(body: unknown): asserts body is Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Request body must be an object.');
  }
}

function validateOrganizationName(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, 'Organization name is required.');
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_ORGANIZATION_NAME_LENGTH) {
    throw new ApiError(
      400,
      `Organization name must not exceed ${MAX_ORGANIZATION_NAME_LENGTH} characters.`,
    );
  }
  return trimmed;
}

/**
 * Validates an optional string field. `undefined` means "not provided";
 * anything else must be a non-empty string within the length limit.
 * Empty strings are rejected (not silently cleared).
 */
function validateOptionalString(value: unknown, label: string, maxLength: number): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} must be a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new ApiError(400, `${label} must not be empty.`);
  }
  if (trimmed.length > maxLength) {
    throw new ApiError(400, `${label} must not exceed ${maxLength} characters.`);
  }
  return trimmed;
}

function validateOptionalEmail(value: unknown, label: string): string | undefined {
  const trimmed = validateOptionalString(value, label, MAX_CONTACT_EMAIL_LENGTH);
  if (trimmed === undefined) {
    return undefined;
  }
  // Normalized like the schema (trim + lowercase) - symmetric with the User
  // email handling, so validated inputs already carry the canonical value.
  const normalized = trimmed.toLowerCase();
  if (!EMAIL_PATTERN.test(normalized)) {
    throw new ApiError(400, `${label} must be a valid email address.`);
  }
  return normalized;
}

/** Only http/https URLs with a host are accepted for social links. */
function validateOptionalUrl(value: unknown, label: string): string | undefined {
  const trimmed = validateOptionalString(value, label, MAX_SOCIAL_URL_LENGTH);
  if (trimmed === undefined) {
    return undefined;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }
    if (url.hostname.length === 0) {
      throw new Error('missing host');
    }
  } catch {
    throw new ApiError(400, `${label} must be a valid http(s) URL.`);
  }
  return trimmed;
}

/** Nested sections must be plain objects; arrays and null are rejected. */
function assertSectionObject(value: unknown, label: string): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError(400, `${label} must be an object.`);
  }
}

/**
 * Validates a contact section. Unknown keys inside the section are ignored -
 * only the known fields can ever reach the database.
 */
function validateContact(value: unknown): ContactInput {
  if (value === undefined) {
    return {};
  }
  assertSectionObject(value, 'contact');
  const source = value as Record<string, unknown>;
  return {
    ...(source.email !== undefined && { email: validateOptionalEmail(source.email, 'contact email') }),
    ...(source.phone !== undefined && { phone: validateOptionalString(source.phone, 'contact phone', MAX_PHONE_LENGTH) }),
    ...(source.address !== undefined && { address: validateOptionalString(source.address, 'contact address', MAX_ADDRESS_LENGTH) }),
  };
}

function validateSocialLinks(value: unknown): SocialLinksInput {
  if (value === undefined) {
    return {};
  }
  assertSectionObject(value, 'social links');
  const source = value as Record<string, unknown>;
  return {
    ...(source.facebook !== undefined && { facebook: validateOptionalUrl(source.facebook, 'facebook URL') }),
    ...(source.instagram !== undefined && { instagram: validateOptionalUrl(source.instagram, 'instagram URL') }),
    ...(source.linkedin !== undefined && { linkedin: validateOptionalUrl(source.linkedin, 'linkedin URL') }),
    ...(source.youtube !== undefined && { youtube: validateOptionalUrl(source.youtube, 'youtube URL') }),
    ...(source.twitter !== undefined && { twitter: validateOptionalUrl(source.twitter, 'twitter URL') }),
    ...(source.website !== undefined && { website: validateOptionalUrl(source.website, 'website URL') }),
  };
}

function validateFooter(value: unknown): FooterInput {
  if (value === undefined) {
    return {};
  }
  assertSectionObject(value, 'footer');
  const source = value as Record<string, unknown>;
  return {
    ...(source.shortDescription !== undefined && {
      shortDescription: validateOptionalString(
        source.shortDescription,
        'footer short description',
        MAX_FOOTER_SHORT_DESCRIPTION_LENGTH,
      ),
    }),
    ...(source.copyrightText !== undefined && {
      copyrightText: validateOptionalString(
        source.copyrightText,
        'footer copyright text',
        MAX_COPYRIGHT_TEXT_LENGTH,
      ),
    }),
  };
}

/**
 * Validates a full create payload. `organizationName` is required; every
 * other field is optional but strictly validated when present. Unknown
 * top-level fields are ignored.
 */
export function validateCreateSiteSettingsInput(body: unknown): CreateSiteSettingsInput {
  assertBodyObject(body);
  return {
    organizationName: validateOrganizationName(body.organizationName),
    ...(body.tagline !== undefined && {
      tagline: validateOptionalString(body.tagline, 'tagline', MAX_TAGLINE_LENGTH),
    }),
    ...(body.description !== undefined && {
      description: validateOptionalString(body.description, 'description', MAX_DESCRIPTION_LENGTH),
    }),
    contact: validateContact(body.contact),
    socialLinks: validateSocialLinks(body.socialLinks),
    footer: validateFooter(body.footer),
  };
}

/**
 * Validates a partial update payload. Only provided fields are included;
 * empty sections (e.g. `contact: {}`) are treated as no-ops so an empty
 * section can never wipe existing data.
 */
export function validateUpdateSiteSettingsInput(body: unknown): UpdateSiteSettingsInput {
  assertBodyObject(body);
  const input: UpdateSiteSettingsInput = {};

  if (body.organizationName !== undefined) {
    input.organizationName = validateOrganizationName(body.organizationName);
  }
  if (body.tagline !== undefined) {
    input.tagline = validateOptionalString(body.tagline, 'tagline', MAX_TAGLINE_LENGTH);
  }
  if (body.description !== undefined) {
    input.description = validateOptionalString(body.description, 'description', MAX_DESCRIPTION_LENGTH);
  }

  const contact = validateContact(body.contact);
  if (Object.keys(contact).length > 0) {
    input.contact = contact;
  }
  const socialLinks = validateSocialLinks(body.socialLinks);
  if (Object.keys(socialLinks).length > 0) {
    input.socialLinks = socialLinks;
  }
  const footer = validateFooter(body.footer);
  if (Object.keys(footer).length > 0) {
    input.footer = footer;
  }

  if (Object.keys(input).length === 0) {
    throw new ApiError(400, 'Provide at least one field to update.');
  }
  return input;
}

/**
 * Converts a validated partial update into MongoDB dot-path $set entries so
 * partial nested updates (e.g. only `contact.email`) preserve the siblings.
 */
function buildSet(input: UpdateSiteSettingsInput): Record<string, string> {
  const set: Record<string, string> = {};
  if (input.organizationName !== undefined) {
    set.organizationName = input.organizationName;
  }
  if (input.tagline !== undefined) {
    set.tagline = input.tagline;
  }
  if (input.description !== undefined) {
    set.description = input.description;
  }
  if (input.contact !== undefined) {
    for (const [field, value] of Object.entries(input.contact)) {
      if (value !== undefined) {
        set[`contact.${field}`] = value;
      }
    }
  }
  if (input.socialLinks !== undefined) {
    for (const [field, value] of Object.entries(input.socialLinks)) {
      if (value !== undefined) {
        set[`socialLinks.${field}`] = value;
      }
    }
  }
  if (input.footer !== undefined) {
    for (const [field, value] of Object.entries(input.footer)) {
      if (value !== undefined) {
        set[`footer.${field}`] = value;
      }
    }
  }
  return set;
}

/**
 * Returns the current settings. The singleton key is fixed, so this can
 * return at most one document; a 404 signals "not initialized yet".
 */
export async function getSiteSettings(): Promise<SiteSettingsResponse> {
  const settings = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY });
  if (!settings) {
    throw ApiError.notFound('Site settings not found.');
  }
  return serializeSiteSettings(settings);
}

/**
 * Initializes the singleton. The unique index on `key` is the authoritative
 * guard against concurrent initialization: the friendly pre-check is only a
 * fast path - if two requests race, exactly one create wins and the other is
 * rejected with a duplicate-key 409.
 */
export async function initializeSiteSettings(body: unknown): Promise<SiteSettingsResponse> {
  const input = validateCreateSiteSettingsInput(body);

  const existing = await SiteSettingsModel.exists({ key: SITE_SETTINGS_KEY });
  if (existing) {
    throw new ApiError(409, 'Site settings already exist.');
  }

  try {
    const settings = await SiteSettingsModel.create({
      key: SITE_SETTINGS_KEY,
      organizationName: input.organizationName,
      tagline: input.tagline,
      description: input.description,
      contact: input.contact,
      socialLinks: input.socialLinks,
      footer: input.footer,
    });
    return serializeSiteSettings(settings);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ApiError(409, 'Site settings already exist.');
    }
    throw error;
  }
}

/**
 * Updates settings. Unknown fields never reach the database (the update is
 * built only from validated input), and unmentioned fields are preserved.
 */
export async function updateSiteSettings(body: unknown): Promise<SiteSettingsResponse> {
  const input = validateUpdateSiteSettingsInput(body);

  const settings = await SiteSettingsModel.findOneAndUpdate(
    { key: SITE_SETTINGS_KEY },
    { $set: buildSet(input) },
    { new: true },
  );
  if (!settings) {
    throw ApiError.notFound('Site settings not found.');
  }
  return serializeSiteSettings(settings);
}

/**
 * The single place that shapes a settings document for API responses -
 * only the intended fields, never `_id`, `key`, `__v` or any other metadata.
 */
export function serializeSiteSettings(settings: SiteSettings): SiteSettingsResponse {
  return {
    organizationName: settings.organizationName,
    ...(settings.tagline !== undefined && { tagline: settings.tagline }),
    ...(settings.description !== undefined && { description: settings.description }),
    contact: settings.contact,
    socialLinks: settings.socialLinks,
    footer: settings.footer,
    ...(settings.createdAt !== undefined && { createdAt: settings.createdAt }),
    ...(settings.updatedAt !== undefined && { updatedAt: settings.updatedAt }),
  };
}
