"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { isSafeInternalAdminPath } from "@/lib/auth";
import { ApiError } from "@/lib/api/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface LoginFormProps {
  /** Intended admin destination preserved across the login redirect (?from=). */
  redirectTo?: string;
}

/**
 * Interactive login form — Client Component.
 *
 * Uses HttpOnly cookies for authentication (backend-owned).
 * Validates input client-side before submission.
 * Displays user-friendly errors without exposing backend details.
 */
export function LoginForm({ redirectTo }: LoginFormProps) {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to the dashboard (or the intended page).
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const safeFrom =
        redirectTo && isSafeInternalAdminPath(redirectTo) ? redirectTo : "/admin/dashboard";
      router.replace(safeFrom);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Show loading skeleton while auth state is resolving.
  if (isLoading) {
    return (
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <Skeleton className="mx-auto size-12 rounded-full" />
            <Skeleton className="mx-auto h-6 w-32" />
            <Skeleton className="mx-auto h-4 w-48" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Don't flash the form if we're about to redirect.
  if (isAuthenticated) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Client-side validation.
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: trimmedEmail, password }, redirectTo);
      // Navigation happens inside login().
    } catch (err) {
      if (err instanceof ApiError) {
        // Map backend errors to user-friendly messages.
        // Never expose internal details (MongoDB, JWT, stack traces).
        switch (err.statusCode) {
          case 401:
            setError("Invalid email or password.");
            break;
          case 403:
            setError("Your account does not have access.");
            break;
          case 429:
            setError("Too many attempts. Please try again later.");
            break;
          case 0:
            setError(
              "Unable to reach the server. Please check your connection.",
            );
            break;
          default:
            setError("Authentication failed. Please try again.");
        }
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <span className="font-heading text-lg font-bold text-primary">
              SM
            </span>
          </div>
          <CardTitle className="font-heading text-xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to the SM Welfare admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive" id="login-error">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@smwelfare.charity"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
