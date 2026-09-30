import { Router } from 'express';
import { publicProgramRouter } from './public/publicProgram.routes.js';
import { publicProjectRouter } from './public/publicProject.routes.js';
import { publicSiteSettingsRouter } from './public/publicSiteSettings.routes.js';
import { publicMediaRouter } from './public/publicMedia.routes.js';
import { publicPageRouter } from './public/publicPage.routes.js';

const publicRouter = Router();

publicRouter.use('/programs', publicProgramRouter);
publicRouter.use('/projects', publicProjectRouter);
publicRouter.use('/site-settings', publicSiteSettingsRouter);
publicRouter.use('/media', publicMediaRouter);
// Unified slug resolver for the dynamic program/project detail route. Mounted
// last so it can never shadow the explicit resource paths above.
publicRouter.use('/pages', publicPageRouter);

export { publicRouter };
