/**
 * CMS seed content — reproduced from the live site (smwelfare.charity).
 *
 * This is the server-side copy of the structured content the public API
 * serves (GET /public/programs, /public/projects, /public/site-settings).
 * Text is identical to the curated client fallback in
 * `client/src/data/projects.ts`, so the site renders the same content
 * whether it is served by the API or the static fallback.
 *
 * STRUCTURE
 * The live site's navbar lists 13 main projects; sub-pages (Ambulance,
 * Heat Stroke, Iftaar Dastarkhawan, Monthly Raashan) hang off their parent
 * programmes. That maps onto the Program → Project model as:
 *   Program = one of the 13 main live-site projects (badge/filter parent)
 *   Project = the 17 live project pages (13 mains + 4 sub-projects)
 * Programme titles equal the client's `category` labels, so API-driven card
 * badges render identically to the static fallback.
 *
 * Every string below is copied verbatim from the live pages; the counters
 * and homepage-only copy live client-side (they are not part of the API
 * contract). Media is deliberately absent: media documents require real
 * Cloudinary assets and an uploading user, so images are uploaded through
 * the admin panel instead (the client falls back to the byte-verified local
 * photos until then).
 */

export interface SeedProgram {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  /** Key into PAGE_CONTENT (defaults to `slug`). */
  page?: string;
}

export interface SeedProject {
  /** Slug of the parent programme (must exist in SEED_PROGRAMS). */
  programSlug: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  displayOrder: number;
  /** Key into PAGE_CONTENT (defaults to `slug`). */
  page?: string;
}

export interface SeedSiteSettings {
  organizationName: string;
  tagline: string;
  description: string;
  contact: { email: string; phone: string; address: string };
  socialLinks: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    website: string;
  };
  footer: { shortDescription: string; copyrightText: string };
}

/**
 * The 13 main projects from the live navbar, in live-nav order.
 * shortDescription/description reuse the flagship project's copy so the
 * programme entry and its landing content stay identical.
 */
export const SEED_PROGRAMS: readonly SeedProgram[] = [
  {
    title: 'Hunarmand Beti Project',
    slug: 'hunarmand-beti-project',
    shortDescription:
      'Skill building for young girls through vocational training to help them earn.',
    description:
      'Skilled Girls, A Promise for a Brighter Future! In Pakistan nearly 75% of women lack vocational training or practical skills. The Sirat-e-Mustaqeem Vocational Training Center in Orangi Town, Liaquat Chowk trains underprivileged girls in henna application, sewing and beautician courses at affordable fees, so they can earn a respectable livelihood with dignity.',
    displayOrder: 1,
  },
  {
    title: 'Free Schooling System',
    slug: 'free-schooling-system',
    shortDescription:
      "Quality education for underprivileged children with free books, uniforms, and a safe learning environment.",
    description:
      "Education is every child's basic right! Launched in 2018 in the underserved area of Raees Amrohi, Orangi Town, our Free Schooling System offers education from pre-primary to primary levels, fully based on an Activity-Based Learning system, for children whose parents cannot afford the costs of schooling.",
    displayOrder: 2,
  },
  {
    title: 'Health Care Services',
    slug: 'health-care-services',
    shortDescription:
      'Free medical camps, doctor consultations, and medicines for those with no access to basic healthcare.',
    description:
      'Your Health, Our Priority. Our healthcare centre offers low-cost OPD services, essential medicines and regular free medical camps — supported by Ambulance Services and seasonal Heat Stroke Camps — for families who cannot afford treatment.',
    displayOrder: 3,
  },
  {
    title: 'Sirat ul Quran Academy',
    slug: 'sirat-ul-quran-academy',
    shortDescription:
      'The Light of Islamic Knowledge, A Guarantee for a Better Generation.',
    description:
      'Children are taught the Holy Quran with proper Tajweed, alongside weekly Islamic lessons, celebrations of Islamic festivals and special programs based on the Seerat-un-Nabi ﷺ. Sirat-ul-Quran Academy is a non-profit welfare institution serving the underprivileged segments of society.',
    displayOrder: 4,
  },
  {
    title: 'Sasta Khana Project',
    slug: 'sasta-khana-project',
    shortDescription:
      'Affordable, hygienic meals for daily wage workers and needy families struggling to afford basic food.',
    description:
      'A subsidised kitchen serving freshly cooked, hygienic meals every day so that no worker in Orangi Town has to choose between transport fare and dinner. The project also runs Iftaar Dastarkhawan, the Monthly Raashan Support Program and the Rehmat-e-Ramadan Rashan Program.',
    displayOrder: 5,
  },
  {
    title: 'Rozgar Project',
    slug: 'rozgar-project',
    shortDescription: 'A Step Towards Self-Reliance!',
    description:
      "With youth unemployment across Pakistan crossed 11%, the Rozgar Project is a ray of hope for deserving, hardworking individuals who cannot earn a living due to lack of resources. The goal is not financial aid but dignified employment — sources of respectable income matched to each person's skills, interests and circumstances.",
    displayOrder: 6,
  },
  {
    title: 'Marriage Support Program',
    slug: 'marriage-support-program',
    shortDescription: "A Dignified Marriage is Every Daughter's Right!",
    description:
      "Nearly 40% of Pakistan's population lives below the poverty line, making the sacred duty of marriage an extremely difficult challenge for countless families. The Marriage Support Program provides essential wedding support — especially for orphan girls whose families cannot arrange their weddings — so that no daughter's wedding is delayed just because of poverty.",
    displayOrder: 7,
  },
  {
    title: 'Free Eid Shopping',
    slug: 'free-eid-shopping',
    shortDescription:
      "New clothes, shoes, and gifts for children and families who can't afford Eid celebrations.",
    description:
      'Bringing Eid Joy to Every Home! Widows, orphans and deserving individuals are invited to do their complete Eid shopping for just Rs. 10 — new clothes, shoes, jewelry, perfumes and gifts — preserving their dignity and self-respect while they celebrate Eid with pride and joy.',
    displayOrder: 8,
  },
  {
    title: 'Flood Relief Mission',
    slug: 'flood-relief-mission',
    shortDescription: 'Standing Together in Crisis is True Humanity!',
    description:
      'The 2022 floods submerged thousands of villages and left millions homeless. Our volunteers stood by flood victims in the harshest conditions — delivering food rations, tents, clean drinking water, clothing and medicines to neglected areas of South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari) — with a long-term commitment that helps victims rebuild their lives.',
    displayOrder: 9,
  },
  {
    title: 'Home & Masjid Renovation',
    slug: 'home-masjid-renovation',
    shortDescription: 'A Safe Roof and a Peaceful Place to Pray!',
    description:
      'The Home and Mosque Renovation Project repairs and rebuilds damaged and flood-affected houses and masajid in low-income neighbourhoods like Orangi Town — where hardworking, self-respecting families may never ask for help, but whose homes are in urgent need of restoration.',
    displayOrder: 10,
  },
  {
    title: 'Qurbani Barae Waqaf',
    slug: 'qurbani-barae-waqaf',
    shortDescription:
      'Collective Qurbani to support orphans, widows, and madrassas through meat distribution on Eid.',
    description:
      'Waqf Qurbani for the Deserving. Generous people donate financially for Qurbani and 100% of the meat is delivered to those who need it — families in informal settlements, rural villages and underprivileged areas where poverty keeps kitchen stoves cold.',
    displayOrder: 11,
  },
  {
    title: 'Tree for Tomorrow',
    slug: 'tree-for-tomorrow-plantation-compaign',
    shortDescription: 'Green Earth, Healthy Life.',
    description:
      '"Whoever plants a tree and looks after it until it bears fruit, it becomes a Sadaqah Jariyah for him." (Musnad Ahmad) With Orangi Town experiencing temperatures exceeding 40°C every year and a severe shortage of trees, our plantation campaign turns an act of worship into a responsibility — planting and caring for trees across Karachi.',
    displayOrder: 12,
  },
  {
    title: 'Winter Relief',
    slug: 'winter-relief',
    shortDescription:
      'Winter clothing and relief for families during the cold season.',
    description:
      'Winter Relief 2025, in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season.',
    displayOrder: 13,
  },
];

/**
 * The 17 live project pages. displayOrder puts the six featured projects
 * (the live homepage slider, which carries the byte-verified photography)
 * first, so GET /public/projects?limit=6 returns exactly the slider set in
 * the slider order; the remaining eleven follow in live-nav order.
 */
export const SEED_PROJECTS: readonly SeedProject[] = [
  // ── Featured six (live homepage slider) ──────────────────────────────
  {
    programSlug: 'sasta-khana-project',
    title: 'Sasta Khana Project',
    slug: 'sasta-khana',
    shortDescription:
      'Affordable, hygienic meals for daily wage workers and needy families struggling to afford basic food.',
    description:
      'A subsidised kitchen serving freshly cooked, hygienic meals every day so that no worker in Orangi Town has to choose between transport fare and dinner. The project also runs Iftaar Dastarkhawan, the Monthly Raashan Support Program and the Rehmat-e-Ramadan Rashan Program.',
    displayOrder: 1,
  },
  {
    programSlug: 'free-schooling-system',
    title: 'Free Schooling System',
    slug: 'free-schooling',
    shortDescription:
      "Quality education for underprivileged children with free books, uniforms, and a safe learning environment.",
    description:
      "Education is every child's basic right! Launched in 2018 in the underserved area of Raees Amrohi, Orangi Town, our Free Schooling System offers education from pre-primary to primary levels, fully based on an Activity-Based Learning system, for children whose parents cannot afford the costs of schooling.",
    displayOrder: 2,
  },
  {
    programSlug: 'health-care-services',
    title: 'Health Care Services',
    slug: 'health-care',
    shortDescription:
      'Free medical camps, doctor consultations, and medicines for those with no access to basic healthcare.',
    description:
      'Your Health, Our Priority. Our healthcare centre offers low-cost OPD services, essential medicines and regular free medical camps — supported by Ambulance Services and seasonal Heat Stroke Camps — for families who cannot afford treatment.',
    displayOrder: 3,
  },
  {
    programSlug: 'hunarmand-beti-project',
    title: 'Hunarmand Beti Project',
    slug: 'hunarmand-beti',
    shortDescription:
      'Skill building for young girls through vocational training to help them earn.',
    description:
      'Skilled Girls, A Promise for a Brighter Future! In Pakistan nearly 75% of women lack vocational training or practical skills. The Sirat-e-Mustaqeem Vocational Training Center in Orangi Town, Liaquat Chowk trains underprivileged girls in henna application, sewing and beautician courses at affordable fees, so they can earn a respectable livelihood with dignity.',
    displayOrder: 4,
  },
  {
    programSlug: 'qurbani-barae-waqaf',
    title: 'Qurbani Barae Waqaf',
    slug: 'qurbani-barae-waqaf',
    shortDescription:
      'Collective Qurbani to support orphans, widows, and madrassas through meat distribution on Eid.',
    description:
      'Waqf Qurbani for the Deserving. Generous people donate financially for Qurbani and 100% of the meat is delivered to those who need it — families in informal settlements, rural villages and underprivileged areas where poverty keeps kitchen stoves cold.',
    displayOrder: 5,
  },
  {
    programSlug: 'free-eid-shopping',
    title: 'Free Eid Shopping',
    slug: 'free-eid-shopping',
    shortDescription:
      "New clothes, shoes, and gifts for children and families who can't afford Eid celebrations.",
    description:
      'Bringing Eid Joy to Every Home! Widows, orphans and deserving individuals are invited to do their complete Eid shopping for just Rs. 10 — new clothes, shoes, jewelry, perfumes and gifts — preserving their dignity and self-respect while they celebrate Eid with pride and joy.',
    displayOrder: 6,
  },

  // ── Remaining live project pages ─────────────────────────────────────
  {
    programSlug: 'rozgar-project',
    title: 'Rozgar Project',
    slug: 'rozgar-project',
    shortDescription: 'A Step Towards Self-Reliance!',
    description:
      "With youth unemployment across Pakistan crossed 11%, the Rozgar Project is a ray of hope for deserving, hardworking individuals who cannot earn a living due to lack of resources. The goal is not financial aid but dignified employment — sources of respectable income matched to each person's skills, interests and circumstances.",
    displayOrder: 7,
  },
  {
    programSlug: 'marriage-support-program',
    title: 'Marriage Support Program',
    slug: 'marriage-support-program',
    shortDescription: "A Dignified Marriage is Every Daughter's Right!",
    description:
      "Nearly 40% of Pakistan's population lives below the poverty line, making the sacred duty of marriage an extremely difficult challenge for countless families. The Marriage Support Program provides essential wedding support — especially for orphan girls whose families cannot arrange their weddings — so that no daughter's wedding is delayed just because of poverty.",
    displayOrder: 8,
  },
  {
    programSlug: 'flood-relief-mission',
    title: 'Flood Relief Mission',
    slug: 'flood-relief-mission',
    shortDescription: 'Standing Together in Crisis is True Humanity!',
    description:
      'The 2022 floods submerged thousands of villages and left millions homeless. Our volunteers stood by flood victims in the harshest conditions — delivering food rations, tents, clean drinking water, clothing and medicines to neglected areas of South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari) — with a long-term commitment that helps victims rebuild their lives.',
    displayOrder: 9,
  },
  {
    programSlug: 'home-masjid-renovation',
    title: 'Home & Masjid Renovation',
    slug: 'home-masjid-renovation',
    shortDescription: 'A Safe Roof and a Peaceful Place to Pray!',
    description:
      'The Home and Mosque Renovation Project repairs and rebuilds damaged and flood-affected houses and masajid in low-income neighbourhoods like Orangi Town — where hardworking, self-respecting families may never ask for help, but whose homes are in urgent need of restoration.',
    displayOrder: 10,
  },
  {
    programSlug: 'tree-for-tomorrow-plantation-compaign',
    title: 'Tree for Tomorrow (Plantation Campaign)',
    slug: 'tree-for-tomorrow',
    shortDescription: 'Green Earth, Healthy Life.',
    description:
      '"Whoever plants a tree and looks after it until it bears fruit, it becomes a Sadaqah Jariyah for him." (Musnad Ahmad) With Orangi Town experiencing temperatures exceeding 40°C every year and a severe shortage of trees, our plantation campaign turns an act of worship into a responsibility — planting and caring for trees across Karachi.',
    displayOrder: 11,
  },
  {
    programSlug: 'winter-relief',
    title: 'Winter Relief',
    slug: 'winter-relief',
    shortDescription:
      'Winter clothing and relief for families during the cold season.',
    description:
      'Winter Relief 2025, in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season.',
    displayOrder: 12,
  },
  {
    programSlug: 'sirat-ul-quran-academy',
    title: 'Sirat ul Quran Academy (Taleem e Baligaat)',
    slug: 'sirat-ul-quran-academy',
    shortDescription:
      'The Light of Islamic Knowledge, A Guarantee for a Better Generation.',
    description:
      'Children are taught the Holy Quran with proper Tajweed, alongside weekly Islamic lessons, celebrations of Islamic festivals and special programs based on the Seerat-un-Nabi ﷺ. Sirat-ul-Quran Academy is a non-profit welfare institution serving the underprivileged segments of society.',
    displayOrder: 13,
  },

  // ── Sub-projects (live child pages) ──────────────────────────────────
  {
    programSlug: 'health-care-services',
    title: 'Ambulance Services',
    slug: 'ambulance-services',
    shortDescription: 'Every Breath is Precious!',
    description:
      'In densely populated, underprivileged areas like Orangi Town, dozens of patients lose their lives because an ambulance fails to arrive on time. Our Ambulance Service operates specifically where government or private services are limited or unavailable, transporting every person in need to hospital in a timely and dignified manner — charging only minimal necessary expenses.',
    displayOrder: 14,
  },
  {
    programSlug: 'health-care-services',
    title: 'Heat Stroke Camp',
    slug: 'heat-stroke-camp',
    shortDescription: "Be the Shade, Be Someone's Breath of Life!",
    description:
      "Every summer during peak heat days we organise Heatstroke Relief Camps in critical zones of Orangi Town — busy intersections, major bus stops and crowded market areas — where labourers, pedestrians, elderly citizens and small children are directly exposed to the sun's wrath and vulnerable to life-threatening heatstroke and dehydration.",
    displayOrder: 15,
  },
  {
    programSlug: 'sasta-khana-project',
    title: 'Iftaar Dastarkhawan',
    slug: 'iftaar-dastarkhawan',
    shortDescription:
      'Daily Iftar gatherings for hundreds of deserving families.',
    description:
      'During Ramadan, Sirat-e-Mustaqeem Welfare Trust hosts daily Iftar gatherings for hundreds of deserving families. Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.',
    displayOrder: 16,
  },
  {
    programSlug: 'sasta-khana-project',
    title: 'Monthly Raashan Support Program',
    slug: 'monthly-raashan-support-program',
    shortDescription: 'True Help is What Opens the Doors to Self-Reliance!',
    description:
      'Around 70 deserving families — including widows, the sick and extremely poor individuals — receive monthly ration packages, with their dignity and self-respect carefully preserved so they never feel like a burden on society. A meaningful effort that goes beyond short-term relief to offer sustainable support.',
    displayOrder: 17,
  },
];

/**
 * Site-settings singleton — contact/footer copy copied from the live site's
 * footer and Contact/Donate pages.
 */
export const SEED_SITE_SETTINGS: SeedSiteSettings = {
  organizationName: 'SM Welfare Trust',
  tagline: 'Charity efforts that are for happiness',
  description:
    'Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.',
  contact: {
    email: 'smwelfaretrust@gmail.com',
    phone: '+92 315 2616482',
    address:
      'Orangi Town Liaquat chowk, Gulshan e Zia, House 2772 Street 1 SECT -:11 1/2, 1st St E, Karachi, Pakistan',
  },
  socialLinks: {
    facebook: 'https://www.facebook.com/smwelfare.charity',
    instagram: 'https://www.instagram.com/smwelfaretrust',
    linkedin:
      'https://pk.linkedin.com/in/sm-welfare-trust-854392282',
    youtube: 'https://www.youtube.com/@SMWelfareTrust',
    website: 'https://smwelfare.charity',
  },
  footer: {
    shortDescription:
      'SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan, dedicated to social development and providing relief to individuals from low-income groups since 2017.',
    copyrightText:
      'Copyright ©2025 by Sirat e Mustaqeem Welfare Trust',
  },
};
