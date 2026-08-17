import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/data/projects";

/**
 * Project card per the template: stat badge, title, summary, read-more link.
 * The image area is a placeholder until Cloudinary imagery is wired in.
 */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-white transition-shadow hover:shadow-lg">
      <div className="photo-placeholder relative aspect-[16/10]">
        <Badge className="absolute left-4 top-4 bg-accent text-accent-foreground hover:bg-accent">
          {project.stat} {project.statLabel}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-xl font-bold tracking-tight">
          {project.name}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>
        <a
          href={`/projects#${project.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Read more
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      </CardContent>
    </Card>
  );
}
