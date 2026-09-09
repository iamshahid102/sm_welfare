import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PublicMedia } from "@/types/public-api";
import { cn } from "@/lib/utils";

/**
 * Data shape from the template/static data.
 */
export interface MediaCardStaticData {
  slug: string;
  category: string;
  title: string;
  summary: string;
  imageAspect: "wide" | "square";
  source: "static";
}

/**
 * Data shape from the public API.
 */
export interface MediaCardApiData extends PublicMedia {
  source: "api";
}

export type MediaCardProps =
  | { update: MediaCardStaticData }
  | { apiMedia: MediaCardApiData };

function isWideMedia(media: PublicMedia): boolean {
  return media.width > media.height;
}

/**
 * Media update card per the template: photo, category, title, summary, read-more.
 * Supports both static template data and API data.
 */
export function MediaCard(props: MediaCardProps) {
  if ("apiMedia" in props) {
    const { apiMedia } = props;
    const aspect = isWideMedia(apiMedia) ? "aspect-[16/9]" : "aspect-square";
    return (
      <Card className="group flex h-full flex-col overflow-hidden border-border bg-white transition-shadow hover:shadow-lg">
        <div
          className={cn("relative overflow-hidden", aspect)}
        >
          <img
            src={apiMedia.secureUrl}
            alt={apiMedia.originalFilename ?? "Media update"}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder on image load failure
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.classList.add("photo-placeholder");
              }
            }}
          />
          {apiMedia.folder ? (
            <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground hover:bg-secondary">
              {apiMedia.folder}
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-heading text-lg font-bold tracking-tight">
            {apiMedia.originalFilename ?? "Media update"}
          </h3>
          <a
            href="/media"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </CardContent>
      </Card>
    );
  }

  const { update } = props;
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-white transition-shadow hover:shadow-lg">
      <div
        className={cn(
          "photo-placeholder relative",
          update.imageAspect === "wide" ? "aspect-[16/9]" : "aspect-square",
        )}
      >
        <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground hover:bg-secondary">
          {update.category}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-lg font-bold tracking-tight">
          {update.title}
        </h3>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {update.summary}
        </p>
        <a
          href="/media"
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
