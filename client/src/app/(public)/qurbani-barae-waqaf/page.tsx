import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBanknotes,
  HiHandRaised,
  HiHeart,
  HiMapPin,
  HiTruck,
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
import { QURBANI_BARAE_WAQAF } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Qurbani Barae Waqaf — mirrors the live /qurbani-barae-waqaf/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: Qurbani as one of the
 * greatest acts of worship in Islam and the selflessness, compassion and
 * devotion it teaches, how on Eid-ul-Adha countless people long for a blessing
 * as basic as meat, those living in informal settlements, rural villages and
 * underprivileged areas where poverty keeps kitchen stoves cold and families
 * hungry, the Trust's purposeful and dignified service "Waqf Qurbani for the
 * Deserving" that lets generous people donate financially for Qurbani and
 * ensures 100% of the meat reaches those who truly deserve it, Orangi Town's
 * density and its educated, hardworking and talented residents, the volunteers
 * delivering meat door-to-door to the most needy families, the work done not
 * for show or fame but purely for the pleasure of Allah and in the spirit of
 * serving humanity regardless of race, religion or background, the mission to
 * include the hearts left behind in the joys of Eid, the belief that every
 * person deserves to live with dignity, equality and love, and the closing
 * invitation. The initiative's own name, "Waqf Qurbani for the Deserving.", is
 * used as the hero subtitle because the live page carries no separate tagline
 * and every project page here has one.
 *
 * SOURCE NOTE: the live page reads "which they haven't get to eat for years";
 * that grammatical slip is rejoined to "which they haven't been able to eat
 * for years" here, in the same spirit as the line-wrap artifacts corrected on
 * the other project pages. Nothing else in the copy is altered.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project,
 * Marriage Support Program, Free Eid Shopping, Flood Relief Mission, Home &
 * Masjid Renovation): PageHero → challenge grid with a sticky image →
 * bg-section service band (heading, copy, service cards, facts panel) → white
 * mission section with the copy's own statement as a callout → closing card →
 * CtaBand.
 *
 * The kickers, headings, the service cards and the facts panel are
 * presentation only — every fact in them (100% of the meat, Orangi Town,
 * door-to-door delivery, financial donation for Qurbani, service regardless
 * of race, religion or background) comes from the same live copy. The client
 * photo is framed at its natural 16:9 ratio so it is never cropped.
 */

/** Live paragraph 1 — Qurbani as an act of worship and who longs for meat. */
const CHALLENGE_PARAGRAPH =
  "Qurbani (sacrifice) is one of the greatest acts of worship in Islam. It teaches us the values of selflessness, compassion, and devotion. On this blessed occasion of Eid-ul-Adha, while we celebrate happiness in our homes, countless people around us are longing for a blessing as basic as meat, which they haven’t been able to eat for years.";

/** Live paragraph 2 — the areas where poverty keeps stoves cold. */
const AREAS_PARAGRAPH =
  "This is especially true for those living in informal settlements, rural villages, and underprivileged areas, where poverty keeps kitchen stoves cold and families hungry.";

/** Live paragraph 3 — the Waqf Qurbani service and the 100% promise. */
const SERVICE_PARAGRAPH =
  "To support such deserving individuals, Sirat-e-Mustaqeem Welfare Trust has launched a purposeful and dignified service called “Waqf Qurbani for the Deserving.” The primary goal is to allow generous people to donate financially for Qurbani, and then ensure that 100% of the meat is delivered to those who truly deserve it.";

/** Live paragraph 4 — Orangi Town and the door-to-door delivery. */
const DELIVERY_PARAGRAPH =
  "In Orangi Town, a densely populated area filled with educated, hardworking, and talented individuals, there are also many challenges due to the vast population. Volunteers from Sirat-e-Mustaqeem have worked here in an organized manner, delivering meat door-to-door, reaching the most needy families.";

/** Live paragraph 5 — the intention behind the work. */
const INTENTION_PARAGRAPH =
  "We do this not for show or fame, but purely for the pleasure of Allah and with the spirit of serving humanity, regardless of race, religion, or background.";

/** Live paragraph 6 — the mission to include every heart in Eid's joy. */
const MISSION_PARAGRAPH =
  "Our mission is not just to distribute meat, but to include the hearts that have been left behind in the joys of Eid. We believe every person in society deserves to live with dignity, equality, and love.";

/** Live paragraph 7 — the invitation to join the noble cause. */
const JOIN_PARAGRAPH = "Join us in this noble cause of Waqf Qurbani.";

/** Live closing line — the page's own last sentence. */
const CLOSING_PARAGRAPH =
  "Let your sacrifice reach those hearts who are truly waiting for your kindness and sincerity.";

/** The initiative's own name, used as the hero subtitle. */
const TAGLINE = "Waqf Qurbani for the Deserving.";

/**
 * How the Waqf Qurbani service works, presented as cards. The titles condense
 * the live copy's own points; the one-line descriptions are presentation.
 */
const SERVICE_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiBanknotes;
}[] = [
  {
    title: "Donate for Qurbani",
    description:
      "Generous people donate financially for Qurbani — the Trust handles the rest.",
    icon: HiBanknotes,
  },
  {
    title: "100% of the meat delivered",
    description:
      "Every part of the meat reaches those who truly deserve it.",
    icon: HiHeart,
  },
  {
    title: "Door-to-door delivery",
    description:
      "Volunteers work in an organised manner, reaching the most needy families in Orangi Town.",
    icon: HiTruck,
  },
  {
    title: "For the pleasure of Allah",
    description:
      "Not for show or fame — serving humanity regardless of race, religion or background.",
    icon: HiHandRaised,
  },
];

/**
 * The two facts stated in the live copy, shown as the service's facts panel.
 * Both are lifted from the live page — no other figure is claimed.
 */
const SERVICE_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiHeart;
}[] = [
  {
    label: "Every share",
    value: "100% of the meat is delivered to those who truly deserve it",
    icon: HiHeart,
  },
  {
    label: "Where",
    value: "Orangi Town — delivered door-to-door to the most needy families",
    icon: HiMapPin,
  },
];

export const metadata: Metadata = {
  title: "Qurbani Barae Waqaf",
  description:
    "Waqf Qurbani for the Deserving. Sirat-e-Mustaqeem Welfare Trust lets generous people donate financially for Qurbani on Eid-ul-Adha and ensures 100% of the meat is delivered door-to-door to the most needy families in Orangi Town, Karachi — purely for the pleasure of Allah.",
  openGraph: {
    title: "Qurbani Barae Waqaf | SM Welfare Trust",
    description:
      "Donate for Qurbani and 100% of the meat reaches those who truly deserve it — delivered door-to-door to the most needy families in Orangi Town, Karachi.",
  },
  twitter: {
    title: "Qurbani Barae Waqaf | SM Welfare Trust",
    description:
      "Donate for Qurbani and 100% of the meat reaches those who truly deserve it — delivered door-to-door to the most needy families in Orangi Town, Karachi.",
  },
};

export default function QurbaniBaraeWaqafPage() {
  return (
    <>
      <PageHero title="Qurbani Barae Waqaf" description={TAGLINE} />

      {/* Live copy — what Qurbani teaches and who longs for meat, beside the
          client-provided photo (16:9, framed at its natural ratio so it is
          never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The occasion"
              title="A blessing as basic as meat, longed for year after year"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {AREAS_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={QURBANI_BARAE_WAQAF.src}
              alt={QURBANI_BARAE_WAQAF.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the Waqf Qurbani service + the service cards and the
          facts panel */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our service"
            title="Waqf Qurbani for the Deserving"
            description="A purposeful and dignified service: donate financially for Qurbani and 100% of the meat is delivered to the families who truly deserve it."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {SERVICE_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICE_CARDS.map((item) => (
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

          {/* The live copy's own 100% promise and where the meat is delivered */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {SERVICE_FACTS.map((fact) => (
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

      {/* Live copy about the delivery in Orangi Town, the intention behind the
          work and the mission to include every heart */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our mission"
              title="Not just distributing meat — including every heart in Eid's joy"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {DELIVERY_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {MISSION_PARAGRAPH}
            </p>
          </div>

          {/* The live copy's own statement of intention, shown as a callout */}
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-section px-6 py-10 text-center shadow-sm sm:px-10">
            <span className="h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
            <p className="font-heading text-xl font-bold leading-snug tracking-tight text-balance sm:text-2xl">
              {INTENTION_PARAGRAPH}
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
              title={CLOSING_PARAGRAPH}
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
