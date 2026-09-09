import {
  HiGlobeAlt,
  HiEye,
  HiShieldCheck,
  HiArrowRight,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { CtaBand } from "@/components/shared/cta-band";
import { listPublicPrograms } from "@/services/public-programs";
import type { PublicProgram } from "@/types/public-api";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    icon: HiGlobeAlt,
    title: "Our mission",
    description:
      "To be a ray of light in education, healthcare, employment and social welfare for people who fight each day just to survive.",
  },
  {
    icon: HiEye,
    title: "Our vision",
    description:
      "A society where no one is left behind — where every family can live with dignity, confidence and independence.",
  },
  {
    icon: HiShieldCheck,
    title: "Our promise",
    description:
      "Transparency, integrity and consistent effort. Donations are tracked, reported and spent where they were pledged.",
  },
] as const;

async function fetchPrograms(): Promise<PublicProgram[]> {
  try {
    const result = await listPublicPrograms({ limit: 12 });
    return result.items;
  } catch {
    return [];
  }
}

export default async function AboutPage() {
  const programs = await fetchPrograms();

  return (
    <>
      <PageHero
        kicker="Serving Karachi since 2017"
        title="Charity efforts that are for happiness"
        description="At SM Welfare Charity we believe true happiness lies in giving, especially to those who need it most. Our mission is rooted in compassion and our vision is a society where no one is left behind."
      />

      {/* Mission / Vision / Promise */}
      <section className="bg-white">
        <Container className="grid gap-6 py-16 sm:py-20 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-xl border border-border bg-white p-6 shadow-sm"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-xl font-bold tracking-tight">
                {title}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </Container>
      </section>

      {/* Our story */}
      <section className="border-t border-border bg-white">
        <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <SectionHeading
              kicker="Our story"
              title="Grassroots work, measured in real families"
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              With your support we provide food to the hungry, sponsor education
              for orphaned children, offer free medical aid and install clean
              water systems in remote communities across Pakistan. We work at
              the grassroots level in Orangi Town, creating sustainable change
              that lets families become self-reliant rather than dependent.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              SM Welfare Trust is one of the most reputable non-profit welfare
              organisations in Pakistan, dedicated to social development and
              relief for low-income groups since 2017.
            </p>
            <div>
              <a
                href="/projects"
                className={cn(buttonVariants(), "group")}
              >
                See what we run
                <HiArrowRight
                  className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
          <div
            className="photo-placeholder aspect-[4/3] rounded-2xl shadow-lg"
            aria-hidden="true"
          />
        </Container>
      </section>

      {/* What we do — fetched from API */}
      <section id="what-we-do" className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            kicker="What we do"
            title="Six areas of focus"
          />
          {programs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Programmes will appear here once they are published.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((program, index) => (
                <article
                  key={program.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm"
                >
                  <span className="font-heading text-3xl font-bold text-primary/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-heading text-lg font-bold tracking-tight">
                    {program.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {program.shortDescription}
                  </p>
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
