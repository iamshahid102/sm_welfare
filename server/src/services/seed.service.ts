import { Types } from 'mongoose';
import { cloudinaryConfigured } from '../config/cloudinary.js';
import { SITE_SETTINGS_KEY } from '../constants/siteSettings.js';
import { MediaModel } from '../models/media.model.js';
import { ProgramModel } from '../models/program.model.js';
import { ProjectModel } from '../models/project.model.js';
import { SiteSettingsModel } from '../models/siteSettings.model.js';
import { UserModel } from '../models/user.model.js';
import {
  SEED_PROGRAMS,
  SEED_PROJECTS,
  SEED_SITE_SETTINGS,
  type SeedProject,
} from '../scripts/seedData.js';
import {
  PAGE_CONTENT,
  type SeedImageRef,
  type SeedPageContent,
} from '../scripts/seedContent.js';
import {
  destroyAllMediaAssets,
  listLocalImageFiles,
  uploadImagesToCloudinary,
} from './seedMedia.service.js';
import type {
  ContentCta,
  ContentFact,
  ContentHighlight,
  ContentImage,
  ContentSection,
} from '../types/content.js';

/**
 * CMS content seed service.
 *
 * Loads the real smwelfare.charity content — 13 programs, 17 projects, the
 * site-settings singleton and the curated Cloudinary media — into MongoDB so
 * the public API is the single source of truth and the admin can edit every
 * word and image from the dashboard. Exposed two ways:
 *   - POST /api/v1/seed  (one click from the admin dashboard)
 *   - npm run seed:cms   (the server-side CLI)
 *
 * Behaviour:
 *  - Idempotent upserts keyed by slug (programs/projects) and the fixed
 *    singleton key (site settings) — re-running re-syncs the seeded content
 *    after edits instead of duplicating it.
 *  - With `reset: true` every existing program, project, media record and the
 *    site-settings singleton is removed first (their Cloudinary assets
 *    destroyed too). User accounts are NEVER touched — the admin login always
 *    survives a reset.
 *  - With `uploadMedia: true` the curated images in client/public/images are
 *    uploaded to Cloudinary and attached to the matching documents. When
 *    Cloudinary is not configured the seed falls back to the root-relative
 *    `/images/<file>` path, so the site still renders real photos.
 *  - Everything is written as PUBLISHED, because the public endpoints only
 *    expose PUBLISHED documents.
 *  - Each document is fully validated against its schema before the upsert,
 *    so a content typo fails loudly instead of writing a bad document.
 */

const PUBLISHED = 'PUBLISHED' as const;

export interface UpsertCounts {
  created: number;
  reSynced: number;
}

export interface SeedOptions {
  /** Delete all existing CMS content first (users are always preserved). */
  reset?: boolean;
  /** Upload the curated local images to Cloudinary and attach them. */
  uploadMedia?: boolean;
}

export interface SeedResult {
  reset: boolean;
  programs: UpsertCounts & { total: number };
  projects: UpsertCounts & { published: number };
  siteSettings: { created: boolean };
  media: {
    /** False when Cloudinary is not configured (local fallback used). */
    cloudinary: boolean;
    /** Assets destroyed during a reset. */
    destroyed: number;
    /** Assets uploaded/attached in this run. */
    attached: number;
    /** Images found in the curated folder. */
    available: number;
  };
}

/**
 * Projects whose slug differs from the page they render fall back to their
 * parent program's content key (the live site reuses one page for both).
 */
const PROJECT_PAGE_ALIASES: Record<string, string> = {
  'sasta-khana': 'sasta-khana-project',
  'free-schooling': 'free-schooling-system',
  'health-care': 'health-care-services',
  'hunarmand-beti': 'hunarmand-beti-project',
  'tree-for-tomorrow': 'tree-for-tomorrow-plantation-compaign',
};

function tally(result: { upsertedCount: number }, counts: UpsertCounts): void {
  if (result.upsertedCount > 0) {
    counts.created += 1;
  } else {
    counts.reSynced += 1;
  }
}

/** Resolves a seed image reference to a stored image (Cloudinary or local). */
function materializeImage(
  ref: SeedImageRef,
  images: Map<string, ContentImage>,
): ContentImage {
  const uploaded = images.get(ref.file);
  if (uploaded) {
    return { ...uploaded, alt: ref.alt };
  }
  // Cloudinary unavailable — point at the curated local file so the public
  // page still shows a real photo instead of a placeholder.
  return { url: `/images/${ref.file}`, alt: ref.alt };
}

interface MaterializedContent {
  tagline: string;
  coverImage: ContentImage;
  gallery: ContentImage[];
  sections: ContentSection[];
  highlights: ContentHighlight[];
  facts: ContentFact[];
  cta: ContentCta;
}

/** Turns a seed page definition into the stored rich-content document shape. */
function buildContent(pageKey: string, images: Map<string, ContentImage>): MaterializedContent {
  const content: SeedPageContent | undefined = PAGE_CONTENT[pageKey];
  if (!content) {
    throw new Error(`No seed page content found for "${pageKey}".`);
  }
  return {
    tagline: content.tagline,
    coverImage: materializeImage(content.cover, images),
    gallery: [],
    sections: content.sections.map((section): ContentSection => {
      const next: ContentSection = {};
      if (section.kicker !== undefined) next.kicker = section.kicker;
      if (section.title !== undefined) next.title = section.title;
      if (section.body !== undefined) next.body = section.body;
      if (section.imageSide !== undefined) next.imageSide = section.imageSide;
      if (section.image !== undefined) next.image = materializeImage(section.image, images);
      return next;
    }),
    highlights: content.highlights,
    facts: content.facts,
    cta: content.cta,
  };
}

/** Upserts every seed program and returns their slug → id map. */
async function seedPrograms(
  images: Map<string, ContentImage>,
): Promise<{ counts: UpsertCounts; ids: Map<string, Types.ObjectId> }> {
  const counts: UpsertCounts = { created: 0, reSynced: 0 };
  const ids = new Map<string, Types.ObjectId>();

  for (const seed of SEED_PROGRAMS) {
    const content = buildContent(seed.page ?? seed.slug, images);
    const fields = {
      title: seed.title,
      slug: seed.slug,
      shortDescription: seed.shortDescription,
      description: seed.description,
      displayOrder: seed.displayOrder,
      status: PUBLISHED,
      ...content,
    };

    // Full-document validation first: schema validators do not run for every
    // update operator, so validate the exact document the upsert would write.
    await new ProgramModel(fields).validate();

    const result = await ProgramModel.updateOne(
      { slug: seed.slug },
      { $set: fields },
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

/** Resolves the page content key for a project. */
function projectPageKey(seed: SeedProject): string {
  return seed.page ?? PROJECT_PAGE_ALIASES[seed.slug] ?? seed.slug;
}

/** Upserts every seed project under its resolved parent program. */
async function seedProjects(
  programIds: Map<string, Types.ObjectId>,
  images: Map<string, ContentImage>,
): Promise<UpsertCounts> {
  const counts: UpsertCounts = { created: 0, reSynced: 0 };

  for (const seed of SEED_PROJECTS) {
    const programId = programIds.get(seed.programSlug);
    if (!programId) {
      throw new Error(
        `Project "${seed.slug}" references unknown program "${seed.programSlug}".`,
      );
    }

    const content = buildContent(projectPageKey(seed), images);
    const fields = {
      title: seed.title,
      slug: seed.slug,
      shortDescription: seed.shortDescription,
      description: seed.description,
      displayOrder: seed.displayOrder,
      status: PUBLISHED,
      programId,
      ...content,
    };
    await new ProjectModel(fields).validate();

    // Matched by slug alone (all seed slugs are distinct): an existing
    // document is re-pointed at the right program instead of inserting a
    // duplicate slug under a second parent.
    const result = await ProjectModel.updateOne(
      { slug: seed.slug },
      { $set: fields },
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

/** Removes every CMS document, leaving user accounts untouched. */
async function resetContent(options: SeedOptions): Promise<number> {
  const destroyed = options.uploadMedia ? await destroyAllMediaAssets() : 0;
  await Promise.all([
    ProgramModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    MediaModel.deleteMany({}),
    SiteSettingsModel.deleteMany({}),
  ]);
  return destroyed;
}

/**
 * Seeds programs, projects, media and the site-settings singleton, then
 * verifies the result straight from the database. Safe to run any number of
 * times; pass `reset` to start from a clean slate (users are preserved).
 */
export async function seedCmsContent(options: SeedOptions = {}): Promise<SeedResult> {
  const destroyed = options.reset ? await resetContent(options) : 0;

  const files = options.uploadMedia ? await listLocalImageFiles() : [];
  let images = new Map<string, ContentImage>();

  if (options.uploadMedia && cloudinaryConfigured && files.length > 0) {
    const admin = await UserModel.findOne().sort({ createdAt: 1 }).select('_id').lean();
    if (!admin) {
      throw new Error(
        'No admin account found. Run `npm run provision:admin` before seeding media.',
      );
    }
    images = await uploadImagesToCloudinary(files, admin._id);
  }

  const { counts: programCounts, ids: programIds } = await seedPrograms(images);
  const projectCounts = await seedProjects(programIds, images);
  const siteSettings = await seedSiteSettings();

  const [programTotal, publishedProjects] = await Promise.all([
    ProgramModel.countDocuments(),
    ProjectModel.countDocuments({ status: PUBLISHED }),
  ]);

  return {
    reset: options.reset === true,
    programs: { ...programCounts, total: programTotal },
    projects: { ...projectCounts, published: publishedProjects },
    siteSettings,
    media: {
      cloudinary: cloudinaryConfigured,
      destroyed,
      attached: images.size,
      available: files.length,
    },
  };
}
