import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HiArrowRight, HiHeart, HiPhone } from "react-icons/hi2";
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
import { AMBULANCE_BANNER } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

/**
 * Ambulance Services — mirrors the live /ambulance-services/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the Karachi / Orangi
 * Town response gap, the launch of the Ambulance Service where government or
 * private ambulances are unavailable, the minimal-expense / free
 * (Fi Sabeelillah) charging model, the two ambulances in operation, and the
 * closing appeal. The tagline "Every Breath is Precious!" is the live page's
 * own subtitle.
 *
 * The layout follows the same section flow as the Free Schooling System and
 * Hunarmand Beti pages: PageHero → challenge grid with a sticky image →
 * bg-section service band (heading, impact counters, copy) → white fleet
 * section → closing card → CtaBand.
 *
 * The kickers, headings and the impact counters are presentation only — every
 * figure in the counters (two ambulances, free for the extremely needy,
 * minimal expenses, Orangi Town) is taken from the same live copy.
 */

/** Live paragraph 1 — the timely-transport gap in Karachi. */
const CHALLENGE_PARAGRAPH =
  "In a large city like Karachi, where modern hospitals and medical facilities are available in some areas, there are still densely populated and underprivileged areas like Orangi Town, where thousands of people are deprived of timely medical treatment. Research and local observations reveal that in these areas, dozens of patients lose their lives simply because an ambulance fails to arrive on time or there's no way to get to the hospital quickly. In such situations, immediate medical assistance and safe transportation can mean the difference between life and death.";

/** Live paragraph 2 — why the service was launched and where it operates. */
const LAUNCH_PARAGRAPH =
  "Keeping this basic human need in mind, Sirat-e-Mustaqeem Welfare Trust launched its Ambulance Service, specifically operating in areas where government or private ambulance services are either limited or completely unavailable. Our goal is to ensure that every person in need is transported to the hospital in a timely and dignified manner.";

/** Live paragraph 3 — the charging model and the core belief. */
const CHARGES_PARAGRAPH =
  "Under this service, we charge only the necessary minimal expenses, and that too only from those who can afford it. For the extremely needy and poor, this service is provided completely free of cost (Fi Sabeelillah). This initiative reflects the core belief of Sirat-e-Mustaqeem that \"saving one life is like saving all of humanity.\"";

/** Live paragraph 4 — the current fleet and the aim to expand. */
const FLEET_PARAGRAPH =
  "Currently, Sirat-e-Mustaqeem operates with only two ambulances, and we aim to expand this life-saving service to more areas so that more lives can be saved.";

/** Live closing paragraph requesting prayers, support and donations. */
const JOIN_PARAGRAPH =
  "We earnestly request your prayers, support, and donations to help us continue and grow this noble mission.";

/**
 * Impact counters — every value is lifted from the live copy above, so the
 * band reports the page's own figures rather than invented ones.
 */
const AMBULANCE_STATS: readonly { value: string; label: string }[] = [
  { value: "2", label: "Ambulances currently in service" },
  { value: "Free", label: "For the extremely needy — Fi Sabeelillah" },
  { value: "Minimal", label: "Necessary expenses only, from those who can afford" },
  { value: "Orangi Town", label: "Operating where services are limited or unavailable" },
];

/** Click-to-call href for the closing card's secondary action. */
const CALL_HREF = `tel:${SITE.phone.replace(/\s/g, "")}`;

export const metadata: Metadata = {
  title: "Ambulance Services",
  description:
    "Every Breath is Precious! Sirat-e-Mustaqeem Welfare Trust's Ambulance Service provides timely, dignified hospital transport in areas of Karachi where ambulances are limited — free of cost for the extremely needy (Fi Sabeelillah).",
  openGraph: {
    title: "Ambulance Services | SM Welfare Trust",
    description:
      "Timely, dignified ambulance transport in Orangi Town and other underserved areas of Karachi — free for the extremely needy, minimal expenses for others.",
  },
  twitter: {
    title: "Ambulance Services | SM Welfare Trust",
    description:
      "Timely, dignified ambulance transport in Orangi Town and other underserved areas of Karachi — free for the extremely needy, minimal expenses for others.",
  },
};

export default function AmbulanceServicesPage() {
  return (
    <>
      <PageHero
        title="Ambulance Services"
        description="Every Breath is Precious!"
      />

      {/* Live copy — the timely-transport gap in Karachi, beside the
          AMBULANCE-BANNER artwork (the live page's first content element,
          loaded eagerly exactly like the source's fetchpriority="high").
          The banner is framed at its natural 16:9 ratio so the designed
          artwork is never cropped, matching how the reference pages frame
          their own project imagery. */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="When an ambulance fails to arrive on time"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHALLENGE_PARAGRAPH}
            </p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24">
            <Image
              src={AMBULANCE_BANNER.src}
              alt={AMBULANCE_BANNER.alt}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      {/* Live copy about the service + the page's own figures */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="Our service"
            title="Dignified transport, wherever ambulances are unavailable"
            description="Launched by Sirat-e-Mustaqeem Welfare Trust for the areas government and private services leave behind."
          />

          <div className="grid grid-cols-2 gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-4">
            {AMBULANCE_STATS.map((stat) => (
              <Stat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>

          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {LAUNCH_PARAGRAPH}
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              {CHARGES_PARAGRAPH}
            </p>
          </div>
        </Container>
      </section>

      {/* Live fleet copy — the two ambulances and the aim to expand */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our fleet"
              title="Two ambulances, one mission to save more lives"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {FLEET_PARAGRAPH}
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
              kicker="Join the mission"
              title="Let's come together and fulfill our duty to humanity!"
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
              <a
                href={CALL_HREF}
                className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT)}
              >
                <HiPhone className="mr-1.5 size-4" aria-hidden="true" />
                Call for ambulance
              </a>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
