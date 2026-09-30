import type { RequestHandler } from 'express';
import { getPublicPageBySlug } from '../../services/public/publicPage.service.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * GET /api/v1/public/pages/:slug
 *
 * Unauthenticated. Resolves a slug to its program or project detail payload.
 * Unknown (or unpublished) slugs return 404 so the client can render its
 * not-found page.
 */
export const getPublicPageBySlugHandler: RequestHandler = async (req, res, next) => {
  try {
    const slug = typeof req.params.slug === 'string' ? req.params.slug : '';
    const result = await getPublicPageBySlug(slug);
    if (!result) {
      throw ApiError.notFound('Page not found.');
    }
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
