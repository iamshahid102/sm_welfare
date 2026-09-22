import Link from "next/link";
import { HiArrowRight, HiCalendarDays, HiEye, HiHeart } from "react-icons/hi2";
import {
  FaDroplet,
  FaHandHoldingMedical,
  FaUserGraduate,
  FaUtensils,
} from "react-icons/fa6";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { Hero } from "@/components/shared/hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stat } from "@/components/shared/stat";
import { ProjectCard } from "@/components/shared/project-card";
import { MediaCard } from "@/components/shared/media-card";
import { CtaBand } from "@/components/shared/cta-band";
import {
  MISSION_PARAGRAPHS,
  IMPACT_STATS,
  PROGRAMS,
  ABOUT_INTRO,
} from "@/data/programs";
import { PROJECTS } from "@/data/projects";
import { STORY_HIGHLIGHTS } from "@/data/site-images";
import { listPublicPrograms } from "@/services/public-programs";
import { listPublicProjects } from "@/services/public-projects";
import { listPublicMedia } from "@/services/public-media";
import type { PublicProgram } from "@/types/public-api";
import { cn } from "@/lib/utils";
import {
  BTN_PRIMARY_BLUE,
  BTN_OUTLINE_DEFAULT,
} from "@/components/shared/home-styles";

/**
 * Icon per service card — utensils / graduate / medical for the first three
 * (matching the icon set the live site uses), themed icons for the rest.
 * Order follows the live homepage "About" card order.
 */
const PROGRAM_ICONS = [
  FaUtensils,
  FaUserGraduate,
  FaHandHoldingMedical,
  FaDroplet,
  HiHeart,
  HiCalendarDays,
] as const;

/** Programme chips for the hero-adjacent row — API first, curated fallback. */
async function ProgramChips() {
  let programs: PublicProgram[] = [];
  try {
    // 20 > the 13 seeded programs so none is silently dropped by the page limit.
    const result = await listPublicPrograms({ limit: 20 });
    programs = result.items;
  } catch (err) {
    console.error("[Home] Failed to fetch programs:", err);
  }

  const chips =
    programs.length > 0
      ? programs.map((program) => ({
          key: program.slug,
          label: program.title,
          href: `/projects?program=${encodeURIComponent(program.slug)}`,
        }))
      : PROGRAMS.map((program) => ({
          key: program.number,
          label: program.name,
          href: "/projects",
        }));

  return (
    <section className="border-b border-border bg-white">
      <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-6">
        {chips.map((chip) => (
          <Link
            key={chip.key}
            href={chip.href}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {chip.label}
          </Link>
        ))}
      </Container>
    </section>
  );
}

/**
 * "Our Project" counters — values and labels are the live homepage funfact
 * widgets (600+ Daily Food, 100+ Raashan Support Monthly, 430+ Education
 * Monthly, 7,000+ Medical Monthly) on a full-width brand band, Saylani
 * "Our Impact In Numbers" layout.
 */
function ImpactBand() {
  return (
    <section className="relative isolate overflow-hidden bg-hero-gradient text-white">
      <div
        aria-hidden="true"
        className="hero-dots pointer-events-none absolute inset-0 opacity-30"
      />
      <Container className="relative flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading
          light
          center
          kicker="Impact in numbers"
          title="Our Project"
          description="Reported by our teams on the ground in Orangi Town, Karachi."
        />
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <Stat
              key={stat.label}
              light
              value={stat.value}
              label={stat.label}
              className="items-center text-center"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

/**
 * Projects grid — API projects when the CMS has them, otherwise the curated
 * set in the live slider order (Sasta Khana → Free Schooling → Health Care →
 * Hunarmand Beti → Qurbani → Free Eid Shopping). The curated set carries the
 * byte-verified project photography, so the grid shows real pictures either
 * way.
 */
async function ProjectsSection() {
  let projects: Awaited<ReturnType<typeof listPublicProjects>>["items"] = [];
  try {
    const result = await listPublicProjects({ limit: 6 });
    projects = result.items;
  } catch (err) {
    console.error("[Home] Failed to fetch projects:", err);
  }

  const curated = PROJECTS.slice(0, 6);

  return (
    <section className="border-t border-border bg-white">
      <Container className="flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading
          center
          kicker="Our initiatives"
          title="Our Projects"
          description="SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan, dedicated to social development and providing relief to individuals from low-income groups since 2017."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length > 0
            ? projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  apiProject={{ ...project, source: "api" }}
                />
              ))
            : curated.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={{
                    slug: project.slug,
                    name: project.name,
                    category: project.category,
                    summary: project.summary,
                    source: "static",
                  }}
                />
              ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/projects"
            className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT, "group")}
          >
            <HiEye className="mr-1.5 size-4" aria-hidden="true" />
            View all projects
            <HiArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}

/** About — live heading split Saylani-style (kicker line + big line). */
function AboutSection() {
  return (
    <section className="border-t border-border bg-section">
      <Container className="flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading
          center
          kicker="About Sirat E Mustaqeem Welfare Trust"
          title="Charity Efforts Are For Happiness"
          description={ABOUT_INTRO}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program, index) => {
            const Icon = PROGRAM_ICONS[index % PROGRAM_ICONS.length];
            return (
              <article
                key={program.number}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-3xl font-bold text-primary/30">
                  {program.number}
                </span>
                <h3 className="font-heading text-lg font-bold tracking-tight">
                  {program.name}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {program.description}
                </p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/** Our Mission — live homepage copy with a Read More link to /about. */
function MissionSection() {
  return (
    <section className="border-t border-border bg-white">
      <Container className="grid items-start gap-10 py-16 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeading
          kicker="About us"
          title="Our Mission"
          description="Hope and smiles for lives filled with struggle."
        />
        <div className="flex flex-col gap-4">
          {MISSION_PARAGRAPHS.slice(0, 2).map((paragraph) => (
            <p
              key={paragraph.slice(0, 32)}
              className="text-base leading-relaxed text-muted-foreground"
            >
              {paragraph}
            </p>
          ))}
          <div>
            <Link
              href="/about"
              className={cn(buttonVariants(), BTN_PRIMARY_BLUE, "group")}
            >
              Read More
              <HiArrowRight
                className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Media Updates — API media when available, otherwise the six curated field
 * stories (byte-verified photos + live excerpts), so the row always shows
 * real photography. Saylani "Latest Update / Media Updates" heading pattern.
 */
async function MediaSection() {
  let mediaItems: Awaited<ReturnType<typeof listPublicMedia>>["items"] = [];
  try {
    const result = await listPublicMedia({ limit: 6 });
    mediaItems = result.items;
  } catch (err) {
    console.error("[Home] Failed to fetch media:", err);
  }

  const stories = STORY_HIGHLIGHTS.slice(0, 6);

  return (
    <section className="border-t border-border bg-section">
      <Container className="flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading
          center
          kicker="Latest update"
          title="Media Updates"
          description="Reports, field notes and photographs from the communities we serve across Karachi."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.length > 0
            ? mediaItems.map((item) => (
                <MediaCard key={item.id} apiMedia={{ ...item, source: "api" }} />
              ))
            : stories.map((story) => (
                <MediaCard
                  key={story.slug}
                  update={{
                    slug: story.slug,
                    category: story.category,
                    title: story.title,
                    summary: story.summary,
                    image: story.image,
                    source: "static",
                  }}
                />
              ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/media"
            className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT, "group")}
          >
            <HiEye className="mr-1.5 size-4" aria-hidden="true" />
            View all updates
            <HiArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
}

export const metadata: Metadata = {
  // absolute avoids appending the "| SM Welfare Trust" template suffix to the
  // already-complete home title.
  title: {
    absolute: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
  },
  description:
    "Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.",
  openGraph: {
    title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    description:
      "Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.",
  },
  twitter: {
    title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    description:
      "Sirat-e-Mustaqeem Welfare Trust (SM Welfare) is a registered welfare organisation in Karachi, Pakistan, serving food, education and healthcare to families in need since 2017.",
  },
};

/**
 * Homepage section order mirrors the live smwelfare.charity homepage:
 * welcome hero → programme chips → six featured projects (live slider) →
 * Our Project counters → About (live heading + six service cards) →
 * Our Mission → Media Updates → donate CTA — each laid out in the
 * Saylani Welfare card/heading style on the existing blue/amber theme.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Programme chips — fetched from API */}
      <ProgramChips />

      {/* Six featured projects — live slider order, verified photos */}
      <ProjectsSection />

      {/* Our Project counters — live funfact values */}
      <ImpactBand />

      {/* About — live heading + six service cards */}
      <AboutSection />

      {/* Our Mission — live homepage copy */}
      <MissionSection />

      {/* Media Updates — live excerpts, verified photos */}
      <MediaSection />

      <CtaBand />
    </>
  );
}
