"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { canAccessAdmin, isSuperAdmin, getUserInitials } from "@/types/auth";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HiBars3, HiXMark } from "react-icons/hi2";

/**
 * Admin navigation items.
 * SUPER_ADMIN-only items are marked with `superAdminOnly`.
 */
const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", superAdminOnly: false },
  { label: "Site settings", href: "/admin/site-settings", superAdminOnly: true },
  { label: "Programs", href: "/admin/programs", superAdminOnly: false },
  { label: "Projects", href: "/admin/projects", superAdminOnly: false },
  { label: "Media", href: "/admin/media", superAdminOnly: false },
  { label: "Admins", href: "/admin/admins", superAdminOnly: true },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="border-b border-border bg-background">
        <Container className="flex min-h-[56px] items-center justify-between py-2.5">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight text-foreground">
            <span className="size-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              SW
            </span>
            <span>SM Welfare Admin</span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Admin" className="hidden items-center gap-0.5 lg:flex">
            <ul className="flex items-center gap-0.5">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-primary rounded-full shadow-[0_0_6px_0_currentColor]" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Hamburger */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 -mr-2 lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <HiXMark className="size-4" aria-hidden="true" />
            ) : (
              <HiBars3 className="size-4" aria-hidden="true" />
            )}
          </Button>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <nav aria-label="Admin mobile" className="absolute top-full left-0 right-0 z-50 flex max-h-[60vh] flex-col overflow-y-auto border-b border-border bg-background py-2 shadow-lg lg:hidden">
              <ul className="flex flex-col gap-0.5 px-3">
                {visibleNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                      >
                        {item.label}
                        {isActive && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary" aria-hidden="true" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* Right side - User */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                {initials}
              </span>
              <span className="truncate max-w-[100px]">{user.name}</span>
              <Badge variant="secondary" className="text-[10px]">
                {userIsSuperAdmin ? "Super admin" : "Admin"}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              Sign out
            </Button>
            <Link href="/" className="hidden rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground lg:inline-block">
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