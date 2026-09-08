import type { RequestHandler } from 'express';
import { getPublicSiteSettings } from '../../services/public/publicSiteSettings.service.js';
import type { PublicSiteSettingsResponse } from '../../services/public/publicSiteSettings.service.js';

/** GET /api/v1/public/site-settings - unauthenticated site settings (if initialized). */
export const getPublicSiteSettingsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const settings = await getPublicSiteSettings();
    res.status(200).json({ success: true, data: { settings } } as { success: true; data: { settings: PublicSiteSettingsResponse } });
  } catch (error) {
    next(error);
  }
};
