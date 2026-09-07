import { api } from "@/lib/api/client";
import type {
  AdminListResponse,
  SafeUser,
} from "@/types/api";

export type {
  SafeUser,
  AdminListResponse,
} from "@/types/api";

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface ListAdminsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface UpdateAdminInput {
  name?: string;
  email?: string;
}

export type AdminStatus = "ACTIVE" | "INACTIVE";


// ─── Create admin ────────────────────────────────────────────────────────

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export async function createAdmin(input: CreateAdminInput): Promise<SafeUser> {
  const data = await api.post<{ user: SafeUser }>("/admins", input);
  return data.user;
}

// ─── List admins ─────────────────────────────────────────────────────────

export interface ListAdminsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export async function listAdmins(query: ListAdminsQuery = {}): Promise<AdminListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.search !== undefined) params.set("search", query.search);
  if (query.status !== undefined) params.set("status", query.status);
  const qs = params.toString();
  const data = await api.get<AdminListResponse>(`/admins${qs ? `?${qs}` : ""}`);
  return data;
}

// ─── Get admin ───────────────────────────────────────────────────────────

export async function getAdmin(id: string): Promise<SafeUser> {
  const data = await api.get<{ user: SafeUser }>(`/admins/${id}`);
  return data.user;
}

// ─── Update admin ────────────────────────────────────────────────────────

export interface UpdateAdminInput {
  name?: string;
  email?: string;
}

export async function updateAdmin(id: string, input: UpdateAdminInput): Promise<SafeUser> {
  const data = await api.patch<{ user: SafeUser }>(`/admins/${id}`, input);
  return data.user;
}

// ─── Update admin status ─────────────────────────────────────────────────
export async function updateAdminStatus(id: string, status: AdminStatus): Promise<SafeUser> {
  const data = await api.patch<{ user: SafeUser }>(`/admins/${id}/status`, { status });
  return data.user;
}
