import { Router } from 'express';
import * as publicMediaController from '../../../controllers/public/publicMedia.controller.js';

const publicMediaRouter = Router();

publicMediaRouter.get('/', publicMediaController.listPublicMediaHandler);

export { publicMediaRouter };
