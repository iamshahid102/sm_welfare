import { api } from "@/lib/api/client";
import type { SafeUser } from "@/types/api";

/**
 * Authentication service — ARCHITECTURE BOUNDARY (foundation only).
 *
 * Full authentication is implemented in a dedicated phase. These functions
 * define the exact contract the UI will consume. Nothing here stores tokens:
 * the Express backend owns the HttpOnly cookies, so these calls only need
 * `credentials: "include"` (handled by the shared API client).
 *
 * Frontend role checks are UX only — the backend remains the security
 * authority.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  user: SafeUser;
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  return api.post<LoginResult>("/auth/login", credentials);
}

export async function logout(): Promise<null> {
  return api.post<null>("/auth/logout");
}

export async function refreshSession(): Promise<LoginResult> {
  return api.post<LoginResult>("/auth/refresh");
}

export async function getCurrentUser(): Promise<LoginResult> {
  return api.get<LoginResult>("/auth/me");
}
