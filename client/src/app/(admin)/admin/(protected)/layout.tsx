"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { canAccessAdmin, isSuperAdmin, getUserInitials } from "@/types/auth";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Admin navigation items.
 * SUPER_ADMIN-only items are marked with `superAdminOnly`.
 */
const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", superAdminOnly: false },
  {
    label: "Site settings",
    href: "/admin/site-settings",
    superAdminOnly: true,
  },
  { label: "Programs", href: "/admin/programs", superAdminOnly: false },
  { label: "Projects", href: "/admin/projects", superAdminOnly: false },
  { label: "Media", href: "/admin/media", superAdminOnly: false },
  {
    label: "Admins",
    href: "/admin/admins",
    superAdminOnly: true,
  },
] as const;

/** Paths only SUPER_ADMIN may open directly. */
const SUPER_ADMIN_ONLY_PREFIXES = [
  "/admin/site-settings",
  "/admin/admins",
];

/**
 * Admin shell — with authentication guard.
 *
 * - Redirects unauthenticated users to /admin/login (preserving the intended
 *   destination via ?from= for post-login return)
 * - Shows loading state while auth is resolving
 * - Displays user info and logout button
 * - Hides SUPER_ADMIN-only nav items for ADMIN users
 * - Shows an unauthorized state when an ADMIN opens a SUPER_ADMIN-only route
 * - Backend remains the actual security authority
 */
export default function AdminProtectedLayout({ children }: LayoutProps<"/admin">) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login (with the intended destination) when unauthenticated.
  useEffect(() => {
    if (!isLoading && !user) {
      const from = pathname && pathname !== "/admin/login" ? `?from=${encodeURIComponent(pathname)}` : "";
      router.replace(`/admin/login${from}`);
    }
  }, [isLoading, user, router, pathname]);

  // Loading skeleton while auth hydration is in progress.
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <header className="border-b bg-background">
          <Container className="flex min-h-14 items-center justify-between py-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
          </Container>
        </header>
        <main id="main-content" className="flex-1">
          <Container className="py-10">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
          </Container>
        </main>
      </div>
    );
  }

  // Not authenticated — show nothing while the redirect (above) takes over.
  // Prevents flashing protected content.
  if (!user || !canAccessAdmin(user)) {
    return null;
  }

  const userIsSuperAdmin = isSuperAdmin(user);
  const initials = getUserInitials(user);

  // Filter nav items based on role.
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.superAdminOnly || userIsSuperAdmin,
  );

  // Direct URL access to a SUPER_ADMIN-only route by an ADMIN → unauthorized state.
  const routeRequiresSuperAdmin = SUPER_ADMIN_ONLY_PREFIXES.some((prefix) =>
    pathname?.startsWith(prefix),
  );

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background">
        <Container className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
          <span className="font-heading text-sm font-semibold">
            SM Welfare Admin
          </span>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap items-center gap-1 text-sm">
              {visibleNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
                aria-hidden="true"
              >
                {initials}
              </span>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Badge variant="secondary" className="hidden sm:inline-flex">
                {userIsSuperAdmin ? "Super admin" : "Admin"}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void logout();
              }}
            >
              Sign out
            </Button>
            <Link
              href="/"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              View site
            </Link>
          </div>
        </Container>
      </header>
      <main id="main-content" className="flex-1">
        <Container className="py-10">
          {routeRequiresSuperAdmin && !userIsSuperAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Access denied</CardTitle>
                <CardDescription>
                  This section is restricted to super administrators.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Your account does not have permission to view this page. If you
                believe this is a mistake, contact the system administrator.
              </CardContent>
            </Card>
          ) : (
            children
          )}
        </Container>
      </main>
    </div>
  );
}