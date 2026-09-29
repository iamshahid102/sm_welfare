import type { Types } from 'mongoose';
import { SITE_SETTINGS_KEY } from '../constants/siteSettings.js';
import { ProgramModel } from '../models/program.model.js';
import { ProjectModel } from '../models/project.model.js';
import { SiteSettingsModel } from '../models/siteSettings.model.js';
import {
  SEED_PROGRAMS,
  SEED_PROJECTS,
  SEED_SITE_SETTINGS,
} from '../scripts/seedData.js';

/**
 * CMS content seed service.
 *
 * Loads the real smwelfare.charity content (the same structured content the
 * public site is built from) into MongoDB so the public API serves it and the
 * admin can edit it from the dashboard. Exposed two ways:
 *   - POST /api/v1/seed  (one click from the admin dashboard)
 *   - npm run seed:cms   (the server-side CLI)
 *
 * Behaviour:
 *  - Idempotent upserts keyed by slug (programs/projects) and the fixed
 *    singleton key (site settings) - re-running re-syncs the seeded content
 *    after edits instead of duplicating it.
 *  - Everything is written as PUBLISHED, because the public endpoints only
 *    expose PUBLISHED documents (DRAFT is the schema default, so a plain
 *    insert would stay invisible).
 *  - Never deletes: documents not listed in seedData.ts are left untouched,
 *    so admin-created content survives a re-seed.
 *  - Each document is fully validated against its schema before the upsert,
 *    so a content typo fails loudly instead of writing a bad document.
 *  - Media is not seeded (Media documents require real Cloudinary assets and
 *    an uploading user) - upload images through the admin panel instead.
 */

const PUBLISHED = 'PUBLISHED' as const;

export interface UpsertCounts {
  created: number;
  reSynced: number;
}

export interface SeedResult {
  programs: UpsertCounts & { total: number };
  projects: UpsertCounts & { published: number };
  siteSettings: { created: boolean };
  mediaSeeded: false;
}

function tally(result: { upsertedCount: number }, counts: UpsertCounts): void {
  if (result.upsertedCount > 0) {
    counts.created += 1;
  } else {
    counts.reSynced += 1;
  }
}

/** Upserts every seed program and returns their slug → id map. */
async function seedPrograms(): Promise<{
  counts: UpsertCounts;
  ids: Map<string, Types.ObjectId>;
}> {
  const counts: UpsertCounts = { created: 0, reSynced: 0 };
  const ids = new Map<string, Types.ObjectId>();

  for (const seed of SEED_PROGRAMS) {
    // Full-document validation first: schema validators do not run for every
    // update operator, so validate the exact document the upsert would write.
    await new ProgramModel({ ...seed, status: PUBLISHED }).validate();

    const result = await ProgramModel.updateOne(
      { slug: seed.slug },
      { $set: { ...seed, status: PUBLISHED } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    tally(result, counts);

    const program = await ProgramModel.findOne({ slug: seed.slug })
      .select('_id')
      .lean();
    if (!program) {
      throw new Error(`Program "${seed.slug}" not found right after upsert.`);
    }
    ids.set(seed.slug, program._id);
  }

  return { counts, ids };
}

/** Upserts every seed project under its resolved parent program. */
async function seedProjects(
  programIds: Map<string, Types.ObjectId>,
): Promise<UpsertCounts> {
  const counts: UpsertCounts = { created: 0, reSynced: 0 };

  for (const seed of SEED_PROJECTS) {
    const programId = programIds.get(seed.programSlug);
    if (!programId) {
      throw new Error(
        `Project "${seed.slug}" references unknown program "${seed.programSlug}".`,
      );
    }

    const fields = {
      title: seed.title,
      slug: seed.slug,
      shortDescription: seed.shortDescription,
      description: seed.description,
      displayOrder: seed.displayOrder,
    };
    await new ProjectModel({ ...fields, programId, status: PUBLISHED }).validate();

    // Matched by slug alone (all seed slugs are distinct): an existing
    // document is re-pointed at the right program instead of inserting a
    // duplicate slug under a second parent.
    const result = await ProjectModel.updateOne(
      { slug: seed.slug },
      { $set: { ...fields, programId, status: PUBLISHED } },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    tally(result, counts);
  }

  return counts;
}

/** Upserts the site-settings singleton document. */
async function seedSiteSettings(): Promise<{ created: boolean }> {
  await new SiteSettingsModel({
    key: SITE_SETTINGS_KEY,
    ...SEED_SITE_SETTINGS,
  }).validate();

  const result = await SiteSettingsModel.updateOne(
    { key: SITE_SETTINGS_KEY },
    { $set: { key: SITE_SETTINGS_KEY, ...SEED_SITE_SETTINGS } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  return { created: result.upsertedCount > 0 };
}

/**
 * Seeds programs, projects and the site-settings singleton, then verifies the
 * result straight from the database. Safe to run any number of times.
 */
export async function seedCmsContent(): Promise<SeedResult> {
  const { counts: programCounts, ids: programIds } = await seedPrograms();
  const projectCounts = await seedProjects(programIds);
  const siteSettings = await seedSiteSettings();

  const [programTotal, publishedProjects] = await Promise.all([
    ProgramModel.countDocuments(),
    ProjectModel.countDocuments({ status: PUBLISHED }),
  ]);

  return {
    programs: { ...programCounts, total: programTotal },
    projects: { ...projectCounts, published: publishedProjects },
    siteSettings,
    mediaSeeded: false,
  };
}
