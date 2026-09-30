"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/shared/media-card";
import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  listPublicMedia,
  type PublicMediaQuery,
} from "@/services/public-media";
import type { PublicMedia } from "@/types/public-api";
import {
  BLOG_POSTS,
  DUPLICATE_MEDIA_FILES,
  SITE_CHROME_FILES,
} from "@/data/site-images";

/**
 * The stored filename for a media record — the original filename when known,
 * otherwise the last segment of its CDN URL. Used to keep interface assets
 * (logos, hero banner, founder portrait) out of the gallery.
 */
function mediaFilename(media: PublicMedia): string {
  const original = media.originalFilename?.trim();
  if (original) return original.toLowerCase();
  const path = media.secureUrl.split("?")[0];
  return (path.split("/").pop() ?? "").toLowerCase();
}

/**
 * Media page body.
 *
 * Real uploads win: when GET /public/media returns assets, those render.
 * Otherwise the page falls back to the curated copy of the live /blog/
 * archive — the six posts the site's own blog lists, in the live order, each
 * with its real photo (`BLOG_POSTS` in `data/site-images.ts`). The six
 * homepage "Stories from the field" cards used to be mixed in here too; they
 * are homepage content and now appear only on the homepage.
 */
export function MediaExplorer() {
  const [media, setMedia] = useState<PublicMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const query: PublicMediaQuery = { limit: 40 };
      const result = await listPublicMedia(query);
      // Two things never render in the gallery:
      //  - site chrome (logos, hero banner, founder portrait): interface
      //    assets that already live on their own pages and sections
      //  - duplicate twins: the same photo stored twice under a second name
      setMedia(
        result.items.filter((item) => {
          const filename = mediaFilename(item);
          return (
            !SITE_CHROME_FILES.has(filename) &&
            !DUPLICATE_MEDIA_FILES.has(filename)
          );
        }),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load media",
      );
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      await fetchMedia();
      setLoading(false);
    }
    load();
  }, [fetchMedia]);

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        {error ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Empty className="border-none p-0">
              <EmptyTitle>Unable to load media</EmptyTitle>
              <EmptyDescription>{error}</EmptyDescription>
            </Empty>
            <Button variant="outline" size="sm" onClick={() => void fetchMedia()}>
              Try again
            </Button>
          </div>
        ) : loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-border bg-white"
              >
                <Skeleton className="aspect-[4/3] rounded-none" />
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : media.length === 0 ? (
          /* The live /blog/ archive, reproduced: the six posts the site's
             own blog lists, in the live order, each with its real photo. */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BLOG_POSTS.map((post, index) => (
              <Reveal
                key={post.slug}
                delay={Math.min(index, 5) * 70}
                className="h-full"
              >
                <MediaCard
                  update={{
                    slug: post.slug,
                    category: post.category,
                    title: post.title,
                    summary: post.summary,
                    image: post.image,
                    imageAspect: post.imageAspect,
                    source: "static",
                  }}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item, index) => (
              <Reveal
                key={item.id}
                delay={Math.min(index, 5) * 70}
                className="h-full"
              >
                <MediaCard apiMedia={{ ...item, source: "api" }} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
