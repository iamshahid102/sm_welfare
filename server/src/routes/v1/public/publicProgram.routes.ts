import { Router } from 'express';
import * as publicProgramController from '../../../controllers/public/publicProgram.controller.js';

const publicProgramRouter = Router();

publicProgramRouter.get('/', publicProgramController.listPublicProgramsHandler);

export { publicProgramRouter };
