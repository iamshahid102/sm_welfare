"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HiArrowRight, HiChevronDown } from "react-icons/hi2";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/constants/navigation";

interface NavigationProps {
  className?: string;
  /** Render white text for dark backgrounds (header gradient). */
  light?: boolean;
  /** Called after a link is activated (used by the mobile sheet to close). */
  onNavigate?: () => void;
  /**
   * "desktop" renders hover/focus dropdown panels positioned under the item.
   * "mobile" renders collapsible inline lists, which is the only layout that
   * works inside the mobile sheet (an absolutely positioned panel there would
   * float over the sheet content instead of pushing it down).
   */
  variant?: "desktop" | "mobile";
}

/** True when `href` is the current route. */
function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface InlineLinksProps {
  items: readonly NavItem[];
  /** Href of the owning item, used to detect fallback links that share it. */
  parentHref: string;
  pathname: string;
  depth: number;
  onNavigate?: () => void;
}

/**
 * Recursive inline list used for nested menu levels.
 * Items that fall back to their parent's href are never marked active —
 * otherwise every sibling would highlight at the same time.
 */
function InlineLinks({
  items,
  parentHref,
  pathname,
  depth,
  onNavigate,
}: InlineLinksProps) {
  return (
    <ul
      className={cn(
        "mt-1 flex flex-col gap-0.5 border-l border-border pl-3",
        depth > 1 && "ml-2"
      )}
    >
      {items.map((item) => {
        const active =
          item.href !== parentHref && isRouteActive(pathname, item.href);

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "block rounded-md px-2.5 py-2 text-[13px] leading-snug transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "font-semibold text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
            {item.children ? (
              <InlineLinks
                items={item.children}
                parentHref={item.href}
                pathname={pathname}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Public site navigation. Active route detection is a client concern
 * (usePathname), so this component is intentionally "use client".
 * Desktop and mobile both render from NAV_ITEMS.
 *
 * INTERACTION
 * - Precise pointers (mouse): the panel opens on hover/focus, the trigger
 *   navigates on click.
 * - Coarse pointers (touch): there is no hover, so tapping a trigger toggles
 *   the panel instead of navigating. The panel's "View all …" row is the way
 *   to reach the section landing page, so nothing becomes unreachable.
 */
export function Navigation({
  className,
  light,
  onNavigate,
  variant = "desktop",
}: NavigationProps) {
  const pathname = usePathname();
  const isMobile = variant === "mobile";

  // One dropdown open at a time — simpler and less surprising than a Set.
  const [openHref, setOpenHref] = useState<string | null>(null);

  // touch-only: hover cannot open a panel, so click has to.
  const [isTouch, setIsTouch] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsTouch(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Any activated link closes the menu, so navigation never leaves one open.
  // (Done here rather than in an effect on `pathname`: state changes in an
  // effect body cause cascading renders.)
  const handleNavigate = () => {
    setOpenHref(null);
    onNavigate?.();
  };

  // Escape closes; a tap/click outside the nav also closes (needed on touch,
  // where nothing auto-closes a clicked-open panel).
  useEffect(() => {
    if (!openHref) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenHref(null);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenHref(null);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openHref]);

  const toggle = (href: string) =>
    setOpenHref((current) => (current === href ? null : href));

  // Button-like shell shared by top-level triggers on both colour schemes.
  const triggerClass = cn(
    "relative inline-flex items-center rounded-full px-3.5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2",
    light
      ? "text-white/85 hover:bg-white/10 hover:text-white focus-visible:ring-white/60"
      : "text-foreground hover:bg-muted hover:text-primary focus-visible:ring-ring"
  );

  const activePill = (active: boolean) =>
    active &&
    (light
      ? "bg-white/15 text-white after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-[3px] after:rounded-full after:bg-accent"
      : "bg-secondary text-primary after:absolute after:inset-x-3.5 after:bottom-0.5 after:h-[3px] after:rounded-full after:bg-primary");

  return (
    <nav ref={navRef} aria-label="Primary" className={className}>
      <ul
        className={cn(
          "flex items-center gap-0.5",
          isMobile && "flex-col items-stretch gap-0"
        )}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = isRouteActive(pathname, item.href);
          const hasChildren = !!item.children?.length;

          if (!hasChildren) {
            return (
              <li key={item.href} className={cn(isMobile && "border-b border-border/60")}>
                <Link
                  href={item.href}
                  onClick={handleNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    triggerClass,
                    isMobile && "w-full justify-start rounded-none border-l-2 border-transparent py-3.5",
                    isMobile &&
                      (isActive
                        ? "border-l-primary bg-secondary/60 text-primary"
                        : "text-foreground hover:bg-muted"),
                    !isMobile && activePill(isActive)
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          }

          const isOpen = openHref === item.href;

          if (isMobile) {
            return (
              <li key={item.href} className="border-b border-border/60">
                <div className="flex items-center gap-1">
                  <Link
                    href={item.href}
                    onClick={handleNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex-1 rounded-md px-3 py-3.5 text-sm font-semibold",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(item.href)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label} submenu`}
                    className="rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <HiChevronDown
                      className={cn(
                        "size-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {isOpen ? (
                  <div className="pb-3">
                    <InlineLinks
                      items={item.children ?? []}
                      parentHref={item.href}
                      pathname={pathname}
                      depth={1}
                      onNavigate={handleNavigate}
                    />
                  </div>
                ) : null}
              </li>
            );
          }

          return (
            <li
              key={item.href}
              className="relative"
              onMouseEnter={() => !isTouch && setOpenHref(item.href)}
              onMouseLeave={() =>
                setOpenHref((current) => (current === item.href ? null : current))
              }
              onFocus={() => setOpenHref(item.href)}
              onBlur={(event) => {
                // Only close once focus leaves the whole item (trigger + panel),
                // otherwise tabbing into the dropdown closes it immediately.
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setOpenHref((current) => (current === item.href ? null : current));
                }
              }}
            >
              <Link
                href={item.href}
                onClick={(event) => {
                  // Touch: first tap reveals the submenu, the panel's footer
                  // link is what reaches the parent page.
                  if (isTouch) {
                    event.preventDefault();
                    toggle(item.href);
                    return;
                  }
                  handleNavigate();
                }}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  triggerClass,
                  "pr-2.5",
                  activePill(isActive)
                )}
              >
                {item.label}
                <HiChevronDown
                  className={cn(
                    "ml-1 size-3.5 transition-transform duration-200",
                    light ? "text-white/70" : "text-muted-foreground",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </Link>

              {/* The offset below the trigger lives in this wrapper's padding,
                  not a margin on the panel. A margin left a gap where the
                  pointer sat outside the <li>, so crossing from the trigger
                  into the panel fired mouseleave and closed the menu. Padding
                  keeps that strip inside the <li> and acts as a hover bridge. */}
              <div
                className={cn(
                  "absolute top-full z-20 w-72 origin-top pt-2 transition duration-150 ease-out",
                  // Right-align the panel so menus near the viewport edge
                  // (e.g. "Forms") never overflow horizontally.
                  light ? "right-0 origin-top-right" : "left-0 origin-top-left",
                  isOpen
                    ? "visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-1 opacity-0"
                )}
              >
                <ul
                  aria-label={`${item.label} submenu`}
                  className="max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/25 ring-1 ring-black/5"
                >
                  {item.children?.map((child) => {
                    const childIsActive =
                      child.href !== item.href &&
                      isRouteActive(pathname, child.href);

                    return (
                      <li key={child.label}>
                        <Link
                          href={child.href}
                          onClick={handleNavigate}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            childIsActive
                              ? "font-semibold text-primary"
                              : "text-foreground"
                          )}
                        >
                          {child.label}
                        </Link>

                        {child.children ? (
                          <InlineLinks
                            items={child.children}
                            parentHref={child.href}
                            pathname={pathname}
                            depth={1}
                            onNavigate={onNavigate}
                          />
                        ) : null}
                      </li>
                    );
                  })}

                  {/* Footer keeps the section landing page one tap away and makes
                      it obvious the panel may scroll — long menus no longer look
                      like they are cut short. */}
                  <li className="sticky bottom-0 -mx-1.5 mt-1 border-t border-border bg-popover px-1.5 pt-1.5">
                    <Link
                      href={item.href}
                      onClick={handleNavigate}
                      className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      View all {item.label}
                      <HiArrowRight
                        className="size-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
