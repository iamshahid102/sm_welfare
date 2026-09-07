import type { SafeUser } from "@/types/api";

/** Roles recognized by the backend RBAC system. */
export type UserRole = "SUPER_ADMIN" | "ADMIN";

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

/** Get display initials from user name. */
export function getUserInitials(user: SafeUser): string {
  return user.name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}