import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HiArrowRight, HiHeart } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stat } from "@/components/shared/stat";
import { Quote } from "@/components/shared/quote";
import { CtaBand } from "@/components/shared/cta-band";
import {
  BTN_OUTLINE_DEFAULT,
  BTN_PRIMARY_BLUE,
} from "@/components/shared/home-styles";
import { IFTAAR_DASTARKHWAN } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Iftaar Dastarkhawan — mirrors the live WordPress category page at
 * /category/iftaar-dastarkhawan/.
 *
 * The live page is deliberately small: the heading "RAMADAN IFTAR DASTARKHWAN",
 * the Trust's own featured photo (768×1024, fetchpriority="high"), and a
 * single paragraph — reproduced verbatim below, split into its two sentences
 * so the intro sentence sits under the hero and the daily-gatherings sentence
 * sits beside the photo. Nothing else exists on the source page (no posts in
 * the archive), so no copy here is invented.
 *
 * The layout follows the same section flow as the other project pages:
 * PageHero → challenge grid with a sticky image → bg-section impact band
 * (heading + counters) → white pull-quote section → closing card → CtaBand.
 * The pull-quote repeats the live paragraph's own closing phrase as an
 * editorial highlight — same words, presented large.
 *
 * The kickers, headings and the counters' labels are presentation only —
 * every figure in the counters (250–300 people a day, hundreds of families,
 * daily gatherings) comes from the same live copy.
 */

/** Live paragraph, sentence 1 — what the Trust is hosting. */
const INTRO_SENTENCE =
  "Sirat-e-Mustaqeem Welfare Trust is hosting daily Iftar gatherings for hundreds of deserving families.";

/** Live paragraph, sentence 2 — the daily turnout and its meaning. */
const DAILY_SENTENCE =
  "Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.";

/**
 * Impact counters — every value is lifted from the live copy above, so the
 * band reports the page's own figures rather than invented ones.
 */
const IFTAAR_STATS: readonly { value: string; label: string }[] = [
  { value: "250–300", label: "People join our Iftar every day" },
  { value: "Hundreds", label: "Deserving families hosted for Iftar" },
  { value: "Daily", label: "Iftar gatherings during Ramadan" },
];

export const metadata: Metadata = {
  title: "Iftaar Dastarkhawan",
  description:
    "Sirat-e-Mustaqeem Welfare Trust is hosting daily Iftar gatherings for hundreds of deserving families. Every day, 250 to 300 people join our Iftar, sharing moments of spiritual peace and community togetherness.",
  openGraph: {
    title: "Iftaar Dastarkhawan | SM Welfare Trust",
    description:
      "Daily Ramadan Iftar gatherings for hundreds of deserving families — 250 to 300 people join our Iftar every day.",
  },
  twitter: {
    title: "Iftaar Dastarkhawan | SM Welfare Trust",
    description:
      "Daily Ramadan Iftar gatherings for hundreds of deserving families — 250 to 300 people join our Iftar every day.",
  },
};

export default function IftaarDastarkhawanPage() {
  return (
    <>
      <PageHero
        title="Ramadan Iftar Dastarkhawan"
        description={INTRO_SENTENCE}
      />

      {/* Live paragraph's daily-gatherings sentence beside the client-provided
          photo (960×1280 portrait, framed at its natural 3:4 ratio so it is
          never cropped — the same ratio as the live page's own featured
          image, loaded eagerly exactly like the source's fetchpriority="high"). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The blessing of iftar"
              title="Iftar for those who need it most"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {DAILY_SENTENCE}
            </p>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={IFTAAR_DASTARKHWAN.src}
              alt={IFTAAR_DASTARKHWAN.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* The page's own figures as impact counters */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our impact"
            title="Hundreds of families, served every day"
            description="Daily gatherings hosted for hundreds of deserving families by Sirat-e-Mustaqeem Welfare Trust."
          />

          <div className="grid grid-cols-1 gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-3">
            {IFTAAR_STATS.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </Container>
      </section>

      {/* Pull-quote — the live paragraph's own closing phrase, shown large.
          The Quote component renders its own white section. */}
      <Quote
        text="Sharing moments of spiritual peace and community togetherness"
        attribution="Ramadan Iftar Dastarkhawan"
      />

      {/* Closing call to action */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join us"
              title="Be the reason someone breaks their fast"
            />
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
