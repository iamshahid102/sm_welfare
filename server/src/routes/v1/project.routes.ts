import { Router } from 'express';
import * as projectController from '../../controllers/project.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const projectRouter = Router();

// Every route requires the single admin session (requireAuth). There is
// deliberately no DELETE route - projects are never physically deleted
// (ARCHIVED retains them).
projectRouter.get('/', requireAuth, projectController.listProjects);
projectRouter.get('/:id', requireAuth, projectController.getProject);
projectRouter.post('/', requireAuth, projectController.createProject);
projectRouter.patch('/:id', requireAuth, projectController.updateProject);
projectRouter.patch('/:id/status', requireAuth, projectController.updateProjectStatus);

export { projectRouter };
