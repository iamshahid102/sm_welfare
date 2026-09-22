/**
 * Public forms API types.
 *
 * These mirror the request/response contracts of the Express endpoints:
 *   POST /api/v1/forms/submit  -> { success, message, data }
 *   POST /api/v1/contact       -> { success, message, data }
 *
 * The backend is the source of truth. Do not invent fields.
 */

/** The five documented public form types (server enum in constants/form.ts). */
export type PublicFormType =
  | "hunarmand-beti-vocational"
  | "it-courses-vocational"
  | "employee"
  | "free-education"
  | "quran-academy";

export interface PublicFormSubmissionInput {
  formType: PublicFormType;
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface PublicFormSubmissionResult {
  id: string;
  formType: PublicFormType;
  name: string;
  submittedAt: string;
}

export interface PublicContactMessageInput {
  name: string;
  email: string;
  /** Optional subject line. */
  topic?: string;
  message: string;
}

export interface PublicContactMessageResult {
  id: string;
  name: string;
  subject: string;
  submittedAt: string;
}
