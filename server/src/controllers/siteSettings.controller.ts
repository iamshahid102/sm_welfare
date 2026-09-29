import type { RequestHandler } from 'express';
import {
  getSiteSettings as getSettings,
  initializeSiteSettings as initSettings,
  updateSiteSettings as patchSettings,
} from '../services/siteSettings.service.js';
import type { SiteSettingsResponse } from '../services/siteSettings.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Site settings controllers - thin HTTP adapters.
 * Every route requires the single admin session (requireAuth) in the route
 * definitions. Controllers only translate request data into service calls and
 * results into responses.
 */

function settingsPayload(
  settings: SiteSettingsResponse,
): ApiSuccessResponse<{ settings: SiteSettingsResponse }> {
  return { success: true, data: { settings } };
}

/** GET /api/v1/site-settings - current settings (admin session). */
export const getSiteSettings: RequestHandler = async (_req, res) => {
  const settings = await getSettings();
  res.status(200).json(settingsPayload(settings));
};

/** POST /api/v1/site-settings - initialize the settings singleton. */
export const initializeSiteSettings: RequestHandler = async (req, res) => {
  const settings = await initSettings(req.body);
  res.status(201).json(settingsPayload(settings));
};

/** PATCH /api/v1/site-settings - partial update. */
export const updateSiteSettings: RequestHandler = async (req, res) => {
  const settings = await patchSettings(req.body);
  res.status(200).json(settingsPayload(settings));
};
