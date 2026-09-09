import { API_BASE_URL } from "@/lib/api/config";
import type { PublicSiteSettings } from "@/types/public-api";

/**
 * Public site settings service — consumes GET /api/v1/public/site-settings.
 *
 * Returns null when the singleton has not been initialized (404),
 * which is a normal pre-production state.
 */

export async function getPublicSiteSettings(): Promise<PublicSiteSettings | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/site-settings`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      success: boolean;
      data: { settings: PublicSiteSettings };
    };
    return payload.data.settings;
  } catch {
    // Network failure — return null gracefully
    return null;
  }
}
