import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin route protection — security-in-depth.
 *
 * Guards every `/admin/*` request EXCEPT the login page. The check is
 * deliberately presence-based: if the browser sent neither the HttpOnly access
 * credential (`smw_access_token`) nor the HttpOnly refresh credential
 * (`smw_refresh_token`), the visitor cannot be authenticated, so the request is
 * redirected to the login page with the intended destination preserved in
 * `?from=`.
 *
 * The proxy NEVER verifies a credential itself — it has no secrets and must not
 * parse JWTs. Signature/expiry/role checks stay where they belong: in the
 * Express backend (`requireAuth` + `requireRole`). This gate exists only to keep
 * unauthenticated visitors out of the admin bundle and to avoid flashing
 * protected content during hydration.
 *
 * A request is allowed through when EITHER credential is present:
 *  - a valid access cookie (the normal case), or
 *  - only a refresh cookie, which happens once the short-lived access cookie
 *    has expired but the 7-day session is still valid. In that case the API
 *    client refreshes transparently; redirecting to the login page here would
 *    force an unnecessary re-login.
 *
 * NOTE: this file must be named `proxy.ts` in `src/` — Next.js 16 renamed the
 * `middleware.ts` convention to `proxy.ts` and deprecated the `middleware`
 * export. Keeping the old filename would silently disable this guard.
 * The proxy runtime is Node.js and is not configurable in Next.js 16.
 */

const AUTH_ACCESS_COOKIE = "smw_access_token";
const AUTH_REFRESH_COOKIE = "smw_refresh_token";
const ADMIN_LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // The login page must always be reachable.
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  const hasSession =
    request.cookies.has(AUTH_ACCESS_COOKIE) ||
    request.cookies.has(AUTH_REFRESH_COOKIE);

  if (!hasSession) {
    const from = encodeURIComponent(pathname);
    const loginUrl = new URL(`${ADMIN_LOGIN_PATH}?from=${from}`, origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
