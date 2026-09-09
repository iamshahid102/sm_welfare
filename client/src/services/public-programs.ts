import { API_BASE_URL } from "@/lib/api/config";
import type {
  PublicProgram,
  PublicListResult,
} from "@/types/public-api";

/**
 * Public programs service — consumes GET /api/v1/public/programs.
 *
 * Unauthenticated access. Returns only PUBLISHED programs.
 */

export interface PublicProgramsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listPublicPrograms(
  query: PublicProgramsQuery = {},
): Promise<PublicListResult<PublicProgram>> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.search !== undefined) params.set("search", query.search);

  const qs = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/public/programs${qs ? `?${qs}` : ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load programs (${response.status})`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: PublicListResult<PublicProgram>;
  };
  return payload.data;
}
