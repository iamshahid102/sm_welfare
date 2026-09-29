import { Router } from 'express';
import * as siteSettingsController from '../../controllers/siteSettings.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const siteSettingsRouter = Router();

// This is intentionally a singleton resource: no /:id routes, no delete.
// Every route requires the single admin session (requireAuth).
siteSettingsRouter.get('/', requireAuth, siteSettingsController.getSiteSettings);
siteSettingsRouter.post('/', requireAuth, siteSettingsController.initializeSiteSettings);
siteSettingsRouter.patch('/', requireAuth, siteSettingsController.updateSiteSettings);

export { siteSettingsRouter };
