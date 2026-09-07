import { api } from "@/lib/api/client";
import type { SafeUser } from "@/types/api";

/**
 * Authentication service — consumes the backend auth API contracts.
 *
 * The backend owns HttpOnly cookies (smw_access_token, smw_refresh_token).
 * These functions never store, read, or manipulate tokens directly.
 * All requests use `credentials: "include"` (handled by the shared API client),
 * and 401 handling (refresh + single retry) lives in that client.
 *
 * Frontend role checks are UX only — the backend remains the security authority.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUserResponse {
  user: SafeUser;
}

export async function login(credentials: LoginCredentials): Promise<SafeUser> {
  const data = await api.post<AuthUserResponse>("/auth/login", credentials);
  return data.user;
}

export async function logout(): Promise<void> {
  await api.post<null>("/auth/logout");
}

export async function getCurrentUser(): Promise<SafeUser> {
  const data = await api.get<AuthUserResponse>("/auth/me");
  return data.user;
}