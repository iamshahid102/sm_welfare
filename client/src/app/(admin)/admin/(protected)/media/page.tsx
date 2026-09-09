"use client";


import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/hooks/use-auth";
import {
  uploadMedia,
  deleteMedia,
  type Media,
} from "@/services/media";

// Title is set via the layout

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; media: Media }
  | { status: "error"; message: string };

type PageState =
  | { status: "loading" }
  | {
      status: "ready";
      recentUpload: Media | null;
      uploadingState: UploadState;
      deletingId: string | null;
      deleteError: string | null;
    };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function MediaPreview({ media }: { media: Media }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
        <img
          src={media.secureUrl}
          alt={media.originalFilename ?? "Uploaded image"}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium truncate">
            {media.originalFilename ?? media.publicId}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
          <span>Format: {media.format}</span>
          <span>{media.width} × {media.height}px</span>
          <span>{formatBytes(media.bytes)}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminMediaPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUploading = (uploadingState: UploadState) => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, uploadingState }
        : prev,
    );
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) return;

      // Client-side basic validation for UX
      const isImage = file.type.startsWith("image/");
      const isWithinSizeLimit = file.size <= 5 * 1024 * 1024;

      if (!isImage) {
        setState((prev) =>
          prev.status === "ready"
            ? { ...prev, uploadingState: { status: "error", message: "Only image files are allowed." } }
            : prev,
        );
        return;
      }

      if (!isWithinSizeLimit) {
        setState((prev) =>
          prev.status === "ready"
            ? { ...prev, uploadingState: { status: "error", message: "File must be 5 MB or smaller." } }
            : prev,
        );
        return;
      }

      setSelectedFile(file);
      setUploading({ status: "uploading" });

      uploadMedia(file)
        .then((media) => {
          setUploading({ status: "success", media });
          setState((prev) =>
            prev.status === "ready"
              ? { ...prev, recentUpload: media }
              : prev,
          );
        })
        .catch((error) => {
          setUploading({
            status: "error",
            message:
              error instanceof Error ? error.message : "Upload failed.",
          });
        });
    },
    [setUploading],
  );

  const handleRemoveRecentUpload = useCallback(() => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, recentUpload: null, uploadingState: { status: "idle" } }
        : prev,
    );
  }, []);

  const handleDeleteMedia = useCallback(
    async (mediaId: string) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, deletingId: mediaId, deleteError: null }
          : prev,
      );
      try {
        await deleteMedia(mediaId);
        setState((prev) =>
          prev.status === "ready"
            ? { ...prev, recentUpload: null, deletingId: null, deleteError: null }
            : prev,
        );
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                deletingId: null,
                deleteError:
                  error instanceof Error ? error.message : "Delete failed.",
              }
            : prev,
        );
      }
    },
    [],
  );

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Media library</h1>
        <p className="text-sm text-muted-foreground">
          Manage images uploaded through the Cloudinary media foundation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Upload image</CardTitle>
          <CardDescription>
            Upload a new image to the media library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.uploadingState.status === "idle" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Label htmlFor="mediaFileInput" className="cursor-pointer">
                  Choose file
                </Label>
                <Input
                  id="mediaFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                  ref={fileInputRef}
                />
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">JPG</Badge>
                <Badge variant="secondary">PNG</Badge>
                <Badge variant="secondary">WebP</Badge>
                <span className="text-muted-foreground">·</span>
                <span>Max 5 MB</span>
              </div>
              {selectedFile && (
                <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                  <span className="text-sm truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedFile}
                >
                  Upload image
                </Button>
              </div>
            </div>
          )}

          {state.uploadingState.status === "uploading" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="flex items-center gap-3">
                <svg
                  className="size-5 animate-spin text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.25 0 4 1.25 4 2.5h.5z"
                  />
                </svg>
                <span className="text-sm text-muted-foreground">
                  Uploading to Cloudinary…
                </span>
              </div>
            </div>
          )}

          {state.uploadingState.status === "success" && (
            <div className="space-y-4">
              <Alert>
                <AlertTitle>Upload successful</AlertTitle>
                <AlertDescription>
                  The image has been uploaded to the media library.
                </AlertDescription>
              </Alert>
              <MediaPreview media={state.uploadingState.media} />
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRemoveRecentUpload}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {state.uploadingState.status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>{state.uploadingState.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {state.recentUpload && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Recent upload</CardTitle>
            <CardDescription>
              The most recently uploaded image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <MediaPreview media={state.recentUpload} />
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={state.deletingId === state.recentUpload.id}
                  onClick={() =>
                    state.recentUpload &&
                    handleDeleteMedia(state.recentUpload.id)
                  }
                >
                  {state.deletingId === state.recentUpload.id
                    ? "Deleting…"
                    : "Delete"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {state.deleteError && (
        <Alert variant="destructive">
          <AlertTitle>Delete failed</AlertTitle>
          <AlertDescription>{state.deleteError}</AlertDescription>
        </Alert>
      )}

      {!state.recentUpload && state.uploadingState.status === "idle" && (
        <Empty>
          <EmptyContent>
            <EmptyDescription>No media uploaded yet in this session.</EmptyDescription>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload your first image
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <p className="text-sm text-muted-foreground">
        Note: The media library currently shows only the most recent upload.
        A list/pagination endpoint is planned for a future update.
      </p>
    </div>
  );
}
