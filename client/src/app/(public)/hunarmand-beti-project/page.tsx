import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  HiArrowRight,
  HiClock,
  HiHeart,
  HiMapPin,
  HiPaintBrush,
  HiScissors,
  HiSparkles,
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
import { resolveProjectImage } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Hunarmand Beti Project — mirrors the live /hunarmand-beti-project/ page.
 *
 * Every paragraph below is reproduced from the live WordPress page so the
 * rebuild says exactly what the site it replaces says: the 75% skills gap,
 * the Sirat-e-Mustaqeem Vocational Training Center in Orangi Town, the dream
 * for skilled daughters, the invitation to join, and the centre's location
 * and timing. As on the Founder's Profile page, line-wrap artifacts from the
 * source ("skillbuilding", "selfreliant") are restored to the standard
 * "skill-building" / "self-reliant" spelling.
 *
 * The kickers, skill cards and the "Visit the centre" panel are presentation
 * only — their facts (henna application, sewing and beautician courses;
 * Liaquat Chowk, Gulshan-e-Zia; 12:00 PM to 6:00 PM) all come from the same
 * live copy.
 */

/** Live intro paragraph — the skills gap and why it matters. */
const INTRO_PARAGRAPH =
  "In Pakistan, nearly 75% of women lack vocational training or practical skills, which is significantly higher than in neighboring countries. This alarming gap not only affects women's economic independence but also slows down the overall development of the nation. When half the population is left without skills and unable to contribute to the economy, poverty increases, and the economic system weakens. Empowering women with skills is no longer a choice; it is a national need.";

/** Live paragraph about the training centre and the courses it runs. */
const CENTRE_PARAGRAPH =
  "Under the Sirat-e-Mustaqeem Welfare Trust, the Sirat-e-Mustaqeem Vocational Training Center has been established in Orangi Town, Liaquat Chowk (Karachi). Here, underprivileged girls are being trained in useful skills such as henna application, Sewing, and Beautician courses, all at affordable fees. These skill-building programs are designed to help young women become self-reliant and earn a respectable livelihood with dignity.";

/** Live "we dream of a Pakistan…" paragraph. */
const DREAM_PARAGRAPH =
  "We dream of a Pakistan where every woman has a skill in her hands, where every daughter, sister, and mother is respected, confident, and has a dignified role in society. A skilled daughter can support her family, raise strong future generations, and become a beacon of change.";

/** Live closing paragraph inviting readers to join the mission. */
const JOIN_PARAGRAPH =
  "Join hands with us in this mission. Let's empower more deserving women and girls with skills and build a stronger, self-reliant society together.";

/** The three courses named in the live copy, in the order the page lists them. */
const COURSES: readonly {
  title: string;
  description: string;
  icon: typeof HiPaintBrush;
}[] = [
  {
    title: "Henna application",
    description:
      "Mehndi design and application taught step by step, ready for paid work at weddings and events.",
    icon: HiPaintBrush,
  },
  {
    title: "Sewing",
    description:
      "Stitching and tailoring on real machines — from taking measurements to finishing a wearable garment.",
    icon: HiScissors,
  },
  {
    title: "Beautician courses",
    description:
      "Salon and beautician skills that let graduates earn from home or join a local salon with confidence.",
    icon: HiSparkles,
  },
];

/** Live "Location" and "Timing" lines, shown in the visit panel. */
const CENTRE_FACTS: readonly {
  label: string;
  value: string;
  icon: typeof HiMapPin;
}[] = [
  {
    label: "Location",
    value: "Liaquat Chowk, Gulshan-e-Zia, Orangi Town, Karachi.",
    icon: HiMapPin,
  },
  {
    label: "Timing",
    value: "12:00 PM to 6:00 PM",
    icon: HiClock,
  },
];

/**
 * Byte-verified project photograph from the curated image set
 * (`project-hunarmand-beti.jpg`) — the same resolver the Projects page uses,
 * so this page never drifts from the shared imagery.
 */
const PROJECT_IMAGE = resolveProjectImage({ slug: "hunarmand-beti" });

export const metadata: Metadata = {
  title: "Hunarmand Beti Project",
  description:
    "Skilled girls, a promise for a brighter future — the Hunarmand Beti Project trains underprivileged girls at the Sirat-e-Mustaqeem Vocational Training Center in Orangi Town, Karachi in henna application, sewing and beautician courses at affordable fees.",
  openGraph: {
    title: "Hunarmand Beti Project | SM Welfare Trust",
    description:
      "Vocational training for underprivileged girls in Orangi Town — henna application, sewing and beautician courses at affordable fees.",
  },
  twitter: {
    title: "Hunarmand Beti Project | SM Welfare Trust",
    description:
      "Vocational training for underprivileged girls in Orangi Town — henna application, sewing and beautician courses at affordable fees.",
  },
};

export default function HunarmandBetiProjectPage() {
  return (
    <>
      <PageHero
        title="Hunarmand Beti Project"
        description="Skilled Girls, A Promise for a Brighter Future!"
      />

      {/* Live intro copy — the 75% skills gap */}
      <section className="bg-white">
        <Container className="grid items-start gap-12 py-16 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="The challenge"
              title="Skilled Girls, A Promise for a Brighter Future!"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {INTRO_PARAGRAPH}
            </p>
          </div>
          <div
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg lg:sticky lg:top-24",
              !PROJECT_IMAGE && "photo-placeholder"
            )}
            aria-hidden={PROJECT_IMAGE ? undefined : "true"}
          >
            {PROJECT_IMAGE ? (
              <Image
                src={PROJECT_IMAGE.src}
                alt={PROJECT_IMAGE.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            ) : null}
          </div>
        </Container>
      </section>

      {/* Live copy about the vocational training centre + the three courses */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            center
            kicker="The centre"
            title="Sirat-e-Mustaqeem Vocational Training Center"
            description="Established in Orangi Town, Liaquat Chowk (Karachi) for underprivileged girls, at affordable fees."
          />
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              {CENTRE_PARAGRAPH}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((course) => (
              <article
                key={course.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <course.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {course.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {course.description}
                </p>
              </article>
            ))}
          </div>

          {/* Live "Location" and "Timing" lines */}
          <div className="mx-auto grid w-full max-w-3xl gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            {CENTRE_FACTS.map((fact) => (
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

      {/* Live "we dream of a Pakistan…" copy */}
      <section className="border-t border-border bg-white">
        <Container className="py-16 sm:py-20">
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <SectionHeading
              kicker="Our dream"
              title="A skilled daughter becomes a beacon of change"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              {DREAM_PARAGRAPH}
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
              title="Let's build a stronger, self-reliant society"
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
                href="/forms"
                className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT)}
              >
                Vocational admission form
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
