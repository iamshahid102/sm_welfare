/**
 * Client-side authentication helpers.
 *
 * These shape navigation/UX decisions — they never touch credentials.
 * The backend remains the security authority for authentication and RBAC.
 */

/**
 * Name of the non-HttpOnly session-hint cookie the API sets on login/refresh.
 * Kept in sync with `AUTH_SESSION_HINT_COOKIE` in the server.
 */
export const SESSION_HINT_COOKIE = "smw_session";

/**
 * True when the API previously issued a session on this browser (a hint cookie
 * is present). Readable by JavaScript by design — it holds no secret and only
 * tells the app "probing /auth/me is worth a round-trip".
 */
export function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((entry) => entry.startsWith(`${SESSION_HINT_COOKIE}=`));
}

/**
 * Drops the hint once the backend has confirmed the session is unusable, so
 * the next page load does not probe an endpoint that will 401.
 */
export function clearSessionHint(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; path=/`;
}


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