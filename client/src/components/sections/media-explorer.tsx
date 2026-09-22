"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/shared/filter-chips";
import { MediaCard } from "@/components/shared/media-card";
import { Container } from "@/components/shared/container";
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
import { BLOG_POSTS, STORY_HIGHLIGHTS } from "@/data/site-images";

/** Media page body — fetches real public media from the API. */
export function MediaExplorer() {
  const [media, setMedia] = useState<PublicMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedia = useCallback(async () => {
    try {
      const query: PublicMediaQuery = { limit: 40 };
      const result = await listPublicMedia(query);
      setMedia(result.items);
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

  /** Derive categories from the folder field of returned media items. */
  const categories = Array.from(
    new Set(media.map((m) => m.folder).filter(Boolean)),
  );

  const [activeCategory, setActiveCategory] = useState<string>("All");

  const visible =
    activeCategory === "All"
      ? media
      : media.filter((m) => m.folder === activeCategory);

  const chipOptions: readonly string[] = [
    "All",
    ...categories,
  ];

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        {chipOptions.length > 1 ? (
          <FilterChips
            options={chipOptions}
            onSelect={setActiveCategory}
            className="justify-center"
          />
        ) : null}

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
            <Skeleton className="aspect-[16/9] rounded-xl" />
            <Skeleton className="aspect-[16/9] rounded-xl" />
            <Skeleton className="aspect-[16/9] rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
          </div>
        ) : visible.length === 0 ? (
          /* Curated content mirrors the live site: the six homepage Media
             Updates (byte-verified photos + live excerpts) followed by the
             six live /blog/ archive posts, so the page is never empty. */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STORY_HIGHLIGHTS.map((story) => (
              <MediaCard
                key={story.slug}
                update={{
                  slug: story.slug,
                  category: story.category,
                  title: story.title,
                  summary: story.summary,
                  image: story.image,
                  source: "static",
                }}
              />
            ))}
            {BLOG_POSTS.map((post) => (
              <MediaCard
                key={post.slug}
                update={{
                  slug: post.slug,
                  category: post.category,
                  title: post.title,
                  summary: post.summary,
                  source: "static",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <MediaCard key={item.id} apiMedia={{ ...item, source: "api" }} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
