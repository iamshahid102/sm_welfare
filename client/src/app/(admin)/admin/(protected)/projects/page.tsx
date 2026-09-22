"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/types/auth";
import {
  listProjects,
  createProject,
  updateProject,
  updateProjectStatus,
  listProgramsForSelector,
  type CreateProjectInput,
  type UpdateProjectInput,
  type Project,
  type ProjectStatus,
  type Program,
} from "@/services/projects";
import { HiLockClosed } from "react-icons/hi2";

// Title is set via the layout

const PAGE_SIZE = 10;

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      projects: Project[];
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      search: string;
      filterProgramId: string | "all";
      filterStatus: ProjectStatus | "all";
      programs: Program[];
      /** True while a refetch is in flight - the rendered list stays mounted. */
      refreshing: boolean;
      editingProject: Project | null;
      editingForm: UpdateProjectInput;
      saving: boolean;
      lastError: string | null;
    };

function isReadyState(
  state: PageState,
): state is Extract<PageState, { status: "ready" }> {
  return state.status === "ready";
}

const STATUS_BADGE_VARIANT: Record<
  ProjectStatus,
  | "secondary"
  | "default"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | null
  | undefined
> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

function ProjectRow({
  project,
  onEdit,
  canEdit,
}: {
  project: Project;
  onEdit: () => void;
  canEdit: boolean;
}) {
  return (
    <tr className="group cursor-default border-border/60 hover:bg-muted/50">
      <td className="px-4 py-3 align-middle font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span>{project.title}</span>
          <Badge
            variant={STATUS_BADGE_VARIANT[project.status]}
            className="whitespace-nowrap"
          >
            {project.status}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-sm">
        {project.program ? (
          <span className="text-muted-foreground">{project.program.title}</span>
        ) : (
          <span className="text-muted-foreground line-through">
            Program not found
          </span>
        )}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground font-mono text-xs">
        {project.slug}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
        {project.shortDescription}
      </td>
      <td className="px-4 py-3 align-middle text-sm">
        <span className="font-mono text-muted-foreground">
          {project.displayOrder}
        </span>
      </td>
      <td className="px-4 py-3 align-middle">
        {canEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [programIdFilter, setProgramIdFilter] = useState<string | "all">("all");
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  // Bumped after a mutation so the effect refetches even when the query
  // parameters themselves are unchanged (e.g. create while on page 1).
  const [refreshToken, setRefreshToken] = useState(0);

  // Only the newest request may write state - a slow response for an older
  // search term can never overwrite a newer one.
  const requestIdRef = useRef(0);

  const userIsSuperAdmin = isSuperAdmin(user);
  const canEdit = userIsSuperAdmin;

  /**
   * Loads the project page together with the program selector options - both
   * are needed to render every state of this screen.
   */
  const loadProjects = useCallback(
    async (query: {
      page: number;
      search: string;
      status: ProjectStatus | "all";
      programId: string | "all";
    }) => {
      const requestId = ++requestIdRef.current;

      // Refetching must NOT unmount the ready UI: replacing it with a skeleton
      // would unmount the search input mid-typing and drop keyboard focus.
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, refreshing: true }
          : { status: "loading" },
      );

      try {
        const [projectsData, programsData] = await Promise.all([
          listProjects({
            page: query.page,
            limit: PAGE_SIZE,
            search: query.search || undefined,
            status: query.status !== "all" ? query.status : undefined,
            programId: query.programId !== "all" ? query.programId : undefined,
          }),
          listProgramsForSelector({ limit: 100 }),
        ]);
        if (requestId !== requestIdRef.current) return;
        setState({
          status: "ready",
          projects: projectsData.items,
          page: projectsData.page,
          limit: projectsData.limit,
          total: projectsData.total,
          totalPages: projectsData.totalPages,
          search: query.search,
          filterStatus: query.status,
          filterProgramId: query.programId,
          programs: programsData.items,
          refreshing: false,
          editingProject: null,
          editingForm: {},
          saving: false,
          lastError: null,
        });
      } catch (error) {
        if (requestId !== requestIdRef.current) return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load projects.",
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (user) {
      loadProjects({ page, search, status, programId: programIdFilter });
    }
  }, [
    user,
    loadProjects,
    page,
    search,
    status,
    programIdFilter,
    refreshToken,
  ]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusFilter = useCallback((filter: ProjectStatus | "all") => {
    setStatus(filter);
    setPage(1);
  }, []);

  const handleProgramFilter = useCallback((id: string | "all") => {
    setProgramIdFilter(id);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const openEditDialog = useCallback((project: Project) => {
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            editingProject: project,
            editingForm: {
              programId: project.programId,
              title: project.title,
              slug: project.slug,
              shortDescription: project.shortDescription,
              description: project.description,
              displayOrder: project.displayOrder,
            },
            saving: false,
            lastError: null,
          }
        : prev,
    );
  }, []);

  const closeDialog = useCallback(() => {
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            editingProject: null,
            editingForm: {},
            saving: false,
            lastError: null,
          }
        : prev,
    );
  }, []);

  const handleCreate = useCallback(
    async (values: CreateProjectInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, saving: true, lastError: null }
          : prev,
      );
      try {
        await createProject(values);
        setCreateDialogOpen(false);
        setPage(1);
        setSearch("");
        setStatus("all");
        setProgramIdFilter("all");
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                editingProject: null,
                editingForm: {},
                saving: false,
                lastError: null,
              }
            : prev,
        );
        // Refetch even when the filters were already at their defaults.
        setRefreshToken((token) => token + 1);
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                saving: false,
                lastError:
                  error instanceof Error
                    ? error.message
                    : "Failed to create project.",
              }
            : prev,
        );
      }
    },
    [],
  );

  const handleUpdate = useCallback(
    async (values: UpdateProjectInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, saving: true, lastError: null }
          : prev,
      );
      try {
        const readyState = isReadyState(state) ? state : null;
        if (!readyState || !readyState.editingProject) return;
        const updated = await updateProject(
          readyState.editingProject.id,
          values,
        );
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                projects: prev.projects.map((p) =>
                  p.id === updated.id ? updated : p,
                ),
                editingProject: updated,
                editingForm: values,
                saving: false,
                lastError: null,
              }
            : prev,
        );
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                saving: false,
                lastError:
                  error instanceof Error
                    ? error.message
                    : "Failed to update project.",
              }
            : prev,
        );
      }
    },
    [state],
  );

  const handleStatusChange = useCallback(
    async (projectId: string, newStatus: ProjectStatus) => {
      try {
        const updated = await updateProjectStatus(projectId, newStatus);
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                projects: prev.projects.map((p) =>
                  p.id === updated.id ? updated : p,
                ),
              }
            : prev,
        );
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                lastError:
                  error instanceof Error
                    ? error.message
                    : "Failed to change status.",
              }
            : prev,
        );
      }
    },
    [],
  );

  if (!user) {
    return null;
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <CardTitle className="font-heading">
                <Skeleton className="h-6 w-32" />
              </CardTitle>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage the projects shown on the public Projects page.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-destructive font-medium">Error</span>
            <span className="text-sm text-muted-foreground">
              {state.message}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                loadProjects({
                  page: 1,
                  search,
                  status,
                  programId: programIdFilter,
                })
              }
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status !== "ready") {
    return null;
  }

  const {
    projects,
    total,
    totalPages,
    editingProject,
    editingForm,
    saving,
    lastError,
    programs,
    refreshing,
  } = state;

  const EmptyState = (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <HiLockClosed
          className="size-10 text-muted-foreground/60"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">No projects yet</span>
        <span className="text-sm text-muted-foreground">
          Create a project to start organizing initiatives.
        </span>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Manage the projects shown on the public Projects page.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <CardTitle className="font-heading">All projects</CardTitle>
            <CardDescription>
              {total} project{total === 1 ? "" : "s"} total
              {refreshing ? " · Refreshing…" : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search projects…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-48"
            />
            <Select
              value={status === "all" ? "all" : status}
              onValueChange={(val) =>
                handleStatusFilter(
                  val === "all"
                    ? ("all" as ProjectStatus | "all")
                    : (val as ProjectStatus),
                )
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={programIdFilter ?? "all"}
              onValueChange={(val) => handleProgramFilter(val as string)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canEdit && (
              <Dialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
              >
                <DialogTrigger
                  render={<Button size="sm">Create project</Button>}
                />
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading">
                      Create project
                    </DialogTitle>
                    <DialogDescription>
                      Add a new project under a program. It will start as a
                      draft.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateProjectForm
                    programs={programs}
                    onSubmit={handleCreate}
                    saving={saving}
                    lastError={lastError}
                    onClose={() => setCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {projects.length === 0 ? (
            EmptyState
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border/60 text-left">
                      <th className="px-4 py-2 text-sm font-medium">Name</th>
                      <th className="px-4 py-2 text-sm font-medium">Program</th>
                      <th className="px-4 py-2 text-sm font-medium">Slug</th>
                      <th className="px-4 py-2 text-sm font-medium">
                        Short description
                      </th>
                      <th className="px-4 py-2 text-sm font-medium">Order</th>
                      <th className="px-4 py-2 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        onEdit={() => openEditDialog(project)}
                        canEdit={canEdit}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </div>
                  <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {editingProject && canEdit && (
        <Dialog open onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit project</DialogTitle>
              <DialogDescription>Update the project details.</DialogDescription>
            </DialogHeader>
            <EditProjectForm
              project={editingProject}
              initialValues={editingForm}
              programs={programs}
              onSave={handleUpdate}
              onStatusChange={handleStatusChange}
              saving={saving}
              lastError={lastError}
              onClose={closeDialog}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    // flex-wrap keeps a long page list from forcing horizontal page overflow
    // on narrow screens.
    <div className="flex max-w-full flex-wrap items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}

function CreateProjectForm({
  programs,
  onSubmit,
  saving,
  lastError,
  onClose,
}: {
  programs: Program[];
  onSubmit: (values: CreateProjectInput) => void;
  saving: boolean;
  lastError: string | null;
  onClose: () => void;
}) {
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const hasSelectedProgramRef = useRef(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(
    undefined,
  );

  useEffect(() => {
    if (programs.length > 0 && !hasSelectedProgramRef.current) {
      hasSelectedProgramRef.current = true;
      setSelectedProgramId(programs[0].id);
    }
  }, [programs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgramId) return;
    onSubmit({
      programId: selectedProgramId,
      title: title.trim(),
      ...(slug.trim() && { slug: slug.trim() }),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      ...(displayOrder !== undefined && { displayOrder }),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {lastError && (
        <div className="rounded-lg border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {lastError}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="createProgramId">Program *</Label>
        <Select
          value={selectedProgramId || "all"}
          onValueChange={(val) => setSelectedProgramId(val ?? "")}
          disabled={saving}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" disabled>
              Select a program
            </SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.title}
                <span className="text-muted-foreground ml-2">
                  ({program.status})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {programs.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No programs available yet - create a program first, because every
            project belongs to one.
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createTitle">Title *</Label>
        <Input
          id="createTitle"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          required
          disabled={saving}
          aria-invalid={lastError ? true : undefined}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createSlug">Slug (optional)</Label>
        <Input
          id="createSlug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
          }}
          disabled={saving}
          placeholder="Auto-generated from title if empty"
          className="text-xs font-mono"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createShortDescription">Short description *</Label>
        <Textarea
          id="createShortDescription"
          value={shortDescription}
          onChange={(e) => {
            setShortDescription(e.target.value);
          }}
          required
          disabled={saving}
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createDescription">Description *</Label>
        <Textarea
          id="createDescription"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          required
          disabled={saving}
          rows={4}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createDisplayOrder">Display order</Label>
        <Input
          id="createDisplayOrder"
          type="number"
          min={0}
          step={1}
          value={(displayOrder ?? "").toString()}
          onChange={(e) => {
            const val = e.target.value;
            setDisplayOrder(val ? Number(val) : undefined);
          }}
          disabled={saving}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !selectedProgramId}>
          {saving ? "Creating…" : "Create project"}
        </Button>
      </div>
    </form>
  );
}

function EditProjectForm({
  project,
  initialValues,
  programs,
  onSave,
  onStatusChange,
  saving,
  lastError,
  onClose,
}: {
  project: Project;
  initialValues: UpdateProjectInput;
  programs: Program[];
  onSave: (values: UpdateProjectInput) => void;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  saving: boolean;
  lastError: string | null;
  onClose: () => void;
}) {
  const [selectedProgramId, setSelectedProgramId] = useState(
    initialValues.programId ?? project.programId,
  );
  const [title, setTitle] = useState(initialValues.title ?? project.title);
  const [slug, setSlug] = useState(initialValues.slug ?? project.slug);
  const [shortDescription, setShortDescription] = useState(
    initialValues.shortDescription ?? project.shortDescription,
  );
  const [description, setDescription] = useState(
    initialValues.description ?? project.description,
  );
  const [displayOrderValue, setDisplayOrderValue] = useState<
    number | undefined
  >(initialValues.displayOrder ?? project.displayOrder);

  const hasChanges =
    selectedProgramId !== project.programId ||
    title !== project.title ||
    slug !== project.slug ||
    shortDescription !== project.shortDescription ||
    description !== project.description ||
    displayOrderValue !== project.displayOrder;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(selectedProgramId !== project.programId && {
        programId: selectedProgramId,
      }),
      ...(title !== project.title && { title: title.trim() }),
      ...(slug !== project.slug && { slug: slug.trim() }),
      ...(shortDescription !== project.shortDescription && {
        shortDescription: shortDescription.trim(),
      }),
      ...(description !== project.description && {
        description: description.trim(),
      }),
      ...(displayOrderValue !== project.displayOrder && {
        displayOrder: displayOrderValue,
      }),
    });
  };

  return (
    <div className="space-y-6">
      {lastError && (
        <div className="rounded-lg border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {lastError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="editProgramId">Program</Label>
          <Select
            value={selectedProgramId || "all"}
            onValueChange={(val) => setSelectedProgramId(val ?? "")}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.title}
                  <span className="text-muted-foreground ml-2">
                    ({program.status})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="editTitle">Title</Label>
          <Input
            id="editTitle"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            required
            disabled={saving}
            aria-invalid={lastError ? true : undefined}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="editSlug">Slug</Label>
          <Input
            id="editSlug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
            }}
            disabled={saving}
            className="text-xs font-mono"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="editShortDescription">Short description</Label>
          <Textarea
            id="editShortDescription"
            value={shortDescription}
            onChange={(e) => {
              setShortDescription(e.target.value);
            }}
            disabled={saving}
            rows={2}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="editDescription">Description</Label>
          <Textarea
            id="editDescription"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            disabled={saving}
            rows={4}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="editDisplayOrder">Display order</Label>
          <Input
            id="editDisplayOrder"
            type="number"
            min={0}
            step={1}
            value={(displayOrderValue ?? "").toString()}
            onChange={(e) => {
              const val = e.target.value;
              setDisplayOrderValue(val ? Number(val) : undefined);
            }}
            disabled={saving}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !hasChanges}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <Separator />

      <div>
        <h3 className="font-heading text-base font-medium mb-3">Status</h3>
        <div className="flex flex-wrap gap-2">
          {["DRAFT", "PUBLISHED", "ARCHIVED"]
            .filter((s) => s !== project.status)
            .map((nextStatus) => (
              <Button
                key={nextStatus}
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() =>
                  onStatusChange(project.id, nextStatus as ProjectStatus)
                }
              >
                Set to{" "}
                {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
              </Button>
            ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Status changes are made through a dedicated endpoint.
        </p>
      </div>
    </div>
  );
}
