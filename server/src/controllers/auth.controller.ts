import type { Request, RequestHandler, Response } from 'express';
import { AUTH_ACCESS_COOKIE, AUTH_REFRESH_COOKIE } from '../constants/auth.js';
import {
  login as authLogin,
  getCurrentUser,
  logout as authLogout,
  refresh as authRefresh,
} from '../services/auth.service.js';
import type { AuthenticatedRequest, AuthTokens, SafeUser } from '../types/auth.js';
import type { ApiSuccessResponse } from '../types/index.js';
import {
  accessCookieOptions,
  clearingCookieOptions,
  refreshCookieOptions,
} from '../utils/auth.js';

/** Sets both HttpOnly credentials on the response. */
function setAuthCookies(res: Response, tokens: AuthTokens): void {
  res.cookie(AUTH_ACCESS_COOKIE, tokens.accessToken, accessCookieOptions());
  res.cookie(AUTH_REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions());
}

/** Clears both credentials - the browser deletes them (Max-Age=0). */
function clearAuthCookies(res: Response): void {
  res.cookie(AUTH_ACCESS_COOKIE, '', clearingCookieOptions());
  res.cookie(AUTH_REFRESH_COOKIE, '', clearingCookieOptions());
}

function userResponse(res: Response, user: SafeUser): void {
  const payload: ApiSuccessResponse<{ user: SafeUser }> = { success: true, data: { user } };
  res.status(200).json(payload);
}

/** POST /api/v1/auth/login */
export const login: RequestHandler = async (req, res) => {
  const { user, tokens } = await authLogin(req.body?.email, req.body?.password);
  setAuthCookies(res, tokens);
  userResponse(res, user);
};

/** POST /api/v1/auth/refresh - rotates the refresh credential. */
export const refresh: RequestHandler = async (req, res) => {
  const { user, tokens } = await authRefresh(req.cookies?.[AUTH_REFRESH_COOKIE]);
  setAuthCookies(res, tokens);
  userResponse(res, user);
};

/** POST /api/v1/auth/logout - clears cookies and revokes the refresh session. */
export const logout: RequestHandler = async (req, res) => {
  await authLogout(req.cookies?.[AUTH_REFRESH_COOKIE]);
  clearAuthCookies(res);
  res.status(200).json({ success: true, data: null } satisfies ApiSuccessResponse<null>);
};

/** GET /api/v1/auth/me - protected by requireAuth. */
export const me: RequestHandler = async (req: Request, res) => {
  const authUser = (req as AuthenticatedRequest).authUser;
  const user = await getCurrentUser(authUser.id);
  userResponse(res, user);
};
