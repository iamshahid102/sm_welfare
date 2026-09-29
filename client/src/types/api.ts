/**
 * Types mirroring the Express API response contract:
 *   success → { success: true, data: T }
 *   failure → { success: false, error: { statusCode, message } }
 */

import type { PublicFormType } from "@/types/forms";

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
 *
 * There is exactly ONE administrator account in this CMS, so `role` always
 * holds the single ADMIN value.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  title: string | null;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse {
  media: Media;
}

export interface MediaListResponse {
  items: Media[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MediaDeleteResponse {
  id: string;
}

// ─── Admin inbox types (list endpoints) ─────────────────────────────────

/** One stored submission from the five public forms (admin inbox). */
export interface FormSubmission {
  id: string;
  formType: PublicFormType;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export interface FormSubmissionListResponse {
  items: FormSubmission[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** One stored message from the public contact form (admin inbox). */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: string;
}

export interface ContactMessageListResponse {
  items: ContactMessage[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
