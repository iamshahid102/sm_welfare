import { Router } from 'express';
import * as programController from '../../controllers/program.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const programRouter = Router();

// Every route requires the single admin session (requireAuth). There is
// deliberately no DELETE route - programs are never physically deleted
// (ARCHIVED retains them).
programRouter.get('/', requireAuth, programController.listPrograms);
programRouter.get('/:id', requireAuth, programController.getProgram);
programRouter.post('/', requireAuth, programController.createProgram);
programRouter.patch('/:id', requireAuth, programController.updateProgram);
programRouter.patch('/:id/status', requireAuth, programController.updateProgramStatus);

export { programRouter };
