/**
 * Template-derived program/impact content (Phase 14).
 *
 * "Programmes" here are the six areas of focus shown in the About PDF
 * ("What we do") and the Home page chip row. Presentation data from the
 * template mockups; replace with typed API data when a public API exists.
 */

export interface Program {
  /** Order shown in the About "What we do" numbered list (01-06). */
  number: string;
  name: string;
  description: string;
}

export const PROGRAMS: readonly Program[] = [
  {
    number: "01",
    name: "Food Distribution",
    description:
      "Ration packs and cooked meals delivered to underprivileged families so no one sleeps hungry.",
  },
  {
    number: "02",
    name: "Education Support",
    description:
      "School fees, books, uniforms and supplies sponsored for orphans and needy children.",
  },
  {
    number: "03",
    name: "Medical Assistance",
    description:
      "Free camps, medicines and treatment for patients who cannot afford basic healthcare.",
  },
  {
    number: "04",
    name: "Clean Water Projects",
    description:
      "Hand pumps and water coolers installed in remote villages with no safe drinking water.",
  },
  {
    number: "05",
    name: "Widow & Orphan Support",
    description:
      "Monthly stipends and essentials for widows and orphans with no other support.",
  },
  {
    number: "06",
    name: "Seasonal Drives",
    description:
      "Ramadan ration, winter clothing and Eid campaigns reaching thousands every year.",
  },
] as const;

/** Home page hero + stats band numbers (from the Home PDF). */
export const IMPACT_STATS = [
  { value: "1,200+", label: "Daily meals served" },
  { value: "900+", label: "Monthly ration support" },
  { value: "800+", label: "Students in education" },
  { value: "500+", label: "Monthly medical cases" },
] as const;

/** Mission section list (Home PDF, "Our mission"). */
export const MISSION_AREAS = [
  {
    title: "Food Distribution",
    description:
      "Ration packs and cooked meals delivered to underprivileged families so no one sleeps hungry.",
  },
  {
    title: "Education Support",
    description:
      "School fees, books, uniforms and supplies sponsored for orphans and needy children.",
  },
  {
    title: "Medical Assistance",
    description:
      "Free camps, medicines and treatment for patients who cannot afford basic healthcare.",
  },
] as const;
