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
import { listPrograms, type Program } from "@/services/programs";
import {
  createProject,
  listProjects,
  updateProject,
  updateProjectStatus,
  type CreateProjectInput,
  type Project,
  type ProjectStatus,
  type UpdateProjectInput,
} from "@/services/projects";
import type { ContentFieldsInput } from "@/types/content";
import { cn } from "@/lib/utils";
import {
  HiArrowTopRightOnSquare,
  HiFolderOpen,
  HiPhoto,
  HiPlus,
  HiPencilSquare,
} from "react-icons/hi2";

/**
 * Admin → Projects.
 *
 * A project is a page inside a program (Ambulance Services under Health Care,
 * for example). This screen lists every project with its cover photo, parent
 * program and content summary, and edits exactly what the public page shows.
 */

const PAGE_SIZE = 10;

const STATUS_BADGE_VARIANT: Record<
  ProjectStatus,
  "secondary" | "default" | "outline"
> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

interface ListState {
  items: Project[];
  page: number;
  total: number;
  totalPages: number;
}

function ProjectCard({
  project,
  onEdit,
}: {
  project: Project;
  onEdit: () => void;
}) {
  const photoCount = (project.coverImage ? 1 : 0) + project.gallery.length;

  return (
    // Shadow-only hover (no lift): these rows carry action buttons, and a
    // row that moves under the pointer makes those targets harder to click.
    <div className="group flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg sm:flex-row sm:items-center">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:w-40">
        {project.coverImage ? (
          <Image
            src={project.coverImage.url}
            alt={project.coverImage.alt ?? project.title}
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
          <Badge variant={STATUS_BADGE_VARIANT[project.status]}>
            {project.status}
          </Badge>
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-bold tracking-tight">
            {project.title}
          </h3>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {project.program?.title ?? "No program"}
          </span>
        </div>
        {project.tagline ? (
          <p className="text-sm font-medium text-primary">{project.tagline}</p>
        ) : null}
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <HiPhoto className="size-3" aria-hidden="true" />
            {photoCount} photo{photoCount === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {project.sections.length} section
            {project.sections.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {project.highlights.length} card
            {project.highlights.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch">
        <Button size="sm" variant="outline" onClick={onEdit}>
          <HiPencilSquare className="mr-1.5 size-4" aria-hidden="true" />
          Edit content
        </Button>
        <Link
          href={`/${project.slug}`}
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

function ProjectForm({
  project,
  programs,
  saving,
  error,
  onSubmit,
  onCancel,
}: {
  project: Project | null;
  programs: Program[];
  saving: boolean;
  error: string | null;
  onSubmit: (values: CreateProjectInput | UpdateProjectInput) => void;
  onCancel: () => void;
}) {
  const [programId, setProgramId] = useState(
    project?.programId ?? programs[0]?.id ?? "",
  );
  const [title, setTitle] = useState(project?.title ?? "");
  const [shortDescription, setShortDescription] = useState(
    project?.shortDescription ?? "",
  );
  const [description, setDescription] = useState(project?.description ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    project?.displayOrder !== undefined ? String(project.displayOrder) : "",
  );
  const [content, setContent] = useState<ContentFieldsInput>({
    tagline: project?.tagline ?? undefined,
    coverImage: project?.coverImage ?? null,
    gallery: project?.gallery ?? [],
    sections: project?.sections ?? [],
    highlights: project?.highlights ?? [],
    facts: project?.facts ?? [],
    cta: project?.cta ?? null,
  });
  const [tab, setTab] = useState<"basics" | "content">("basics");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const orderValue = displayOrder.trim() === "" ? undefined : Number(displayOrder);
    onSubmit({
      programId,
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
            <Label htmlFor="projectProgram">Program *</Label>
            <select
              id="projectProgram"
              required
              value={programId}
              disabled={saving}
              onChange={(event) => setProgramId(event.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Select a program
              </option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              The program this project belongs to.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="projectTitle">Title *</Label>
            <Input
              id="projectTitle"
              value={title}
              required
              disabled={saving}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="projectShort">Short description *</Label>
            <Textarea
              id="projectShort"
              rows={2}
              value={shortDescription}
              required
              disabled={saving}
              onChange={(event) => setShortDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="projectDescription">Full description *</Label>
            <Textarea
              id="projectDescription"
              rows={5}
              value={description}
              required
              disabled={saving}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="projectOrder">Display order</Label>
            <Input
              id="projectOrder"
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              disabled={saving}
              onChange={(event) => setDisplayOrder(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <ContentEditor value={content} onChange={setContent} disabled={saving} />
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !programId}>
          {saving ? "Saving…" : project ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

export default function AdminProjectsPage() {
  const [state, setState] = useState<ListState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [refreshToken, setRefreshToken] = useState(0);
  const [dialog, setDialog] = useState<
    { mode: "create" } | { mode: "edit"; project: Project } | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await listPrograms({ limit: 100 });
        if (!cancelled) setPrograms(data.items);
      } catch {
        // The selector stays empty; the page itself surfaces list errors.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      const data = await listProjects({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: status !== "all" ? status : undefined,
        programId: programFilter !== "all" ? programFilter : undefined,
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
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [page, search, status, programFilter]);

  // Guarded so an effect can never fire twice for the same query (and a
  // refreshToken bump always forces a fresh load).
  const loadKeyRef = useRef<string>("");
  useEffect(() => {
    const key = `${page}|${search}|${status}|${programFilter}|${refreshToken}`;
    if (loadKeyRef.current === key) return;
    loadKeyRef.current = key;
    void load();
  }, [load, page, search, status, programFilter, refreshToken]);

  const handleSave = useCallback(
    async (values: CreateProjectInput | UpdateProjectInput) => {
      if (!dialog) return;
      setSaving(true);
      setFormError(null);
      try {
        if (dialog.mode === "create") {
          await createProject(values as CreateProjectInput);
        } else {
          await updateProject(dialog.project.id, values as UpdateProjectInput);
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
    async (project: Project, next: ProjectStatus) => {
      try {
        const updated = await updateProjectStatus(project.id, next);
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
        title="Projects"
        description="The pages inside each program — every project owns its own photos, sections, cards and facts."
        icon={HiFolderOpen}
        actions={
          <Button
            size="sm"
            disabled={programs.length === 0}
            onClick={() => {
              setFormError(null);
              setDialog({ mode: "create" });
            }}
          >
            <HiPlus className="mr-1.5 size-4" aria-hidden="true" />
            Create project
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="w-56"
        />
        <select
          value={programFilter}
          onChange={(event) => {
            setProgramFilter(event.target.value);
            setPage(1);
          }}
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All programs</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.title}
            </option>
          ))}
        </select>
        <select
          value={status === "all" ? "" : status}
          onChange={(event) => {
            setStatus((event.target.value as ProjectStatus) || "all");
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
            {state.total} project{state.total === 1 ? "" : "s"}
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
            <HiFolderOpen className="size-10 text-muted-foreground/60" aria-hidden="true" />
            <span className="text-sm font-medium">No projects yet</span>
            <span className="text-sm text-muted-foreground">
              Create a project inside a program, or load the pre-filled content
              from the dashboard.
            </span>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {state?.items.map((project) => (
            <div key={project.id} className="flex flex-col gap-2">
              <ProjectCard
                project={project}
                onEdit={() => {
                  setFormError(null);
                  setDialog({ mode: "edit", project });
                }}
              />
              <div className="flex flex-wrap items-center gap-1.5 px-1">
                {(["DRAFT", "PUBLISHED", "ARCHIVED"] as ProjectStatus[])
                  .filter((next) => next !== project.status)
                  .map((next) => (
                    <Button
                      key={next}
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => void handleStatusChange(project, next)}
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
              {dialog?.mode === "edit" ? "Edit project" : "Create project"}
            </DialogTitle>
            <DialogDescription>
              Edit everything the public page shows — basics and full page
              content.
            </DialogDescription>
          </DialogHeader>
          {dialog ? (
            <ProjectForm
              key={dialog.mode === "edit" ? dialog.project.id : "create"}
              project={dialog.mode === "edit" ? dialog.project : null}
              programs={programs}
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
