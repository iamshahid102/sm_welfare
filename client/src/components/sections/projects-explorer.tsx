"use client";

import { useCallback, useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { FilterChips } from "@/components/shared/filter-chips";
import { Container } from "@/components/shared/container";
import { DONATE_HREF } from "@/constants/navigation";
import {
  listPublicPrograms,
} from "@/services/public-programs";
import {
  listPublicProjects,
  type PublicProjectsQuery,
} from "@/services/public-projects";
import type {
  PublicProgram,
  PublicProject,
} from "@/types/public-api";
import { cn } from "@/lib/utils";

function ProjectDetail({
  project,
  index,
}: {
  project: PublicProject;
  index: number;
}) {
  const imageRight = index % 2 === 1;

  return (
    <article
      id={project.slug}
      className="grid items-start gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className={cn("relative", imageRight && "lg:order-2")}>
        <div
          className="photo-placeholder aspect-[16/11] rounded-xl"
          aria-hidden="true"
        />
        <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
          {project.program.title}
        </Badge>
      </div>
      <div className={cn("flex flex-col gap-4", imageRight && "lg:order-1")}>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          {project.title}
        </h2>
        <p className="text-base leading-relaxed text-foreground">
          {project.shortDescription}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-auto">
          <a
            href={DONATE_HREF}
            className={cn(buttonVariants(), "group")}
          >
            Support this project
            <HiArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </article>
  );
}

/** Loading skeleton for a single project card. */
function ProjectSkeleton() {
  return (
    <article className="grid items-start gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
      <Skeleton className="aspect-[16/11] rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-9 w-48" />
      </div>
    </article>
  );
}

/** Projects page body — fetches real published programs and projects from the API. */
export function ProjectsExplorer() {
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (programSlug?: string) => {
    try {
      const query: PublicProjectsQuery = { limit: 40 };
      if (programSlug && programSlug !== "All") {
        query.program = programSlug;
      }
      const result = await listPublicProjects(query);
      setProjects(result.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load projects",
      );
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      // Fetch programs (for filter chips) and initial projects in parallel
      const projectsPromise = fetchProjects();

      let programsResult: PublicProgram[] = [];
      try {
        const result = await listPublicPrograms({ limit: 40 });
        programsResult = result.items;
      } catch {
        // Programs fetch failed — show empty chips
      }
      setPrograms(programsResult);

      await projectsPromise;
      setLoading(false);
    }
    load();
  }, [fetchProjects]);

  const handleProgramSelect = useCallback(
    async (program: string) => {
      setLoading(true);
      setError(null);
      await fetchProjects(program === "All" ? undefined : program);
      setLoading(false);
    },
    [fetchProjects],
  );

  const chipOptions: readonly string[] = [
    "All",
    ...programs.map((p) => p.title),
  ];

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        {chipOptions.length > 1 ? (
          <FilterChips
            options={chipOptions}
            onSelect={handleProgramSelect}
            className="justify-center"
          />
        ) : null}

        {error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Empty className="border-none p-0">
              <EmptyTitle>Unable to load projects</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </Empty>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-8">
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </div>
        ) : projects.length === 0 ? (
          <Empty className="py-16">
            <EmptyTitle>No projects available</EmptyTitle>
            <EmptyDescription>
              Projects will appear here once they are published by the team.
            </EmptyDescription>
          </Empty>
        ) : (
          <div className="flex flex-col gap-8">
            {projects.map((project, index) => (
              <ProjectDetail
                key={project.id}
                project={project}
                index={index}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
