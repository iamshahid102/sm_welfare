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

/**
 * Ambulance Services page banner — moved from the root `AMBULANCE_BANNER.jpg`
 * (1920×1080), the same banner the live `/ambulance-services/` page renders as
 * the first element of its content with `fetchpriority="high"`.
 */
export const AMBULANCE_BANNER: SiteImage = {
  src: "/images/ambulance-banner.jpg",
  alt: "Ambulance Services banner — Sirat-e-Mustaqeem Welfare Trust",
  width: 1920,
  height: 1080,
};

/**
 * Heat Stroke Camp page image — moved from the root `heat-stoke.jpg`
 * (1600×900, filename corrected while moving), the client-provided photo for
 * the Heat Stroke Camp page.
 */
export const HEAT_STROKE_CAMP: SiteImage = {
  src: "/images/heat-stroke-camp.jpg",
  alt: "Heat Stroke Camp — Sirat-e-Mustaqeem Welfare Trust providing cold water and first aid in Orangi Town, Karachi",
  width: 1600,
  height: 900,
};

/**
 * Sirat ul Quran Academy page image — moved from the root
 * `sirat-ul-quran-academy.jpg` (1600×900), the client-provided photo for the
 * Sirat ul Quran Academy (Taleem e Baligaat) page.
 */
export const SIRAT_UL_QURAN_ACADEMY: SiteImage = {
  src: "/images/sirat-ul-quran-academy.jpg",
  alt: "Sirat ul Quran Academy — children learning the Holy Quran with Tajweed in Orangi Town, Karachi",
  width: 1600,
  height: 900,
};

/**
 * Iftaar Dastarkhawan page image — moved from the root `ramadan iftar.jpg`
 * (960×1280, filename slugified while moving), the client-provided photo for
 * the Ramadan Iftar Dastarkhawan page. Portrait 3:4, matching the live page's
 * own featured image ratio (768×1024).
 */
export const IFTAAR_DASTARKHWAN: SiteImage = {
  src: "/images/iftaar-dastarkhawan.jpg",
  alt: "Ramadan Iftar Dastarkhawan — Sirat-e-Mustaqeem Welfare Trust serving iftar to deserving families",
  width: 960,
  height: 1280,
};

/**
 * Monthly Raashan Support Program page image — moved from the root
 * `Rashan_Distribution.jpg` (1920×1080, filename slugified while moving), the
 * client-provided photo for the Monthly Raashan Support Program page.
 */
export const MONTHLY_RAASHAN_SUPPORT: SiteImage = {
  src: "/images/monthly-raashan-support.jpg",
  alt: "Monthly Raashan Support Program — ration packages being distributed to deserving families by Sirat-e-Mustaqeem Welfare Trust in Orangi Town, Karachi",
  width: 1920,
  height: 1080,
};

/**
 * Rozgar Project page image — moved from the root `rozgar-projects.jpg`
 * (1600×900, filename singularised while moving to match the page slug), the
 * client-provided photo for the Rozgar Project page.
 */
export const ROZGAR_PROJECT: SiteImage = {
  src: "/images/rozgar-project.jpg",
  alt: "Rozgar Project — a beneficiary earning a dignified living from a fruit and vegetable cart provided by Sirat-e-Mustaqeem Welfare Trust",
  width: 1600,
  height: 900,
};

/**
 * Marriage Support Program page image — moved from the root
 * `marriage-support.jpg` (1024×684, kept at its original filename), the
 * client-provided photo for the Marriage Support Program page.
 */
export const MARRIAGE_SUPPORT: SiteImage = {
  src: "/images/marriage-support.jpg",
  alt: "Marriage Support Program — a daughter's wedding arranged with dignity by Sirat-e-Mustaqeem Welfare Trust",
  width: 1024,
  height: 684,
};

/**
 * Free Eid Shopping page image — moved from the root `free-eid-shopping.jpg`
 * (1600×900, kept at its original filename), the client-provided photo for
 * the Free Eid Shopping page.
 */
export const FREE_EID_SHOPPING: SiteImage = {
  src: "/images/free-eid-shopping.jpg",
  alt: "Free Eid Shopping — families choosing Eid clothes, shoes and gifts for just Rs. 10 at a Sirat-e-Mustaqeem Welfare Trust event",
  width: 1600,
  height: 900,
};

/**
 * Flood Relief Mission page image — moved from the root
 * `flood-relief-mission.jpg` (1600×900, kept at its original filename), the
 * client-provided photo for the Flood Relief Mission page.
 */
export const FLOOD_RELIEF_MISSION: SiteImage = {
  src: "/images/flood-relief-mission.jpg",
  alt: "Flood Relief Mission — volunteers delivering food rations, tents and clean drinking water to flood-affected families in Pakistan",
  width: 1600,
  height: 900,
};

/**
 * Home & Masjid Renovation page image — moved from the root `masjid.jpg`
 * (745×500, kept at its original filename), the client-provided photo for the
 * Home & Masjid Renovation page.
 */
export const HOME_MASJID_RENOVATION: SiteImage = {
  src: "/images/masjid.jpg",
  alt: "Home & Masjid Renovation — a repaired and rebuilt home alongside a renovated mosque in Karachi by Sirat-e-Mustaqeem Welfare Trust",
  width: 745,
  height: 500,
};

/**
 * Qurbani Barae Waqaf page image — moved from the root `qurbani barae
 * waqaf.jpg` (1600×900, filename slugified while moving), the client-provided
 * photo for the Qurbani Barae Waqaf page.
 */
export const QURBANI_BARAE_WAQAF: SiteImage = {
  src: "/images/qurbani-barae-waqaf.jpg",
  alt: "Qurbani Barae Waqaf — Waqf Qurbani meat packed and delivered door-to-door to deserving families in Orangi Town, Karachi",
  width: 1600,
  height: 900,
};

/**
 * Tree for Tomorrow (Plantation Campaign) page image — moved from the root
 * `tree-for-tomorrow.jpg` (1600×900, kept at its original filename), the
 * client-provided photo for the Tree for Tomorrow page.
 */
export const TREE_FOR_TOMORROW: SiteImage = {
  src: "/images/tree-for-tomorrow.jpg",
  alt: "Tree for Tomorrow plantation campaign — saplings planted by Sirat-e-Mustaqeem Welfare Trust volunteers in Karachi",
  width: 1600,
  height: 900,
};

/**
 * Winter Relief page image — moved from the root `winter-relief.jpg`
 * (1280×960, kept at its original filename), the client-provided photo for
 * the Winter Relief page.
 */
export const WINTER_RELIEF: SiteImage = {
  src: "/images/winter-relief.jpg",
  alt: "Winter Relief 2025 — blankets and warm clothing distributed to families facing the cold season by Sirat-e-Mustaqeem Welfare Trust",
  width: 1280,
  height: 960,
};

/**
 * Payment-provider marks on the Donate page — the two logos the live /donate/
 * page renders beside its details (Faysal Bank above the account details,
 * EasyPaisa above the wallet number), fetched from the live site's own uploads
 * so no brand mark is redrawn by hand. `alt` names the provider, matching how
 * the live page uses them.
 */
export const FAYSAL_BANK_LOGO: SiteImage = {
  src: "/images/faysal-bank-logo.png",
  alt: "Faysal Bank",
  width: 1024,
  height: 264,
};

export const EASYPAISA_LOGO: SiteImage = {
  src: "/images/easypaisa-logo.png",
  alt: "EasyPaisa",
  width: 300,
  height: 300,
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
 * The six posts the live /blog/ archive lists, in the live order (WordPress
 * REST: /wp-json/wp/v2/posts). Titles are the live posts' own titles in the
 * title case this file already used, and every summary is the post's own
 * excerpt — the `[…]` marker the live archive appends to truncated excerpts is
 * dropped, nothing else is changed.
 *
 * IMAGERY: every post now carries its real photo. Four come from the client's
 * photo set — `we-prayed-for-ayatollah-khomeini.jpg` (1500×1500, the dua
 * social-media post), `a-story-of-healing.jpg` (864×1536),
 * `installing-water-hand-pumps.jpg` (1280×960) and
 * `serving-flood-effective-punjab.jpg` (1280×960) — while the iftar and winter
 * posts reuse the photos already on the site for those pages
 * (`iftaar-dastarkhawan.jpg`, 960×1280 and `winter-relief.jpg`, 1280×960).
 * `imageAspect` picks the tile each photo is framed in: portrait and square
 * shots get the square tile, landscape shots the 16:9 tile, so a photo is
 * never squashed — only cropped to its tile.
 *
 * SOURCE NOTES: the live flood post's route reads "effective" where the post
 * means "affected"; the slug keeps the live spelling for URL parity and the
 * visible title uses "Affected", as this file already did. The live winter
 * post's slug carries the source's "releif" spelling, preserved for the same
 * reason while the visible title is normalised.
 */
export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  summary?: string;
  /** Curated local photo for the post. */
  image?: SiteImage;
  /** Tile the photo is framed in on the Media page. */
  imageAspect?: "wide" | "square";
}

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: "we-prayed-for-ayatollah-khomeini",
    title: "We Prayed for Ayatollah Khomeini",
    category: "Blog",
    summary:
      "Today at Sirat e Mustaqeem Welfare Trust, during our Iftar Dastarkhawan, we expressed solidarity and offered special prayers for the strength, safety, and guidance of Muslim leadership and for the unity of the Ummah. Our volunteers stood together in remembrance of those who strive for the dignity of Islam and the protection of Muslim communities.",
    image: {
      src: "/images/we-prayed-for-ayatollah-khomeini.jpg",
      alt: "Iftar Dastarkhawan gathering where SM Welfare Trust offered special prayers for the guidance of Muslim leadership and the unity of the Ummah",
      width: 1500,
      height: 1500,
    },
    imageAspect: "square",
  },
  {
    slug: "ramadan-iftar-dastarkhawan",
    title: "Ramadan Iftar Dastarkhawan",
    category: "Blog",
    summary:
      "Sirat-e-Mustaqeem Welfare Trust is hosting daily Iftar gatherings for hundreds of deserving families. Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.",
    image: {
      src: "/images/iftaar-dastarkhawan.jpg",
      alt: "Ramadan Iftar Dastarkhawan — daily Iftar gatherings for hundreds of deserving families",
      width: 960,
      height: 1280,
    },
    imageAspect: "square",
  },
  {
    slug: "a-story-of-healing-dreams-and-a-brighter-future",
    title: "A Story of Healing, Dreams, and a Brighter Future",
    category: "Blog",
    summary:
      "We've shared a heartfelt video highlighting the journey of free education and big dreams for a brighter tomorrow.",
    image: {
      src: "/images/a-story-of-healing.jpg",
      alt: "A story of healing, dreams and a brighter future — the journey of free education supported by SM Welfare Trust",
      width: 864,
      height: 1536,
    },
    imageAspect: "square",
  },
  {
    slug: "winter-releif-2025-in-collaboration-with-alamgir-welfare-trust",
    title: "Winter Relief 2025 in Collaboration with Alamgir Welfare Trust",
    category: "Blog",
    image: {
      src: "/images/winter-relief.jpg",
      alt: "Winter Relief 2025 in collaboration with Alamgir Welfare Trust — blankets and warm clothing for families facing the cold season",
      width: 1280,
      height: 960,
    },
    imageAspect: "wide",
  },
  {
    slug: "installing-water-hand-pumps",
    title: "Installing Water Hand Pumps",
    category: "Blog",
    image: {
      src: "/images/installing-water-hand-pumps.jpg",
      alt: "Installing water hand pumps to bring clean drinking water to underserved communities in Karachi",
      width: 1280,
      height: 960,
    },
    imageAspect: "wide",
  },
  {
    slug: "serving-flood-effective-punjab",
    title: "Serving Flood Affected Punjab",
    category: "Blog",
    summary:
      "Arranged this mega free medical camp, more than 300 patients got treated.",
    image: {
      src: "/images/serving-flood-effective-punjab.jpg",
      alt: "Serving flood affected Punjab — a free medical camp where more than 300 patients were treated",
      width: 1280,
      height: 960,
    },
    imageAspect: "wide",
  },
];
