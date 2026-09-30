import {
  getPublicProgramBySlug,
  type PublicProgram,
} from './publicProgram.service.js';
import {
  getPublicProjectBySlug,
  type PublicProject,
} from './publicProject.service.js';

/**
 * Public page resolver.
 *
 * The public site renders program and project detail pages from a single
 * dynamic route, so the client needs one lookup that answers "what does this
 * slug resolve to?". Programs win over projects: a slug that exists as both
 * (the live site reuses several slugs) resolves to the parent program page.
 */

export interface PublicPageResult {
  kind: 'program' | 'project';
  program: PublicProgram | null;
  project: PublicProject | null;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Resolves a public slug to a program or a project, or null when unknown. */
export async function getPublicPageBySlug(slug: string): Promise<PublicPageResult | null> {
  if (typeof slug !== 'string' || slug.length === 0 || slug.length > 200 || !SLUG_PATTERN.test(slug)) {
    return null;
  }

  const program = await getPublicProgramBySlug(slug);
  if (program) {
    return { kind: 'program', program, project: null };
  }

  const project = await getPublicProjectBySlug(slug);
  if (project) {
    return { kind: 'project', program: null, project };
  }

  return null;
}
