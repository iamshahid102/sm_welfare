"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  uploadMedia,
  listMedia,
  updateMedia,
  deleteMedia,
  type Media,
} from "@/services/media";
import { HiPencilSquare, HiTrash, HiXMark } from "react-icons/hi2";
import { LuLoaderCircle } from "react-icons/lu";

// ─── Helpers ────────────────────────────────────────────────────────────

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
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const TITLE_MAX = 200;
const DESC_MAX = 500;

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File must be ${MAX_FILE_SIZE / (1024 * 1024)} MB or smaller. Your file is ${formatBytes(file.size)}.`;
  }
  return null;
}

// ─── Upload State ───────────────────────────────────────────────────────

type UploadStatus = "idle" | "uploading";

// ─── Media Card ─────────────────────────────────────────────────────────

function MediaCardItem({
  media,
  onEdit,
  onDelete,
  deletingId,
}: {
  media: Media;
  onEdit: (m: Media) => void;
  onDelete: (media: Media) => void;
  deletingId: string | null;
}) {
  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={media.secureUrl}
          alt={media.title ?? media.originalFilename ?? "Uploaded image"}
          className="h-full w-full object-contain"
        />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => onEdit(media)}
            aria-label="Edit media"
          >
            <HiPencilSquare className="size-3.5" />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            disabled={deletingId === media.id}
            onClick={() => onDelete(media)}
            aria-label="Delete media"
          >
            {deletingId === media.id ? (
              <LuLoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <HiTrash className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium truncate">
            {media.title || media.originalFilename || "Untitled"}
          </p>
          {media.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {media.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-1">
            <Badge variant="secondary" className="text-[10px]">
              {media.format.toUpperCase()}
            </Badge>
            <span>{media.width}×{media.height}px</span>
            <span>{formatBytes(media.bytes)}</span>
            <span>{formatDate(media.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Delete Confirmation Dialog ─────────────────────────────────────────

function DeleteConfirmDialog({
  media,
  open,
  onClose,
  onConfirm,
  deleting,
}: {
  media: Media | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete media</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this image? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {media && (
          <div className="flex flex-col gap-3">
            <div className="overflow-hidden rounded-md bg-muted">
              <img
                src={media.secureUrl}
                alt={media.title ?? "Media preview"}
                className="h-32 w-full object-contain"
              />
            </div>
            <p className="text-sm font-medium truncate">
              {media.title || media.originalFilename || "Untitled"}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <LuLoaderCircle className="size-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Dialog ────────────────────────────────────────────────────────

function EditMediaDialog({
  media,
  open,
  onClose,
  onSaved,
}: {
  media: Media | null;
  open: boolean;
  onClose: () => void;
  onSaved: (m: Media) => void;
}) {
  // Initialized from `media`; the parent remounts this dialog (via `key`) so
  // the state refreshes for each edited media record.
  const [title, setTitle] = useState(media?.title ?? "");
  const [description, setDescription] = useState(media?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string }>({});

  const validate = useCallback((): boolean => {
    const errs: { title?: string; description?: string } = {};
    if (title.length > TITLE_MAX) {
      errs.title = `Title must be ${TITLE_MAX} characters or fewer.`;
    }
    if (description.length > DESC_MAX) {
      errs.description = `Description must be ${DESC_MAX} characters or fewer.`;
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }, [title, description]);

  const handleSave = useCallback(async () => {
    if (!media) return;
    if (!validate()) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await updateMedia(media.id, {
        title: title.trim(),
        description: description.trim(),
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [media, title, description, validate, onSaved, onClose]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit media</DialogTitle>
          <DialogDescription>
            Update the title and description for this media asset.
          </DialogDescription>
        </DialogHeader>

        {media && (
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-md bg-muted">
              <img
                src={media.secureUrl}
                alt={media.title ?? "Media preview"}
                className="h-40 w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: undefined }));
                }}
                placeholder="e.g. Community event photo"
                maxLength={TITLE_MAX}
                aria-invalid={!!fieldErrors.title}
              />
              {fieldErrors.title && (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: undefined }));
                }}
                placeholder="Optional description or alt-text"
                maxLength={DESC_MAX}
                rows={3}
                aria-invalid={!!fieldErrors.description}
              />
              {fieldErrors.description && (
                <p className="text-xs text-destructive">{fieldErrors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{description.length}/{DESC_MAX}</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <LuLoaderCircle className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────

// ─── Fullscreen Image Viewer ────────────────────────────────────────────

function FullscreenImageViewerDialog({
  open,
  imageUrl,
  altText,
  onClose,
}: {
  open: boolean;
  imageUrl: string | null;
  altText: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="flex h-[95vh] w-[95vw] max-w-[95vw] items-center justify-center overflow-hidden bg-black/95 p-3 sm:max-w-[95vw]"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Image preview</DialogTitle>
        <DialogDescription className="sr-only">
          Fullscreen preview of the selected image. Press Escape or use the
          close button to exit.
        </DialogDescription>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={altText}
            className="max-h-full w-auto max-w-full rounded-md object-contain shadow-2xl"
          />
        )}
        <DialogClose
          render={
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3 shadow-lg"
              aria-label="Close image preview"
            />
          }
        >
          <HiXMark />
          <span className="sr-only">Close image preview</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

const PAGE_SIZE = 12;

export default function AdminMediaPage() {
  // ── Upload form state ──
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Library state ──
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Delete dialog state ──
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Edit dialog state ──
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // ── Fetch media library ──
  // Every setState happens AFTER the await so this callback can run inside an
  // effect without triggering synchronous cascading renders.
  const fetchMedia = useCallback(async (p: number) => {
    try {
      const result = await listMedia({ page: p, limit: PAGE_SIZE });
      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setListError(null);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Failed to load media.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    // fetchMedia only sets state after `await` (never synchronously), so this
    // is a false positive from the compiler lint rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMedia(page);
  }, [page, fetchMedia]);

  // ── File selection (NO auto-upload) ──
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setFileError(null);
      setUploadError(null);

      if (!file) {
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        setFileError(validationError);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [],
  );

  // ── Revoke the preview object URL whenever it changes or on unmount ──
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // ── Upload handler (button-triggered) ──
  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setUploadError(null);

    try {
      // Step 1: image goes to Cloudinary. Step 2: its public URL is saved to
      // MongoDB along with title + description (same endpoint, atomic flow).
      await uploadMedia(selectedFile, {
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
      });
      // Reset form (object URL revocation is handled by the preview effect)
      setUploadTitle("");
      setUploadDescription("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setViewerOpen(false);
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Show the new image directly in the All media section
      setListLoading(true);
      setPage(1);
      fetchMedia(1);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploadStatus("idle");
    }
  }, [selectedFile, uploadTitle, uploadDescription, fetchMedia]);

  // ── Delete handlers ──
  const handleOpenDelete = useCallback((media: Media) => {
    setDeleteTarget(media);
    setDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteMedia(deleteTarget.id);
      setItems((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setTotal((prev) => prev - 1);
      setDeleteOpen(false);
      setDeleteTarget(null);
      // If page is now empty and not page 1, go back
      if (items.length === 1 && page > 1) {
        setListLoading(true);
        setPage((p) => p - 1);
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Delete failed. Please try again.");
      setDeleteOpen(false);
    } finally {
      setDeletingId(null);
    }
  }, [deleteTarget, items.length, page]);

  // ── Edit handlers ──
  const handleOpenEdit = useCallback((media: Media) => {
    setEditingMedia(media);
    setEditOpen(true);
  }, []);

  const handleEditSaved = useCallback((updated: Media) => {
    setItems((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  // ── Derived upload button state: enabled only when every field is filled ──
  const isUploading = uploadStatus === "uploading";
  const canUpload =
    !!selectedFile &&
    uploadTitle.trim().length > 0 &&
    uploadDescription.trim().length > 0 &&
    !isUploading;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold">Media library</h1>
        <p className="text-sm text-muted-foreground">
          Upload, organize and manage images for the website.
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Upload image</CardTitle>
          <CardDescription>
            Select an image file, fill in the title and description, then click Upload media.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
              {uploadError && (
                <Alert variant="destructive">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {/* File input */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Label htmlFor="mediaFileInput" className="cursor-pointer sm:w-24">
                  Image file <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mediaFileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="flex-1"
                  ref={fileInputRef}
                  aria-describedby={fileError ? "file-error" : undefined}
                  aria-invalid={!!fileError}
                />
              </div>
              {fileError && (
                <div className="flex gap-3 sm:ml-24">
                  <p id="file-error" className="text-xs text-destructive">{fileError}</p>
                </div>
              )}

              {/* Selected image preview (click to open fullscreen) */}
              {selectedFile && previewUrl && (
                <div className="flex flex-col items-center gap-1.5 sm:ml-24">
                  <button
                    type="button"
                    className="group relative w-40 overflow-hidden rounded-md border bg-muted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    onClick={() => setViewerOpen(true)}
                    aria-label="Open fullscreen image preview"
                    title="Click to view fullscreen"
                  >
                    <img
                      src={previewUrl}
                      alt="Selected image preview"
                      className="aspect-square h-40 w-full object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-center text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      Click to view fullscreen
                    </span>
                  </button>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      className="underline-offset-2 transition-colors hover:text-foreground hover:underline disabled:pointer-events-none disabled:opacity-50"
                      disabled={isUploading}
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setFileError(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Label htmlFor="mediaTitle" className="sm:w-24">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mediaTitle"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Community event photo"
                  maxLength={TITLE_MAX}
                  className="flex-1"
                  disabled={isUploading}
                />
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {uploadTitle.length}/{TITLE_MAX}
                </span>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                <Label htmlFor="mediaDescription" className="sm:w-24 sm:pt-2">
                  Description <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-col gap-1 flex-1">
                  <Textarea
                    id="mediaDescription"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Description or alt-text for this image"
                    maxLength={DESC_MAX}
                    rows={2}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  <span className="text-xs text-muted-foreground text-right">
                    {uploadDescription.length}/{DESC_MAX}
                  </span>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">JPG</Badge>
                  <Badge variant="secondary">PNG</Badge>
                  <Badge variant="secondary">WebP</Badge>
                  <span>·</span>
                  <span>Max 5 MB</span>
                </div>
                <Button
                  size="lg"
                  onClick={handleUpload}
                  disabled={!canUpload}
                >
                  {isUploading ? (
                    <>
                      <LuLoaderCircle className="size-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    "Upload media"
                  )}
                </Button>
              </div>
            </div>
          {isUploading && (
            <div
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              aria-live="polite"
            >
              <LuLoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Uploading to Cloudinary and saving to database…
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-heading">All media</CardTitle>
              <CardDescription>
                {total > 0 ? `${total} image${total === 1 ? "" : "s"} uploaded` : "No images yet"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {listError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{listError}</AlertDescription>
            </Alert>
          )}

          {listLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-xl" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <Empty>
              <EmptyContent>
                <EmptyDescription>
                  No media uploaded yet. Use the upload form above to get started.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((m) => (
                  <MediaCardItem
                    key={m.id}
                    media={m}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    deletingId={deletingId}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => {
                        setListLoading(true);
                        setPage((p) => p - 1);
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => {
                        setListLoading(true);
                        setPage((p) => p + 1);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen image preview (selected file) */}
      <FullscreenImageViewerDialog
        open={viewerOpen}
        imageUrl={previewUrl}
        altText="Selected image preview"
        onClose={() => setViewerOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        media={deleteTarget}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        deleting={deletingId === deleteTarget?.id}
      />

      {/* Edit Dialog */}
      <EditMediaDialog
        key={editingMedia?.id ?? "none"}
        media={editingMedia}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={handleEditSaved}
      />
    </div>
  );
}
