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

/** Width of the nested flyout panel (Tailwind `w-56`). */
const FLYOUT_WIDTH = 224;

/** Geometry of the open nested panel, relative to the dropdown wrapper. */
interface FlyoutState {
  /** Label of the row that owns the panel (unique within its menu). */
  key: string;
  /** Offset from the top of the wrapper, in px. */
  top: number;
  /** Side of the wrapper the panel hangs off. */
  side: "left" | "right";
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
 * Recursive inline list used for nested menu levels in the mobile sheet.
 * Items that fall back to their parent's href are never marked active —
 * otherwise every sibling would highlight at the same time.
 *
 * Items with children render a chevron toggle and reveal their own list on
 * demand, mirroring the desktop flyout so nesting behaves the same at every
 * viewport instead of dumping every grandchild into the sheet at once.
 */
function InlineLinks({
  items,
  parentHref,
  pathname,
  depth,
  onNavigate,
}: InlineLinksProps) {
  // The branch containing the current route starts expanded, so the visitor
  // always sees where they are.
  const [openKey, setOpenKey] = useState<string | null>(() => {
    const branch = items.find((item) =>
      item.children?.some(
        (child) =>
          child.href !== item.href && isRouteActive(pathname, child.href)
      )
    );
    return branch?.label ?? null;
  });

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
        const hasChildren = !!item.children?.length;
        const isOpen = openKey === item.label;

        return (
          <li key={item.label}>
            <div className="flex items-center gap-1">
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex-1 rounded-md px-2.5 py-2 text-[13px] leading-snug transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "font-semibold text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? null : item.label)}
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label} submenu`}
                  className="shrink-0 rounded-md p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HiChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>
            {hasChildren && isOpen ? (
              <InlineLinks
                items={item.children ?? []}
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
 * - Rows that have children of their own open a second-level panel: a flyout
 *   beside the row on desktop, a chevron accordion in the mobile sheet — so
 *   the menu stays two levels deep like the live site's nested dropdown.
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

  // Nested (second-level) panel: which row owns it and where to draw it.
  const [flyout, setFlyout] = useState<FlyoutState | null>(null);

  // touch-only: hover cannot open a panel, so click has to.
  const [isTouch, setIsTouch] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  // Dropdown wrapper of the open menu — the nested panel's positioning
  // context (it must live outside the scrolling <ul>, see below).
  const panelRef = useRef<HTMLDivElement>(null);
  // The mounted nested panel, for hover checks and focus containment.
  const flyoutRef = useRef<HTMLDivElement>(null);
  // Row that opened the nested panel — Escape returns focus to it.
  const childElRef = useRef<HTMLElement | null>(null);
  // Pending close timer for the nested panel (hover grace period).
  const flyoutTimerRef = useRef<number | null>(null);
  // Timestamp of the last touchstart, so tap-induced focus is ignored.
  const lastTouchAt = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsTouch(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Remember the last touch so focus handlers can tell a tap from a keyboard.
  useEffect(() => {
    const onTouchStart = () => {
      lastTouchAt.current = Date.now();
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => window.removeEventListener("touchstart", onTouchStart);
  }, []);

  // ── Menu open/close (top-level panel + nested flyout together) ────────
  // Kept out of effects on purpose: setState inside an effect body causes
  // cascading renders (and react-hooks/set-state-in-effect). Every caller is
  // an event handler, so the state pair always changes together.
  const closeMenu = () => {
    setFlyout(null);
    setOpenHref(null);
  };

  const openMenu = (href: string) => {
    setFlyout(null);
    setOpenHref(href);
  };

  // Any activated link closes the menu, so navigation never leaves one open.
  const handleNavigate = () => {
    closeMenu();
    onNavigate?.();
  };

  // Escape closes; a tap/click outside the nav also closes (needed on touch,
  // where nothing auto-closes a clicked-open panel).
  useEffect(() => {
    if (!openHref) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (flyout) {
        // First Escape closes only the nested panel.
        const insideFlyout = flyoutRef.current?.contains(document.activeElement);
        setFlyout(null);
        if (insideFlyout) childElRef.current?.focus();
      } else {
        setOpenHref(null);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      // Outside click: drop the nested panel along with the menu. (Only setters
      // and refs here — this runs inside an event callback, not the effect
      // body, so react-hooks/set-state-in-effect does not apply.)
      setFlyout(null);
      setOpenHref(null);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openHref, flyout]);

  // Never leave a pending hover timer behind on unmount.
  useEffect(
    () => () => {
      if (flyoutTimerRef.current !== null) {
        window.clearTimeout(flyoutTimerRef.current);
      }
    },
    []
  );

  const toggle = (href: string) => {
    // Switching or closing the panel always invalidates its nested flyout.
    setFlyout(null);
    setOpenHref((current) => (current === href ? null : href));
  };

  // ── Nested (second-level) flyout ──────────────────────────────────────
  const clearFlyoutTimer = () => {
    if (flyoutTimerRef.current !== null) {
      window.clearTimeout(flyoutTimerRef.current);
      flyoutTimerRef.current = null;
    }
  };

  /** Close the nested panel, after a short grace period by default. */
  const closeFlyout = (immediate = false) => {
    clearFlyoutTimer();
    if (immediate) {
      setFlyout(null);
      return;
    }
    flyoutTimerRef.current = window.setTimeout(() => setFlyout(null), 120);
  };

  /** Position and open the nested panel for `child` beside its row. */
  const openFlyout = (child: NavItem, source: HTMLElement) => {
    const wrapper = panelRef.current;
    if (!wrapper || !child.children?.length) return;
    clearFlyoutTimer();

    const panelRect = wrapper.getBoundingClientRect();
    const rowRect = source.getBoundingClientRect();
    let top = rowRect.top - panelRect.top;

    // Keep the panel inside the viewport on short screens.
    const estimatedHeight = child.children.length * 36 + 16;
    const maxTop = window.innerHeight - 12 - panelRect.top;
    if (top + estimatedHeight > maxTop) {
      top = Math.max(0, maxTop - estimatedHeight);
    }

    // Open on whichever side has room: right like the screenshot, left when
    // the viewport edge would otherwise cut the panel off.
    const spaceRight = window.innerWidth - panelRect.right;
    const side: "left" | "right" =
      spaceRight >= FLYOUT_WIDTH + 16 || spaceRight >= panelRect.left
        ? "right"
        : "left";

    childElRef.current = source.querySelector("a") ?? source;
    setFlyout({ key: child.label, top, side });
  };

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
              onMouseEnter={() => {
                if (isTouch || openHref === item.href) return;
                openMenu(item.href);
              }}
              onMouseLeave={() => {
                if (openHref === item.href) closeMenu();
              }}
              onFocus={() => {
                // A touch tap focuses the trigger too — suppress it, or the
                // click's toggle below would immediately close what focus
                // just opened. Keyboard focus (no recent touch) still works.
                if (Date.now() - lastTouchAt.current <= 600) return;
                // Focus bubbles up from rows inside the open panel — only a
                // genuine switch to another menu may reset the nested flyout.
                if (openHref !== item.href) openMenu(item.href);
              }}
              onBlur={(event) => {
                // Only close once focus leaves the whole item (trigger + panel),
                // otherwise tabbing into the dropdown closes it immediately.
                if (
                  openHref === item.href &&
                  !event.currentTarget.contains(event.relatedTarget as Node | null)
                ) {
                  closeMenu();
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
                ref={isOpen ? panelRef : undefined}
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
                  onScroll={() => closeFlyout(true)}
                  className="max-h-[70vh] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/25 ring-1 ring-black/5"
                >
                  {item.children?.map((child) => {
                    const childIsActive =
                      child.href !== item.href &&
                      isRouteActive(pathname, child.href);
                    const hasGrandchildren = !!child.children?.length;
                    const flyoutOpen = flyout?.key === child.label;

                    return (
                      <li
                        key={child.label}
                        onMouseEnter={(event) => {
                          if (isTouch) return;
                          clearFlyoutTimer();
                          if (hasGrandchildren) {
                            openFlyout(child, event.currentTarget);
                          } else if (flyout) {
                            setFlyout(null);
                          }
                        }}
                        onMouseLeave={() => {
                          if (!isTouch && flyout) closeFlyout();
                        }}
                        onBlur={(event) => {
                          const next = event.relatedTarget as Node | null;
                          if (
                            next &&
                            (event.currentTarget.contains(next) ||
                              flyoutRef.current?.contains(next))
                          ) {
                            return;
                          }
                          closeFlyout();
                        }}
                      >
                        <Link
                          href={child.href}
                          onClick={(event) => {
                            // Touch has no hover: the first tap opens the
                            // nested panel, the second navigates.
                            if (isTouch && hasGrandchildren && !flyoutOpen) {
                              event.preventDefault();
                              openFlyout(child, event.currentTarget);
                              return;
                            }
                            handleNavigate();
                          }}
                          onFocus={(event) => {
                            if (!hasGrandchildren) {
                              // Keyboard/tab focus moved onto a plain row —
                              // a stale flyout from another row must not stay.
                              if (flyout) closeFlyout(true);
                              return;
                            }
                            // A touch tap can focus too — ignore recent taps
                            // so the first tap opens rather than navigates.
                            if (Date.now() - lastTouchAt.current > 600) {
                              openFlyout(child, event.currentTarget);
                            }
                          }}
                          onKeyDown={(event) => {
                            // Tab steps into the nested panel first; the panel
                            // sits after the list in DOM order.
                            if (
                              event.key === "Tab" &&
                              !event.shiftKey &&
                              flyoutOpen
                            ) {
                              event.preventDefault();
                              flyoutRef.current
                                ?.querySelector<HTMLAnchorElement>("a")
                                ?.focus();
                            }
                          }}
                          aria-haspopup={hasGrandchildren ? "true" : undefined}
                          aria-expanded={
                            hasGrandchildren ? flyoutOpen : undefined
                          }
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            childIsActive
                              ? "font-semibold text-primary"
                              : "text-foreground",
                            flyoutOpen && "bg-secondary"
                          )}
                        >
                          <span>{child.label}</span>
                          {hasGrandchildren ? (
                            <HiChevronDown
                              className="size-4 shrink-0 text-muted-foreground"
                              aria-hidden="true"
                            />
                          ) : null}
                        </Link>
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

                {/* One flyout per row that has children, always mounted so the
                    nested links stay in the DOM (same parity the old inline
                    list gave them) and hidden until their row is hovered or
                    focused. They sit outside the scrolling <ul> so the list's
                    overflow cannot clip them, and the inner padding bridges
                    the gap between the two panels (same hover-bridge trick as
                    the wrapper's pt-2). */}
                {item.children
                  ?.filter((child) => child.children?.length)
                  .map((child) => {
                    const flyoutForChild =
                      isOpen && flyout?.key === child.label ? flyout : null;
                    const active = flyoutForChild !== null;

                    return (
                      <div
                        key={child.label}
                        ref={active ? flyoutRef : undefined}
                        style={
                          // Parked off-screen while hidden so a switch between
                          // two flyouts never flashes the old one at its
                          // static position during the fade-out.
                          active
                            ? { top: flyoutForChild.top }
                            : { top: -9999 }
                        }
                        onMouseEnter={clearFlyoutTimer}
                        onMouseLeave={() => closeFlyout()}
                        onKeyDown={(event) => {
                          if (event.key === "Tab" && event.shiftKey) {
                            const links = Array.from(
                              event.currentTarget.querySelectorAll<HTMLAnchorElement>(
                                "a"
                              )
                            );
                            if (links[0] === event.target) {
                              event.preventDefault();
                              childElRef.current?.focus();
                            }
                          }
                        }}
                        className={cn(
                          "absolute z-30 w-56 transition duration-150 ease-out",
                          flyoutForChild?.side === "left"
                            ? "right-full origin-top-right pr-2"
                            : "left-full origin-top-left pl-2",
                          active
                            ? "visible translate-y-0 opacity-100"
                            : "pointer-events-none invisible -translate-y-1 opacity-0"
                        )}
                      >
                        <ul
                          aria-label={`${child.label} submenu`}
                          className="rounded-2xl border border-border bg-popover p-1.5 shadow-2xl shadow-black/25 ring-1 ring-black/5"
                        >
                          {child.children?.map((sub) => {
                            const subIsActive =
                              sub.href !== child.href &&
                              isRouteActive(pathname, sub.href);

                            return (
                              <li key={sub.label}>
                                <Link
                                  href={sub.href}
                                  onClick={handleNavigate}
                                  className={cn(
                                    "block rounded-lg px-3 py-2 text-sm leading-snug transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    subIsActive
                                      ? "font-semibold text-primary"
                                      : "text-foreground"
                                  )}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
