import type { RequestHandler } from 'express';
import {
  createProject as projectCreate,
  getProjectById,
  listProjects as projectList,
  setProjectStatus,
  updateProject as projectUpdate,
  validateListProjectsQuery,
} from '../services/project.service.js';
import type { ProjectResponse } from '../services/project.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Project controllers - thin HTTP adapters.
 * Every route requires the single admin session (requireAuth) in the route
 * definitions. Controllers only translate request data into service calls and
 * results into responses.
 */

function projectPayload(project: ProjectResponse): ApiSuccessResponse<{ project: ProjectResponse }> {
  return { success: true, data: { project } };
}

/** GET /api/v1/projects - list projects with pagination/search/status/programId. */
export const listProjects: RequestHandler = async (req, res) => {
  const query = validateListProjectsQuery({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    programId: req.query.programId,
  });
  const result = await projectList(query);
  res.status(200).json({ success: true, data: result });
};

/** GET /api/v1/projects/:id - get a single project. */
export const getProject: RequestHandler = async (req, res) => {
  const project = await getProjectById(req.params.id);
  res.status(200).json(projectPayload(project));
};

/** POST /api/v1/projects - create a project (starts as DRAFT). */
export const createProject: RequestHandler = async (req, res) => {
  const project = await projectCreate(req.body);
  res.status(201).json(projectPayload(project));
};

/** PATCH /api/v1/projects/:id - partial update (no status changes here). */
export const updateProject: RequestHandler = async (req, res) => {
  const project = await projectUpdate(req.params.id, req.body);
  res.status(200).json(projectPayload(project));
};

/** PATCH /api/v1/projects/:id/status - publish/archive/draft a project. */
export const updateProjectStatus: RequestHandler = async (req, res) => {
  const project = await setProjectStatus(req.params.id, req.body?.status);
  res.status(200).json(projectPayload(project));
};
