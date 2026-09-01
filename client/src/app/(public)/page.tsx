import { ArrowRight, CheckCircle2, Utensils, GraduationCap, Stethoscope, Droplets, Users, CalendarHeart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Hero } from "@/components/shared/hero";
import { Container } from "@/components/shared/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stat } from "@/components/shared/stat";
import { ProjectCard } from "@/components/shared/project-card";
import { MediaCard } from "@/components/shared/media-card";
import { Quote } from "@/components/shared/quote";
import { CtaBand } from "@/components/shared/cta-band";
import { PROJECTS } from "@/data/projects";
import { MEDIA_UPDATES } from "@/data/media";
import { IMPACT_STATS, MISSION_AREAS } from "@/data/programs";
import { cn } from "@/lib/utils";
import {
  BTN_PRIMARY_BLUE,
  BTN_OUTLINE_DEFAULT,
} from "@/components/shared/home-styles";

const PROGRAM_CHIPS = [
  { name: "Food Distribution", icon: Utensils },
  { name: "Education Support", icon: GraduationCap },
  { name: "Medical Assistance", icon: Stethoscope },
  { name: "Clean Water Projects", icon: Droplets },
  { name: "Widow & Orphan Support", icon: Users },
  { name: "Seasonal Drives", icon: CalendarHeart },
] as const;

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Programme chips */}
      <section className="bg-white">
        <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 py-6">
          {PROGRAM_CHIPS.map(({ name, icon: Icon }) => (
            <a
              key={name}
              href="/about#what-we-do"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="size-4 text-primary" aria-hidden="true" />
              {name}
            </a>
          ))}
        </Container>
      </section>

      {/* Impact stats */}
      <section className="border-t border-border bg-section">
        <Container className="grid grid-cols-2 gap-8 py-14 sm:py-16 lg:grid-cols-4">
          {IMPACT_STATS.map((stat) => (
            <Stat key={stat.label} {...stat} className="items-center text-center" />
          ))}
        </Container>
      </section>

      {/* Our projects */}
      <section className="border-t border-border bg-white">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          <SectionHeading
            kicker="Our projects"
            title="Six programmes, one promise — nobody left behind"
            description="Each project answers a problem our team sees on the ground in Karachi — a missed meal, a lost school year, an untreated illness, a skill never learned."
            center
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </Container>
      </section>

      {/* Media updates + Our mission */}
      <section className="border-t border-border bg-section">
        <Container className="flex flex-col gap-10 py-16 sm:py-20">
          {/* Side-by-side: media heading left, mission content right */}
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col gap-4">
              <SectionHeading
                kicker="Media updates"
                title="Stories from the field"
              />
              <div>
                <a
                  href="/media"
                  className={cn(buttonVariants(), BTN_OUTLINE_DEFAULT, "group")}
                >
                  View all updates
                  <ArrowRight
                    className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
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
                    <CheckCircle2
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
                <a href="/about" className={cn(buttonVariants(), BTN_PRIMARY_BLUE)}>
                  More about us
                </a>
              </div>
            </div>
          </div>

          {/* Full-width media cards row below the side-by-side layout */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MEDIA_UPDATES.slice(0, 3).map((update) => (
              <MediaCard key={update.slug} update={update} />
            ))}
          </div>
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
