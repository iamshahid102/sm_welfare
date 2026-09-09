import { API_BASE_URL } from "@/lib/api/config";
import type {
  PublicProject,
  PublicListResult,
} from "@/types/public-api";

/**
 * Public projects service — consumes GET /api/v1/public/projects.
 *
 * Unauthenticated access. Returns only PUBLISHED projects under PUBLISHED programs.
 */

export interface PublicProjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  program?: string;
}

export async function listPublicProjects(
  query: PublicProjectsQuery = {},
): Promise<PublicListResult<PublicProject>> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.search !== undefined) params.set("search", query.search);
  if (query.program !== undefined) params.set("program", query.program);

  const qs = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/public/projects${qs ? `?${qs}` : ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load projects (${response.status})`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: PublicListResult<PublicProject>;
  };
  return payload.data;
}
