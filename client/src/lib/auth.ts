/**
 * Client-side authentication helpers (pure functions only).
 *
 * These shape navigation/UX decisions — they never touch credentials.
 * The backend remains the security authority for authentication and RBAC.
 */

/**
 * A destination is only safe to redirect to after login if it is an internal
 * admin path. Rejects absolute URLs, protocol-relative URLs, backslashes and
 * anything outside /admin/ — no open-redirect vectors.
 */
export function isSafeInternalAdminPath(path: string | undefined): path is string {
  if (typeof path !== "string" || path.length < "/admin/x".length) return false;
  if (!path.startsWith("/admin/")) return false;
  if (path.startsWith("//") || path.includes("\\")) return false;
  return true;
}