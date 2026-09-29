/**
 * CMS content seed CLI - thin wrapper around the shared seed service.
 *
 * Usage (from server/):
 *   npm run seed:cms
 *
 * Loads the real smwelfare.charity content (13 programs, 17 projects and the
 * site-settings singleton) into MongoDB so the public API serves exactly what
 * the live site publishes. The same routine is available as a one-click action
 * from the admin dashboard: POST /api/v1/seed.
 *
 * Output policy: the MongoDB URI is never printed.
 */
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { APP_NAME } from '../constants/index.js';
import { seedCmsContent } from '../services/seed.service.js';

const EXIT_FAILURE = 1;

async function main(): Promise<void> {
  console.log(`[${APP_NAME}] connecting to MongoDB...`);
  await connectToDatabase();
  console.log(`[${APP_NAME}] connected to MongoDB`);

  try {
    const result = await seedCmsContent();

    console.log(`[${APP_NAME}] CMS seed complete:`);
    console.log(
      `  programs:      ${result.programs.created} created, ${result.programs.reSynced} re-synced (${result.programs.total} total)`,
    );
    console.log(
      `  projects:      ${result.projects.created} created, ${result.projects.reSynced} re-synced (${result.projects.published} published)`,
    );
    console.log(
      `  site settings: ${result.siteSettings.created ? 'created' : 're-synced'}`,
    );
    console.log(
      'Media is not seeded - upload images through the admin panel (Cloudinary).',
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
