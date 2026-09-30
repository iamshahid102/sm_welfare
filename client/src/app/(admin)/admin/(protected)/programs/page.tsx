"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContentEditor } from "@/components/admin/content-editor";
import {
  createProgram,
  listPrograms,
  updateProgram,
  updateProgramStatus,
  type CreateProgramInput,
  type Program,
  type ProgramStatus,
  type UpdateProgramInput,
} from "@/services/programs";
import type { ContentFieldsInput } from "@/types/content";
import { cn } from "@/lib/utils";
import {
  HiArrowTopRightOnSquare,
  HiPhoto,
  HiPlus,
  HiPencilSquare,
  HiRectangleStack,
} from "react-icons/hi2";

/**
 * Admin → Programs.
 *
 * A program is the top-level welfare initiative and the badge/filter category
 * on the public site. This screen lists every program with its cover photo and
 * a quick "how much content it has" summary, and edits the exact fields the
 * public page shows — tagline, cover, gallery, sections, highlight cards,
 * quick facts and the closing call to action.
 */

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<
  ProgramStatus,
  "secondary" | "default" | "outline"
> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

interface ListState {
  items: Program[];
  page: number;
  total: number;
  totalPages: number;
}

function ProgramCard({
  program,
  onEdit,
}: {
  program: Program;
  onEdit: () => void;
}) {
  const sectionCount = program.sections.length;
  const highlightCount = program.highlights.length;
  const factCount = program.facts.length;
  const photoCount = (program.coverImage ? 1 : 0) + program.gallery.length;

  return (
    // Shadow-only hover (no lift): these rows carry action buttons, and a
    // row that moves under the pointer makes those targets harder to click.
    <div className="group flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg sm:flex-row sm:items-center">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-40">
        {program.coverImage ? (
          <Image
            src={program.coverImage.url}
            alt={program.coverImage.alt ?? program.title}
            fill
            unoptimized
            sizes="200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <HiPhoto className="size-6" aria-hidden="true" />
          </span>
        )}
        <span className="absolute left-2 top-2">
          <Badge variant={STATUS_BADGE_VARIANT[program.status]}>
            {program.status}
          </Badge>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-bold tracking-tight">
            {program.title}
          </h3>
          <span className="font-mono text-xs text-muted-foreground">
            #{program.displayOrder}
          </span>
        </div>
        {program.tagline ? (
          <p className="text-sm font-medium text-primary">{program.tagline}</p>
        ) : null}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {program.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <HiPhoto className="size-3" aria-hidden="true" />
            {photoCount} photo{photoCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {sectionCount} section{sectionCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {highlightCount} card{highlightCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {factCount} fact{factCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <HiPencilSquare className="mr-1.5 size-4" aria-hidden="true" />
          Edit content
        </Button>
        <Link
          href={`/${program.slug}`}
          target="_blank"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HiArrowTopRightOnSquare className="size-3.5" aria-hidden="true" />
          Preview
        </Link>
      </div>
    </div>
  );
}

/** Self-contained create/edit form — owns its draft state. */
function ProgramForm({
  program,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  program: Program | null;
  saving: boolean;
  error: string | null;
  onSubmit: (values: CreateProgramInput | UpdateProgramInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(program?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    program?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(program?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    program?.displayOrder !== undefined ? String(program.displayOrder) : "",
  );
  const [content, setContent] = useState<ContentFieldsInput>({
    tagline: program?.tagline ?? undefined,
    coverImage: program?.coverImage ?? null,
    gallery: program?.gallery ?? [],
    sections: program?.sections ?? [],
    highlights: program?.highlights ?? [],
    facts: program?.facts ?? [],
    cta: program?.cta ?? null,
  });

  const [tab, setTab] = useState<"basics" | "content">("basics");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const orderValue = displayOrder.trim() === "" ? undefined : Number(displayOrder);
    onSubmit({
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      ...(orderValue !== undefined && !Number.isNaN(orderValue)
        ? { displayOrder: orderValue }
        : {}),
      tagline: content.tagline,
      coverImage: content.coverImage ?? null,
      gallery: content.gallery,
      sections: content.sections,
      highlights: content.highlights,
      facts: content.facts,
      cta: content.cta ?? null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {(
          [
            ["basics", "Basics"],
            ["content", "Page content"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "basics" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="programTitle">Title *</Label>
            <Input
              id="programTitle"
              value={title}
              required
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="programShort">Short description *</Label>
            <Textarea
              id="programShort"
              rows={2}
              value={shortDescription}
              required
              disabled={saving}
              onChange={(event) => setShortDescription(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown on cards and listings across the site.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="programDescription">Full description *</Label>
            <Textarea
              id="programDescription"
              rows={5}
              value={description}
              required
              disabled={saving}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="programOrder">Display order</Label>
            <Input
              id="programOrder"
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              disabled={saving}
              onChange={(event) => setDisplayOrder(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
          </div>
        </div>
      ) : (
        <ContentEditor value={content} onChange={setContent} disabled={saving} />
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : program ? "Save changes" : "Create program"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminProgramsPage() {
  const [state, setState] = useState<ListState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProgramStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);

  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; program: Program } | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const data = await listPrograms({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
      });
      if (requestId !== requestIdRef.current) return;
      setState({
        items: data.items,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
      });
      setError(null);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Failed to load programs.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, search, status]);

  // Guarded so an effect can never fire twice for the same query (and a
  // refreshToken bump always forces a fresh load).
  const loadKeyRef = useRef<string>("");
  useEffect(() => {
    const key = `${page}|${search}|${status}|${refreshToken}`;
    if (loadKeyRef.current === key) return;
    loadKeyRef.current = key;
    void load();
  }, [load, page, search, status, refreshToken]);

  const handleSave = useCallback(
    async (values: CreateProgramInput | UpdateProgramInput) => {
      if (!dialog) return;
      setSaving(true);
      setFormError(null);
      try {
        if (dialog.mode === "create") {
          await createProgram(values as CreateProgramInput);
        } else {
          await updateProgram(dialog.program.id, values as UpdateProgramInput);
        }
        setDialog(null);
        setPage(1);
        setRefreshToken((token) => token + 1);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Failed to save.");
      } finally {
        setSaving(false);
      }
    },
    [dialog],
  );

  const handleStatusChange = useCallback(
    async (program: Program, next: ProgramStatus) => {
      try {
        const updated = await updateProgramStatus(program.id, next);
        setState((prev) =>
          prev
            ? {
                ...prev,
                items: prev.items.map((p) => (p.id === updated.id ? updated : p)),
              }
            : prev,
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to change status.");
      }
    },
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Programs"
        description="The main welfare initiatives — each one is a category on the public site and can own its own page, photos and details."
        icon={HiRectangleStack}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setFormError(null);
              setDialog({ mode: "create" });
            }}
          >
            <HiPlus className="mr-1.5 size-4" aria-hidden="true" />
            Create program
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search programs…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="w-56"
        />
        <select
          value={status === "all" ? "" : status}
          onChange={(event) => {
            setStatus((event.target.value as ProgramStatus) || "all");
            setPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        {state ? (
          <span className="text-sm text-muted-foreground">
            {state.total} program{state.total === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      {loading && !state ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-wrap items-center gap-3 py-4">
            <span className="font-medium text-destructive">Could not load</span>
            <span className="text-sm text-muted-foreground">{error}</span>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : state && state.items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <HiRectangleStack className="size-10 text-muted-foreground/60" aria-hidden="true" />
            <span className="text-sm font-medium">No programs yet</span>
            <span className="text-sm text-muted-foreground">
              Create your first program, or load the pre-filled content from the
              dashboard.
            </span>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {state?.items.map((program) => (
            <div key={program.id} className="flex flex-col gap-2">
              <ProgramCard
                program={program}
                onEdit={() => {
                  setFormError(null);
                  setDialog({ mode: "edit", program });
                }}
              />
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                {(["DRAFT", "PUBLISHED", "ARCHIVED"] as ProgramStatus[])
                  .filter((next) => next !== program.status)
                  .map((next) => (
                    <Button
                      key={next}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => void handleStatusChange(program, next)}
                    >
                      Set {next.toLowerCase()}
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {state && state.totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Page {state.page} of {state.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={state.page <= 1}
              onClick={() => setPage(state.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={state.page >= state.totalPages}
              onClick={() => setPage(state.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {dialog?.mode === "edit" ? "Edit program" : "Create program"}
            </DialogTitle>
            <DialogDescription>
              {dialog?.mode === "edit"
                ? "Edit everything the public page shows — basics and full page content."
                : "New programs start as drafts. You can publish them right after."}
            </DialogDescription>
          </DialogHeader>
          {dialog ? (
            <ProgramForm
              key={dialog.mode === "edit" ? dialog.program.id : "create"}
              program={dialog.mode === "edit" ? dialog.program : null}
              saving={saving}
              error={formError}
              onSubmit={handleSave}
              onCancel={() => setDialog(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
