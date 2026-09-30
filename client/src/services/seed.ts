import { api } from "@/lib/api/client";

/**
 * CMS seed service — consumes POST /api/v1/seed.
 *
 * Loads the site's real content (13 programs, 17 projects, the site-settings
 * singleton and the curated images) into MongoDB so the public site is served
 * from the database and every piece becomes editable in the admin panel.
 *
 * Options:
 *  - `reset`       wipe existing programs/projects/media/settings first
 *                  (user accounts are always preserved)
 *  - `uploadMedia` upload the curated local images to Cloudinary and attach
 *                  them to the matching documents
 */

export interface SeedCounts {
  created: number;
  reSynced: number;
}

export interface SeedMediaResult {
  /** False when Cloudinary is not configured (local /images fallback is used). */
  cloudinary: boolean;
  /** Cloudinary assets destroyed during a reset. */
  destroyed: number;
  /** Images uploaded/linked in this run. */
  attached: number;
  /** Images available in the curated folder. */
  available: number;
}

export interface SeedResult {
  reset: boolean;
  programs: SeedCounts & { total: number };
  projects: SeedCounts & { published: number };
  siteSettings: { created: boolean };
  media: SeedMediaResult;
}

export interface SeedOptions {
  reset?: boolean;
  uploadMedia?: boolean;
}

export async function runCmsSeed(options: SeedOptions = {}): Promise<SeedResult> {
  return api.post<SeedResult>("/seed", options);
}
