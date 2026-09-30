"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { SafeUser } from "@/types/api";
import * as authService from "@/services/auth";
import {
  clearSessionHint,
  hasSessionHint,
  isSafeInternalAdminPath,
} from "@/lib/auth";
import { setUnauthorizedHandler } from "@/lib/api/client";

/**
 * Auth context shape — contains only safe, serialized user information.
 * No JWT tokens, no password hashes, no secrets.
 */
export interface AuthContextValue {
  /** The currently authenticated user, or null. */
  user: SafeUser | null;
  /** Whether the initial auth hydration has completed. */
  isLoading: boolean;
  /** Whether a user is authenticated. */
  isAuthenticated: boolean;
  /**
   * Authenticate with email/password and establish a session.
   * Optionally return to a previously-intended admin destination.
   */
  login: (
    credentials: authService.LoginCredentials,
    redirectTo?: string,
  ) => Promise<void>;
  /** End the session and clear state. */
  logout: () => Promise<void>;
  /** Re-fetch the current user from the backend. */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider — manages authentication state using HttpOnly cookies.
 *
 * Responsibilities:
 * - On mount: hydrate from GET /auth/me (the API client transparently
 *   refreshes the access credential and retries once on 401)
 * - Provide login/logout/refreshUser methods
 * - Register an unauthorized handler so an expired session clears state
 *   immediately and admin visitors are returned to the login page
 * - Store only safe serialized user data in React state
 * - No tokens in JavaScript — the backend owns the cookies
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Prevent double-hydration in StrictMode.
  const hydrationAttempted = useRef(false);

  /** Load the current user from the backend (refresh is handled internally). */
  const loadCurrentUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    }
  }, []);

  // Hydrate on mount (once).
  useEffect(() => {
    if (hydrationAttempted.current) return;
    hydrationAttempted.current = true;

    const hydrate = async () => {
      // The provider lives in the ROOT layout, but only the admin area ever
      // reads auth state. Probing /auth/me for a visitor with no session
      // returns 401 and then triggers a second 401 from /auth/refresh —
      // console noise on every public page load. The readable session-hint
      // cookie (set by the API at login) tells us whether a session might
      // exist, so anonymous visitors skip the probe.
      //
      // Protected admin pages are the exception: they always probe, because
      // the route guard has already required credentials there and a skipped
      // probe would look like a signed-out user and bounce an admin who holds
      // a valid session but no hint (e.g. one established before the hint
      // existed). The login page itself does NOT need that guarantee — with no
      // hint there is nothing to hydrate, so it stays silent for logged-out
      // visitors.
      const path =
        typeof window !== "undefined" ? window.location.pathname : "";
      const isProtectedAdminPage =
        path.startsWith("/admin") && path !== "/admin/login";

      if (isProtectedAdminPage || hasSessionHint()) {
        await loadCurrentUser();
      }
      setIsLoading(false);
    };

    void hydrate();
  }, [loadCurrentUser]);

  /**
   * React to a session that the backend considers expired (refresh failed).
   * Clears state everywhere; admin-area visitors are sent back to the login
   * page with their intended destination preserved.
   */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      // The backend declared the session dead — drop the hint so the next
      // page load does not probe an endpoint that is guaranteed to 401.
      clearSessionHint();
      setUser(null);
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin/") &&
        window.location.pathname !== "/admin/login"
      ) {
        const from = encodeURIComponent(window.location.pathname);
        router.replace(`/admin/login?from=${from}`);
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [router]);

  const login = useCallback(
    async (credentials: authService.LoginCredentials, redirectTo?: string) => {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
      router.push(
        isSafeInternalAdminPath(redirectTo) ? redirectTo : "/admin/dashboard",
      );
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // The API clears the hint in its response; do it here too so a failed
      // request cannot leave a stale hint behind.
      clearSessionHint();
      setUser(null);
      router.push("/admin/login");
    }
  }, [router]);

  const refreshUser = loadCurrentUser;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
