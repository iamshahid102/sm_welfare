"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { canAccessAdmin, isSuperAdmin, getUserInitials } from "@/types/auth";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  HiBars3,
  HiXMark,
  HiArrowTopRightOnSquare,
  HiArrowLeftOnRectangle,
} from "react-icons/hi2";

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
  { label: "Submissions", href: "/admin/submissions", superAdminOnly: false },
  { label: "Admins", href: "/admin/admins", superAdminOnly: true },
] as const;

/** Paths only SUPER_ADMIN may open directly. */
const SUPER_ADMIN_ONLY_PREFIXES = ["/admin/site-settings", "/admin/admins"];

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
export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to login (with the intended destination) when unauthenticated.
  useEffect(() => {
    if (!isLoading && !user) {
      const from =
        pathname && pathname !== "/admin/login"
          ? `?from=${encodeURIComponent(pathname)}`
          : "";
      router.replace(`/admin/login${from}`);
    }
  }, [isLoading, user, router, pathname]);

  // Close the mobile menu on Escape or when clicking outside it.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.closest("[data-admin-mobile-menu]") ||
        target?.closest("[data-admin-menu-toggle]")
      ) {
        return;
      }
      setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mobileMenuOpen]);

  // Loading skeleton while auth hydration is in progress.
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/30">
        <header className="border-b border-border bg-background/80 backdrop-blur-md">
          <Container className="flex h-16 items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <div className="hidden items-center gap-3 lg:flex">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-8 w-20 lg:hidden" />
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <Container className="flex h-16 items-center justify-between gap-4">
          {/* ── Logo ── */}
          <Link
            href="/admin/dashboard"
            className="group flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm ring-1 ring-primary/20 transition-shadow group-hover:shadow-md">
              SW
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
              SM Welfare
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            aria-label="Admin"
            className="hidden items-center gap-1 lg:flex"
          >
            <ul className="flex items-center gap-0.5">
              {visibleNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                      {isActive && (
                        <span
                          className="absolute inset-x-3 -bottom-2.5 h-0.5 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Mobile Hamburger ── */}
          <Button
            variant="ghost"
            size="icon-sm"
            data-admin-menu-toggle
            className="shrink-0 lg:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <HiXMark className="size-5" aria-hidden="true" />
            ) : (
              <HiBars3 className="size-5" aria-hidden="true" />
            )}
          </Button>

          {/* ── Mobile Nav Dropdown ── */}
          {mobileMenuOpen && (
            <nav
              data-admin-mobile-menu
              aria-label="Admin mobile"
              className="absolute top-full left-0 right-0 z-50 border-b border-border bg-background/95 shadow-xl backdrop-blur-md supports-[backdrop-filter]:bg-background/80 lg:hidden"
            >
              <div className="flex flex-col gap-1 p-3">
                {visibleNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary/8 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {item.label}
                      {isActive && (
                        <span className="ml-auto size-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
                <Separator className="my-1.5" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials}
                  </span>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {userIsSuperAdmin ? "Super Admin" : "Admin"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 px-3 pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void logout();
                    }}
                  >
                    <HiArrowLeftOnRectangle className="size-3.5" />
                    Sign out
                  </Button>
                  <Link
                    href="/"
                    className="inline-flex h-7 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiArrowTopRightOnSquare className="size-3" />
                    View site
                  </Link>
                </div>
              </div>
            </nav>
          )}

          {/* ── Right side - User ── */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <HiArrowTopRightOnSquare className="size-3.5" />
              View site
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-background">
                {initials}
              </span>
              <div className="hidden flex-col leading-none md:flex">
                <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {userIsSuperAdmin ? "Super Admin" : "Admin"}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void logout()}
              className="gap-1.5"
            >
              <HiArrowLeftOnRectangle className="size-3.5" />
              Sign out
            </Button>
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