import { API_BASE_URL } from "@/lib/api/config";
import type { PublicPageResult } from "@/types/public-api";

/**
 * Public pages service — consumes GET /api/v1/public/pages/:slug.
 *
 * Unauthenticated. Resolves a slug to either a published program or a published
 * project (programs win when both exist), so one dynamic route can render both.
 * Returns null for an unknown or unpublished slug (404) so the caller can show
 * a not-found page.
 */
export async function getPublicPage(
  slug: string,
): Promise<PublicPageResult | null> {
  const response = await fetch(
    `${API_BASE_URL}/public/pages/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to load page (${response.status})`);
  }

  const payload = (await response.json()) as {
    success: boolean;
    data: PublicPageResult;
  };
  return payload.data;
}
