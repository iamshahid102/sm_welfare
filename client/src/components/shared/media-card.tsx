import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MediaUpdate } from "@/data/media";
import { cn } from "@/lib/utils";

/**
 * Media update card per the template: photo placeholder, category badge,
 * title, summary and read-more link.
 */
export function MediaCard({ update }: { update: MediaUpdate }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-white transition-shadow hover:shadow-lg">
      <div
        className={cn(
          "photo-placeholder relative",
          update.imageAspect === "wide" ? "aspect-[16/9]" : "aspect-square"
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
