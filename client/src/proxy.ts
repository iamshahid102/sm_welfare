import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin route protection — security-in-depth (Next.js 16 `proxy.ts`).
 *
 * Guards every `/admin/*` request EXCEPT the login page. The check is
 * deliberately presence-based: if the browser did not send the HttpOnly
 * access credential (`smw_access_token`), the visitor cannot be
 * authenticated, so the request is redirected to the login page with the
 * intended destination preserved in `?from=`.
 *
 * The proxy NEVER verifies the credential itself — it has no secrets and
 * must not parse JWTs. Signature/expiry/role checks stay where they belong:
 * in the Express backend (`requireAuth` + `requireRole`). This gate exists
 * only to keep unauthenticated visitors out of the admin bundle and to
 * avoid flashing protected content during hydration.
 *
 * Because the access cookie is HttpOnly and domain-scoped by the browser,
 * this check only fires when the cookie is genuinely absent — a stale but
 * still-present cookie passes through and the client-side AuthProvider
 * handles refresh/expiry via GET /auth/me.
 */

const AUTH_ACCESS_COOKIE = "smw_access_token";
const ADMIN_LOGIN_PATH = "/admin/login";

export function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // The login page must always be reachable.
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }

  if (!request.cookies.has(AUTH_ACCESS_COOKIE)) {
    const from = encodeURIComponent(pathname);
    const loginUrl = new URL(`${ADMIN_LOGIN_PATH}?from=${from}`, origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};