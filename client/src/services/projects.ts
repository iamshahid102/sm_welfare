import { api } from "@/lib/api/client";
import type { Project, ProjectListResponse, ProjectStatus, Program, ProgramListResponse } from "@/types/api";

export type {
  Project,
  ProjectStatus,
  ProjectListResponse,
  Program,
  ProgramListResponse,
} from "@/types/api";

export interface ListProjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
  programId?: string;
}

export async function listProjects(query: ListProjectsQuery = {}): Promise<ProjectListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.search !== undefined) params.set("search", query.search);
  if (query.status !== undefined) params.set("status", query.status);
  if (query.programId !== undefined) params.set("programId", query.programId);
  const qs = params.toString();
  const data = await api.get<ProjectListResponse>(`/projects${qs ? `?${qs}` : ""}`);
  return data;
}

// ─── Get project ────────────────────────────────────────────────────────

export async function getProject(id: string): Promise<Project> {
  const data = await api.get<{ project: Project }>(`/projects/${id}`);
  return data.project;
}

// ─── Create project ─────────────────────────────────────────────────────

export interface CreateProjectInput {
  programId: string;
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  displayOrder?: number;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const data = await api.post<{ project: Project }>("/projects", input);
  return data.project;
}

// ─── Update project ─────────────────────────────────────────────────────

export interface UpdateProjectInput {
  programId?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  displayOrder?: number;
}

export async function updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
  const data = await api.patch<{ project: Project }>(`/projects/${id}`, input);
  return data.project;
}

// ─── Update project status ──────────────────────────────────────────────

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  const data = await api.patch<{ project: Project }>(`/projects/${id}/status`, { status });
  return data.project;
}

// ─── List programs (for program selector) ───────────────────────────────

export async function listProgramsForSelector(query: ListProjectsQuery = {}): Promise<ProgramListResponse> {
  const params = new URLSearchParams();
  if (query.page !== undefined) params.set("page", query.page.toString());
  if (query.limit !== undefined) params.set("limit", query.limit.toString());
  if (query.search !== undefined) params.set("search", query.search);
  const qs = params.toString();
  const data = await api.get<ProgramListResponse>(`/programs${qs ? `?${qs}` : ""}`);
  return data;
}
