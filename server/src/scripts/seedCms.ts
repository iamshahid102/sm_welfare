/**
 * CMS content seed CLI — loads the live smwelfare.charity content into
 * MongoDB so the public API serves exactly what the live site publishes.
 *
 * Usage (from server/):
 *   npm run seed:cms
 *
 * Behaviour:
 *  - Idempotent upserts keyed by slug (programs/projects) and the fixed
 *    singleton key (site settings) — re-running re-syncs the seeded content
 *    after edits instead of duplicating it.
 *  - Everything is written as PUBLISHED, because the public endpoints only
 *    expose PUBLISHED documents (DRAFT is the schema default, so a plain
 *    insert would stay invisible).
 *  - Never deletes: documents not listed in seedData.ts are left untouched,
 *    so admin-created content survives a re-seed.
 *  - Each document is fully validated against its schema before the upsert,
 *    so a content typo fails loudly instead of writing a bad document.
 *  - Media is not seeded (Media documents require real Cloudinary assets and
 *    an uploading user) — upload images through the admin panel instead.
 *
 * Output policy: the MongoDB URI is never printed.
 */
import type { Types } from 'mongoose';
import {
  connectToDatabase,
  disconnectFromDatabase,
} from '../config/database.js';
import { APP_NAME } from '../constants/index.js';
import { SITE_SETTINGS_KEY } from '../constants/siteSettings.js';
import { ProgramModel } from '../models/program.model.js';
import { ProjectModel } from '../models/project.model.js';
import { SiteSettingsModel } from '../models/siteSettings.model.js';
import {
  SEED_PROGRAMS,
  SEED_PROJECTS,
  SEED_SITE_SETTINGS,
} from './seedData.js';

const EXIT_FAILURE = 1;
const PUBLISHED = 'PUBLISHED' as const;

interface UpsertCounts {
  created: number;
  reSynced: number;
}

function tally(result: { upsertedCount: number }, counts: UpsertCounts): void {
  if (result.upsertedCount > 0) {
    counts.created += 1;
  } else {
    counts.reSynced += 1;
  }
}

/** Upserts the 13 seed programs and returns their slug → id map. */
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

/** Upserts the 17 seed projects under their resolved parent programs. */
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
async function seedSiteSettings(): Promise<UpsertCounts> {
  const counts: UpsertCounts = { created: 0, reSynced: 0 };

  await new SiteSettingsModel({
    key: SITE_SETTINGS_KEY,
    ...SEED_SITE_SETTINGS,
  }).validate();

  const result = await SiteSettingsModel.updateOne(
    { key: SITE_SETTINGS_KEY },
    { $set: { key: SITE_SETTINGS_KEY, ...SEED_SITE_SETTINGS } },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  tally(result, counts);

  return counts;
}

async function main(): Promise<void> {
  console.log(`[${APP_NAME}] connecting to MongoDB...`);
  await connectToDatabase();
  console.log(`[${APP_NAME}] connected to MongoDB`);

  try {
    const { counts: programCounts, ids: programIds } = await seedPrograms();
    const projectCounts = await seedProjects(programIds);
    const settingsCounts = await seedSiteSettings();

    // Post-seed verification straight from the database.
    const [programTotal, publishedProjects, settingsReady] = await Promise.all([
      ProgramModel.countDocuments(),
      ProjectModel.countDocuments({ status: PUBLISHED }),
      SiteSettingsModel.findOne({ key: SITE_SETTINGS_KEY }).select('_id').lean(),
    ]);

    console.log(`[${APP_NAME}] CMS seed complete:`);
    console.log(
      `  programs:      ${programCounts.created} created, ${programCounts.reSynced} re-synced (${programTotal} total)`,
    );
    console.log(
      `  projects:      ${projectCounts.created} created, ${projectCounts.reSynced} re-synced (${publishedProjects} published)`,
    );
    console.log(
      `  site settings: ${settingsCounts.created ? 'created' : 're-synced'} (${settingsReady ? 'present' : 'MISSING'})`,
    );
    console.log(
      'Media is not seeded — upload images through the admin panel (Cloudinary).',
    );
  } finally {
    // Always release the connection, on success and on failure.
    await disconnectFromDatabase();
    console.log(`[${APP_NAME}] MongoDB connection closed`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${APP_NAME}] CMS seed failed: ${message}`);
  process.exitCode = EXIT_FAILURE;
});
