import { redirect } from "next/navigation";

/**
 * /admin index — redirects authenticated users to the dashboard.
 *
 * Unauthenticated users are already gated by middleware.ts (redirects to /admin/login).
 * This page only renders when the cookie is present, so a simple server redirect
 * is the smallest correct solution.
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
