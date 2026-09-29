import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { healthRouter } from './health.routes.js';
import { mediaRouter } from './media.routes.js';
import { programRouter } from './program.routes.js';
import { projectRouter } from './project.routes.js';
import { publicRouter } from './public.routes.js';
import { seedRouter } from './seed.routes.js';
import { siteSettingsRouter } from './siteSettings.routes.js';

const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/seed', seedRouter);
v1Router.use('/site-settings', siteSettingsRouter);
v1Router.use('/programs', programRouter);
v1Router.use('/projects', projectRouter);
v1Router.use('/media', mediaRouter);
v1Router.use('/public', publicRouter);

export { v1Router };
