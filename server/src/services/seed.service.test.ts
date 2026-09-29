import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
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
 * Offline seed-content tests.
 *
 * The one-click seed is only as safe as the content it writes, and a content
 * typo would otherwise surface as a mid-seed write failure. These tests build
 * the exact documents the seed would persist and run the real Mongoose
 * validators over them (in memory - no MongoDB), plus the structural rules the
 * seed relies on: unique slugs and resolvable parent-program references.
 */

describe('CMS seed content', () => {
  it('every seed program passes the Program schema validators', async () => {
    for (const seed of SEED_PROGRAMS) {
      await new ProgramModel({ ...seed, status: 'PUBLISHED' }).validate();
    }
    assert.ok(SEED_PROGRAMS.length > 0, 'there must be seed programs');
  });

  it('uses unique program slugs', () => {
    const slugs = SEED_PROGRAMS.map((program) => program.slug);
    assert.equal(new Set(slugs).size, slugs.length, 'program slugs must be unique');
  });

  it('every seed project passes the Project schema validators', async () => {
    const firstProgram = SEED_PROGRAMS[0];
    assert.ok(firstProgram, 'a program is needed to validate projects');
    const resolvedId = new ProgramModel({ ...firstProgram, status: 'PUBLISHED' })._id;

    for (const seed of SEED_PROJECTS) {
      const { programSlug: _programSlug, ...fields } = seed;
      await new ProjectModel({ ...fields, programId: resolvedId, status: 'PUBLISHED' }).validate();
    }
    assert.ok(SEED_PROJECTS.length > 0, 'there must be seed projects');
  });

  it('every seed project references a program that exists in the seed', () => {
    const programSlugs = new Set(SEED_PROGRAMS.map((program) => program.slug));
    for (const project of SEED_PROJECTS) {
      assert.ok(
        programSlugs.has(project.programSlug),
        `project "${project.slug}" references unknown program "${project.programSlug}"`,
      );
    }
  });

  it('uses unique project slugs (the seed upserts projects by slug)', () => {
    const slugs = SEED_PROJECTS.map((project) => project.slug);
    assert.equal(new Set(slugs).size, slugs.length, 'project slugs must be unique');
  });

  it('the site-settings seed passes the SiteSettings schema validators', async () => {
    await new SiteSettingsModel({
      key: SITE_SETTINGS_KEY,
      ...SEED_SITE_SETTINGS,
    }).validate();
  });

  it('ships the real organization content (not placeholders)', () => {
    assert.equal(SEED_SITE_SETTINGS.organizationName, 'SM Welfare Trust');
    assert.ok(SEED_SITE_SETTINGS.contact.email.includes('@'));
    assert.ok(SEED_SITE_SETTINGS.socialLinks.facebook.startsWith('https://'));
    assert.equal(SEED_PROGRAMS.length, 13, 'the live navbar lists 13 programmes');
    assert.equal(SEED_PROJECTS.length, 17, 'the live site has 17 project pages');
  });
});
