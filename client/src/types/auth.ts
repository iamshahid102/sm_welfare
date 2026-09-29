import type { SafeUser } from "@/types/api";

/** The single role this CMS issues. */
export type UserRole = "ADMIN";

/**
 * UX-only helpers. The backend session is the security authority — these only
 * decide what the UI shows.
 *
 * Because this CMS is operated by exactly one admin account that owns every
 * content type, there is no role distinction left to make: being
 * authenticated *is* being the admin.
 */
export function canAccessAdmin(user: SafeUser | null): boolean {
  return user !== null;
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