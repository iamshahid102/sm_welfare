import Image from "next/image";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveProjectImage } from "@/data/site-images";
import type { ContentImage } from "@/types/content";
import { cn } from "@/lib/utils";

/** Shared card image sizing hint (3-up grid on desktop, full width on mobile). */
const IMAGE_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Data shape from the curated/static data.
 */
export interface ProjectCardStaticData {
  slug: string;
  name: string;
  /** Category badge shown on the photo (live site shows the project name). */
  category: string;
  summary: string;
  source: "static";
}

/**
 * Data shape from the public API.
 */
export interface ProjectCardApiData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  program: { id: string; title: string; slug: string };
  /** CMS cover photo — used when present, curated fallback otherwise. */
  coverImage?: ContentImage | null;
  source: "api";
}

export type ProjectCardProps =
  | { project: ProjectCardStaticData }
  | { apiProject: ProjectCardApiData };

/**
 * Project card per the template: photo, stat badge, title, summary, read-more.
 * Supports both curated data and API data.
 *
 * The photo is resolved from the curated image set by slug/title and falls
 * back to the placeholder frame, so a project the CMS adds later still renders
 * correctly without a picture.
 */
export function ProjectCard(props: ProjectCardProps) {
  if ("apiProject" in props) {
    const { apiProject } = props;
    const image = resolveProjectImage(apiProject);
    return (
      <Card className="hover-lift group flex h-full flex-col overflow-hidden border-border bg-white hover:border-primary/25">
        <div
          className={cn(
            "relative aspect-[16/10] overflow-hidden",
            !image && "photo-placeholder"
          )}
          aria-hidden={image ? undefined : "true"}
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={IMAGE_SIZES}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : null}
          {/* Same badge treatment as the static card, so the grid looks
              identical whether the card came from the API or the fallback. */}
          <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
            {apiProject.program.title}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-heading text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
            {apiProject.title}
          </h3>
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
            {apiProject.shortDescription}
          </p>
          <Link
            href={`/projects#${apiProject.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Read more
            <HiArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </CardContent>
      </Card>
    );
  }

  const { project } = props;
  const image = resolveProjectImage({ slug: project.slug, name: project.name });

  return (
    <Card className="hover-lift group flex h-full flex-col overflow-hidden border-border bg-white hover:border-primary/25">
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden",
          !image && "photo-placeholder"
        )}
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes={IMAGE_SIZES}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : null}
        <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
          {project.category}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-xl font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          {project.name}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
        <Link
          href={`/projects#${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Read more
          <HiArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </CardContent>
    </Card>
  );
}
