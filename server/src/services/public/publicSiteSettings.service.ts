import { SiteSettingsModel } from '../../models/siteSettings.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { SITE_SETTINGS_KEY } from '../../constants/siteSettings.js';

/**
 * Public site settings service.
 *
 * Exposes a public-safe subset of the singleton settings document. The public
 * response is an explicit whitelist, not a raw MongoDB document.
 */

export interface PublicSiteSettingsContact {
  email?: string;
  phone?: string;
  address?: string;
}

export interface PublicSiteSettingsSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
}

export interface PublicSiteSettingsFooter {
  shortDescription?: string;
  copyrightText?: string;
}

export interface PublicSiteSettingsResponse {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: PublicSiteSettingsContact;
  socialLinks: PublicSiteSettingsSocialLinks;
  footer: PublicSiteSettingsFooter;
  createdAt: string;
  updatedAt: string;
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettingsResponse> {
  const settings = await SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY });
  if (!settings) {
    throw ApiError.notFound('Site settings not found.');
  }
  return serializePublicSiteSettings(settings.toObject());
}

export function serializePublicSiteSettings(
  settings: {
    organizationName: string;
    tagline?: string;
    description?: string;
    contact: unknown;
    socialLinks: unknown;
    footer: unknown;
    createdAt?: Date;
    updatedAt?: Date;
  },
): PublicSiteSettingsResponse {
  return {
    organizationName: settings.organizationName,
    ...(settings.tagline !== undefined && { tagline: settings.tagline }),
    ...(settings.description !== undefined && { description: settings.description }),
    contact: settings.contact as PublicSiteSettingsContact,
    socialLinks: settings.socialLinks as PublicSiteSettingsSocialLinks,
    footer: settings.footer as PublicSiteSettingsFooter,
    createdAt: settings.createdAt?.toISOString() ?? '',
    updatedAt: settings.updatedAt?.toISOString() ?? '',
  };
}


