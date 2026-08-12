import type { RequestHandler } from 'express';
import {
  createAdmin as adminCreate,
  getAdminById,
  listAdmins as adminList,
  setAdminStatus,
  updateAdmin as adminUpdate,
  validateListAdminsQuery,
} from '../services/admin.service.js';
import type { SafeUser } from '../types/auth.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Admin management controllers - thin HTTP adapters.
 * All routes are guarded by requireAuth + requireRole('SUPER_ADMIN') in the
 * route definitions; controllers only translate request data into service
 * calls and service results into responses.
 */

function adminPayload(user: SafeUser): ApiSuccessResponse<{ user: SafeUser }> {
  return { success: true, data: { user } };
}

/** POST /api/v1/admins - create an ADMIN (role is always forced to ADMIN). */
export const createAdmin: RequestHandler = async (req, res) => {
  const user = await adminCreate(req.body?.name, req.body?.email, req.body?.password);
  res.status(201).json(adminPayload(user));
};

/** GET /api/v1/admins - list ADMIN users with pagination/search/status. */
export const listAdmins: RequestHandler = async (req, res) => {
  const query = validateListAdminsQuery({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
  });
  const result = await adminList(query);
  res.status(200).json({ success: true, data: result });
};

/** GET /api/v1/admins/:id - get a single ADMIN. */
export const getAdmin: RequestHandler = async (req, res) => {
  const user = await getAdminById(req.params.id);
  res.status(200).json(adminPayload(user));
};

/** PATCH /api/v1/admins/:id - update name/email (no role/status/password). */
export const updateAdmin: RequestHandler = async (req, res) => {
  const user = await adminUpdate(req.params.id, req.body?.name, req.body?.email);
  res.status(200).json(adminPayload(user));
};

/** PATCH /api/v1/admins/:id/status - activate/deactivate an ADMIN. */
export const updateAdminStatus: RequestHandler = async (req, res) => {
  const user = await setAdminStatus(req.params.id, req.body?.status);
  res.status(200).json(adminPayload(user));
};
