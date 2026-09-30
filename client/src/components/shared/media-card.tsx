"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiArrowRight, HiEye } from "react-icons/hi2";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import type { PublicMedia } from "@/types/public-api";
import type { SiteImage } from "@/data/site-images";
import { cn } from "@/lib/utils";

/**
 * Data shape from the curated/static data.
 */
export interface MediaCardStaticData {
  slug: string;
  category: string;
  title: string;
  summary?: string;
  /** Curated local photo. Falls back to the placeholder frame when absent. */
  image?: SiteImage;
  imageAspect?: "wide" | "square";
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

/** A stored title that is really a filename, e.g. `winter-relief.jpg`. */
const FILENAME_PATTERN = /\.(?:jpe?g|png|webp|gif|avif|bmp|svg)$/i;

/** Turns `winter-relief.jpg` into `Winter Relief` and `image-1.png` into `Image 1`. */
export function humanizeFilename(name: string): string {
  return name
    .replace(FILENAME_PATTERN, "")
    .replace(/[-_]+/g, " ")
    // Split letter/digit boundaries so "image2" reads as "Image 2".
    .replace(/([a-z])(\d)/gi, "$1 $2")
    .replace(/(\d)([a-z])/gi, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/**
 * Resolves a readable title for a media record.
 *
 * Seeded media stores the original filename as its title, so a raw filename is
 * never shown: it is humanised instead. An admin-authored title always wins.
 */
export function resolveMediaTitle(
  media: Pick<PublicMedia, "title" | "originalFilename">,
): string {
  const rawTitle = media.title?.trim() ?? "";
  if (rawTitle && !FILENAME_PATTERN.test(rawTitle)) return rawTitle;

  const source = rawTitle || media.originalFilename?.trim() || "";
  return humanizeFilename(source) || "Media";
}

// ─── Media Detail Dialog ──────────────────────────────────────────────

function MediaDetailDialog({
  media,
  title,
  open,
  onClose,
}: {
  media: MediaCardApiData;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const description = media.description?.trim();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl">
        {/* Photo */}
        <div className="flex items-center justify-center bg-muted/40 p-4 pt-12 sm:p-8 sm:pt-12">
          <Image
            src={media.secureUrl}
            alt={title}
            width={media.width}
            height={media.height}
            sizes="(max-width: 640px) 100vw, 768px"
            className="h-auto max-h-[58vh] w-auto max-w-full rounded-lg object-contain shadow-sm ring-1 ring-foreground/10"
            priority
          />
        </div>

        {/* Title + description only — no file metadata. */}
        <div className="flex flex-col gap-4 p-6">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="font-heading text-xl font-bold tracking-tight text-balance">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-sm leading-relaxed">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="flex justify-end">
            <DialogClose render={<Button variant="outline" />}>
              Close
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Static Media Card ────────────────────────────────────────────────

/**
 * Media update card per the template: photo, category, title, summary, read-more.
 * Supports both static template data and API data.
 */
export function MediaCard(props: MediaCardProps) {
  if ("apiMedia" in props) {
    const { apiMedia } = props;
    return <ApiMediaCard apiMedia={apiMedia} />;
  }

  const { update } = props;
  const aspect =
    update.imageAspect === "square" ? "aspect-square" : "aspect-[16/9]";

  return (
    <Card className="hover-lift group flex h-full flex-col overflow-hidden border-border bg-white hover:border-primary/25">
      <div
        className={cn(
          "relative overflow-hidden",
          !update.image && "photo-placeholder",
          aspect,
        )}
      >
        {update.image ? (
          <Image
            src={update.image.src}
            alt={update.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : null}
        <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground hover:bg-secondary">
          {update.category}
        </Badge>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <h3 className="font-heading text-lg font-bold tracking-tight transition-colors duration-300 group-hover:text-primary">
          {update.title}
        </h3>
        {update.summary ? (
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
            {update.summary}
          </p>
        ) : null}
        <Link
          href="/media"
          aria-label={`Read more about ${update.title}`}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

// ─── API Media Card (with detail dialog) ─────────────────────────────

function ApiMediaCard({ apiMedia }: { apiMedia: MediaCardApiData }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const handleImageError = useCallback(() => setImgFailed(true), []);

  const title = resolveMediaTitle(apiMedia);
  const description = apiMedia.description?.trim();

  return (
    <>
      <Card className="hover-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border-border/70 bg-white shadow-sm hover:border-primary/30">
        {/* Every card uses the same 4:3 frame, so the grid rows line up
            regardless of the source photo's own aspect ratio. */}
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          aria-label={`View ${title}`}
          className={cn(
            "relative block aspect-[4/3] w-full overflow-hidden bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            imgFailed && "photo-placeholder",
          )}
        >
          {!imgFailed && (
            <Image
              src={apiMedia.secureUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
              onError={handleImageError}
            />
          )}
          {/* Soft scrim so light photos stay legible against the tile edge. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-black/0 ring-1 ring-inset ring-black/5 transition-colors duration-300 group-hover:bg-black/10"
          />
        </button>

        <CardContent className="flex flex-1 flex-col gap-1.5 p-5">
          <h3 className="font-heading line-clamp-2 text-base font-bold leading-snug tracking-tight transition-colors duration-300 group-hover:text-primary">
            {title}
          </h3>
          {description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {/* Pinned to the bottom so every card in a row shares the same
              baseline, whether or not the photo has a description. */}
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            aria-label={`View ${title}`}
            className="mt-auto inline-flex w-fit items-center gap-1.5 pt-3 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HiEye className="size-4" aria-hidden="true" />
            View photo
            <HiArrowRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </CardContent>
      </Card>

      {detailOpen ? (
        <MediaDetailDialog
          media={apiMedia}
          title={title}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      ) : null}
    </>
  );
}
