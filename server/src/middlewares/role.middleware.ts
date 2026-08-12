import type { RequestHandler } from 'express';
import type { UserRole } from '../constants/user.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * requireRole - role-based access control.
 *
 * Composes with requireAuth, which has already attached the authenticated
 * user context (id + role reloaded from MongoDB on every request). This
 * middleware never decodes tokens or queries the database itself - it only
 * answers "is the authenticated user's role allowed?".
 *
 * Usage:
 *   router.get('/admin-only', requireAuth, requireRole('SUPER_ADMIN'), handler)
 *   router.get('/staff', requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'), handler)
 *
 * There is no implicit hierarchy: requireRole('SUPER_ADMIN') allows exactly
 * SUPER_ADMIN; listing multiple roles means "any of these". Roles are
 * strongly typed from the single UserRole source of truth (constants/user.ts),
 * so arbitrary strings are rejected at compile time.
 *
 * HTTP behavior:
 *   401 - no authenticated context (route missing requireAuth, or middleware
 *         used out of order) - never a 500.
 *   403 - authenticated, but the role is not in the allowed list.
 */
export function requireRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    // Fail safely: if requireAuth did not run, there is no server-authenticated
    // user context to authorize.
    if (!req.authUser) {
      next(new ApiError(401, 'Authentication required.'));
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      // Generic message - do not reveal the required roles.
      next(new ApiError(403, 'Insufficient permissions.'));
      return;
    }

    next();
  };
}
