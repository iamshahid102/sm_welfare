import { Router } from 'express';
import * as projectController from '../../controllers/project.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const projectRouter = Router();

// Reads require authentication only (ADMIN may view projects); mutations are
// SUPER_ADMIN-only. There is deliberately no DELETE route - projects are never
// physically deleted (ARCHIVED retains them).
projectRouter.get('/', requireAuth, projectController.listProjects);
projectRouter.get('/:id', requireAuth, projectController.getProject);
projectRouter.post('/', requireAuth, requireRole('SUPER_ADMIN'), projectController.createProject);
projectRouter.patch('/:id', requireAuth, requireRole('SUPER_ADMIN'), projectController.updateProject);
projectRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  projectController.updateProjectStatus,
);

export { projectRouter };
