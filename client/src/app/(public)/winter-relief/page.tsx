import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiGift,
  HiHeart,
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
import { WINTER_RELIEF } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Winter Relief — the rebuild of the live /category/winter-relief/ page.
 *
 * A SHORT SOURCE, SAYING SO: the live page is a WordPress category archive
 * with no posts in it. Its entire content is the heading "WINTER RELEIF 2025
 * IN COLLABORATION WITH ALAMGIR WELFARE TRUST" (the live copy's own spelling).
 * Nothing else about the drive — figures, dates, areas, item counts — exists
 * on the source page, so nothing of the sort is claimed here. The two
 * paragraphs of body copy come from this project's own curated Winter Relief
 * entry (`data/projects.ts`), which was written from the live site itself:
 * "Winter clothing and relief for families during the cold season." and
 * "Winter Relief 2025, in collaboration with Alamgir Welfare Trust — warm
 * clothing, blankets and seasonal support for families facing the harsh cold
 * season." The heading is split into a hero title and subtitle; "RELEIF" is
 * corrected to "Relief" in visible labels, matching `data/projects.ts`.
 *
 * If the client supplies the drive's real details (number of blankets,
 * villages reached, dates), this page should be expanded — the cards below are
 * the only items the curated copy names (warm clothing, blankets, seasonal
 * support) and no others are invented.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project,
 * Marriage Support Program, Free Eid Shopping, Flood Relief Mission, Home &
 * Masjid Renovation, Qurbani Barae Waqaf, Tree for Tomorrow): PageHero →
 * intro grid with a sticky image → bg-section band (heading, copy, item cards,
 * collaboration panel) → closing card → CtaBand. The client photo is framed at
 * its natural 4:3 ratio so it is never cropped.
 */

/** Curated copy — what the drive is. */
const SUMMARY =
  "Winter clothing and relief for families during the cold season.";

/** Curated copy — the drive and its collaboration. */
const DESCRIPTION =
  "Winter Relief 2025, in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season.";

/**
 * The items the curated copy names, presented as cards. The titles are the
 * copy's own list; the one-line descriptions are presentation.
 */
const DRIVE_ITEMS: readonly {
  title: string;
  description: string;
  icon: typeof HiGift;
}[] = [
  {
    title: "Blankets",
    description:
      "Blankets to keep families warm through the coldest months of the year.",
    icon: HiSun,
  },
  {
    title: "Warm clothing",
    description:
      "Warm clothing for families who cannot afford protection from the cold.",
    icon: HiGift,
  },
  {
    title: "Seasonal support",
    description:
      "Timely seasonal support while the harsh cold season lasts.",
    icon: HiSparkles,
  },
];

export const metadata: Metadata = {
  title: "Winter Relief",
  description:
    "Winter Relief 2025, in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season, delivered by Sirat-e-Mustaqeem Welfare Trust.",
  openGraph: {
    title: "Winter Relief | SM Welfare Trust",
    description:
      "Winter Relief 2025 in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season.",
  },
  twitter: {
    title: "Winter Relief | SM Welfare Trust",
    description:
      "Winter Relief 2025 in collaboration with Alamgir Welfare Trust — warm clothing, blankets and seasonal support for families facing the harsh cold season.",
  },
};

export default function WinterReliefPage() {
  return (
    <>
      <PageHero
        title="Winter Relief 2025"
        description="In collaboration with Alamgir Welfare Trust"
      />

      {/* Curated copy — winter clothing and relief for families during the cold
          season, beside the client-provided photo (4:3, framed at its natural
          ratio so it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="Our winter drive"
              title="Winter clothing and relief for families during the cold season"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {SUMMARY}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {DESCRIPTION}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={WINTER_RELIEF.src}
              alt={WINTER_RELIEF.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* What the drive provides + the collaboration it runs with */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="What we provide"
            title="Warm clothing, blankets and seasonal support"
            description="Support delivered to families facing the harsh cold season, in collaboration with Alamgir Welfare Trust."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DRIVE_ITEMS.map((item) => (
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

          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <span className="h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
            <p className="font-heading text-xl font-bold leading-snug tracking-tight text-balance sm:text-2xl">
              Winter Relief 2025 — in collaboration with Alamgir Welfare Trust
            </p>
          </div>
        </Container>
      </section>

      {/* Closing call to action */}
      <section className="border-t border-border bg-section">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-border bg-white px-6 py-12 text-center shadow-sm sm:px-12">
            <SectionHeading
              center
              kicker="Join hands with us"
              title="Help families through the harsh cold season"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {DESCRIPTION}
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
