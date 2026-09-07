"use client";

import type { Metadata } from "next";

// Metadata is handled by the parent layout
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/types/auth";
import {
  listAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  type CreateAdminInput,
  type UpdateAdminInput,
  type AdminStatus,
  type SafeUser,
} from "@/services/admins";

// Title is set via the layout

const PAGE_SIZE = 10;

type ReadyState = {
  status: "ready";
  admins: SafeUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  search: string;
  filterStatus: AdminStatus | "all";
  creating: boolean;
  createError: string | null;
  selectingAdmin: SafeUser | null;
  editingAdmin: SafeUser | null;
  editingForm: UpdateAdminInput;
  saving: boolean;
  lastError: string | null;
};

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ReadyState;

function isReadyState(state: PageState): state is ReadyState {
  return state.status === "ready";
}

function AdminRow({
  admin,
  onEdit,
  canManage,
}: {
  admin: SafeUser;
  onEdit: () => void;
  canManage: boolean;
}) {
  return (
    <tr className="group cursor-default border-border/60 hover:bg-muted/50">
      <td className="px-4 py-3 align-middle">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {admin.name
              .split(" ")
              .map((part) => part.charAt(0))
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </span>
          <span className="font-medium">{admin.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
        {admin.email}
      </td>
      <td className="px-4 py-3 align-middle">
        <Badge
          variant={admin.status === "ACTIVE" ? "default" : "secondary"}
          className="whitespace-nowrap"
        >
          {admin.status}
        </Badge>
      </td>
      <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
        {admin.role}
      </td>
      <td className="px-4 py-3 align-middle">
        {canManage && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function AdminAdminsPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({ status: "loading" });

  // Access current state values safely
  const currentState = state.status === "ready" ? state : null;
  const currentSearch = currentState?.search ?? "";
  const currentFilterStatus = currentState?.filterStatus ?? ("all" as AdminStatus | "all");
  const currentPage = currentState?.page ?? 1;

  const userIsSuperAdmin = isSuperAdmin(user);
  const canManage = userIsSuperAdmin;

  // State setters
  const setSearchState = useCallback((value: string) => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, search: value, page: 1 }
        : prev,
    );
  }, []);
  const setFilterStatusState = useCallback((value: AdminStatus | "all") => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, filterStatus: value, page: 1 }
        : prev,
    );
  }, []);
  const setPageState = useCallback((value: number) => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, page: value }
        : prev,
    );
  }, []);

  const loadAdmins = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const currentSearch = state.status === "ready" ? state.search : "";
      const currentFilterStatus = state.status === "ready" ? state.filterStatus : ("all" as AdminStatus | "all");
      const data = await listAdmins({
        page: 1,
        limit: PAGE_SIZE,
        search: currentSearch || undefined,
        status: currentFilterStatus !== "all" ? currentFilterStatus : undefined,
      });
      setState({
        status: "ready",
        admins: data.admins,
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
        search: currentSearch,
        filterStatus: currentFilterStatus,
        creating: false,
        createError: null,
        selectingAdmin: null,
        editingAdmin: null,
        editingForm: {},
        saving: false,
        lastError: null,
      });
    } catch (error) {
      setState({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to load admins.",
      });
    }
  }, []);

  useEffect(() => {
    if (user && canManage) {
      loadAdmins();
    }
  }, [user, canManage, loadAdmins]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchState(value);
      setPageState(1);
      loadAdmins();
    },
    [loadAdmins],
  );

  const handleStatusFilter = useCallback(
    (status: AdminStatus | "all") => {
      setFilterStatusState(status);
      setPageState(1);
      loadAdmins();
    },
    [loadAdmins],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      loadAdmins();
    },
    [loadAdmins],
  );

  const openCreateDialog = useCallback(() => {
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            creating: true,
            createError: null,
            selectingAdmin: null,
            editingAdmin: null,
            editingForm: {},
            saving: false,
            lastError: null,
          }
        : prev,
    );
  }, []);

  const openEditDialog = useCallback(
    (admin: SafeUser) => {
      setState((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              editingAdmin: admin,
              editingForm: {
                name: admin.name,
                email: admin.email,
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
    setState((prev) =>
      prev.status === "ready"
        ? {
            ...prev,
            creating: false,
            createError: null,
            editingAdmin: null,
            editingForm: {},
            saving: false,
            lastError: null,
          }
        : prev,
    );
  }, []);

  const updateFormField = useCallback(
    (field: keyof UpdateAdminInput, value: string) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, editingForm: { ...prev.editingForm, [field]: value } }
          : prev,
      );
    },
    [],
  );

  const handleCreate = useCallback(
    async (values: CreateAdminInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, saving: true, createError: null }
          : prev,
      );
      try {
        await createAdmin(values);
        setPageState(1);
        setSearchState("");
        setFilterStatusState("all");
        closeDialog();
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                saving: false,
                createError:
                  error instanceof Error ? error.message : "Failed to create admin.",
              }
            : prev,
        );
      }
    },
    [closeDialog],
  );

  const handleUpdate = useCallback(
    async (values: UpdateAdminInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, saving: true, lastError: null }
          : prev,
      );
      try {
        const readyState = state as ReadyState;
        const updated = await updateAdmin(readyState.editingAdmin!.id, values);
        setState((prev) => {
        if (!isReadyState(prev)) return prev;
        return {
          ...prev,
          admins: prev.admins.map((a) =>
            a.id === updated.id ? updated : a,
          ),
          editingAdmin: updated,
          editingForm: values,
          saving: false,
          lastError: null,
        };
      });
      setState((prev) => {
        if (!isReadyState(prev)) return prev;
        const admins = prev.admins.map((a) =>
          a.id === updated.id ? updated : a,
        );
        return {
          ...prev,
          admins,
          editingAdmin: updated,
          editingForm: values,
          saving: false,
          lastError: null,
        };
      });
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                saving: false,
                lastError:
                  error instanceof Error ? error.message : "Failed to update admin.",
              }
            : prev,
        );
      }
    },
    [state],
  );

  const handleStatusChange = useCallback(
    async (adminId: string, newStatus: AdminStatus) => {
      try {
        const updated = await updateAdminStatus(adminId, newStatus);      setState((prev) =>
        prev.status === "ready" && "admins" in prev
          ? { ...prev, admins: prev.admins.map((a) =>
              a.id === updated.id ? updated : a,
            ) }
          : prev,
      );
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                lastError:
                  error instanceof Error ? error.message : "Failed to change status.",
              }
            : prev,
        );
      }
    },
    [state],
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
          <h1 className="font-heading text-2xl font-semibold">Admins</h1>
          <p className="text-sm text-muted-foreground">
            Manage administrator accounts and their status.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-destructive font-medium">Error</span>
            <span className="text-sm text-muted-foreground">
              {state.message}
            </span>
            <Button variant="outline" size="sm" onClick={() => loadAdmins()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status !== "ready" || !canManage) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Admins</h1>
          <p className="text-sm text-muted-foreground">
            Manage administrator accounts and their status.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <svg
              className="size-10 text-muted-foreground/60"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.78 1.128a6.75 6.75 0 016.75-6.75 2.25 2.25 0 001.128 2.25 4.5 4.5 0 008.4 2.245c0 .399-.078.78-.22 1.128z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12.75h.008v.008h-.008V12.75z"
              />
            </svg>
            <span className="text-sm font-medium">
              Admin management is restricted
            </span>
            <span className="text-sm text-muted-foreground">
              Only super administrators can manage other administrators.
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { admins, total, totalPages, editingAdmin, editingForm, saving, lastError } = state;

  const EmptyState = (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
        <svg
          className="size-10 text-muted-foreground/60"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.124-1.352 4.125 4.125 0 00-7.533-2.053M15 19.128v-.003c0-1.113-.285-2.16-.765-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.004-.106M15 19.128a9.38 9.38 0 002.625-.372 9.337 9.337 0 004.124 1.352 4.125 4.125 0 00-7.533 2.053M12 6.302a4.125 4.125 0 00-4.125 4.125 4.125 4.125 0 004.125 4.125M12 6.302v12.376m12.376-24.752a4.125 4.125 0 00-4.125 4.125 4.125 4.125 0 004.125 4.125M3.375 20.625a4.125 4.125 0 004.125 4.125 4.125 4.125 0 004.125-4.125V20.625z"
          />
        </svg>
        <span className="text-sm font-medium">No admins found</span>
        <span className="text-sm text-muted-foreground">
          Create an admin account to get started.
        </span>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Admins</h1>
        <p className="text-sm text-muted-foreground">
          Manage administrator accounts and their status.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <CardTitle className="font-heading">All admins</CardTitle>
            <CardDescription>
              {total} admin{total === 1 ? "" : "s"} total
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search admins…"
              value={currentSearch}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-48"
            />
            <select
              value={currentFilterStatus === "all" ? "" : currentFilterStatus}
              onChange={(e) => {
                const val = e.target.value;
                handleStatusFilter(val ? (val as AdminStatus) : "all");
              }}
              className="rounded-lg border-border bg-background px-2 text-sm"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>              {canManage && (
              <Dialog>
                <DialogTrigger render={<Button size="sm">Create admin</Button>} />
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-heading">Create admin</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateAdminForm
                    onSubmit={handleCreate}
                    saving={saving}
                    createError={state.createError}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {admins.length === 0 ? (
            EmptyState
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border/60 text-left">
                      <th className="px-4 py-2 text-sm font-medium">Name</th>
                      <th className="px-4 py-2 text-sm font-medium">Email</th>
                      <th className="px-4 py-2 text-sm font-medium">Status</th>
                      <th className="px-4 py-2 text-sm font-medium">Role</th>
                      <th className="px-4 py-2 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <AdminRow
                        key={admin.id}
                        admin={admin}
                        onEdit={() => openEditDialog(admin)}
                        canManage={canManage}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <PaginationControls
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {editingAdmin && canManage && (
        <Dialog open>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Edit admin</DialogTitle>
              <DialogDescription>
                Update the administrator&apos;s details.
              </DialogDescription>
            </DialogHeader>
            <EditAdminForm
              admin={editingAdmin}
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
}function CreateAdminForm({
  onSubmit,
  saving,
  createError,
}: {
  onSubmit: (values: CreateAdminInput) => void;
  saving: boolean;
  createError: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return;
    }
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createError && (
        <div className="rounded-lg border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {createError}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="createName">Name *</Label>
        <Input
          id="createName"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          required
          disabled={saving}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createEmail">Email *</Label>
        <Input
          id="createEmail"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          required
          disabled={saving}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createPassword">Password *</Label>
        <Input
          id="createPassword"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          required
          disabled={saving}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
          required
          disabled={saving}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => {}}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Creating…" : "Create admin"}
        </Button>
      </div>
    </form>
  );
}function EditAdminForm({
  admin,
  initialValues,
  onSave,
  onStatusChange,
  saving,
  lastError,
  onClose,
}: {
  admin: SafeUser;
  initialValues: UpdateAdminInput;
  onSave: (values: UpdateAdminInput) => void;
  onStatusChange: (id: string, status: AdminStatus) => void;
  saving: boolean;
  lastError: string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialValues.name ?? admin.name);
  const [email, setEmail] = useState(initialValues.email ?? admin.email);

  const hasChanges =
    name !== admin.name || email !== admin.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(name !== admin.name && { name: name.trim() }),
      ...(email !== admin.email && { email: email.trim() }),
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
          <Label htmlFor="editName">Name</Label>
          <Input
            id="editName"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            required
            disabled={saving}
            aria-invalid={lastError ? true : undefined}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="editEmail">Email</Label>
          <Input
            id="editEmail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
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
          {admin.status === "ACTIVE" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onStatusChange(admin.id, "INACTIVE")}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => onStatusChange(admin.id, "ACTIVE")}
            >
              Activate
            </Button>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Status changes are made through a dedicated endpoint.
        </p>
      </div>
    </div>
  );
}
