/**
 * Program/impact content reproduced from the live site (smwelfare.charity).
 *
 * Headings, counter values and blurbs below are copied from the live
 * homepage so the rebuild says exactly what the WordPress site says — the
 * counters come from the `data-value` attributes of the live funfact widgets,
 * and the blurbs from the six cards under the live "About ..." section.
 */

export interface Program {
  /** Order shown in the About "What we do" numbered list (01-06). */
  number: string;
  name: string;
  description: string;
}

/** The six service cards under the live homepage "About" section. */
export const PROGRAMS: readonly Program[] = [
  {
    number: "01",
    name: "Food Distribution",
    description:
      "We deliver ration packs and cooked meals to underprivileged families across Pakistan. Your support ensures that no one sleeps hungry.",
  },
  {
    number: "02",
    name: "Education Support",
    description:
      "We sponsor school fees, books, uniforms, and supplies for orphans and needy children. Your donation helps unlock a brighter future.",
  },
  {
    number: "03",
    name: "Medical Assistance",
    description:
      "We arrange free medical camps, medicines, and treatments for the sick who cannot afford basic healthcare. Your support helps restore health.",
  },
  {
    number: "04",
    name: "Clean Water Projects",
    description:
      "Thousands lack access to clean water. We install hand pumps and water coolers in remote villages.",
  },
  {
    number: "05",
    name: "Widow & Orphan Support",
    description:
      "We provide monthly stipends and essentials to widows and orphans who have no one else to support them.",
  },
  {
    number: "06",
    name: "Seasonal Drives",
    description:
      "From Ramadan ration to winter clothes, our seasonal campaigns reach thousands each year with timely support.",
  },
] as const;

/** Intro paragraph of the live homepage "About ... Happiness" section. */
export const ABOUT_INTRO =
  "At SM Welfare Charity, we believe that true happiness lies in giving especially to those who need it the most. Our mission is rooted in compassion, and our vision is to build a society where no one is left behind. With your support, we are able to provide food to the hungry, sponsor education for orphaned children, offer free medical aid, and install clean water systems in remote communities across Pakistan.";

/**
 * Mission paragraphs — the first two run on the live homepage under
 * "Our Mission"; the third is from the live /our-mission/ page.
 */
export const MISSION_PARAGRAPHS: readonly string[] = [
  "We aim to bring hope and smiles to lives filled with sadness and struggle by becoming a ray of light in areas like education, healthcare, employment, and social welfare. We want to help those who fight each day just to survive so that they can live with dignity, confidence, and independence.",
  "We stand with families who face growing challenges with each passing day. Our goal is to brighten their tomorrow, give them practical opportunities, and help them move toward a better and successful future.",
  "We believe in serving humanity beyond the boundaries of caste, sect, or religion. Our vision is of a world where no one is deprived of necessities like healthcare, education, or a dignified life due to poverty or personal hardship.",
];

/**
 * Live homepage "Our Project" counters — values are the `data-value`
 * attributes of the live elementskit funfact widgets, labels the funfact
 * titles, rendered on the live site as "600 +", "100 +", etc.
 */
export const IMPACT_STATS = [
  { value: "600+", label: "Daily Food" },
  { value: "100+", label: "Raashan Support Monthly" },
  { value: "430+", label: "Education Monthly" },
  { value: "7,000+", label: "Medical Monthly" },
] as const;
