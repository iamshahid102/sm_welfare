import { api } from "@/lib/api/client";
import type {
  FormSubmissionListResponse,
  ContactMessageListResponse,
} from "@/types/api";
import type { PublicFormType } from "@/types/forms";

export type {
  FormSubmission,
  FormSubmissionListResponse,
  ContactMessage,
  ContactMessageListResponse,
} from "@/types/api";

/**
 * Admin inbox service — consumes the administrator-only list endpoints:
 *   GET /api/v1/forms/submissions  (filterable by formType)
 *   GET /api/v1/contact
 *
 * Both require an authenticated ADMIN / SUPER_ADMIN session (HttpOnly
 * cookies, handled by the shared API client). The payloads contain personal
 * data, which is why only these authenticated reads exist — the public site
 * can write submissions but never read them back.
 */

export interface ListFormSubmissionsQuery {
  page?: number;
  limit?: number;
  formType?: PublicFormType;
}

export interface ListContactMessagesQuery {
  page?: number;
  limit?: number;
}

// ─── Form submissions inbox ──────────────────────────────────────────────

export async function listFormSubmissions(
  query: ListFormSubmissionsQuery = {},
): Promise<FormSubmissionListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.formType !== undefined) params.set("formType", query.formType);
  const qs = params.toString();
  return api.get<FormSubmissionListResponse>(
    `/forms/submissions${qs ? `?${qs}` : ""}`,
  );
}

// ─── Contact messages inbox ──────────────────────────────────────────────

export async function listContactMessages(
  query: ListContactMessagesQuery = {},
): Promise<ContactMessageListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  const qs = params.toString();
  return api.get<ContactMessageListResponse>(
    `/contact${qs ? `?${qs}` : ""}`,
  );
}
