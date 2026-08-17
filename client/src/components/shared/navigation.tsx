"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/navigation";

interface NavigationProps {
  className?: string;
  /** Light variant (white links) for use on blue/overlay headers. */
  light?: boolean;
  /** Called after a link is activated (used by the mobile sheet to close). */
  onNavigate?: () => void;
}

/**
 * Public site navigation. Active route detection is a client concern
 * (usePathname), so this component is intentionally "use client".
 * Desktop and mobile both render from NAV_ITEMS.
 */
export function Navigation({ className, light, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  light
                    ? isActive
                      ? "text-accent"
                      : "text-white/85 hover:text-white"
                    : isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  !light &&
                    isActive &&
                    "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary"
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
