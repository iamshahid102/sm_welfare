/**
 * Single source of truth for the public site navigation.
 * Used by both the desktop header navigation and the mobile sheet.
 */

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Media", href: "/media" },
  { label: "Contact", href: "/contact" },
] as const;

/** Primary call-to-action used across header/footer. */
export const DONATE_HREF = "/donate";
