"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiArrowRight, HiHeart } from "react-icons/hi2";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { FilterChips } from "@/components/shared/filter-chips";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { BTN_PRIMARY_BLUE } from "@/components/shared/home-styles";
import { PROJECTS } from "@/data/projects";
import { resolveProjectImage } from "@/data/site-images";
import { DONATE_HREF } from "@/constants/navigation";
import { listPublicPrograms } from "@/services/public-programs";
import {
  listPublicProjects,
  type PublicProjectsQuery,
} from "@/services/public-projects";
import type {
  PublicProgram,
  PublicProject,
} from "@/types/public-api";
import { cn } from "@/lib/utils";

/** Chip value meaning "no program filter". */
const ALL_PROGRAMS = "All";

/**
 * Normalised project shape for rendering. Both the API projects and the
 * curated fallback map onto this, so the layout has a single input.
 */
interface ProjectDetailData {
  slug: string;
  title: string;
  /** Badge text — the programme title from the API, or the curated category. */
  badge: string;
  shortDescription: string;
  description: string;
}

function ProjectDetail({
  project,
  index,
}: {
  project: ProjectDetailData;
  index: number;
}) {
  const imageRight = index % 2 === 1;
  const image = resolveProjectImage({ slug: project.slug, title: project.title });

  return (
    <article
      id={project.slug}
      className="group grid items-start gap-8 rounded-2xl border border-border bg-white p-6 shadow-sm transition-[box-shadow,border-color,transform] duration-300 ease-out hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <div className={cn("relative", imageRight && "lg:order-2")}>
        <div
          className={cn(
            "relative aspect-[16/11] overflow-hidden rounded-xl",
            !image && "photo-placeholder"
          )}
          aria-hidden={image ? undefined : "true"}
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
          ) : null}
        </div>
        <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
          {project.badge}
        </Badge>
      </div>
      <div className={cn("flex flex-col gap-4", imageRight && "lg:order-1")}>
        <h2 className="font-heading text-2xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          {project.title}
        </h2>
        <p className="text-base leading-relaxed text-foreground">
          {project.shortDescription}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-auto">
          <Link
            href={DONATE_HREF}
            className={cn(buttonVariants(), BTN_PRIMARY_BLUE, "group")}
          >
            <HiHeart className="mr-1.5 size-4" aria-hidden="true" />
            Support this project
            <HiArrowRight
              className="ml-1.5 size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
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

/**
 * Projects page body — fetches real published programs and projects from the API.
 *
 * Deep links are supported: /projects?program=<slug> pre-selects that program's
 * chip (used by the home page program chips).
 */
export function ProjectsExplorer() {
  const searchParams = useSearchParams();
  const initialProgram = searchParams.get("program")?.trim() || undefined;

  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProgram, setActiveProgram] = useState<string>(
    initialProgram ?? ALL_PROGRAMS,
  );

  // Only the newest request may write state - clicking chips quickly can never
  // let an older response overwrite a newer one.
  const requestIdRef = useRef(0);

  /** The API filters by program slug, never by title. */
  const fetchProjects = useCallback(async (programSlug?: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const query: PublicProjectsQuery = { limit: 40 };
      if (programSlug && programSlug !== ALL_PROGRAMS) {
        query.program = programSlug;
      }
      const result = await listPublicProjects(query);
      if (requestId !== requestIdRef.current) return;
      setProjects(result.items);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(
        err instanceof Error ? err.message : "Failed to load projects",
      );
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Claims the newest request slot, so a chip click that happens while this
    // initial request is still in flight wins (a ref write, not state).
    const requestId = ++requestIdRef.current;
    const isStale = () => cancelled || requestId !== requestIdRef.current;

    // Initial load. Declared inside the effect on purpose: every state write
    // happens AFTER an await, so no state is set synchronously in the effect
    // body (which would cascade renders). `loading` starts as true.
    const loadInitial = async () => {
      try {
        const query: PublicProjectsQuery = { limit: 40 };
        if (initialProgram) {
          query.program = initialProgram;
        }
        const result = await listPublicProjects(query);
        if (isStale()) return;
        setProjects(result.items);
      } catch (err) {
        if (isStale()) return;
        setError(
          err instanceof Error ? err.message : "Failed to load projects",
        );
      } finally {
        if (!isStale()) setLoading(false);
      }
    };
    void loadInitial();

    // Programs only feed the filter chips - a failure must not break the list.
    void listPublicPrograms({ limit: 40 })
      .then((result) => {
        if (!cancelled) setPrograms(result.items);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [initialProgram]);

  const handleProgramSelect = useCallback(
    (program: string) => {
      setActiveProgram(program);
      void fetchProjects(program);
    },
    [fetchProjects],
  );

  // Chip values are program slugs (what the API accepts); labels are titles.
  const chipOptions: readonly string[] = [
    ALL_PROGRAMS,
    ...programs.map((p) => p.slug),
  ];

  const chipLabel = useCallback(
    (value: string) =>
      value === ALL_PROGRAMS
        ? "All"
        : (programs.find((p) => p.slug === value)?.title ?? value),
    [programs],
  );

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        {chipOptions.length > 1 ? (
          <FilterChips
            options={chipOptions}
            initial={activeProgram}
            getLabel={chipLabel}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchProjects(activeProgram)}
            >
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-8">
            <ProjectSkeleton />
            <ProjectSkeleton />
            <ProjectSkeleton />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {projects.length > 0
              ? projects.map((project, index) => (
                  <Reveal key={project.id} delay={Math.min(index, 5) * 70}>
                    <ProjectDetail
                      index={index}
                      project={{
                        slug: project.slug,
                        title: project.title,
                        badge: project.program.title,
                        shortDescription: project.shortDescription,
                        description: project.description,
                      }}
                    />
                  </Reveal>
                ))
              : /* The public API is optional in local/preview environments, so
                   fall back to the curated six programmes rather than showing
                   an empty state on a page whose job is to list them. */
                PROJECTS.map((project, index) => (
                  <Reveal key={project.slug} delay={Math.min(index, 5) * 70}>
                    <ProjectDetail
                      index={index}
                      project={{
                        slug: project.slug,
                        title: project.name,
                        badge: project.category,
                        shortDescription: project.summary,
                        description: project.description,
                      }}
                    />
                  </Reveal>
                ))}
          </div>
        )}
      </Container>
    </section>
  );
}
