import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { loginRateLimiter, refreshRateLimiter } from '../../middlewares/rateLimit.middleware.js';

const authRouter = Router();

authRouter.post('/login', loginRateLimiter, authController.login);
authRouter.post('/refresh', refreshRateLimiter, authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);

export { authRouter };
