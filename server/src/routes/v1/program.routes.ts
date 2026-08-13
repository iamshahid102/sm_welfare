import { Router } from 'express';
import * as programController from '../../controllers/program.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const programRouter = Router();

// Reads require authentication only (ADMIN may view programs); mutations are
// SUPER_ADMIN-only. There is deliberately no DELETE route - programs are never
// physically deleted (ARCHIVED retains them).
programRouter.get('/', requireAuth, programController.listPrograms);
programRouter.get('/:id', requireAuth, programController.getProgram);
programRouter.post('/', requireAuth, requireRole('SUPER_ADMIN'), programController.createProgram);
programRouter.patch('/:id', requireAuth, requireRole('SUPER_ADMIN'), programController.updateProgram);
programRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  programController.updateProgramStatus,
);

export { programRouter };
