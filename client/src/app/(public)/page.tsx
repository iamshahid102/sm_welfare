import Link from "next/link";
import Image from "next/image";
import {
  HiArrowRight,
  HiCalendarDays,
  HiCheckBadge,
  HiEye,
  HiHeart,
  HiMapPin,
  HiSparkles,
} from "react-icons/hi2";
import {
  FaBoxOpen,
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
import { ABOUT_IMAGE, STORY_HIGHLIGHTS } from "@/data/site-images";
import { SITE } from "@/constants/site";
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
 * Homepage — same content and section order as the live smwelfare.charity
 * homepage, laid out in a modern foundation/charity editorial style on the
 * existing blue/amber theme. No theme token is changed and no new claim about
 * the Trust is introduced: every figure, name and paragraph below still comes
 * from the data modules that mirror the live site.
 *
 * WHAT CHANGED IS LAYOUT AND VISUAL TREATMENT ONLY:
 *   - a slim trust strip under the hero banner, built from the organisation
 *     constants this project already holds (`constants/site.ts`: since 2017,
 *     registered trust, Orangi Town, active projects) — the same facts the
 *     footer states;
 *   - the programme chips became a labelled strip that scrolls horizontally on
 *     small screens instead of wrapping into a tall block;
 *   - the card sections (Projects, Media Updates) use a split header — heading
 *     on the left, "view all" action on the right — instead of a centred
 *     button floating under the grid;
 *   - the impact counters sit in glass cards with an icon each, so the band
 *     reads as data rather than plain text on the gradient;
 *   - the six service cards gained an amber top rule, a lifted hover state and
 *     a calmer number treatment;
 *   - the mission section pairs its copy with the story photograph and a
 *     "serving since" card, so it is no longer a wall of text.
 */

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

/** Icon per impact counter, in the live funfact order. */
const IMPACT_ICONS = [
  FaUtensils,
  FaBoxOpen,
  FaUserGraduate,
  FaHandHoldingMedical,
] as const;

/**
 * Trust strip facts — every value is an organisation constant this project
 * already holds, not a new claim about the Trust.
 */
const TRUST_POINTS = [
  {
    icon: HiCalendarDays,
    label: "Serving since",
    value: String(SITE.establishedYear),
  },
  {
    icon: HiCheckBadge,
    label: "Status",
    value: SITE.registrationNote,
  },
  {
    icon: HiMapPin,
    label: "Based in",
    value: SITE.location,
  },
  {
    icon: HiSparkles,
    label: "On the ground",
    value: `${SITE.activeProjects} active projects`,
  },
] as const;

/**
 * Credibility band directly under the hero — the first thing a visitor reads
 * after the banner, so the page opens with who the Trust is rather than a
 * wall of links.
 */
function TrustStrip() {
  return (
    <section className="border-b border-border bg-white">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 lg:grid-cols-4 lg:gap-x-8">
        {TRUST_POINTS.map((point, index) => (
          <div
            key={point.label}
            className={cn(
              "flex items-start gap-3",
              index > 0 && "lg:border-l lg:border-border lg:pl-8"
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <point.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {point.label}
              </span>
              <span className="font-heading text-sm font-bold text-foreground">
                {point.value}
              </span>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

/**
 * Programme directory — API programmes first, curated fallback.
 *
 * Reads as a designed module rather than a loose cloud of pills: one white
 * panel holding a header row (label + count on the left, "View all projects"
 * on the right) above a tidy grid of equal programme links. The grid keeps
 * every entry aligned to a column, so the last, partly-filled row looks
 * deliberate instead of leaving dead space. On phones the list becomes a
 * single swipeable line (scrollbar hidden) so 13 programmes do not push the
 * rest of the page below the fold.
 */
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
    <section className="border-b border-border bg-section">
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-7">
          {/* Panel header — label and count on the left, action on the right */}
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="flex flex-col gap-1.5">
              <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-accent-strong">
                Our programmes
              </p>
              <p className="text-sm text-muted-foreground">
                {chips.length} programmes run by the Trust across Karachi.
              </p>
            </div>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View all projects
              <HiArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* One swipeable line on phones, an aligned grid from `sm` up. */}
          <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:snap-none sm:gap-2.5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-4">
            {chips.map((chip) => (
              <li key={chip.key} className="shrink-0 snap-start">
                <Link
                  href={chip.href}
                  className="group flex h-full w-full items-center justify-between gap-2 rounded-xl bg-section px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 rounded-full bg-accent transition-colors duration-200 group-hover:bg-primary"
                    />
                    <span className="leading-snug">{chip.label}</span>
                  </span>
                  <HiArrowRight
                    className="size-4 shrink-0 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/**
 * "Our Project" counters — values and labels are the live homepage funfact
 * widgets (600+ Daily Food, 100+ Raashan Support Monthly, 430+ Education
 * Monthly, 7,000+ Medical Monthly) on a full-width brand band.
 */
function ImpactBand() {
  return (
    <section className="relative isolate overflow-hidden bg-hero-gradient text-white">
      <div
        aria-hidden="true"
        className="hero-dots pointer-events-none absolute inset-0 opacity-30"
      />
      <Container className="relative flex flex-col gap-12 py-16 sm:py-20">
        <SectionHeading
          light
          center
          kicker="Impact in numbers"
          title="Our Project"
          description="Reported by our teams on the ground in Orangi Town, Karachi."
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {IMPACT_STATS.map((stat, index) => {
            const Icon = IMPACT_ICONS[index % IMPACT_ICONS.length];
            return (
              <div
                key={stat.label}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-7 text-center backdrop-blur-sm transition-colors duration-300 hover:border-accent/40 hover:bg-white/[0.12]"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-3xl font-bold tracking-tight tabular-nums sm:text-4xl">
                  {stat.value}
                </span>
                <span className="text-sm text-blue-100/90">{stat.label}</span>
              </div>
            );
          })}
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <SectionHeading
            kicker="Our initiatives"
            title="Our Projects"
            description="SM Welfare Trust is one of the most reputable non-profit welfare organisations in Pakistan, dedicated to social development and providing relief to individuals from low-income groups since 2017."
          />
          <Link
            href="/projects"
            className={cn(
              buttonVariants(),
              BTN_OUTLINE_DEFAULT,
              "group w-fit shrink-0"
            )}
          >
            <HiEye className="mr-1.5 size-4" aria-hidden="true" />
            View all projects
            <HiArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

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
      </Container>
    </section>
  );
}

/** About — live heading + the six service cards, with a lifted hover state. */
function AboutSection() {
  return (
    <section className="border-t border-border bg-section">
      <Container className="flex flex-col gap-12 py-16 sm:py-20">
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
                className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg"
              >
                {/* Amber rule that draws itself in on hover. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-2xl font-bold tabular-nums text-primary/20">
                    {program.number}
                  </span>
                </div>
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

/**
 * Our Mission — live homepage copy beside the story photograph, with the
 * "serving since" card grounded on the image so the section has a visual
 * anchor instead of being pure text.
 */
function MissionSection() {
  return (
    <section className="border-t border-border bg-white">
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={ABOUT_IMAGE.src}
              alt={ABOUT_IMAGE.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:bottom-6 sm:left-6 sm:px-5 sm:py-3.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <HiSparkles className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col">
              <span className="font-heading text-lg font-bold leading-none tabular-nums">
                {SITE.establishedYear}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                Serving since
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <SectionHeading
            kicker="About us"
            title="Our Mission"
            description="Hope and smiles for lives filled with struggle."
          />
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
 * real photography.
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <SectionHeading
            kicker="Latest update"
            title="Media Updates"
            description="Reports, field notes and photographs from the communities we serve across Karachi."
          />
          <Link
            href="/media"
            className={cn(
              buttonVariants(),
              BTN_OUTLINE_DEFAULT,
              "group w-fit shrink-0"
            )}
          >
            <HiEye className="mr-1.5 size-4" aria-hidden="true" />
            View all updates
            <HiArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

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
 * welcome hero → trust strip → programme chips → six featured projects (live
 * slider) → Our Project counters → About (live heading + six service cards) →
 * Our Mission → Media Updates → donate CTA — on the existing blue/amber theme.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Credibility facts, straight under the banner */}
      <TrustStrip />

      {/* Programme chips — fetched from API */}
      <ProgramChips />

      {/* Six featured projects — live slider order, verified photos */}
      <ProjectsSection />

      {/* Our Project counters — live funfact values */}
      <ImpactBand />

      {/* About — live heading + six service cards */}
      <AboutSection />

      {/* Our Mission — live homepage copy beside the story photo */}
      <MissionSection />

      {/* Media Updates — live excerpts, verified photos */}
      <MediaSection />

      <CtaBand />
    </>
  );
}
