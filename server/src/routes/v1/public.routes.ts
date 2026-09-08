import { Router } from 'express';
import { publicProgramRouter } from './public/publicProgram.routes.js';
import { publicProjectRouter } from './public/publicProject.routes.js';
import { publicSiteSettingsRouter } from './public/publicSiteSettings.routes.js';
import { publicMediaRouter } from './public/publicMedia.routes.js';

const publicRouter = Router();

publicRouter.use('/programs', publicProgramRouter);
publicRouter.use('/projects', publicProjectRouter);
publicRouter.use('/site-settings', publicSiteSettingsRouter);
publicRouter.use('/media', publicMediaRouter);

export { publicRouter };
