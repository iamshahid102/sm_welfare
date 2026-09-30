import { Router } from 'express';
import * as publicPageController from '../../../controllers/public/publicPage.controller.js';

const publicPageRouter = Router();

// Unified resolver used by the dynamic public detail route. A slug resolves to
// either a program or a project (programs win when both exist).
publicPageRouter.get('/:slug', publicPageController.getPublicPageBySlugHandler);

export { publicPageRouter };
