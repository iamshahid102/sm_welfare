import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBeaker,
  HiGift,
  HiHandRaised,
  HiHeart,
  HiHome,
  HiMapPin,
  HiShoppingBag,
  HiUserGroup,
  HiWrenchScrewdriver,
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
import { FLOOD_RELIEF_MISSION } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Flood Relief Mission — mirrors the live /flood-relief-mission/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the 2022 floods as one
 * of the most devastating chapters in Pakistan's history, torrential rains and
 * overflowing rivers submerging thousands of villages and leaving millions
 * homeless, crops destroyed and livestock washed away, the remote hardest-hit
 * regions — South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari) —
 * where immediate emergency relief was nearly impossible to deliver, the
 * Trust stepping forward to reach neglected communities, its volunteers
 * standing by victims in the harshest conditions with food rations, tents,
 * clean drinking water, clothing and medicines, that relief effort as a true
 * act of loyalty to humanity, the belief that real service goes beyond
 * temporary assistance and offers a long-term commitment so victims rebuild
 * their lives with dignity and hope, the mission continuing from emergency aid
 * to rehabilitation, skill development and eventually self-reliance programs,
 * flood relief as a continuous journey of recovery, compassion and community
 * rebuilding, and the closing appeal for shelter, stability and strength. The
 * tagline "Standing Together in Crisis is True Humanity!" is the live page's
 * own subtitle.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project,
 * Marriage Support Program, Free Eid Shopping): PageHero → challenge grid
 * with a sticky image → bg-section response band (heading, copy, supply
 * cards, facts panel) → white long-term mission section with the copy's own
 * recovery journey as steps → closing card → CtaBand.
 *
 * The kickers, headings, the supply cards, the facts panel and the recovery
 * steps are presentation only — every fact in them (the 2022 floods,
 * thousands of villages, millions homeless, Rajanpur, Interior Sindh, Okari,
 * food rations, tents, clean drinking water, clothing, medicines, and the
 * move from emergency aid to rehabilitation, skill development and
 * self-reliance) comes from the same live copy.
 */

/** Live paragraph 1 — the 2022 floods and the regions hardest hit. */
const CHALLENGE_PARAGRAPH =
  "The 2022 floods in Pakistan marked one of the most devastating chapters in the country’s history. Torrential rains and overflowing rivers submerged thousands of villages, leaving millions homeless. Crops were destroyed, livestock washed away, and normal life turned into a painful struggle for survival. Remote regions such as South Punjab (Rajanpur), Interior Sindh, and Balochistan (Okari) were among the hardest hit areas where immediate emergency relief was nearly impossible to deliver.";

/** Live paragraph 2 — the Trust's response and the supplies delivered. */
const RESPONSE_PARAGRAPH =
  "In response to this national crisis, Sirat-e-Mustaqeem Welfare Trust stepped forward and focused on reaching neglected and underserved communities. Our volunteers stood by the flood victims even in the harshest conditions, delivering essential flood relief supplies including food rations, tents, clean drinking water, clothing, and medicines. This was not just a relief effort; it was a true act of loyalty to humanity.";

/** Live paragraph 3 — the long-term commitment and the road to self-reliance. */
const COMMITMENT_PARAGRAPH =
  "We believe that real service goes beyond temporary assistance. It’s about offering a long-term commitment that helps victims rebuild their lives with dignity and hope. Our mission continues to this day, moving from emergency aid to rehabilitation, skill development, and eventually, self-reliance programs that empower flood-affected families to stand on their feet again.";

/** Live paragraph 4 — relief as a continuous journey. */
const JOURNEY_PARAGRAPH =
  "Flood relief in Pakistan is not a one-time response; it’s a continuous journey of recovery, compassion, and community rebuilding.";

/** Live closing paragraph appealing for shelter, stability and strength. */
const JOIN_PARAGRAPH =
  "Join hands with Sirat-e-Mustaqeem Welfare Trust to support disaster victims, and help us bring shelter, stability, and strength to those still recovering from the worst floods in decades.";

/**
 * The supplies the live copy lists as delivered to flood victims, presented
 * as cards. The titles are the source's own list items; the one-line
 * descriptions are presentation.
 */
const SUPPLY_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiShoppingBag;
}[] = [
  {
    title: "Food rations",
    description:
      "Essential food rations delivered to families who lost everything.",
    icon: HiShoppingBag,
  },
  {
    title: "Tents",
    description:
      "Tents providing shelter where homes were submerged by the floods.",
    icon: HiHome,
  },
  {
    title: "Clean drinking water",
    description:
      "Clean drinking water to prevent disease in the aftermath of the floods.",
    icon: HiBeaker,
  },
  {
    title: "Clothing",
    description:
      "Clothing for families left with nothing after the waters rose.",
    icon: HiGift,
  },
  {
    title: "Medicines",
    description:
      "Medicines for victims in areas where emergency relief was hardest to deliver.",
    icon: HiHeart,
  },
];

/**
 * The recovery journey the live copy describes, presented as steps. The
 * titles are the source's own sequence — emergency aid to rehabilitation,
 * skill development and eventually self-reliance.
 */
const RECOVERY_STEPS: readonly {
  title: string;
  description: string;
  icon: typeof HiHandRaised;
}[] = [
  {
    title: "Emergency aid",
    description:
      "Immediate relief supplies in the harshest conditions, reaching neglected communities first.",
    icon: HiHandRaised,
  },
  {
    title: "Rehabilitation",
    description:
      "A long-term commitment that helps victims rebuild their lives with dignity and hope.",
    icon: HiHome,
  },
  {
    title: "Skill development",
    description:
      "Skills that open a path back to earning a living after losing everything.",
    icon: HiWrenchScrewdriver,
  },
  {
    title: "Self-reliance",
    description:
      "Programs that empower flood-affected families to stand on their feet again.",
    icon: HiUserGroup,
  },
];

/**
 * The crisis and the regions the live copy names, shown as the mission's
 * facts panel. Both are lifted from the live page — no other figure is
 * claimed.
 */
const MISSION_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiMapPin;
}[] = [
  {
    label: "The crisis",
    value:
      "The 2022 floods — thousands of villages submerged, millions left homeless",
    icon: HiHandRaised,
  },
  {
    label: "Hardest-hit regions",
    value:
      "South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari)",
    icon: HiMapPin,
  },
];

export const metadata: Metadata = {
  title: "Flood Relief Mission",
  description:
    "Standing Together in Crisis is True Humanity! Sirat-e-Mustaqeem Welfare Trust delivered food rations, tents, clean drinking water, clothing and medicines to thousands of families hit by the 2022 floods in South Punjab (Rajanpur), Interior Sindh and Balochistan (Okari) — and continues from emergency aid to rehabilitation, skill development and self-reliance.",
  openGraph: {
    title: "Flood Relief Mission | SM Welfare Trust",
    description:
      "Food rations, tents, clean drinking water, clothing and medicines for families hit by the 2022 floods — and a long-term commitment from emergency aid to self-reliance.",
  },
  twitter: {
    title: "Flood Relief Mission | SM Welfare Trust",
    description:
      "Food rations, tents, clean drinking water, clothing and medicines for families hit by the 2022 floods — and a long-term commitment from emergency aid to self-reliance.",
  },
};

export default function FloodReliefMissionPage() {
  return (
    <>
      <PageHero
        title="Flood Relief Mission"
        description="Standing Together in Crisis is True Humanity!"
      />

      {/* Live copy — the 2022 floods and the regions hardest hit, beside the
          client-provided photo (16:9, framed at its natural ratio so it is
          never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="One of the most devastating chapters in Pakistan's history"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={FLOOD_RELIEF_MISSION.src}
              alt={FLOOD_RELIEF_MISSION.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the response + the supply cards and the facts panel */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our response"
            title="Standing by flood victims in the harshest conditions"
            description="Reaching neglected and underserved communities with essential flood relief supplies — an act of loyalty to humanity, not just a relief effort."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {RESPONSE_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPLY_CARDS.map((item) => (
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

          {/* The live copy's own crisis and the regions it names */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {MISSION_FACTS.map((fact) => (
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

      {/* Live copy about the long-term commitment, with the copy's own
          recovery journey as steps */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Beyond temporary assistance"
              title="A long-term commitment, not a one-time response"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {COMMITMENT_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {RECOVERY_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-section p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <step.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-section px-6 py-10 text-center shadow-sm sm:px-10">
            <span className="h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
            <p className="font-heading text-xl font-bold leading-snug tracking-tight text-balance sm:text-2xl">
              {JOURNEY_PARAGRAPH}
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
              title="Bring shelter, stability and strength to those still recovering"
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
