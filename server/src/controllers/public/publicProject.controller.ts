import type { RequestHandler } from 'express';
import { listPublicProjects, validateListPublicProjectsQuery } from '../../services/public/publicProject.service.js';

/** GET /api/v1/public/projects - unauthenticated list of public projects. */
export const listPublicProjectsHandler: RequestHandler = async (req, res, next) => {
  try {
    const query = validateListPublicProjectsQuery(req.query);
    const result = await listPublicProjects(query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
