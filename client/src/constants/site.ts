/**
 * Organization-wide constants.
 *
 * Single source of truth for public organization information so it is never
 * duplicated across components. Values mirror the template/ design references.
 *
 * NOTE: In a future phase these may be hydrated from the Site Settings API
 * (GET /site-settings). Until then these are the curated defaults.
 */

export const SITE = {
  name: "SM Welfare Trust",
  legalName: "Sirat-e-Mustaqeem Welfare Trust",
  /** Compact legal name used under the wordmark (template header style). */
  legalShortName: "Sirat-e-Mustaqeem",
  tagline: "Charity efforts that are for happiness",
  establishedYear: 2017,
  location: "Orangi Town, Karachi, Pakistan",
  /** Full postal address as printed in the live site footer (Contact Info). */
  address:
    "Orangi Town Liaquat chowk, Gulshan e Zia, House 2772 Street 1 SECT -:11 1/2, 1st St E, Karachi, Pakistan",
  email: "smwelfaretrust@gmail.com",
  phone: "+92 315 2616482",
  /** Second contact number from the live footer (Contact Info). */
  phone2: "+92 300 2743222",
  /** Shown in the footer: status line under the org description. */
  registrationNote: "Registered welfare trust — Karachi, Pakistan",
  /** Number of active projects (13 main projects on the live site). */
  activeProjects: 13,
  /** Footer copyright year is resolved at render time from this value. */
  copyrightHolder: "Sirat-e-Mustaqeem Welfare Trust",
} as const;

export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "youtube";

export const SOCIAL_LINKS: ReadonlyArray<{
  platform: SocialPlatform;
  label: string;
  href: string;
}> = [
  { platform: "facebook", label: "Facebook", href: "https://www.facebook.com/smwelfare.charity" },
  { platform: "youtube", label: "YouTube", href: "https://www.youtube.com/@SMWelfareTrust" },
  { platform: "instagram", label: "Instagram", href: "https://www.instagram.com/smwelfaretrust" },
  { platform: "linkedin", label: "LinkedIn", href: "https://pk.linkedin.com/in/sm-welfare-trust-854392282" },
];
