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
import { isSafeInternalAdminPath } from "@/lib/auth";
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

    loadCurrentUser().finally(() => {
      setIsLoading(false);
    });
  }, [loadCurrentUser]);

  /**
   * React to a session that the backend considers expired (refresh failed).
   * Clears state everywhere; admin-area visitors are sent back to the login
   * page with their intended destination preserved.
   */
  useEffect(() => {
    setUnauthorizedHandler(() => {
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
