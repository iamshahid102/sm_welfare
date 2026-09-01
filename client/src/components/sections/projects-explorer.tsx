"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FilterChips } from "@/components/shared/filter-chips";
import { Container } from "@/components/shared/container";
import { DONATE_HREF } from "@/constants/navigation";
import { PROJECTS, type Project } from "@/data/projects";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Sasta Khana Project",
  "Free Schooling System",
  "Health Care Services",
  "Hunarmand Beti Project",
  "Qurbani Barae Waqaf",
  "Free Eid Shopping",
] as const;

function ProjectDetail({ project, index }: { project: Project; index: number }) {
  /* Template alternates: even = image left, odd = image right. */
  const imageRight = index % 2 === 1;

  return (
    <article
      id={project.slug}
      className="grid items-start gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      {/* Image column — position depends on alternating index. */}
      <div
        className={cn("relative", imageRight && "lg:order-2")}
      >
        <div className="photo-placeholder aspect-[16/11] rounded-xl" aria-hidden="true" />
        <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
          {project.stat} {project.statLabel}
        </Badge>
      </div>
      <div className={cn("flex flex-col gap-4", imageRight && "lg:order-1")}>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          {project.name}
        </h2>
        <p className="text-base leading-relaxed text-foreground">
          {project.summary}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-auto">
          <a href={DONATE_HREF} className={cn(buttonVariants(), "group")}>
            Support this project
            <ArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </article>
  );
}

/** Projects page body — client-side category filtering (UX only). */
export function ProjectsExplorer() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const visible =
    category === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === category);

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        <FilterChips
          options={CATEGORIES}
          onSelect={setCategory}
          className="justify-center"
        />
        <div className="flex flex-col gap-8">
          {visible.map((project, index) => (
            <ProjectDetail key={project.slug} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}
