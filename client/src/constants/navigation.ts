/**
 * Single source of truth for the public site navigation.
 * Used by the desktop header, the mobile sheet and the footer's useful links.
 *
 * STRUCTURE MIRRORS THE LIVE SITE
 * The menu labels and hierarchy are copied from the live navbar at
 * https://smwelfare.charity so the rebuild stays consistent with the site it
 * replaces. The live site runs WordPress, so most of its links point at pages
 * that cannot exist here — taxonomy archives (`/category/...`), Elementor page
 * IDs (`/elementor-4435/`) and duplicate-slug pages (`/health-care-services-2/`).
 *
 * FALLBACK HREFS
 * Until those pages are built, each such item points at the section page it
 * belongs to (`/projects`, `/forms`, `/about`) so no link in the menu 404s.
 * The original live URL is kept beside it in a `live:` comment — when a real
 * page ships, move the item's href onto it and drop the comment.
 *
 * Note: several items therefore share one href. React keys use `label` (unique
 * per menu) and the active-link logic skips fallback items for this reason.
 */

export interface NavItem {
  label: string;
  href: string;
  /** Optional dropdown items */
  children?: readonly NavItem[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "Founder's Profile", href: "/founders-profile" },
      { label: "Our Mission", href: "/our-mission" },
    ],
  },
  {
    label: "Projects",
    href: "/projects",
    children: [
      { label: "Hunarmand Beti Project", href: "/hunarmand-beti-project" },
      { label: "Free Schooling System", href: "/free-schooling-system" },
      {
        label: "Health Care Services",
        href: "/health-care-services", // live: /health-care-services-2/
        children: [
          { label: "Ambulance Services", href: "/ambulance-services" },
          { label: "Heat Stroke Camp", href: "/heat-stroke-camp" },
        ],
      },
      {
        label: "Sirat ul Quran Academy (Taleem e Baligaat)",
        href: "/sirat-ul-quran-academy",
      },
      {
        label: "Sasta Khana Project",
        href: "/sasta-khana-project", // live: /category/sasta-khana-project/
        children: [
          { label: "Iftaar Dastarkhawan", href: "/iftaar-dastarkhawan" },
          { label: "Monthly Raashan Support Program", href: "/monthly-raashan-support-program" },
          { label: "Rehmat-e-Ramadan Rashan Program", href: "/projects" }, // live: /category/rehmat-e-ramadan-rashan-program/
        ],
      },
      { label: "Rozgar Project", href: "/rozgar-project" },
      { label: "Marriage Support Program", href: "/marriage-support-program" },
      { label: "Free Eid Shopping", href: "/free-eid-shopping" },
      { label: "Flood Relief Mission", href: "/flood-relief-mission" },
      { label: "Home & Masjid Renovation", href: "/home-masjid-renovation" },
      { label: "Qurbani Barae Waqaf", href: "/qurbani-barae-waqaf" },
      { label: "Tree for Tomorrow (Plantation Compaign)", href: "/tree-for-tomorrow-plantation-compaign" },
      { label: "Winter Relief", href: "/winter-relief" },
    ],
  },
  { label: "Media", href: "/media" }, // live: /blog/
  // { label: "Donate", href: "/donate" },
  // Plain link on purpose — every live form lives on the single /forms page,
  // so a dropdown listing five identical destinations was pure noise. The page
  // itself lists each form. (No `children`, so the desktop nav renders a plain
  // trigger and the mobile sheet a plain row.)
  { label: "Forms", href: "/forms" },
  { label: "Contact Us", href: "/contact" }, // live: /contact-us/
] as const;

/** Primary call-to-action used across header/footer. */
export const DONATE_HREF = "/donate";
