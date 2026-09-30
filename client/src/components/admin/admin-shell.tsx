"use client";

import { useEffect, useState, type ElementType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { canAccessAdmin, getUserInitials } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  HiArrowLeftOnRectangle,
  HiArrowTopRightOnSquare,
  HiBars3,
  HiCog6Tooth,
  HiFolderOpen,
  HiInbox,
  HiPhoto,
  HiRectangleStack,
  HiSquares2X2,
  HiXMark,
} from "react-icons/hi2";

/**
 * Admin shell - the single layout every admin page renders inside.
 *
 * Design goals (from the site owner's feedback):
 *  - one obvious place for everything: a fixed left sidebar with the sections
 *    grouped by what they control (Content / Website), each with a short
 *    one-line explanation, instead of a flat row of links in the header
 *  - the current section is always visible (highlighted item + page title in
 *    the top bar), so you never lose track of where you are
 *  - the same sidebar becomes a slide-over panel on phones
 *
 * There is exactly one admin account, so every item is always available; the
 * backend remains the real security authority.
 */

interface AdminNavItem {
  label: string;
  href: string;
  /** One-line explanation of what this section controls. */
  description: string;
  icon: ElementType;
}

interface AdminNavGroup {
  label: string;
  items: readonly AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: readonly AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        description: "Site at a glance",
        icon: HiSquares2X2,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "Programs",
        href: "/admin/programs",
        description: "Main categories the site lists",
        icon: HiRectangleStack,
      },
      {
        label: "Projects",
        href: "/admin/projects",
        description: "Pages inside each program",
        icon: HiFolderOpen,
      },
      {
        label: "Media",
        href: "/admin/media",
        description: "Photos and videos (Cloudinary)",
        icon: HiPhoto,
      },
    ],
  },
  {
    label: "Website",
    items: [
      {
        label: "Site settings",
        href: "/admin/site-settings",
        description: "Name, contact details, footer",
        icon: HiCog6Tooth,
      },
      {
        label: "Submissions",
        href: "/admin/submissions",
        description: "Contact messages and forms",
        icon: HiInbox,
      },
    ],
  },
];

const ALL_NAV_ITEMS: readonly AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap(
  (group) => group.items,
);

/** Brand block shown at the top of the sidebar. */
function ShellBrand() {
  return (
    <Link
      href="/admin/dashboard"
      className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm">
        SW
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-semibold tracking-tight">
          SM Welfare Trust
        </span>
        <span className="text-[11px] text-muted-foreground">Admin panel</span>
      </span>
    </Link>
  );
}

/** Navigation list rendered in both the sidebar and the mobile panel. */
function ShellNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-5">
      {ADMIN_NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </span>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors active:scale-[0.995]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-opacity",
                        isActive ? "opacity-100" : "opacity-0",
                      )}
                      aria-hidden="true"
                    />
                    <Icon
                      className={cn(
                        "mt-0.5 size-4.5 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Signed-in user block + sign out, used in the sidebar footer. */
function ShellUser({
  name,
  initials,
  onLogout,
}: {
  name: string;
  initials: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HiArrowTopRightOnSquare className="size-3.5" aria-hidden="true" />
        View live site
      </Link>
      <Separator />
      <div className="flex items-center gap-3 px-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
          {initials}
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-medium">{name}</span>
          <span className="text-[11px] text-muted-foreground">
            Administrator
          </span>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
        <HiArrowLeftOnRectangle className="size-3.5" aria-hidden="true" />
        Sign out
      </Button>
    </div>
  );
}

/** Full-page skeleton shown while the session is still resolving. */
function ShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="hidden w-64 shrink-0 border-r border-border bg-background p-4 lg:block">
        <Skeleton className="h-9 w-full rounded-xl" />
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-16 items-center border-b border-border bg-background/80 px-6">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect to login (preserving the intended destination) when signed out.
  useEffect(() => {
    if (!isLoading && !user) {
      const from =
        pathname && pathname !== "/admin/login"
          ? `?from=${encodeURIComponent(pathname)}`
          : "";
      router.replace(`/admin/login${from}`);
    }
  }, [isLoading, user, router, pathname]);

  // NOTE: the mobile panel is closed by the nav links themselves
  // (onNavigate) rather than by an effect on `pathname`, so no state is set
  // during a render pass.

  // Escape closes the mobile panel.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  if (isLoading) {
    return <ShellSkeleton />;
  }

  // Not signed in - the redirect above takes over; render nothing so no
  // protected content ever flashes.
  if (!user || !canAccessAdmin(user)) {
    return null;
  }

  const initials = getUserInitials(user);
  const currentItem = ALL_NAV_ITEMS.find((item) => item.href === pathname);
  const handleLogout = () => {
    void logout();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Sidebar (desktop) ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <div className="p-4">
          <ShellBrand />
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          <ShellNav pathname={pathname} />
        </div>
        <div className="border-t border-border p-4">
          <ShellUser name={user.name} initials={initials} onLogout={handleLogout} />
        </div>
      </aside>

      {/* ── Mobile slide-over sidebar ── */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            data-admin-mobile-menu
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-background shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between p-4">
              <ShellBrand />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <HiXMark className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <ShellNav
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
            <div className="border-t border-border p-4">
              <ShellUser
                name={user.name}
                initials={initials}
                onLogout={handleLogout}
              />
            </div>
          </aside>
        </>
      )}

      {/* ── Main column ── */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon-sm"
              data-admin-menu-toggle
              className="shrink-0 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <HiBars3 className="size-5" aria-hidden="true" />
            </Button>

            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold tracking-tight">
                {currentItem?.label ?? "Admin"}
              </span>
              <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {currentItem?.description ?? "SM Welfare Trust content manager"}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 sm:flex">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  {initials}
                </span>
                <span className="max-w-[140px] truncate text-xs font-medium">
                  {user.name}
                </span>
              </span>
              <Link
                href="/"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HiArrowTopRightOnSquare className="size-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">View site</span>
              </Link>
            </div>
          </div>
        </header>

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
