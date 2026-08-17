/**
 * Template-derived project content (Phase 14).
 *
 * IMPORTANT: This is curated presentation data taken from the template/ PDF
 * mockups so the public site matches the design reference. The backend's
 * GET /projects API currently requires authentication and is not yet public;
 * when a public projects API exists, this module should be replaced by typed
 * API data (see src/lib/api). Nothing here pretends to be live backend data.
 */

export interface Project {
  /** Stable id used for routing/filters. */
  slug: string;
  name: string;
  /** Category label used by the Projects page filter. */
  category: "Sasta Khana Project" | "Free Schooling System" | "Health Care Services" | "Hunarmand Beti Project" | "Qurbani Barae Waqaf" | "Free Eid Shopping";
  stat: string;
  statLabel: string;
  /** Short summary shown on the card. */
  summary: string;
  /** Longer field description shown on the Projects page. */
  description: string;
  /** Aspect ratio hint for the future Cloudinary image. */
  imageAspect?: "wide" | "square";
}

export const PROJECTS: readonly Project[] = [
  {
    slug: "sasta-khana",
    name: "Sasta Khana Project",
    category: "Sasta Khana Project",
    stat: "1,200+",
    statLabel: "meals served daily",
    summary:
      "Affordable, hygienic meals for daily wage workers and families struggling to afford basic food.",
    description:
      "A subsidised kitchen serving freshly cooked, hygienic meals every day so that no worker in Orangi Town has to choose between transport fare and dinner.",
  },
  {
    slug: "free-schooling",
    name: "Free Schooling System",
    category: "Free Schooling System",
    stat: "800+",
    statLabel: "children enrolled",
    summary:
      "Quality education for underprivileged children with free books, uniforms and a safe learning environment.",
    description:
      "Full scholarships covering fees, books, uniforms and stationery, taught by trained teachers in classrooms built for focus and dignity.",
  },
  {
    slug: "health-care",
    name: "Health Care Services",
    category: "Health Care Services",
    stat: "6,000+",
    statLabel: "patients treated",
    summary:
      "Free medical camps, doctor consultations and medicines for those with no access to basic healthcare.",
    description:
      "Our healthcare centre runs low-cost OPD services, free medicine dispensing and regular community camps for screening and treatment.",
  },
  {
    slug: "hunarmand-beti",
    name: "Hunarmand Beti Project",
    category: "Hunarmand Beti Project",
    stat: "450+",
    statLabel: "girls trained",
    summary:
      "Skill building for young girls through vocational training so they can earn with dignity.",
    description:
      "Stitching, beautician, mehndi and computer courses that turn a few months of training into lifelong financial independence.",
  },
  {
    slug: "qurbani-barae-waqaf",
    name: "Qurbani Barae Waqaf",
    category: "Qurbani Barae Waqaf",
    stat: "3,000+",
    statLabel: "families reached",
    summary:
      "Collective Qurbani supporting orphans, widows and madrassas through meat distribution on Eid.",
    description:
      "Transparent, supervised Qurbani with fresh meat distributed the same day to families who rarely see protein on their table.",
  },
  {
    slug: "free-eid-shopping",
    name: "Free Eid Shopping",
    category: "Free Eid Shopping",
    stat: "2,500+",
    statLabel: "children hosted",
    summary:
      "New clothes, shoes and gifts for children and families who can't afford Eid celebrations.",
    description:
      "Children pick their own outfit from a real shop floor, because the joy of choosing matters as much as the gift itself.",
  },
] as const;
