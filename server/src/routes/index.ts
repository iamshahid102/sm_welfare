import { Router } from 'express';
import { API_PREFIX } from '../constants/index.js';
import { v1Router } from './v1/index.js';

const apiRouter = Router();

// Every API route lives under the versioned prefix (/api/v1).
apiRouter.use(API_PREFIX, v1Router);

export { apiRouter };
