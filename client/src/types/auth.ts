import type { SafeUser } from "@/types/api";

/** Roles recognized by the backend RBAC system. */
export type UserRole = "SUPER_ADMIN" | "ADMIN";

export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
} as const satisfies Record<UserRole, UserRole>;

/**
 * UX-only role helpers. The backend RBAC middleware is the security
 * authority — these only decide what the UI shows.
 */
export function canAccessAdmin(user: SafeUser | null): boolean {
  return user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";
}

export function isSuperAdmin(user: SafeUser | null): boolean {
  return user?.role === "SUPER_ADMIN";
}
