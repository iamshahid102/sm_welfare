import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | SM Welfare Admin",
  },
};

/**
 * Admin area layout.
 *
 * All the chrome (sidebar, top bar, auth guard, loading state) lives in
 * AdminShell; this file only wires it up so adding an admin page never means
 * re-implementing navigation.
 */
export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
