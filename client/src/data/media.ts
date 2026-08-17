/**
 * Template-derived media update content (Phase 14).
 *
 * Presentation data from the template/ Media PDF mockup. Will be replaced by
 * typed API data when a public media API exists — see src/lib/api.
 */

export interface MediaCategory {
  label: string;
}

export const MEDIA_CATEGORIES: readonly MediaCategory[] = [
  { label: "All" },
  { label: "Community" },
  { label: "Skills" },
  { label: "Health" },
  { label: "Events" },
  { label: "Insight" },
  { label: "Education" },
] as const;

export interface MediaUpdate {
  slug: string;
  category: Exclude<MediaCategory["label"], "All">;
  title: string;
  summary: string;
  /** Aspect ratio of the future Cloudinary image. */
  imageAspect: "wide" | "square";
}

export const MEDIA_UPDATES: readonly MediaUpdate[] = [
  {
    slug: "transforming-lives-in-orangi-town",
    category: "Community",
    title: "Transforming Lives in Orangi Town",
    summary:
      "Grassroots work across education, healthcare and livelihood support, focused on sustainable change that lets families live with dignity and self-reliance.",
    imageAspect: "wide",
  },
  {
    slug: "empowering-women-through-vocational-training",
    category: "Skills",
    title: "Empowering Women through Vocational Training",
    summary:
      "The Hunarmand Beti centre teaches stitching, beautician skills, mehndi and basic computing so women can build a confident, independent future.",
    imageAspect: "wide",
  },
  {
    slug: "affordable-healthcare-for-all",
    category: "Health",
    title: "Affordable Healthcare for All",
    summary:
      "Low-cost and free OPD services, essential medicines and basic care so financial hardship never blocks treatment.",
    imageAspect: "wide",
  },
  {
    slug: "independence-day-with-purpose",
    category: "Events",
    title: "Independence Day with Purpose",
    summary:
      "We mark the day by serving children and deserving families through educational activities, gifts and community programmes.",
    imageAspect: "square",
  },
  {
    slug: "the-role-of-welfare-work",
    category: "Insight",
    title: "The Role of Welfare Work",
    summary:
      "A commitment to transparency, integrity and consistent effort that creates long-term social impact at community level.",
    imageAspect: "square",
  },
  {
    slug: "bridging-gaps-in-education",
    category: "Education",
    title: "Bridging Gaps in Education",
    summary:
      "Reducing educational inequality with free quality schooling, academic support and moral development.",
    imageAspect: "square",
  },
] as const;
