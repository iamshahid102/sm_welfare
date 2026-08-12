import { Router } from 'express';
import * as siteSettingsController from '../../controllers/siteSettings.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const siteSettingsRouter = Router();

// This is intentionally a singleton resource: no /:id routes, no delete.
// Reads require authentication only (ADMIN may view settings); mutations are
// SUPER_ADMIN-only.
siteSettingsRouter.get('/', requireAuth, siteSettingsController.getSiteSettings);
siteSettingsRouter.post(
  '/',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  siteSettingsController.initializeSiteSettings,
);
siteSettingsRouter.patch(
  '/',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  siteSettingsController.updateSiteSettings,
);

export { siteSettingsRouter };
