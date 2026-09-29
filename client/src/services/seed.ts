import { api } from "@/lib/api/client";

/**
 * CMS seed service — consumes POST /api/v1/seed.
 *
 * Loads the site's real content (13 programmes, 17 projects and the
 * site-settings singleton) into MongoDB so the public site is served from the
 * database and every piece becomes editable in the admin panel.
 *
 * The endpoint is idempotent: it upserts by slug (and the settings singleton),
 * so running it repeatedly re-syncs the seeded content instead of duplicating
 * it, and never touches content you created yourself.
 */

export interface SeedCounts {
  created: number;
  reSynced: number;
}

export interface SeedResult {
  programs: SeedCounts & { total: number };
  projects: SeedCounts & { published: number };
  siteSettings: { created: boolean };
  /** Media is never seeded — upload images through the media library. */
  mediaSeeded: false;
}

export async function runCmsSeed(): Promise<SeedResult> {
  return api.post<SeedResult>("/seed");
}
