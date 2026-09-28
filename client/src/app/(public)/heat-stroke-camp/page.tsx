import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBeaker,
  HiBolt,
  HiClock,
  HiHeart,
  HiMapPin,
  HiSparkles,
  HiSun,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";
import {
  BTN_OUTLINE_DEFAULT,
  BTN_PRIMARY_BLUE,
} from "@/components/shared/home-styles";
import { HEAT_STROKE_CAMP } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Heat Stroke Camp — mirrors the live /heat-stroke-camp/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the Karachi summer
 * heat and Orangi Town's missing shade/water/first aid, the exposure of
 * laborers, pedestrians, elderly citizens and small children, the
 * "Heatstroke Relief Camps" set up in Orangi Town's critical zones during
 * peak heat days, the five things offered at the camps, the life-saving
 * intent behind the initiative, and the closing donation appeal. The tagline
 * "Be the Shade, Be Someone's Breath of Life!" is the live page's own
 * subtitle. Line-wrap artifacts from the source ("lifethreatening") are
 * rejoined to the standard spelling, as on the other project pages.
 *
 * The layout follows the same section flow as the Free Schooling System,
 * Hunarmand Beti and Ambulance Services pages: PageHero → challenge grid
 * with a sticky image → bg-section camp band (heading, offered-items cards,
 * copy) → white mission section → closing card → CtaBand.
 *
 * The kickers, headings and the camp-facts panel are presentation only —
 * the facts in them (Orangi Town, peak heat days, the five offered items)
 * all come from the same live copy.
 */

/** Live paragraph 1 — the Karachi heat and Orangi Town's missing essentials. */
const CHALLENGE_PARAGRAPH =
  "In a bustling and sprawling city like Karachi, when the sun blazes in full force and the summer heat becomes unbearable, even the fastest pace of life comes to a halt. Orangi Town, one of the city's largest and most diverse areas, is home to people from varying economic and social backgrounds. While some enjoy full access to urban amenities, there are still neighborhoods where clean drinking water, shaded areas, and even basic first aid remain out of reach.";

/** Live paragraph 2 — who is exposed to the sun's wrath. */
const EXPOSURE_PARAGRAPH =
  "During such extreme weather, laborers, pedestrians, elderly citizens, and small children are directly exposed to the sun's wrath, making them vulnerable to life-threatening heatstroke and dehydration.";

/** Live paragraph 3 — the camps, where they are set up, and what they offer. */
const CAMPS_PARAGRAPH =
  "Recognizing these urgent needs, Sirat-e-Mustaqeem Welfare Trust organizes “Heatstroke Relief Camps” every summer during peak heat days. These camps are set up in critical zones of Orangi Town, including busy intersections, major bus stops, and crowded markets areas where the sun hits hardest and facilities are scarce. At these camps, passersby, workers, women, children, and the elderly are offered:";

/** Live paragraph 4 — why the initiative is a life-saving mission. */
const MISSION_PARAGRAPH =
  "This initiative isn't just about temporary relief, it's a life-saving mission. Sometimes, a cold bottle of water, a wet towel, or a piece of cloth to shield from the sun can mean the difference between life and death. Sirat-e-Mustaqeem's goal is simple yet vital: no one should lose their life just because they couldn't find water or shade in time.";

/** Live closing paragraph requesting readers to join hands. */
const JOIN_PARAGRAPH =
  "If you wish to be the reason someone finds shade in this brutal heat, if you want a child to be saved from fainting, or a laborer to rest and return to his honest work with renewed strength, join hands with us. Your donation could become someone's source of life, comfort, and survival.";

/**
 * The five things the live copy says are offered at the camps, presented as
 * cards. The titles are the source's own list items; the one-line
 * descriptions are presentation.
 */
const OFFERED_ITEMS: readonly {
  title: string;
  description: string;
  icon: typeof HiBeaker;
}[] = [
  {
    title: "Free cold drinking water",
    description: "Chilled drinking water handed to passersby to beat the heat.",
    icon: HiBeaker,
  },
  {
    title: "Refreshing beverages",
    description: "Cool drinks that help the body recover from the blazing sun.",
    icon: HiBolt,
  },
  {
    title: "Wet towels",
    description: "Wet towels for instant relief from heat and exhaustion.",
    icon: HiSparkles,
  },
  {
    title: "Cloth to cover their heads",
    description: "Cloth to shield heads from the sun while out on the road.",
    icon: HiSun,
  },
  {
    title: "Immediate first aid",
    description: "First aid for heat exhaustion at the camp itself.",
    icon: HiHeart,
  },
];

/** The camp's timing and location — both stated in the live copy. */
const CAMP_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiClock;
}[] = [
  {
    label: "When",
    value: "Every summer, during peak heat days",
    icon: HiClock,
  },
  {
    label: "Where",
    value: "Critical zones of Orangi Town — busy intersections, major bus stops and crowded markets",
    icon: HiMapPin,
  },
];

export const metadata: Metadata = {
  title: "Heat Stroke Camp",
  description:
    "Be the Shade, Be Someone's Breath of Life! Sirat-e-Mustaqeem Welfare Trust's Heatstroke Relief Camps offer free cold water, beverages, wet towels, head cover and first aid in Orangi Town, Karachi during peak summer heat.",
  openGraph: {
    title: "Heat Stroke Camp | SM Welfare Trust",
    description:
      "Free cold water, beverages, wet towels and first aid at Heatstroke Relief Camps in Orangi Town's critical zones during peak Karachi summer heat.",
  },
  twitter: {
    title: "Heat Stroke Camp | SM Welfare Trust",
    description:
      "Free cold water, beverages, wet towels and first aid at Heatstroke Relief Camps in Orangi Town's critical zones during peak Karachi summer heat.",
  },
};

export default function HeatStrokeCampPage() {
  return (
    <>
      <PageHero
        title="Heat Stroke Camp"
        description="Be the Shade, Be Someone's Breath of Life!"
      />

      {/* Live copy — the Karachi summer heat and Orangi Town's missing
          essentials, beside the client-provided camp photo (16:9, framed at
          its natural ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="When the shade runs out, lives are put at risk"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {EXPOSURE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={HEAT_STROKE_CAMP.src}
              alt={HEAT_STROKE_CAMP.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the camps + the five things they offer */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our camps"
            title="Heatstroke Relief Camps in Orangi Town"
            description="Set up in the zones where the sun hits hardest and facilities are scarce — busy intersections, major bus stops and crowded markets."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {CAMPS_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {OFFERED_ITEMS.map((item) => (
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

          {/* The live copy's own timing and location */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {CAMP_FACTS.map((fact) => (
              <div key={fact.label} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <fact.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {fact.label}
                  </span>
                  <span className="text-sm font-semibold">{fact.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Live "life-saving mission" copy */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our mission"
              title="No one should lose their life for want of water or shade"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {MISSION_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live closing call to action */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join hands with us"
              title="Be the reason someone finds shade this summer"
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
