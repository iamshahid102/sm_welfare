import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the SM Welfare admin panel.",
};

/**
 * Admin login page (outside the authenticated admin shell).
 *
 * Reads the optional `from` query parameter — the intended admin destination
 * preserved when an unauthenticated visitor was redirected here — and hands it
 * to the login form so the session returns there after a successful sign-in.
 * The value is validated as a safe internal path by the auth provider.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <LoginForm redirectTo={from} />
    </div>
  );
}