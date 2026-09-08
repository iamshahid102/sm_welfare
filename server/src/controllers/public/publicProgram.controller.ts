import type { RequestHandler } from 'express';
import { listPublicPrograms, validateListPublicProgramsQuery } from '../../services/public/publicProgram.service.js';

/** GET /api/v1/public/programs - unauthenticated list of public programs. */
export const listPublicProgramsHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = validateListPublicProgramsQuery(req.query);
    const result = await listPublicPrograms(query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
