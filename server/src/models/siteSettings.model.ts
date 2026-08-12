import { Schema, model } from 'mongoose';
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

/**
 * Shape of the organization-wide website configuration document.
 *
 * This is a strict singleton: the `key` field carries the fixed
 * SITE_SETTINGS_KEY value and has a unique index, so the database itself
 * rejects a second document. `contact`, `socialLinks` and `footer` are plain
 * nested objects (not subdocuments) so they serialize as flat JSON.
 * The `twitter` field holds the X (formerly Twitter) profile URL.
 */
export interface SiteSettingsContact {
  email?: string;
  phone?: string;
  address?: string;
}

export interface SiteSettingsSocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
  website?: string;
}

export interface SiteSettingsFooter {
  shortDescription?: string;
  copyrightText?: string;
}

export interface SiteSettings {
  key: string;
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: SiteSettingsContact;
  socialLinks: SiteSettingsSocialLinks;
  footer: SiteSettingsFooter;
  createdAt?: Date;
  updatedAt?: Date;
}

const siteSettingsSchema = new Schema<SiteSettings>(
  {
    // Singleton enforcement: the fixed key + unique index reject a second
    // document at the database level, so concurrent initialization attempts
    // cannot create duplicates (one create wins, the other hits E11000).
    key: {
      type: String,
      required: true,
      unique: true,
      default: SITE_SETTINGS_KEY,
    },
    organizationName: {
      type: String,
      required: [true, 'organizationName is required'],
      trim: true,
      minlength: 1,
      maxlength: MAX_ORGANIZATION_NAME_LENGTH,
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: MAX_TAGLINE_LENGTH,
    },
    description: {
      type: String,
      trim: true,
      maxlength: MAX_DESCRIPTION_LENGTH,
    },
    contact: {
      type: {
        // Normalized like the User schema email (trim + lowercase).
        email: {
          type: String,
          trim: true,
          lowercase: true,
          match: [EMAIL_PATTERN, 'contact email must be a valid email address'],
          maxlength: MAX_CONTACT_EMAIL_LENGTH,
        },
        phone: {
          type: String,
          trim: true,
          maxlength: MAX_PHONE_LENGTH,
        },
        address: {
          type: String,
          trim: true,
          maxlength: MAX_ADDRESS_LENGTH,
        },
      },
      default: {},
      _id: false,
    },
    socialLinks: {
      type: {
        facebook: { type: String, trim: true, maxlength: MAX_SOCIAL_URL_LENGTH },
        instagram: { type: String, trim: true, maxlength: MAX_SOCIAL_URL_LENGTH },
        linkedin: { type: String, trim: true, maxlength: MAX_SOCIAL_URL_LENGTH },
        youtube: { type: String, trim: true, maxlength: MAX_SOCIAL_URL_LENGTH },
        twitter: { type: String, trim: true, maxlength: MAX_SOCIAL_URL_LENGTH },
        website: { type: String, trim: true, maxlength: MAX_SOCIAL_URL_LENGTH },
      },
      default: {},
      _id: false,
    },
    footer: {
      type: {
        shortDescription: {
          type: String,
          trim: true,
          maxlength: MAX_FOOTER_SHORT_DESCRIPTION_LENGTH,
        },
        copyrightText: {
          type: String,
          trim: true,
          maxlength: MAX_COPYRIGHT_TEXT_LENGTH,
        },
      },
      default: {},
      _id: false,
    },
  },
  {
    timestamps: true,
    collection: 'site_settings',
  },
);

export const SiteSettingsModel = model<SiteSettings>('SiteSettings', siteSettingsSchema);
