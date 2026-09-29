import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiBuildingLibrary,
  HiHandRaised,
  HiHeart,
  HiHome,
  HiSparkles,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stat } from "@/components/shared/stat";
import { CtaBand } from "@/components/shared/cta-band";
import {
  BTN_OUTLINE_DEFAULT,
  BTN_PRIMARY_BLUE,
} from "@/components/shared/home-styles";
import { HOME_MASJID_RENOVATION } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Home & Masjid Renovation — mirrors the live /home-masjid-renovation/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: Karachi's countless
 * neighbourhoods where hardworking, self-respecting families live under
 * challenging conditions, Orangi Town's low-income white-collar households who
 * may never ask for help but whose homes urgently need repair and restoration,
 * how rains, floods and the wear of time make life even harder in those
 * fragile houses, the "Home and Mosque Renovation Project" the Trust initiated
 * to repair and rebuild damaged or flood-affected homes so families can live
 * under a safe, secure and dignified roof, the quiet and respectful support
 * that preserves white-collar families' self-esteem and pride, the renovation
 * and maintenance of mosques for a clean, peaceful and spiritually uplifting
 * environment for worshippers, the over 12 homes already rebuilt in the Qaim
 * Khani area of Baldia Town, and the closing appeal to rebuild lives rather
 * than only walls. The tagline "A Safe Roof and a Peaceful Place to Pray!" is
 * the live page's own subtitle.
 *
 * The layout follows the same section flow as the other project pages (Free
 * Schooling System, Hunarmand Beti, Ambulance Services, Heat Stroke Camp,
 * Sirat ul Quran Academy, Monthly Raashan Support Program, Rozgar Project,
 * Marriage Support Program, Free Eid Shopping, Flood Relief Mission): PageHero
 * → challenge grid with a sticky image → bg-section project band (heading,
 * copy, project cards, dignity callout) → white impact section with the page's
 * own figures as counters → closing card → CtaBand.
 *
 * The kickers, headings, the project cards and the counters are presentation
 * only — every fact in them (over 12 homes, the Qaim Khani area of Baldia
 * Town, home repair and rebuilding, mosque renovation and maintenance, the
 * quiet and respectful support) comes from the same live copy. The client
 * photo is framed at its natural 3:2 ratio so it is never cropped.
 */

/** Live paragraph 1 — Karachi's self-respecting families and their fragile homes. */
const CHALLENGE_PARAGRAPH =
  "In a vast and fast-paced city like Karachi, there are countless neighborhoods where hardworking and self-respecting families live under challenging conditions. Areas like Orangi Town are home to many low-income, white-collar households who may never ask for help, but whose homes are in urgent need of repair and restoration. When rains, floods, or the wear of time strike these fragile houses, life becomes even more difficult.";

/** Live paragraph 2a — the project and the safe, dignified roof it restores. */
const PROJECT_PARAGRAPH =
  "To address this serious yet often overlooked issue, Sirat-e-Mustaqeem Welfare Trust initiated the “Home and Mosque Renovation Project.” This blessed initiative focuses on repairing and rebuilding damaged or flood-affected homes, ensuring that families can live under a safe, secure, and dignified roof.";

/** Live paragraph 2b — the respect and quiet the support is given with. */
const DIGNITY_PARAGRAPH =
  "Respecting the self-esteem of white-collar families, the support is provided quietly and respectfully, without compromising their pride.";

/** Live paragraph 3 — the mosque renovation and maintenance. */
const MOSQUE_PARAGRAPH =
  "Alongside home restoration, the project also includes renovation and maintenance of mosques, aiming to provide a clean, peaceful, and spiritually uplifting environment for worshippers.";

/** Live paragraph 4 — the homes already rebuilt in Qaim Khani, Baldia Town. */
const IMPACT_PARAGRAPH =
  "Alhamdulillah! In the Qaim Khani area of Baldia Town, we’ve already rebuilt over 12 homes, transforming unsafe, crumbling shelters into secure, grateful homes filled with peace and protection.";

/** Live closing paragraph appealing for roofs and prayer spaces. */
const JOIN_PARAGRAPH =
  "Let’s rebuild more than just walls, let’s rebuild lives. Your small donation can offer a roof to a struggling family or provide a tranquil prayer space for worshippers. Be the reason someone finds shelter and hope.";

/**
 * What the project does, presented as cards. The titles condense the live
 * copy's own points; the one-line descriptions are presentation.
 */
const PROJECT_CARDS: readonly {
  title: string;
  description: string;
  icon: typeof HiHome;
}[] = [
  {
    title: "Home repair & rebuilding",
    description:
      "Damaged and flood-affected homes are repaired and rebuilt so families live under a safe, secure and dignified roof.",
    icon: HiHome,
  },
  {
    title: "Quiet, respectful support",
    description:
      "Given peacefully and respectfully, without compromising the pride of white-collar families.",
    icon: HiHandRaised,
  },
  {
    title: "Mosque renovation",
    description:
      "Renovation and maintenance of mosques for a clean, peaceful and spiritually uplifting environment.",
    icon: HiBuildingLibrary,
  },
  {
    title: "Restoring dignity at home",
    description:
      "Unsafe, crumbling shelters become secure homes filled with peace and protection.",
    icon: HiSparkles,
  },
];

/**
 * Impact counters — every value is lifted from the live copy above, so the
 * band reports the page's own figures rather than invented ones.
 */
const RENOVATION_STATS: readonly { value: string; label: string }[] = [
  { value: "Over 12", label: "Homes rebuilt so far" },
  {
    value: "Qaim Khani",
    label: "The Baldia Town area where the rebuilding happened",
  },
];

export const metadata: Metadata = {
  title: "Home & Masjid Renovation",
  description:
    "A Safe Roof and a Peaceful Place to Pray! Sirat-e-Mustaqeem Welfare Trust's Home and Mosque Renovation Project repairs and rebuilds damaged and flood-affected homes and renovates mosques in Karachi — quietly and respectfully, preserving the dignity of white-collar families. Over 12 homes already rebuilt in the Qaim Khani area of Baldia Town.",
  openGraph: {
    title: "Home & Masjid Renovation | SM Welfare Trust",
    description:
      "Repairing and rebuilding damaged and flood-affected homes and renovating mosques in Karachi — over 12 homes already rebuilt in Qaim Khani, Baldia Town.",
  },
  twitter: {
    title: "Home & Masjid Renovation | SM Welfare Trust",
    description:
      "Repairing and rebuilding damaged and flood-affected homes and renovating mosques in Karachi — over 12 homes already rebuilt in Qaim Khani, Baldia Town.",
  },
};

export default function HomeMasjidRenovationPage() {
  return (
    <>
      <PageHero
        title="Home & Masjid Renovation"
        description="A Safe Roof and a Peaceful Place to Pray!"
      />

      {/* Live copy — Karachi's self-respecting families and their fragile homes,
          beside the client-provided photo (3:2, framed at its natural ratio so
          it is never cropped). */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="Families who never ask for help, in homes that urgently need it"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={HOME_MASJID_RENOVATION.src}
              alt={HOME_MASJID_RENOVATION.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the project + the project cards and the dignity
          callout */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our project"
            title="Repairing homes, restoring dignity"
            description="A serious yet often overlooked issue: repairing and rebuilding damaged or flood-affected homes, and renovating the mosques that serve their communities."
          />

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {PROJECT_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROJECT_CARDS.map((item) => (
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

          {/* The live copy's own respect-for-self-esteem line, shown as a
              callout */}
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-border bg-white px-6 py-10 text-center shadow-sm sm:px-10">
            <span className="h-1 w-12 rounded-full bg-accent" aria-hidden="true" />
            <p className="font-heading text-xl font-bold leading-snug tracking-tight text-balance sm:text-2xl">
              {DIGNITY_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live copy about mosques and the homes already rebuilt + the page's own
          figures as counters */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our impact"
              title="Over 12 homes rebuilt in the Qaim Khani area of Baldia Town"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {MOSQUE_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {IMPACT_PARAGRAPH}
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-8 rounded-2xl border border-border bg-section p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {RENOVATION_STATS.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
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
              title="Let's rebuild more than just walls"
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
