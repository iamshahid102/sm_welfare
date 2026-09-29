import { Router } from 'express';
import * as seedController from '../../controllers/seed.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const seedRouter = Router();

// One endpoint, authenticated only: there is exactly one admin, and seeding is
// idempotent, so no further authorization layer exists.
seedRouter.post('/', requireAuth, seedController.runSeed);

export { seedRouter };
