"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { listMedia, uploadMedia, type Media } from "@/services/media";
import { cn } from "@/lib/utils";
import { HiArrowUpTray, HiPhoto, HiTrash, HiXMark } from "react-icons/hi2";
import type { ContentImage } from "@/types/content";

/**
 * Reusable image field for the admin content editor.
 *
 * The editor never has to know about Cloudinary: you either pick an existing
 * asset from the media library, upload a new one, or paste a URL. The chosen
 * image is stored as a lightweight reference (url + publicId + size) on the
 * program/project document.
 */
export function ContentImageField({
  label,
  value,
  onChange,
  disabled,
  hint,
  compact,
}: {
  label: string;
  value: ContentImage | null | undefined;
  onChange: (image: ContentImage | null) => void;
  disabled?: boolean;
  hint?: string;
  compact?: boolean;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [media, setMedia] = useState<Media[] | null>(null);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLibrary = useCallback(async () => {
    setLibraryError(null);
    try {
      const result = await listMedia({ limit: 40, page: 1 });
      setMedia(result.items);
    } catch (error) {
      setLibraryError(
        error instanceof Error ? error.message : "Could not load the media library.",
      );
    }
  }, []);

  const openLibrary = useCallback(() => {
    setLibraryOpen(true);
    if (media === null) {
      void loadLibrary();
    }
  }, [media, loadLibrary]);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadError(null);
      try {
        const uploaded = await uploadMedia(file, { title: file.name });
        onChange({
          url: uploaded.secureUrl,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          alt: value?.alt,
        });
        setLibraryOpen(false);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed.",
        );
      } finally {
        setUploading(false);
      }
    },
    [onChange, value],
  );

  const previewHeight = compact ? "h-28" : "h-40";

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}

      <div className="flex gap-3">
        <div
          className={cn(
            "relative w-40 shrink-0 overflow-hidden rounded-lg border border-border bg-muted",
            previewHeight,
          )}
        >
          {value?.url ? (
            <Image
              src={value.url}
              alt={value.alt ?? ""}
              fill
              unoptimized
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <HiPhoto className="size-6" aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={openLibrary}
            >
              <HiPhoto className="mr-1.5 size-4" aria-hidden="true" />
              {value?.url ? "Change image" : "Choose image"}
            </Button>
            {value?.url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => onChange(null)}
              >
                <HiTrash className="mr-1.5 size-4" aria-hidden="true" />
                Remove
              </Button>
            ) : null}
          </div>
          <Input
            aria-label={`${label} alt text`}
            placeholder="Alt text (describes the photo)"
            value={value?.alt ?? ""}
            disabled={disabled || !value?.url}
            onChange={(event) =>
              onChange({ ...(value as ContentImage), alt: event.target.value })
            }
          />
        </div>
      </div>

      <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Choose an image</DialogTitle>
            <DialogDescription>
              Upload a new photo or pick one from your media library.
            </DialogDescription>
          </DialogHeader>

          {(uploadError || libraryError) && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-sm text-destructive">
              {uploadError ?? libraryError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleUpload(file);
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <HiArrowUpTray className="mr-1.5 size-4" aria-hidden="true" />
              {uploading ? "Uploading…" : "Upload new"}
            </Button>
            <Badge variant="secondary">Cloudinary</Badge>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {media === null && !libraryError ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-[4/3] rounded-lg" />
                ))}
              </div>
            ) : media && media.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {media.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange({
                        url: item.secureUrl,
                        publicId: item.publicId,
                        width: item.width,
                        height: item.height,
                        alt: item.title ?? value?.alt,
                      });
                      setLibraryOpen(false);
                    }}
                    className={cn(
                      "group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted transition-all hover:ring-2 hover:ring-primary",
                      value?.publicId === item.publicId
                        ? "border-primary ring-2 ring-primary"
                        : "border-border",
                    )}
                  >
                    <Image
                      src={item.secureUrl}
                      alt={item.title ?? "Media asset"}
                      fill
                      unoptimized
                      sizes="200px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No images yet. Upload your first photo above.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLibraryOpen(false)}
            >
              <HiXMark className="mr-1.5 size-4" aria-hidden="true" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
