"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/types/auth";
import {
  listPrograms,
  createProgram,
  updateProgram,
  updateProgramStatus,
  type ListProgramsQuery,
  type CreateProgramInput,
  type UpdateProgramInput,
  type Program,
  type ProgramStatus,
} from "@/services/programs";
import { HiLockClosed } from "react-icons/hi2";

// Title is set via the layout

const PAGE_SIZE = 10;

interface LoadingState {
  status: "loading";
}

interface ErrorState {
  status: "error";
  message: string;
}

interface ReadyState {
  status: "ready";
  programs: Program[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  filterStatus: ProgramStatus | "all";
  selectingProgram: Program | null;
  editingProgram: Program | null;
  editingForm: UpdateProgramInput;
  saving: boolean;
  lastError: string | null;
}

type PageState = LoadingState | ErrorState | ReadyState;

function isReadyState(state: PageState): state is ReadyState {
  return state.status === "ready";
}

const STATUS_BADGE_VARIANT: Record<ProgramStatus, "secondary" | "default" | "outline" | "ghost" | "destructive" | "link" | null | undefined> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  ARCHIVED: "outline",
};

function ProgramRow({
  program,
  onEdit,
  canEdit,
}: {
  program: Program;
  onEdit: () => void;
  canEdit: boolean;
}) {
  return (
    <tr className="group cursor-default border-border/60 hover:bg-muted/50">
      <td className="px-4 py-3 align-middle font-medium">
        <div className="flex flex-wrap items-center gap-2">
          <span>{program.title}</span>
          <Badge variant={STATUS_BADGE_VARIANT[program.status]} className="whitespace-nowrap">
            {program.status}
          </Badge>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground font-mono text-xs">
        {program.slug}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
        {program.shortDescription}
      </td>
      <td className="px-4 py-3 align-middle text-sm">
        <span className="font-mono text-muted-foreground">{program.displayOrder}</span>
      </td>
      <td className="px-4 py-3 align-middle">
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminProgramsPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [programSearch, setProgramSearch] = useState("");
  const [programStatus, setProgramStatus] = useState<ProgramStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const userIsSuperAdmin = isSuperAdmin(user);
  const canEdit = userIsSuperAdmin;

  const loadPrograms = useCallback(
    async (
      query: ListProgramsQuery = {},
      keepData: boolean = false,
    ) => {
      setState((prev) =>
        keepData && prev.status === "ready"
          ? { ...prev, status: "loading" }
          : { status: "loading" },
      );
      try {
        const data = await listPrograms(query);
        setState({
          status: "ready",
          programs: data.items,
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
          search: query.search ?? "",
          filterStatus: query.status ?? "all",
          selectingProgram: null,
          editingProgram: null,
          editingForm: {},
          saving: false,
          lastError: null,
        });
      } catch (error) {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load programs.",
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (user) {
      loadPrograms({ page, limit: PAGE_SIZE, search: programSearch || undefined, status: programStatus !== "all" ? programStatus : undefined });
    }
  }, [user, loadPrograms, page, programSearch, programStatus]);

  const handleSearch = useCallback(
    (value: string) => {
      setProgramSearch(value);
      setPage(1);
    },
    [],
  );

  const handleStatusFilter = useCallback(
    (status: ProgramStatus | "all") => {
      setProgramStatus(status);
      setPage(1);
    },
    [],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [],
  );

  const openEditDialog = useCallback(
    (program: Program) => {
      setState((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              editingProgram: program,
              editingForm: {
                title: program.title,
                slug: program.slug,
                shortDescription: program.shortDescription,
                description: program.description,
                displayOrder: program.displayOrder,
              },
              saving: false,
              lastError: null,
            }
          : prev,
      );
    },
    [],
  );

  const closeDialog = useCallback(() => {
    setCreateDialogOpen(false);
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            selectingProgram: null,
            editingProgram: null,
            editingForm: {},
            saving: false,
            lastError: null,
          }
        : prev,
    );
  }, []);

  const handleCreate = useCallback(
    async (values: CreateProgramInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, saving: true, lastError: null }
          : prev,
      );
      try {
        await createProgram(values);
        loadPrograms({
          page: 1,
          limit: PAGE_SIZE,
          search: programSearch || undefined,
          status: programStatus !== "all" ? programStatus : undefined,
        });
        closeDialog();
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? { ...prev, saving: false, lastError: error instanceof Error ? error.message : "Failed to create program." }
            : prev,
        );
      }
    },
    [loadPrograms, programSearch, programStatus, closeDialog],
  );

  const handleUpdate = useCallback(
    async (values: UpdateProgramInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, saving: true, lastError: null }
          : prev,
      );
      try {
        const readyState = isReadyState(state) ? state : null;
        if (!readyState || !readyState.editingProgram) return;
        const updated = await updateProgram(readyState.editingProgram.id, values);
        setState((prev) => {
          if (!isReadyState(prev)) return prev;
          return {
            ...prev,
            programs: prev.programs.map((p) => p.id === updated.id ? updated : p),
            editingProgram: updated,
            editingForm: values,
            saving: false,
            lastError: null,
          };
        });
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? { ...prev, saving: false, lastError: error instanceof Error ? error.message : "Failed to update program." }
            : prev,
        );
      }
    },
    [state],
  );  const handleStatusChange = useCallback(async (programId: string, newStatus: ProgramStatus) => {
    try {
      const updated = await updateProgramStatus(programId, newStatus);
      setState((prev) => {
        if (!isReadyState(prev)) return prev;
        return {
          ...prev,
          programs: prev.programs.map((p) => p.id === updated.id ? updated : p),
        };
      });
    } catch (error) {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, lastError: error instanceof Error ? error.message : "Failed to change status." }
          : prev,
      );
    }
  }, []);

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
          <h1 className="font-heading text-2xl font-semibold">Programs</h1>
          <p className="text-sm text-muted-foreground">
            Manage the programmes shown on the public Projects page.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-destructive font-medium">Error</span>
            <span className="text-sm text-muted-foreground">
              {state.message}
            </span>
            <Button variant="outline" size="sm" onClick={() => loadPrograms()}>
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

  const { programs, total, totalPages, editingProgram, editingForm, saving, lastError } = state;

  const EmptyState = (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <HiLockClosed
          className="size-10 text-muted-foreground/60"
          aria-hidden="true"
        />
        <span className="text-sm font-medium">No programs yet</span>
        <span className="text-sm text-muted-foreground">
          Create a program to start organizing projects.
        </span>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Programs</h1>
        <p className="text-sm text-muted-foreground">
          Manage the programmes shown on the public Projects page.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <CardTitle className="font-heading">All programs</CardTitle>
            <CardDescription>
              {total} program{total === 1 ? "" : "s"} total
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search programs…"
              value={programSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-48"
            />
            <select
              value={programStatus === "all" ? "" : programStatus}
              onChange={(e) => {
                const val = e.target.value;
                handleStatusFilter(val ? (val as ProgramStatus) : "all");
              }}
              className="rounded-lg border-border bg-background px-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            {canEdit && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger render={<Button size="sm">Create program</Button>} />
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Create program</DialogTitle>
                    <DialogDescription>
                      Add a new program. It will start as a draft.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateProgramForm
                    onSubmit={handleCreate}
                    saving={saving}
                    lastError={lastError}
                    onClose={closeDialog}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {programs.length === 0 ? (
            EmptyState
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border/60 text-left">
                      <th className="px-4 py-2 text-sm font-medium">Name</th>
                      <th className="px-4 py-2 text-sm font-medium">Slug</th>
                      <th className="px-4 py-2 text-sm font-medium">Short description</th>
                      <th className="px-4 py-2 text-sm font-medium">Order</th>
                      <th className="px-4 py-2 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((program) => (
                      <ProgramRow
                        key={program.id}
                        program={program}
                        onEdit={() => openEditDialog(program)}
                        canEdit={canEdit}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {state.page} of {totalPages}
                  </div>
                  <PaginationControls
                    page={state.page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {editingProgram && canEdit && (
        <Dialog open onOpenChange={(open) => { if (!open) closeDialog(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit program</DialogTitle>
              <DialogDescription>
                Update the program details.
              </DialogDescription>
            </DialogHeader>
            <EditProgramForm
              program={editingProgram}
              initialValues={editingForm}
              onSave={handleUpdate}
              onStatusChange={handleStatusChange}
              saving={saving}
              lastError={lastError}
              onClose={closeDialog}
            />
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
    <div className="flex items-center gap-1">
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

function CreateProgramForm({
  onSubmit,
  saving,
  lastError,
  onClose,
}: {
  onSubmit: (values: CreateProgramInput) => void;
  saving: boolean;
  lastError: string | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
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
          value={displayOrder ?? ""}
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
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create program"}
        </Button>
      </div>
    </form>
  );
}

function EditProgramForm({
  program,
  initialValues,
  onSave,
  onStatusChange,
  saving,
  lastError,
  onClose,
}: {
  program: Program;
  initialValues: UpdateProgramInput;
  onSave: (values: UpdateProgramInput) => void;
  onStatusChange: (id: string, status: ProgramStatus) => void;
  saving: boolean;
  lastError: string | null;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initialValues.title ?? program.title);
  const [slug, setSlug] = useState(initialValues.slug ?? program.slug);
  const [shortDescription, setShortDescription] = useState(initialValues.shortDescription ?? program.shortDescription);
  const [description, setDescription] = useState(initialValues.description ?? program.description);
  const [displayOrder, setDisplayOrder] = useState<number | undefined>(initialValues.displayOrder ?? program.displayOrder);

  const hasChanges =
    title !== program.title ||
    slug !== program.slug ||
    shortDescription !== program.shortDescription ||
    description !== program.description ||
    displayOrder !== program.displayOrder;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(title !== program.title && { title: title.trim() }),
      ...(slug !== program.slug && { slug: slug.trim() }),
      ...(shortDescription !== program.shortDescription && { shortDescription: shortDescription.trim() }),
      ...(description !== program.description && { description: description.trim() }),
      ...(displayOrder !== program.displayOrder && { displayOrder }),
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
            value={displayOrder ?? ""}
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
          <Button
            type="submit"
            disabled={saving || !hasChanges}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <Separator />

      <div>
        <h3 className="font-heading text-base font-medium mb-3">Status</h3>
        <div className="flex flex-wrap gap-2">
          {["DRAFT", "PUBLISHED", "ARCHIVED"].filter((s) => s !== program.status).map((nextStatus) => (
            <Button
              key={nextStatus}
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onStatusChange(program.id, nextStatus as ProgramStatus)}
            >
              Set to {nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}
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
