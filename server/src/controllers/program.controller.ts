import type { RequestHandler } from 'express';
import {
  createProgram as programCreate,
  getProgramById,
  listPrograms as programList,
  setProgramStatus,
  updateProgram as programUpdate,
  validateListProgramsQuery,
} from '../services/program.service.js';
import type { ProgramResponse } from '../services/program.service.js';
import type { ApiSuccessResponse } from '../types/index.js';

/**
 * Program controllers - thin HTTP adapters.
 * Reads require authentication (requireAuth); mutations additionally require
 * requireRole('SUPER_ADMIN') in the route definitions. Controllers only
 * translate request data into service calls and results into responses.
 */

function programPayload(program: ProgramResponse): ApiSuccessResponse<{ program: ProgramResponse }> {
  return { success: true, data: { program } };
}

/** GET /api/v1/programs - list programs with pagination/search/status. */
export const listPrograms: RequestHandler = async (req, res) => {
  const query = validateListProgramsQuery({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
  });
  const result = await programList(query);
  res.status(200).json({ success: true, data: result });
};

/** GET /api/v1/programs/:id - get a single program. */
export const getProgram: RequestHandler = async (req, res) => {
  const program = await getProgramById(req.params.id);
  res.status(200).json(programPayload(program));
};

/** POST /api/v1/programs - create a program (starts as DRAFT). */
export const createProgram: RequestHandler = async (req, res) => {
  const program = await programCreate(req.body);
  res.status(201).json(programPayload(program));
};

/** PATCH /api/v1/programs/:id - partial update (no status changes here). */
export const updateProgram: RequestHandler = async (req, res) => {
  const program = await programUpdate(req.params.id, req.body);
  res.status(200).json(programPayload(program));
};

/** PATCH /api/v1/programs/:id/status - activate/publish/archive a program. */
export const updateProgramStatus: RequestHandler = async (req, res) => {
  const program = await setProgramStatus(req.params.id, req.body?.status);
  res.status(200).json(programPayload(program));
};
