"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi2";
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

function isWideMedia(media: PublicMedia): boolean {
  return media.width > media.height;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Media Detail Dialog ──────────────────────────────────────────────

function MediaDetailDialog({
  media,
  open,
  onClose,
}: {
  media: MediaCardApiData | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!media) return null;

  const displayName = media.title ?? media.originalFilename ?? "Media update";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-2xl overflow-hidden p-0"
        showCloseButton={false}
      >
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={media.secureUrl}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-contain"
            priority
          />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4 px-6 pb-6">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="text-lg leading-snug">
              {displayName}
            </DialogTitle>
            {media.description && (
              <DialogDescription className="text-sm leading-relaxed">
                {media.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Format
              </span>
              <span className="font-medium">{media.format.toUpperCase()}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Dimensions
              </span>
              <span className="font-medium">
                {media.width} × {media.height} px
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                File size
              </span>
              <span className="font-medium">{formatBytes(media.bytes)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                Uploaded
              </span>
              <span className="font-medium">{formatDate(media.createdAt)}</span>
            </div>
            {media.folder && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Folder
                </span>
                <span className="font-medium">
                  <Badge variant="secondary" className="text-xs">
                    {media.folder}
                  </Badge>
                </span>
              </div>
            )}
            {media.originalFilename && media.title && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Original file
                </span>
                <span className="truncate font-medium">
                  {media.originalFilename}
                </span>
              </div>
            )}
          </div>

          {/* Close button */}
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
    <Card className="group flex h-full flex-col overflow-hidden border-border bg-white transition-shadow hover:shadow-lg">
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
        <h3 className="font-heading text-lg font-bold tracking-tight">
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
  const aspect = isWideMedia(apiMedia) ? "aspect-[16/9]" : "aspect-square";
  const handleImageError = useCallback(() => setImgFailed(true), []);
  const displayName = apiMedia.title ?? apiMedia.originalFilename ?? "Media update";

  return (
    <>
      <Card className="group flex h-full flex-col overflow-hidden border-border bg-white transition-shadow hover:shadow-lg">
        <div className={cn("relative overflow-hidden", imgFailed ? "photo-placeholder" : "", aspect)}>
          {!imgFailed && (
            <Image
              src={apiMedia.secureUrl}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              onError={handleImageError}
            />
          )}
          {apiMedia.folder ? (
            <Badge className="absolute left-4 top-4 bg-secondary text-secondary-foreground hover:bg-secondary">
              {apiMedia.folder}
            </Badge>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-6">
          <h3 className="font-heading text-lg font-bold tracking-tight">
            {displayName}
          </h3>
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            aria-label={`View ${displayName}`}
            className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View
            <HiArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </CardContent>
      </Card>

      <MediaDetailDialog
        media={apiMedia}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
