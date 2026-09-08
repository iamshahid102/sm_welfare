import { Router } from 'express';
import * as publicSiteSettingsController from '../../../controllers/public/publicSiteSettings.controller.js';

const publicSiteSettingsRouter = Router();

publicSiteSettingsRouter.get('/', publicSiteSettingsController.getPublicSiteSettingsHandler);

export { publicSiteSettingsRouter };
