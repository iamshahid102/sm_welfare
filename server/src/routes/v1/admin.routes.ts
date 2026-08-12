import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';

const adminRouter = Router();

// Every admin-management endpoint requires authentication AND the SUPER_ADMIN
// role. ADMIN users cannot manage other admins. There is no public registration.
adminRouter.post('/', requireAuth, requireRole('SUPER_ADMIN'), adminController.createAdmin);
adminRouter.get('/', requireAuth, requireRole('SUPER_ADMIN'), adminController.listAdmins);
adminRouter.get('/:id', requireAuth, requireRole('SUPER_ADMIN'), adminController.getAdmin);
adminRouter.patch('/:id', requireAuth, requireRole('SUPER_ADMIN'), adminController.updateAdmin);
adminRouter.patch(
  '/:id/status',
  requireAuth,
  requireRole('SUPER_ADMIN'),
  adminController.updateAdminStatus,
);

export { adminRouter };
