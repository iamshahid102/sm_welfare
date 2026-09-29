import type { RequestHandler } from 'express';
import { seedCmsContent } from '../services/seed.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Seed controller - a thin HTTP adapter.
 *
 * The route is guarded by requireAuth in the route definition; the controller
 * only calls the seed service and shapes the response. Seeding is idempotent
 * (upserts keyed by slug + the settings singleton), so it is safe to trigger
 * repeatedly from the dashboard.
 */

/** POST /api/v1/seed - load (or re-sync) the site's real content into MongoDB. */
export const runSeed: RequestHandler = async (_req, res) => {
  const result = await seedCmsContent();
  res.status(200).json({ success: true, data: result } satisfies ApiSuccessResponse<
    typeof result
  >);
};
