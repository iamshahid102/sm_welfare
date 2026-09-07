/**
 * Types mirroring the Express API response contract:
 *   success → { success: true, data: T }
 *   failure → { success: false, error: { statusCode, message } }
 */

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Client-side view of a serialized user (SafeUser from the backend).
 * Kept in sync with server/src/types/auth.ts SafeUser.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Admin management types ────────────────────────────────────────────

export interface AdminListResponse {
  admins: SafeUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Site settings types ───────────────────────────────────────────────

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
  organizationName: string;
  tagline?: string;
  description?: string;
  contact: SiteSettingsContact;
  socialLinks: SiteSettingsSocialLinks;
  footer: SiteSettingsFooter;
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteSettingsResponse {
  settings: SiteSettings;
}

// ─── Program types ─────────────────────────────────────────────────────

export type ProgramStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Program {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProgramStatus;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramListResponse {
  items: Program[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProgramResponse {
  program: Program;
}

// ─── Project types ─────────────────────────────────────────────────────

export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface ProjectProgramSummary {
  id: string;
  title: string;
  slug: string;
  status: ProgramStatus;
}

export interface Project {
  id: string;
  programId: string;
  program: ProjectProgramSummary | null;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProjectStatus;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectListResponse {
  items: Project[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectResponse {
  project: Project;
}

// ─── Media types ───────────────────────────────────────────────────────

export type MediaResourceType = "image";

export interface Media {
  id: string;
  publicId: string;
  secureUrl: string;
  resourceType: MediaResourceType;
  format: string;
  width: number;
  height: number;
  bytes: number;
  folder: string;
  originalFilename: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse {
  media: Media;
}

export interface MediaDeleteResponse {
  id: string;
}
