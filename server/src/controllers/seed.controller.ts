import type { RequestHandler } from 'express';
import { seedCmsContent, type SeedOptions } from '../services/seed.service.js';
import { ApiError } from '../utils/ApiError.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Seed controller - a thin HTTP adapter.
 *
 * The route is guarded by requireAuth in the route definition; the controller
 * only reads the optional options and calls the seed service. Seeding is
 * idempotent (upserts keyed by slug + the settings singleton), so it is safe to
 * trigger repeatedly from the dashboard.
 *
 * Body (all optional):
 *   { "reset": true, "uploadMedia": true }
 * `reset` wipes existing CMS content (users are preserved); `uploadMedia`
 * uploads the curated local images to Cloudinary and attaches them.
 */

function readBoolean(value: unknown, label: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new ApiError(400, `${label} must be a boolean.`);
  }
  return value;
}

/** POST /api/v1/seed - load (or reset + re-sync) the site's real content. */
export const runSeed: RequestHandler = async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const options: SeedOptions = {};
  const reset = readBoolean(body.reset, 'reset');
  const uploadMedia = readBoolean(body.uploadMedia, 'uploadMedia');
  if (reset !== undefined) options.reset = reset;
  if (uploadMedia !== undefined) options.uploadMedia = uploadMedia;

  const result = await seedCmsContent(options);
  res.status(200).json({ success: true, data: result } satisfies ApiSuccessResponse<
    typeof result
  >);
};
