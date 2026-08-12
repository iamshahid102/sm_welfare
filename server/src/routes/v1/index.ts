import { Router } from 'express';
import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { healthRouter } from './health.routes.js';
import { siteSettingsRouter } from './siteSettings.routes.js';

const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/admins', adminRouter);
v1Router.use('/site-settings', siteSettingsRouter);

export { v1Router };
