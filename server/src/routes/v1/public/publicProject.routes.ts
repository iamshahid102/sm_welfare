import { Router } from 'express';
import * as publicProjectController from '../../../controllers/public/publicProject.controller.js';

const publicProjectRouter = Router();

publicProjectRouter.get('/', publicProjectController.listPublicProjectsHandler);

export { publicProjectRouter };
