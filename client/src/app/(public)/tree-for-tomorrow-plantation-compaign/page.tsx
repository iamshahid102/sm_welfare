import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiCalendarDays,
  HiGlobeAlt,
  HiHeart,
  HiMapPin,
  HiSparkles,
  HiSun,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Quote } from "@/components/shared/quote";
import { CtaBand } from "@/components/shared/cta-band";
import {
  BTN_OUTLINE_DEFAULT,
  BTN_PRIMARY_BLUE,
} from "@/components/shared/home-styles";
import { Kicker } from "@/components/shared/kicker";
import { TREE_FOR_TOMORROW } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Tree for Tomorrow (Plantation Campaign) — mirrors the live
 * /tree-for-tomorrow-plantation-compaign/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the Hadith of the
 * Holy Prophet Muhammad ﷺ on planting a tree and looking after it until it
 * bears fruit as Sadaqah Jariyah (Musnad Ahmad), Islam's encouragement to
 * beautify the earth, love nature and protect the environment, planting trees
 * as a responsibility in a world facing climate change, environmental
 * pollution and rising heat, Orangi Town's intense heat above 40°C and its
 * severe shortage of trees with the harsh weather and health problems
 * residents face, the Plantation Campaign the Trust launched in 2020, the more
 * than 1,000 trees planted over the past five years, every plant as a new
 * beginning and a shade for the days to come, the Karachi localities where
 * trees have been planted (Altaf Nagar, Khairabad, Safed Chowk, Haq Bahoo
 * Chowk, Muhajir Chowk, Disco Mor, Aman Chowk, Sector 14-C, Bismillah Chowk,
 * Islam Chowk, Liaquat Chowk, North Karachi and several important locations in
 * North Nazimabad), tree plantation as a way to gain the pleasure of Allah
 * with benefit in this world and the Hereafter, and the closing invitation to
 * join the journey of Sadaqah Jariyah. The tagline "Green Earth, Healthy
 * Life." is the live page's own subtitle.
 *
 * SOURCE NOTES: (1) the live page carries a stray Arabic waw in
 * "climate changeو," which is rejoined to "climate change," here, in the same
 * spirit as the line-wrap artifacts corrected on the other project pages;
 * (2) the live route and title spell "Compaign" — the corrected spelling
 * "Campaign" is used in every visible label (as `data/projects.ts` already
 * does) while the route keeps the live slug so URLs stay in parity with the
 * site this replaces. Nothing else in the copy is altered.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project,
 * Marriage Support Program, Free Eid Shopping, Flood Relief Mission, Home &
 * Masjid Renovation, Qurbani Barae Waqaf): PageHero → challenge grid with a
 * sticky image → bg-section campaign band (heading, copy, campaign cards,
 * planting-locations panel) → white pull-quote with the page's own Hadith →
 * closing card → CtaBand.
 *
 * The kickers, headings, the campaign cards and the locations panel are
 * presentation only — every fact in them (2020, more than 1,000 trees, five
 * years, 40°C, the 13 named localities) comes from the same live copy. The
 * client photo is framed at its natural 16:9 ratio so it is never cropped.
 */

/** Live Hadith — the page's own opening, shown later as a pull-quote. */
const HADITH_TEXT =
  "Whoever plants a tree and looks after it until it bears fruit, it becomes a Sadaqah Jariyah for him.";

/** Live paragraph — Islam's call to protect the environment. */
const RESPONSIBILITY_PARAGRAPH =
  "Islam not only teaches us acts of worship but also encourages us to beautify the earth, love nature, and protect the environment. Today, as the world faces climate change, environmental pollution, and rising heat, planting trees has become not just an act but a responsibility.";

/** Live paragraph — Orangi Town's heat and shortage of trees. */
const HEAT_PARAGRAPH =
  "Karachi’s vast and densely populated area Orangi Town experiences intense heat every year, with temperatures exceeding 40°C. Unfortunately, there is a severe shortage of trees in this area. As a result, residents face not only harsh weather but also various health problems.";

/** Live paragraph — the 2020 launch and the trees planted since. */
const CAMPAIGN_PARAGRAPH =
  "Sensing this urgent need, Sirat-e-Mustaqeem Welfare Trust launched its Plantation Campaign in 2020. Over the past five years, we have planted more than 1,000 trees, laying the foundation for a greener environment and sending a message of hope for future generations. Every plant is a new beginning—a shade that can protect the days to come.";

/** Live paragraph — where the trees have been planted. */
const LOCATIONS_PARAGRAPH =
  "Under our Plantation Campaign, trees have been planted in various areas of Karachi, especially in:";

/** Live paragraph — plantation as a way to Allah's pleasure. */
const PLEASURE_PARAGRAPH =
  "Tree plantation is not just a campaign; it is a way to gain the pleasure of Allah. It is an action that can bring benefit both in this world and in the Hereafter.";

/** Live closing paragraph — the invitation to join the journey. */
const JOIN_PARAGRAPH =
  "Come! Join us in this journey of Sadaqah Jariyah so we can work together to make our city greener and more beautiful.";

/**
 * The Karachi localities the live copy names, in its own order. North
 * Nazimabad is listed as stated ("several important locations in North
 * Nazimabad").
 */
const PLANTING_LOCATIONS: readonly string[] = [
  "Altaf Nagar",
  "Khairabad",
  "Safed Chowk",
  "Haq Bahoo Chowk",
  "Muhajir Chowk",
  "Disco Mor",
  "Aman Chowk",
  "Sector 14-C",
  "Bismillah Chowk",
  "Islam Chowk",
  "Liaquat Chowk",
  "North Karachi",
  "North Nazimabad",
];

/**
 * What the campaign has done, presented as cards. The titles condense the
 * live copy's own points; the one-line descriptions are presentation.
 */
const CAMPAIGN_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiCalendarDays;
}[] = [
  {
    title: "Planting since 2020",
    description:
      "The Plantation Campaign was launched in 2020 to answer Orangi Town's urgent need for trees.",
    icon: HiCalendarDays,
  },
  {
    title: "More than 1,000 trees",
    description:
      "Over the past five years of plantation work, more than 1,000 trees have been planted.",
    icon: HiSparkles,
  },
  {
    title: "A shade for the days to come",
    description:
      "Every plant is a new beginning — a message of hope for future generations.",
    icon: HiGlobeAlt,
  },
];

export const metadata: Metadata = {
  title: "Tree for Tomorrow (Plantation Campaign)",
  description:
    "Green Earth, Healthy Life. Sirat-e-Mustaqeem Welfare Trust launched its Plantation Campaign in 2020 and has planted more than 1,000 trees across Karachi — from Altaf Nagar and Khairabad to Liaquat Chowk, North Karachi and North Nazimabad — as a Sadaqah Jariyah for a greener, healthier city.",
  openGraph: {
    title: "Tree for Tomorrow (Plantation Campaign) | SM Welfare Trust",
    description:
      "More than 1,000 trees planted across Karachi since 2020 — a Sadaqah Jariyah for a greener, healthier city and a shade for the days to come.",
  },
  twitter: {
    title: "Tree for Tomorrow (Plantation Campaign) | SM Welfare Trust",
    description:
      "More than 1,000 trees planted across Karachi since 2020 — a Sadaqah Jariyah for a greener, healthier city and a shade for the days to come.",
  },
};

export default function TreeForTomorrowPage() {
  return (
    <>
      <PageHero
        title="Tree for Tomorrow (Plantation Campaign)"
        description="Green Earth, Healthy Life."
      />

      {/* Live copy — Islam's call to protect the environment and Orangi Town's
          heat and shortage of trees, beside the client-provided photo (16:9,
          framed at its natural ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="Our responsibility"
              title="When temperatures pass 40°C, planting trees becomes a duty"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {RESPONSIBILITY_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {HEAT_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={TREE_FOR_TOMORROW.src}
              alt={TREE_FOR_TOMORROW.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the campaign + the campaign cards and the planting
          locations */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our campaign"
            title="Planting a greener Karachi since 2020"
            description="More than 1,000 trees over the past five years — laying the foundation for a greener environment and sending a message of hope for future generations."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {CAMPAIGN_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAMPAIGN_CARDS.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>

          {/* The live copy's own list of places where trees have been planted */}
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HiMapPin className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <Kicker>Where we have planted</Kicker>
                <span className="text-sm font-semibold">
                  {LOCATIONS_PARAGRAPH}
                </span>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PLANTING_LOCATIONS.map((location) => (
                <li
                  key={location}
                  className="flex items-center gap-2 rounded-lg border border-border bg-section px-3 py-2 text-sm font-semibold"
                >
                  <HiMapPin
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {location}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* The live page's own opening Hadith, shown large */}
      <Quote text={HADITH_TEXT} attribution="Musnad Ahmad" />

      {/* Live copy — plantation as a way to Allah's pleasure — with the live
          value of 40°C as the section's own fact */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="More than a campaign"
              title="An action that benefits this world and the Hereafter"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {PLEASURE_PARAGRAPH}
            </p>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-section p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HiSun className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Summer heat in Orangi Town
                </span>
                <span className="text-sm font-semibold">
                  Temperatures exceeding 40°C every year
                </span>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HiSparkles className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Trees planted
                </span>
                <span className="text-sm font-semibold">
                  More than 1,000 since the campaign began in 2020
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Live closing call to action */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join the journey"
              title="Make our city greener and more beautiful"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {JOIN_PARAGRAPH}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={DONATE_HREF}
                className={cn(buttonVariants(), BTN_PRIMARY_BLUE, "group")}
              >
                <HiHeart className="mr-1.5 size-4" aria-hidden="true" />
                Donate now
                <HiArrowRight
                  className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/contact"
                className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT)}
              >
                Contact us
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
