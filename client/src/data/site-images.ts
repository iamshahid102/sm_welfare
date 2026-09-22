/**
 * Curated site imagery.
 *
 * PROVENANCE
 * Every file in `public/images` was derived from the client's own photo set
 * and is byte-verified against the page it belongs to on the live site
 * (smwelfare.charity). The project images are exactly the six photos the live
 * "Our Project" grid renders, and the story images are exactly the six photos
 * the live "Media Updates" row renders — matched by hashing the live image
 * URLs against the source files, not by guessing from filenames.
 *
 * WHY THIS FILE EXISTS
 * The public API contract (see types/public-api.ts) has no image field on
 * projects, and media images live in Cloudinary. Until the CMS has imagery,
 * these verified local assets keep every image slot on the public site filled
 * with real photographs instead of grey placeholders. API data always wins
 * where it exists — nothing here overrides backend content.
 *
 * SWAPPING AN IMAGE
 * Replace the file in `public/images` (keep the name) or point the entry at a
 * new path. `width`/`height` are the intrinsic size of the file on disk, which
 * is what next/image needs to reserve layout space.
 */

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Home hero banner — byte-identical copy (MD5-verified) of the designed
 * homepage artwork the live site uses as its hero background
 * (`web-homepageiamge-1.jpg`, 1920×1080). The artwork carries its own
 * headline/graphics, so the hero renders it with an empty `alt` and keeps the
 * page semantics in the sr-only `h1` + link label.
 */
export const HERO_IMAGE: SiteImage = {
  src: "/images/hero-homepage-banner.jpg",
  alt: "",
  width: 1920,
  height: 1080,
};

/** Used for the About page "Our story" column. */
export const ABOUT_IMAGE: SiteImage = {
  src: "/images/story-empowering-women-vocational-training.jpg",
  alt: "Women learning vocational skills at a SM Welfare Trust training session in Karachi",
  width: 1000,
  height: 614,
};

/**
 * Project imagery keyed by match tokens rather than by exact slug, so the right
 * photo still attaches when the backend slug differs from the template slug
 * (e.g. "health-care-services-2" or "hunarmand-beti-project"). The combined
 * slug + title is matched case-insensitively.
 *
 * ORDER MATTERS: the first entry whose token appears wins, so put the more
 * specific tokens first ("free schooling" before "schooling", "sasta khana"
 * before "food").
 */
const PROJECT_IMAGE_MATCHERS: ReadonlyArray<{
  image: SiteImage;
  match: readonly string[];
}> = [
  {
    match: ["sasta khana", "sasta-khana"],
    image: {
      src: "/images/project-sasta-khana.jpg",
      alt: "Subsidised daily meals prepared for the Sasta Khana Project kitchen in Orangi Town",
      width: 1000,
      height: 563,
    },
  },
  {
    match: ["free schooling", "free-schooling", "schooling", "school"],
    image: {
      src: "/images/project-free-schooling.jpg",
      alt: "Children studying in a classroom supported by the Free Schooling System",
      width: 1000,
      height: 563,
    },
  },
  {
    match: ["health", "medical", "clinic", "ambulance"],
    image: {
      src: "/images/project-health-care.jpg",
      alt: "Medical camp staff treating patients at a SM Welfare Trust health care service",
      width: 1000,
      height: 563,
    },
  },
  {
    match: ["hunarmand", "vocational", "skill", "training"],
    image: {
      src: "/images/project-hunarmand-beti.jpg",
      alt: "Young women learning stitching and tailoring at the Hunarmand Beti Project",
      width: 1000,
      height: 563,
    },
  },
  {
    match: ["qurbani", "waqaf"],
    image: {
      src: "/images/project-qurbani-barae-waqaf.jpg",
      alt: "Supervised Qurbani meat being packed for distribution to families in Karachi",
      width: 1000,
      height: 563,
    },
  },
  {
    match: ["eid"],
    image: {
      src: "/images/project-free-eid-shopping.jpg",
      alt: "Children choosing new clothes at the Free Eid Shopping event",
      width: 1000,
      height: 563,
    },
  },
];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Resolve the curated photo for a project. Returns `undefined` when nothing
 * matches, which lets callers fall back to the placeholder treatment instead of
 * rendering an unrelated picture.
 */
export function resolveProjectImage(project: {
  slug?: string;
  title?: string;
  name?: string;
}): SiteImage | undefined {
  const haystack = normalize(
    [project.slug, project.title, project.name].filter(Boolean).join(" ")
  );
  if (!haystack) return undefined;

  for (const entry of PROJECT_IMAGE_MATCHERS) {
    if (entry.match.some((token) => haystack.includes(normalize(token)))) {
      return entry.image;
    }
  }
  return undefined;
}

// ─── Field stories (home "Stories from the field" + Media page) ────────

export interface StoryHighlight {
  slug: string;
  title: string;
  /** Short label shown as the card badge. */
  category: string;
  /** Excerpt shown on the card — copied from the live homepage. */
  summary: string;
  image: SiteImage;
}

/**
 * The six updates the live site features in its "Media Updates" row, in the
 * same order. Titles and excerpts are reproduced from the live homepage;
 * category labels are derived from the titles.
 */
export const STORY_HIGHLIGHTS: readonly StoryHighlight[] = [
  {
    slug: "transforming-lives-in-orangi-town",
    title: "Transforming Lives in Orangi Town",
    category: "Field report",
    summary:
      "Sirat-e-Mustaqeem Welfare Trust is working at the grassroots level in Orangi Town to uplift underprivileged communities. Through education, healthcare, and livelihood support, we focus on creating sustainable change that enables families to live with dignity and self-reliance.",
    image: {
      src: "/images/story-transforming-lives-orangi-town.jpg",
      alt: "SM Welfare Trust team on the ground with families in Orangi Town, Karachi",
      width: 827,
      height: 500,
    },
  },
  {
    slug: "empowering-women-through-vocational-training",
    title: "Empowering Women through Vocational Training",
    category: "Vocational training",
    summary:
      "Through the Hunarmand Beti Vocational Training Center, we provide women and girls with practical skills such as stitching, beautician training, mehndi, and basic computer education. These skills help them achieve financial independence and build a confident future.",
    image: {
      src: "/images/story-empowering-women-vocational-training.jpg",
      alt: "Women practising tailoring skills during a vocational training session",
      width: 1000,
      height: 614,
    },
  },
  {
    slug: "affordable-healthcare-for-all",
    title: "Affordable Healthcare for All",
    category: "Healthcare",
    summary:
      "Our Healthcare Center offers low-cost and free medical services to those who cannot afford treatment. By providing OPD services, essential medicines, and basic healthcare, we ensure that no one is deprived of medical care due to financial hardship.",
    image: {
      src: "/images/story-affordable-healthcare.jpg",
      alt: "Patients being examined at a SM Welfare Trust medical support drive",
      width: 1000,
      height: 637,
    },
  },
  {
    slug: "independence-day-with-purpose",
    title: "Independence Day with Purpose",
    category: "Community event",
    summary:
      "For us, Independence Day is more than a celebration, it is a reminder of responsibility. We mark this day by serving children and deserving families through educational activities, gifts, and community programs that reflect the true spirit of freedom.",
    image: {
      src: "/images/story-independence-day.jpg",
      alt: "Independence Day celebration organised by SM Welfare Trust volunteers",
      width: 1000,
      height: 602,
    },
  },
  {
    slug: "the-role-of-welfare-work",
    title: "The Role of Welfare Work",
    category: "Awareness",
    summary:
      "Welfare work plays a vital role in building a compassionate and balanced society. Sirat-e-Mustaqeem Welfare Trust is committed to transparency, integrity, and consistent efforts that create long-term social impact at the community level.",
    image: {
      src: "/images/story-role-of-welfare-work.jpg",
      alt: "Volunteers speaking about the role of welfare work in the community",
      width: 1000,
      height: 569,
    },
  },
  {
    slug: "we-are-bridging-gaps-in-education",
    title: "We are Bridging Gaps in Education",
    category: "Education",
    summary:
      "Sirat-e-Mustaqeem Welfare Trust is dedicated to reducing educational inequality by providing free and quality education. Through academic support, moral development, and learning opportunities, we help children move toward a brighter and more secure future.",
    image: {
      src: "/images/story-bridging-gaps-in-education.jpg",
      alt: "Students supported by the SM Welfare Trust education programme",
      width: 960,
      height: 566,
    },
  },
];

// ─── Live /blog/ archive posts (Media page) ───────────────────────────

/**
 * The six posts the live /blog/ archive lists. Their WordPress thumbnails
 * are not part of the provided photo set, so these render on the designed
 * placeholder frame instead of an unrelated photograph.
 */
export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  summary?: string;
}

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: "we-prayed-for-ayatollah-khomeini",
    title: "We Prayed for Ayatollah Khomeini",
    category: "Blog",
    summary:
      "Today at Sirat e Mustaqeem Welfare Trust, during our Iftar Dastarkhawan, we expressed solidarity and offered special prayers for the strength, safety, and guidance of Muslim leadership and for the unity of the Ummah.",
  },
  {
    slug: "ramadan-iftar-dastarkhawan",
    title: "Ramadan Iftar Dastarkhawan",
    category: "Blog",
    summary:
      "Sirat-e-Mustaqeem Welfare Trust is hosting daily Iftar gatherings for hundreds of deserving families. Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.",
  },
  {
    slug: "a-story-of-healing-dreams",
    title: "A Story of Healing, Dreams, and a Brighter Future",
    category: "Blog",
    summary:
      "We've shared a heartfelt video highlighting the journey of free education and big dreams for a brighter tomorrow.",
  },
  {
    slug: "winter-relief-2025",
    title: "Winter Relief 2025 in Collaboration with Alamgir Welfare Trust",
    category: "Blog",
  },
  {
    slug: "installing-water-hand-pumps",
    title: "Installing Water Hand Pumps",
    category: "Blog",
  },
  {
    slug: "serving-flood-affected-punjab",
    title: "Serving Flood Affected Punjab",
    category: "Blog",
    summary:
      "Arranged this mega free medical camp, more than 300 patients got treated.",
  },
];
