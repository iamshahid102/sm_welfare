/**
 * Project content reproduced from the live site (smwelfare.charity).
 *
 * Every `summary` and `description` below is taken from the corresponding
 * live project page (or, for the featured six, from the live homepage slider
 * that carries the byte-verified photography in `public/images`).
 *
 * `category` drives the card badge and the curated fallback list; the six
 * featured entries come first so home-page slicing shows the projects the
 * live homepage shows, in the live order.
 *
 * The public projects API (GET /public/projects) wins whenever the CMS has
 * data — this module is the curated fallback, not a pretence of live backend
 * data.
 */

export interface Project {
  /** Stable id used for routing/filters/anchors. */
  slug: string;
  name: string;
  /** Category label used by the card badge. */
  category: string;
  /** Short one-liner shown on cards. */
  summary: string;
  /** Longer description shown on the Projects page. */
  description: string;
}

export const PROJECTS: readonly Project[] = [
  // ── Featured six (live homepage slider, byte-verified photos) ─────────
  {
    slug: "sasta-khana",
    name: "Sasta Khana Project",
    category: "Sasta Khana Project",
    summary:
      "Affordable, hygienic meals for daily wage workers and needy families struggling to afford basic food.",
    description:
      "A subsidised kitchen serving freshly cooked, hygienic meals every day so that no worker in Orangi Town has to choose between transport fare and dinner. The project also runs Iftaar Dastarkhawan, the Monthly Raashan Support Program and the Rehmat-e-Ramadan Rashan Program.",
  },
  {
    slug: "free-schooling",
    name: "Free Schooling System",
    category: "Free Schooling System",
    summary:
      "Quality education for underprivileged children with free books, uniforms, and a safe learning environment.",
    description:
      "Education is every child's basic right! Launched in 2018 in the underserved area of Raees Amrohi, Orangi Town, our Free Schooling System offers education from pre-primary to primary levels, fully based on an Activity-Based Learning system, for children whose parents cannot afford the costs of schooling.",
  },
  {
    slug: "health-care",
    name: "Health Care Services",
    category: "Health Care Services",
    summary:
      "Free medical camps, doctor consultations, and medicines for those with no access to basic healthcare.",
    description:
      "Your Health, Our Priority. Our healthcare centre offers low-cost OPD services, essential medicines and regular free medical camps — supported by Ambulance Services and seasonal Heat Stroke Camps — for families who cannot afford treatment.",
  },
  {
    slug: "hunarmand-beti",
    name: "Hunarmand Beti Project",
    category: "Hunarmand Beti Project",
    summary:
      "Skill building for young girls through vocational training to help them earn.",
    description:
      "Skilled Girls, A Promise for a Brighter Future! In Pakistan nearly 75% of women lack vocational training or practical skills. The Sirat-e-Mustaqeem Vocational Training Center in Orangi Town, Liaquat Chowk trains underprivileged girls in henna application, sewing and beautician courses at affordable fees, so they can earn a respectable livelihood with dignity.",
  },
  {
    slug: "qurbani-barae-waqaf",
    name: "Qurbani Barae Waqaf",
    category: "Qurbani Barae Waqaf",
    summary:
      "Collective Qurbani to support orphans, widows, and madrassas through meat distribution on Eid.",
    description:
      "Waqf Qurbani for the Deserving. Generous people donate financially for Qurbani and 100% of the meat is delivered to those who need it — families in informal settlements, rural villages and underprivileged areas where poverty keeps kitchen stoves cold.",
  },
  {
    slug: "free-eid-shopping",
    name: "Free Eid Shopping",
    category: "Free Eid Shopping",
    summary:
      "New clothes, shoes, and gifts for children and families who can't afford Eid celebrations.",
    description:
      "Bringing Eid Joy to Every Home! Widows, orphans and deserving individuals are invited to do their complete Eid shopping for just Rs. 10 — new clothes, shoes, jewelry, perfumes and gifts — preserving their dignity and self-respect while they celebrate Eid with pride and joy.",
  },

  // ── Remaining live projects ───────────────────────────────────────────
  {
    slug: "rozgar-project",
    name: "Rozgar Project",
    category: "Rozgar Project",
    summary: "A Step Towards Self-Reliance!",
    description:
      "With youth unemployment across Pakistan crossed 11%, the Rozgar Project is a ray of hope for deserving, hardworking individuals who cannot earn a living due to lack of resources. The goal is not financial aid but dignified employment — sources of respectable income matched to each person's skills, interests and circumstances.",
  },
  {
    slug: "marriage-support-program",
    name: "Marriage Support Program",
    category: "Marriage Support Program",
    summary: "A Dignified Marriage is Every Daughter's Right!",
    description:
      "Nearly 40% of Pakistan's population lives below the poverty line, making the sacred duty of marriage an extremely difficult challenge for countless families. The Marriage Support Program provides essential wedding support — especially for orphan girls whose families cannot arrange their weddings — so that no daughter's wedding is delayed just because of poverty.",
  },
  {
    slug: "flood-relief-mission",
    name: "Flood Relief Mission",
    category: "Flood Relief Mission",
    summary: "Standing Together in Crisis is True Humanity!",
    description:
      "The 2022 floods submerged thousands of villages and left millions homeless. Our volunteers stood by flood victims in the harshest conditions — delivering food rations, tents, clean drinking water, clothing and medicines to neglected areas of South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari) — with a long-term commitment that helps victims rebuild their lives.",
  },
  {
    slug: "home-masjid-renovation",
    name: "Home & Masjid Renovation",
    category: "Home & Masjid Renovation",
    summary: "A Safe Roof and a Peaceful Place to Pray!",
    description:
      "The Home and Mosque Renovation Project repairs and rebuilds damaged and flood-affected houses and masajid in low-income neighbourhoods like Orangi Town — where hardworking, self-respecting families may never ask for help, but whose homes are in urgent need of restoration.",
  },
  {
    slug: "tree-for-tomorrow",
    name: "Tree for Tomorrow (Plantation Campaign)",
    category: "Tree for Tomorrow",
    summary: "Green Earth, Healthy Life.",
    description:
      "\"Whoever plants a tree and looks after it until it bears fruit, it becomes a Sadaqah Jariyah for him.\" (Musnad Ahmad) With Orangi Town experiencing temperatures exceeding 40°C every year and a severe shortage of trees, our plantation campaign turns an act of worship into a responsibility — planting and caring for trees across Karachi.",
  },
  {
    slug: "winter-relief",
    name: "Winter Relief",
    category: "Winter Relief",
    summary: "Winter clothing and relief for families during the cold season.",
    description:
      "Winter Relief 2025, in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season.",
  },
  {
    slug: "sirat-ul-quran-academy",
    name: "Sirat ul Quran Academy (Taleem e Baligaat)",
    category: "Sirat ul Quran Academy",
    summary: "The Light of Islamic Knowledge, A Guarantee for a Better Generation.",
    description:
      "Children are taught the Holy Quran with proper Tajweed, alongside weekly Islamic lessons, celebrations of Islamic festivals and special programs based on the Seerat-un-Nabi ﷺ. Sirat-ul-Quran Academy is a non-profit welfare institution serving the underprivileged segments of society.",
  },
  {
    slug: "ambulance-services",
    name: "Ambulance Services",
    category: "Health Care Services",
    summary: "Every Breath is Precious!",
    description:
      "In densely populated, underprivileged areas like Orangi Town, dozens of patients lose their lives because an ambulance fails to arrive on time. Our Ambulance Service operates specifically where government or private services are limited or unavailable, transporting every person in need to hospital in a timely and dignified manner — charging only minimal necessary expenses.",
  },
  {
    slug: "heat-stroke-camp",
    name: "Heat Stroke Camp",
    category: "Health Care Services",
    summary: "Be the Shade, Be Someone's Breath of Life!",
    description:
      "Every summer during peak heat days we organise Heatstroke Relief Camps in critical zones of Orangi Town — busy intersections, major bus stops and crowded market areas — where labourers, pedestrians, elderly citizens and small children are directly exposed to the sun's wrath and vulnerable to life-threatening heatstroke and dehydration.",
  },
  {
    slug: "iftaar-dastarkhawan",
    name: "Iftaar Dastarkhawan",
    category: "Sasta Khana Project",
    summary: "Daily Iftar gatherings for hundreds of deserving families.",
    description:
      "During Ramadan, Sirat-e-Mustaqeem Welfare Trust hosts daily Iftar gatherings for hundreds of deserving families. Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.",
  },
  {
    slug: "monthly-raashan-support",
    name: "Monthly Raashan Support Program",
    category: "Sasta Khana Project",
    summary: "True Help is What Opens the Doors to Self-Reliance!",
    description:
      "Around 70 deserving families — including widows, the sick and extremely poor individuals — receive monthly ration packages, with their dignity and self-respect carefully preserved so they never feel like a burden on society. A meaningful effort that goes beyond short-term relief to offer sustainable support.",
  },
] as const;
