import Link from "next/link";
import { HiArrowRight, HiCheckCircle } from "react-icons/hi2";
import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { Hero } from "@/components/shared/hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stat } from "@/components/shared/stat";
import { ProjectCard } from "@/components/shared/project-card";
import { MediaCard } from "@/components/shared/media-card";
import { Quote } from "@/components/shared/quote";
import { CtaBand } from "@/components/shared/cta-band";
import { MISSION_AREAS, IMPACT_STATS } from "@/data/programs";
import { listPublicPrograms } from "@/services/public-programs";
import { listPublicProjects } from "@/services/public-projects";
import { listPublicMedia } from "@/services/public-media";
import type { PublicProgram } from "@/types/public-api";
import { cn } from "@/lib/utils";
import {
  BTN_PRIMARY_BLUE,
  BTN_OUTLINE_DEFAULT,
} from "@/components/shared/home-styles";

/** Program chips for the hero — fetched from API or shown as static fallback. */
async function ProgramChips() {
  let programs: PublicProgram[] = [];
  try {
    const result = await listPublicPrograms({ limit: 12 });
    programs = result.items;
  } catch (err) {
    console.error("[Home] Failed to fetch programs:", err);
  }

  if (programs.length === 0) return null;

  return (
    <section className="bg-white">
      <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-6">
        {programs.map((program) => (
          <Link
            key={program.slug}
            href={`/projects#${program.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {program.title}
          </Link>
        ))}
      </Container>
    </section>
  );
}

/** Projects section — fetched from API. */
async function ProjectsSection() {
  let projects: Awaited<ReturnType<typeof listPublicProjects>>["items"] = [];
  try {
    const result = await listPublicProjects({ limit: 6 });
    projects = result.items;
  } catch (err) {
    console.error("[Home] Failed to fetch projects:", err);
  }

  return (
    <section className="border-t border-border bg-white">
      <Container className="flex flex-col gap-10 py-16 sm:py-20">
        <SectionHeading
          kicker="Our projects"
          title="Six programmes, one promise — nobody left behind"
          description="Each project answers a problem our team sees on the ground in Karachi — a missed meal, a lost school year, an untreated illness, a skill never learned."
          center
        />
        {projects.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Projects will appear here once they are published.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} apiProject={{ ...project, source: "api" }} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/** Media section — fetched from API. */
async function MediaSection() {
  let mediaItems: Awaited<ReturnType<typeof listPublicMedia>>["items"] = [];
  try {
    const result = await listPublicMedia({ limit: 3 });
    mediaItems = result.items;
  } catch (err) {
    console.error("[Home] Failed to fetch media:", err);
  }

  return (
    <>
      {/* Side-by-side: media heading left, mission content right */}
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col gap-4">
          <SectionHeading
            kicker="Media updates"
            title="Stories from the field"
          />
          <div>
            <Link
              href="/media"
              className={cn(
                buttonVariants(),
                BTN_OUTLINE_DEFAULT,
                "group",
              )}
            >
              View all updates
              <HiArrowRight
                className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading
            kicker="Our mission"
            title="A ray of light in education, health, work and welfare"
          />
          <p className="text-base leading-relaxed text-muted-foreground">
            We stand with families who face growing challenges with each
            passing day. Our goal is to brighten their tomorrow, give them
            practical opportunities, and help them move toward a better and
            more successful future.
          </p>
          <ul className="flex flex-col gap-4">
            {MISSION_AREAS.map((area) => (
              <li
                key={area.title}
                className="flex gap-3 rounded-lg border border-border bg-white p-4"
              >
                <HiCheckCircle
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-heading text-sm font-bold">
                    {area.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {area.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div>
            <Link
              href="/about"
              className={cn(buttonVariants(), BTN_PRIMARY_BLUE)}
            >
              More about us
            </Link>
          </div>
        </div>
      </div>

      {/* Full-width media cards row below the side-by-side layout */}
      {mediaItems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item) => (
            <MediaCard key={item.id} apiMedia={{ ...item, source: "api" }} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export const metadata: Metadata = {
  title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
  description:
    "SM Welfare Trust serves food, education and healthcare to families in need across Karachi, Pakistan. Join us in making a difference since 2017.",
  openGraph: {
    title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    description:
      "SM Welfare Trust serves food, education and healthcare to families in need across Karachi, Pakistan.",
  },
  twitter: {
    title: "SM Welfare Trust — Food, Education & Healthcare in Karachi",
    description:
      "SM Welfare Trust serves food, education and healthcare to families in need across Karachi, Pakistan.",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Programme chips — fetched from API */}
      <ProgramChips />

      {/* Impact stats — static from template */}
      <section className="border-t border-border bg-section">
        <Container className="grid grid-cols-2 gap-8 py-14 sm:py-16 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <Stat key={stat.label} {...stat} className="items-center text-center" />
          ))}
        </Container>
      </section>

      {/* Our projects — fetched from API */}
      <ProjectsSection />

      {/* Media updates + Our mission */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <MediaSection />
        </Container>
      </section>

      <Quote
        text="True happiness lies in giving — especially to those who need it the most."
        attribution="SM Welfare Trust"
      />

      <CtaBand />
    </>
  );
}
