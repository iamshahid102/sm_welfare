/**
 * Public API types — mirrors the Phase 20 backend DTOs exactly.
 *
 * These types represent the whitelist contracts returned by:
 *   GET /api/v1/public/programs
 *   GET /api/v1/public/projects
 *   GET /api/v1/public/site-settings
 *   GET /api/v1/public/media
 *
 * The backend is the source of truth. Do not invent fields.
 */

// ─── Shared pagination envelope ────────────────────────────────────────

export interface PublicListResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Public Program ────────────────────────────────────────────────────

export interface PublicProgram {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Public Project ────────────────────────────────────────────────────

export interface PublicProgramSummary {
  id: string;
  title: string;
  slug: string;
}

export interface PublicProject {
  id: string;
  programId: string;
  program: PublicProgramSummary;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Public Site Settings ──────────────────────────────────────────────

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

export interface PublicSiteSettings {
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: PublicSiteSettingsContact;
  socialLinks: PublicSiteSettingsSocialLinks;
  footer: PublicSiteSettingsFooter;
  createdAt: string;
  updatedAt: string;
}

// ─── Public Media ──────────────────────────────────────────────────────

export interface PublicMedia {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: "image";
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  originalFilename: string | null;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
