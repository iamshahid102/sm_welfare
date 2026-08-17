"use client";

import { useState } from "react";
import { FilterChips } from "@/components/shared/filter-chips";
import { MediaCard } from "@/components/shared/media-card";
import { Container } from "@/components/shared/container";
import { MEDIA_CATEGORIES, MEDIA_UPDATES, type MediaUpdate } from "@/data/media";

type Category = MediaUpdate["category"];

/** Media page body — client-side category filtering (UX only). */
export function MediaExplorer() {
  const [category, setCategory] = useState<Category | "All">("All");
  const visible =
    category === "All"
      ? MEDIA_UPDATES
      : MEDIA_UPDATES.filter((u) => u.category === category);

  return (
    <section className="bg-white">
      <Container className="flex flex-col gap-10 py-14 sm:py-16">
        <FilterChips
          options={MEDIA_CATEGORIES.map((c) => c.label) as (Category | "All")[]}
          onSelect={setCategory}
          className="justify-center"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((update) => (
            <MediaCard key={update.slug} update={update} />
          ))}
        </div>
      </Container>
    </section>
  );
}
