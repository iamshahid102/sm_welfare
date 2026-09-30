import { api } from "@/lib/api/client";
import type { Program, ProgramListResponse, ProgramStatus } from "@/types/api";
import type { ContentFieldsInput } from "@/types/content";

export type {
  Program,
  ProgramStatus,
  ProgramListResponse,
} from "@/types/api";

export interface ListProgramsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProgramStatus;
}

// NOTE: slugs are never part of the admin payload. The API derives the slug
// from the title and keeps it unique (slug, slug-2, slug-3 ...), so the editor
// never has to think about URLs.
export interface CreateProgramInput extends ContentFieldsInput {
  title: string;
  shortDescription: string;
  description: string;
  displayOrder?: number;
}

export interface UpdateProgramInput extends ContentFieldsInput {
  title?: string;
  shortDescription?: string;
  description?: string;
  displayOrder?: number;
}

// ─── List programs ──────────────────────────────────────────────────────

// ─── List programs ──────────────────────────────────────────────────────

export async function listPrograms(query: ListProgramsQuery = {}): Promise<ProgramListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.search !== undefined) params.set("search", query.search);
  if (query.status !== undefined) params.set("status", query.status);
  const qs = params.toString();
  const data = await api.get<ProgramListResponse>(`/programs${qs ? `?${qs}` : ""}`);
  return data;
}

// ─── Get program ────────────────────────────────────────────────────────

export async function getProgram(id: string): Promise<Program> {
  const data = await api.get<{ program: Program }>(`/programs/${id}`);
  return data.program;
}

// ─── Create program ─────────────────────────────────────────────────────

export async function createProgram(input: CreateProgramInput): Promise<Program> {
  const data = await api.post<{ program: Program }>("/programs", input);
  return data.program;
}

// ─── Update program ─────────────────────────────────────────────────────

export async function updateProgram(id: string, input: UpdateProgramInput): Promise<Program> {
  const data = await api.patch<{ program: Program }>(`/programs/${id}`, input);
  return data.program;
}

// ─── Update program status ──────────────────────────────────────────────

export async function updateProgramStatus(id: string, status: ProgramStatus): Promise<Program> {
  const data = await api.patch<{ program: Program }>(`/programs/${id}/status`, { status });
  return data.program;
}
