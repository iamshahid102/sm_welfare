import { API_BASE_URL } from "@/lib/api/config";
import type {
  PublicMedia,
  PublicListResult,
} from "@/types/public-api";

/**
 * Public media service — consumes GET /api/v1/public/media.
 *
 * Unauthenticated access. Returns public-safe metadata only.
 */

export interface PublicMediaQuery {
  page?: number;
  limit?: number;
  /** Exact Cloudinary folder to scope the list to (e.g. the certificates folder). */
  folder?: string;
}

export async function listPublicMedia(
  query: PublicMediaQuery = {},
): Promise<PublicListResult<PublicMedia>> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.folder !== undefined) params.set("folder", query.folder);

  const qs = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/public/media${qs ? `?${qs}` : ""}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load media (${response.status})`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: PublicListResult<PublicMedia>;
  };
  return payload.data;
}
