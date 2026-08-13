import assert from 'node:assert/strict';
import dns from 'node:dns';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { after, before, describe, it } from 'node:test';
import { Types } from 'mongoose';
import { app } from '../../app.js';
import { connectToDatabase, disconnectFromDatabase } from '../../config/database.js';
import { ProgramModel } from '../../models/program.model.js';
import { ProjectModel } from '../../models/project.model.js';
import { RefreshSessionModel } from '../../models/refreshSession.model.js';
import { UserModel } from '../../models/user.model.js';
import { hashPassword } from '../../utils/password.js';

// Test-only DNS bootstrap: Node v24.15.0 (c-ares 1.34.6) cannot read DHCP-assigned
// DNS servers on this machine and falls back to 127.0.0.1 (nodejs/node#62347),
// which breaks the mongodb+srv:// SRV lookup. Pin working resolvers for tests
// only - application code is intentionally untouched.
dns.setServers(['192.168.80.1', '8.8.8.8']);

const hasMongodb = Boolean(process.env.MONGODB_URI);
const describeDb = hasMongodb ? describe : describe.skip;

const TEST_PASSWORD = 'Correct-Horse-Battery-Staple-9!';

interface ProgramShape {
  id: string;
  slug: string;
  status: string;
}

interface ProjectShape {
  id: string;
  programId: string;
  program: { id: string; title: string; slug: string; status: string } | null;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: string;
  displayOrder: number;
}

interface ListData {
  items: ProjectShape[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResult {
  status: number;
  body: unknown;
}

function asProject(body: unknown): ProjectShape {
  return (body as { data: { project: ProjectShape } }).data.project;
}

function asList(body: unknown): ListData {
  return (body as { data: ListData }).data;
}

function asError(body: unknown): { statusCode: number; message: string } {
  return (body as { error: { statusCode: number; message: string } }).error;
}

describeDb('Projects API (MongoDB-backed)', () => {
  let server: Server;
  let baseUrl = '';
  let superCookies = '';
  let adminCookies = '';
  const trackedProjectIds: string[] = [];
  const trackedProgramIds: string[] = [];
  const trackedUserIds: string[] = [];

  /** Unique per-run token so parallel suite runs never collide. */
  function uniqueToken(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function validProjectBody(
    programId: string,
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> {
    const token = uniqueToken('project');
    return {
      programId,
      title: `Project ${token}`,
      slug: `project-${token}`,
      shortDescription: 'A short description of the welfare project.',
      description: 'A longer description of the project and its goals.',
      displayOrder: 0,
      ...overrides,
    };
  }

  /** Creates a Program document directly (program CRUD is covered by its own
   * suite); tracked for cleanup. */
  async function createProgramFixture(
    overrides: Record<string, unknown> = {},
  ): Promise<ProgramShape> {
    const token = uniqueToken('prog');
    const program = await ProgramModel.create({
      title: `Program ${token}`,
      slug: `program-${token}`,
      shortDescription: 'A program fixture.',
      description: 'A longer program fixture description.',
      ...overrides,
    });
    trackedProgramIds.push(program.id);
    return { id: program.id, slug: program.slug, status: program.status };
  }

  /** Creates a project through the real API as SUPER_ADMIN; tracks the id. */
  async function createProjectViaApi(
    programId: string,
    overrides: Record<string, unknown> = {},
  ): Promise<ProjectShape> {
    const result = await request(
      '/api/v1/projects',
      { method: 'POST', body: JSON.stringify(validProjectBody(programId, overrides)) },
      superCookies,
    );
    assert.equal(result.status, 201, `create project expected 201, got ${result.status}`);
    const project = asProject(result.body);
    trackedProjectIds.push(project.id);
    return project;
  }

  async function createUser(role: 'SUPER_ADMIN' | 'ADMIN'): Promise<string> {
    const email = `${uniqueToken(`project-${role.toLowerCase()}`)}@example.test`;
    const user = await UserModel.create({
      name: `Project Test ${role}`,
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      role,
      status: 'ACTIVE',
    });
    trackedUserIds.push(user.id);
    return email;
  }

  async function loginCookies(email: string): Promise<string> {
    const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    assert.equal(res.status, 200, 'login must succeed for an ACTIVE test user');
    return res.headers
      .getSetCookie()
      .map((cookie) => cookie.split(';')[0])
      .join('; ');
  }

  async function request(
    path: string,
    init: RequestInit = {},
    cookieHeader?: string,
  ): Promise<ApiResult> {
    const headers = new Headers(init.headers);
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
    if (init.body !== undefined) {
      headers.set('Content-Type', 'application/json');
    }
    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  }

  before(async () => {
    await connectToDatabase();
    await UserModel.init();
    await RefreshSessionModel.init();
    // Build the compound unique index before the duplicate-slug tests run.
    await ProjectModel.init();

    server = createServer(app);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (address && typeof address === 'object') {
      baseUrl = `http://127.0.0.1:${address.port}`;
    }

    const superEmail = await createUser('SUPER_ADMIN');
    superCookies = await loginCookies(superEmail);
    const adminEmail = await createUser('ADMIN');
    adminCookies = await loginCookies(adminEmail);
  });

  after(async () => {
    // Projects reference programs, so clean projects first, then programs.
    if (trackedProjectIds.length > 0) {
      await ProjectModel.deleteMany({ _id: { $in: trackedProjectIds } });
    }
    const remainingProjects = await ProjectModel.countDocuments({
      _id: { $in: trackedProjectIds },
    });
    assert.equal(remainingProjects, 0, 'all test projects must be cleaned up');

    if (trackedProgramIds.length > 0) {
      await ProgramModel.deleteMany({ _id: { $in: trackedProgramIds } });
    }
    const remainingPrograms = await ProgramModel.countDocuments({
      _id: { $in: trackedProgramIds },
    });
    assert.equal(remainingPrograms, 0, 'all test programs must be cleaned up');

    if (trackedUserIds.length > 0) {
      await RefreshSessionModel.deleteMany({ userId: { $in: trackedUserIds } });
      await UserModel.deleteMany({ _id: { $in: trackedUserIds } });
    }
    const remainingUsers = await UserModel.countDocuments({ _id: { $in: trackedUserIds } });
    const remainingSessions = await RefreshSessionModel.countDocuments({
      userId: { $in: trackedUserIds },
    });
    assert.equal(remainingUsers, 0, 'all test users must be cleaned up');
    assert.equal(remainingSessions, 0, 'all test refresh sessions must be cleaned up');

    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectFromDatabase();
  });

  it('rejects an anonymous create with 401', async () => {
    const program = await createProgramFixture();
    const result = await request('/api/v1/projects', {
      method: 'POST',
      body: JSON.stringify(validProjectBody(program.id)),
    });
    assert.equal(result.status, 401);
  });

  it('rejects an ADMIN create with 403', async () => {
    const program = await createProgramFixture();
    const result = await request(
      '/api/v1/projects',
      { method: 'POST', body: JSON.stringify(validProjectBody(program.id)) },
      adminCookies,
    );
    assert.equal(result.status, 403);
    assert.equal(asError(result.body).message, 'Insufficient permissions.');
  });

  it('SUPER_ADMIN creates a project that starts as DRAFT under a valid program', async () => {
    const program = await createProgramFixture();
    const result = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(
          validProjectBody(program.id, { title: '  New Initiative  ', displayOrder: 7 }),
        ),
      },
      superCookies,
    );

    assert.equal(result.status, 201);
    const project = asProject(result.body);
    trackedProjectIds.push(project.id);
    assert.equal(project.title, 'New Initiative');
    assert.equal(project.status, 'DRAFT');
    assert.equal(project.displayOrder, 7);
    assert.equal(project.programId, program.id);
    assert.ok(project.program, 'response must embed the program summary');
    assert.equal(project.program.id, program.id);
    assert.equal(project.program.status, 'DRAFT');
    assert.equal('_id' in project, false);
    assert.equal(JSON.stringify(result.body).includes('__v'), false);
    assert.equal(JSON.stringify(result.body).includes('passwordHash'), false);

    const stored = await ProjectModel.findById(project.id);
    assert.ok(stored);
    assert.equal(stored.status, 'DRAFT');
    assert.equal(stored.slug, project.slug);
    assert.equal(stored.programId.toString(), program.id);
  });

  it('creates under a nonexistent program with 404', async () => {
    const missingProgram = new Types.ObjectId().toString();
    const result = await request(
      '/api/v1/projects',
      { method: 'POST', body: JSON.stringify(validProjectBody(missingProgram)) },
      superCookies,
    );
    assert.equal(result.status, 404);
    assert.equal(asError(result.body).message, 'Program not found.');
  });

  it('rejects creation under an archived program with 400', async () => {
    const archived = await createProgramFixture({ status: 'ARCHIVED' });
    const result = await request(
      '/api/v1/projects',
      { method: 'POST', body: JSON.stringify(validProjectBody(archived.id)) },
      superCookies,
    );
    assert.equal(result.status, 400);
    assert.equal(
      asError(result.body).message,
      'Projects cannot be created under an archived program.',
    );
  });

  it('generates a URL-safe slug from the title when slug is omitted', async () => {
    const program = await createProgramFixture();
    const result = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(
          validProjectBody(program.id, {
            title: 'Ramadan Ration & Food Distribution',
            slug: undefined,
          }),
        ),
      },
      superCookies,
    );

    assert.equal(result.status, 201);
    const project = asProject(result.body);
    trackedProjectIds.push(project.id);
    assert.equal(project.slug, 'ramadan-ration-food-distribution');
  });

  it('rejects an invalid explicit slug with 400', async () => {
    const program = await createProgramFixture();
    const result = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(validProjectBody(program.id, { slug: 'Not A Slug' })),
      },
      superCookies,
    );
    assert.equal(result.status, 400);
    assert.match(asError(result.body).message, /URL-safe/);
  });

  it('rejects a duplicate slug within the same program with 409', async () => {
    const program = await createProgramFixture();
    const first = await createProjectViaApi(program.id);
    const duplicate = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(validProjectBody(program.id, { slug: first.slug })),
      },
      superCookies,
    );
    assert.equal(duplicate.status, 409);
    assert.equal(
      asError(duplicate.body).message,
      'A project with this slug already exists in this program.',
    );
  });

  it('allows the same slug under different programs', async () => {
    const programA = await createProgramFixture();
    const programB = await createProgramFixture();
    const sharedSlug = uniqueToken('shared');

    const first = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(validProjectBody(programA.id, { slug: sharedSlug })),
      },
      superCookies,
    );
    assert.equal(first.status, 201);
    trackedProjectIds.push(asProject(first.body).id);

    const second = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(validProjectBody(programB.id, { slug: sharedSlug })),
      },
      superCookies,
    );
    assert.equal(second.status, 201, 'same slug under a different program is allowed');
    trackedProjectIds.push(asProject(second.body).id);
  });

  it('enforces compound uniqueness with the database unique index', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);
    await assert.rejects(
      ProjectModel.create({
        programId: new Types.ObjectId(program.id),
        title: 'Direct Create',
        slug: created.slug,
        shortDescription: 'S',
        description: 'D',
      }),
      (error: unknown) => {
        assert.ok(error !== null && typeof error === 'object' && 'code' in error);
        assert.equal(error.code, 11000, 'duplicate key error');
        return true;
      },
    );
  });

  it('handles concurrent creation of the same slug in one program safely', async () => {
    const program = await createProgramFixture();
    const body = JSON.stringify(validProjectBody(program.id));
    const [first, second] = await Promise.all([
      request('/api/v1/projects', { method: 'POST', body }, superCookies),
      request('/api/v1/projects', { method: 'POST', body }, superCookies),
    ]);
    // Track any winner before asserting, so a failed assertion can never
    // leak an untracked project past the after() cleanup.
    if (first.status === 201) {
      trackedProjectIds.push(asProject(first.body).id);
    }
    if (second.status === 201) {
      trackedProjectIds.push(asProject(second.body).id);
    }
    assert.deepEqual(
      [first.status, second.status].sort(),
      [201, 409],
      'one concurrent create wins, the other is rejected',
    );
  });

  it('rejects missing or over-long title with 400', async () => {
    const program = await createProgramFixture();
    const empty = await request(
      '/api/v1/projects',
      { method: 'POST', body: JSON.stringify(validProjectBody(program.id, { title: '' })) },
      superCookies,
    );
    assert.equal(empty.status, 400);

    const overLong = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(validProjectBody(program.id, { title: 'a'.repeat(151) })),
      },
      superCookies,
    );
    assert.equal(overLong.status, 400);
  });

  it('rejects missing or over-long descriptions with 400', async () => {
    const program = await createProgramFixture();
    const missing = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(
          validProjectBody(program.id, {
            shortDescription: undefined,
            description: undefined,
          }),
        ),
      },
      superCookies,
    );
    assert.equal(missing.status, 400);

    const overLong = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(validProjectBody(program.id, { description: 'a'.repeat(5_001) })),
      },
      superCookies,
    );
    assert.equal(overLong.status, 400);
  });

  it('rejects invalid displayOrder values with 400', async () => {
    const program = await createProgramFixture();
    for (const displayOrder of [-1, 10_001, 1.5, '3']) {
      const result = await request(
        '/api/v1/projects',
        {
          method: 'POST',
          body: JSON.stringify(validProjectBody(program.id, { displayOrder })),
        },
        superCookies,
      );
      assert.equal(result.status, 400, `displayOrder=${String(displayOrder)} must be rejected`);
    }
  });

  it('lists projects for SUPER_ADMIN and ADMIN with pagination', async () => {
    const program = await createProgramFixture();
    const token = uniqueToken('page');
    const first = await createProjectViaApi(program.id, {
      title: `${token} One`,
      slug: `${token}-one`,
      displayOrder: 2,
    });
    const second = await createProjectViaApi(program.id, {
      title: `${token} Two`,
      slug: `${token}-two`,
      displayOrder: 1,
    });

    for (const cookies of [superCookies, adminCookies]) {
      const page1 = await request(`/api/v1/projects?search=${token}&limit=1`, {}, cookies);
      assert.equal(page1.status, 200);
      const list1 = asList(page1.body);
      assert.equal(list1.items.length, 1);
      assert.equal(list1.total, 2);
      assert.equal(list1.totalPages, 2);
      assert.equal(list1.page, 1);
      assert.equal(list1.limit, 1);

      const page2 = await request(
        `/api/v1/projects?search=${token}&page=2&limit=1`,
        {},
        cookies,
      );
      const list2 = asList(page2.body);
      assert.equal(list2.items.length, 1);

      const ids = [list1.items[0]?.id, list2.items[0]?.id].sort();
      assert.deepEqual(ids, [first.id, second.id].sort(), 'both projects appear across pages');
    }
  });

  it('filters projects by status and programId and searches text fields', async () => {
    const program = await createProgramFixture();
    const otherProgram = await createProgramFixture();
    const token = uniqueToken('filter');
    const created = await createProjectViaApi(program.id, { title: `${token} Education` });
    await request(
      `/api/v1/projects/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }) },
      superCookies,
    );

    // Status filter excludes the (now PUBLISHED) project when ARCHIVED asked.
    const byStatus = await request(
      `/api/v1/projects?search=${token}&status=ARCHIVED`,
      {},
      superCookies,
    );
    assert.equal(asList(byStatus.body).total, 0);

    const published = await request(
      `/api/v1/projects?search=${token}&status=PUBLISHED`,
      {},
      superCookies,
    );
    assert.equal(asList(published.body).total, 1);

    // programId filter narrows to that program.
    const byProgram = await request(
      `/api/v1/projects?search=${token}&programId=${otherProgram.id}`,
      {},
      superCookies,
    );
    assert.equal(asList(byProgram.body).total, 0);

    const byProgramMatch = await request(
      `/api/v1/projects?search=${token}&programId=${program.id}`,
      {},
      superCookies,
    );
    assert.equal(asList(byProgramMatch.body).total, 1);

    // Search matches shortDescription too.
    const byShort = await request(
      `/api/v1/projects?search=${token}`,
      {},
      superCookies,
    );
    assert.equal(asList(byShort.body).total, 1);
  });

  it('returns 400 for an invalid id and 404 for an unknown id', async () => {
    const invalid = await request('/api/v1/projects/not-an-id', {}, superCookies);
    assert.equal(invalid.status, 400);
    assert.equal(asError(invalid.body).message, 'Invalid project id.');

    const missing = new Types.ObjectId().toString();
    const notFound = await request(`/api/v1/projects/${missing}`, {}, superCookies);
    assert.equal(notFound.status, 404);
    assert.equal(asError(notFound.body).message, 'Project not found.');
  });

  it('gets a single project for SUPER_ADMIN and ADMIN', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);

    for (const cookies of [superCookies, adminCookies]) {
      const result = await request(`/api/v1/projects/${created.id}`, {}, cookies);
      assert.equal(result.status, 200);
      const project = asProject(result.body);
      assert.equal(project.id, created.id);
      assert.equal(project.title, created.title);
      assert.equal(project.status, 'DRAFT');
      assert.equal(project.programId, program.id);
      assert.ok(project.program);
    }
  });

  it('updates a project partially without wiping other fields', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);

    const result = await request(
      `/api/v1/projects/${created.id}`,
      {
        method: 'PATCH',
        // A status field in the body is ignored - status changes only happen
        // through the dedicated status endpoint.
        body: JSON.stringify({ title: 'Renamed Project', status: 'PUBLISHED' }),
      },
      superCookies,
    );

    assert.equal(result.status, 200);
    const project = asProject(result.body);
    assert.equal(project.title, 'Renamed Project');
    assert.equal(project.slug, created.slug, 'slug preserved on partial update');
    assert.equal(project.shortDescription, created.shortDescription);
    assert.equal(project.description, created.description);
    assert.equal(project.status, 'DRAFT', 'status in PATCH body is ignored');
    assert.equal(project.displayOrder, created.displayOrder);
    assert.equal(project.programId, program.id, 'programId preserved on partial update');
  });

  it('moves a project to another program', async () => {
    const programA = await createProgramFixture();
    const programB = await createProgramFixture();
    const created = await createProjectViaApi(programA.id);

    const result = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({ programId: programB.id }) },
      superCookies,
    );
    assert.equal(result.status, 200);
    const project = asProject(result.body);
    assert.equal(project.programId, programB.id);
    assert.equal(project.program?.id, programB.id);
    assert.equal(project.title, created.title, 'other fields preserved when moving');

    const stored = await ProjectModel.findById(created.id);
    assert.ok(stored);
    assert.equal(stored.programId.toString(), programB.id);
  });

  it('rejects moving to a nonexistent or archived program', async () => {
    const programA = await createProgramFixture();
    const archived = await createProgramFixture({ status: 'ARCHIVED' });
    const created = await createProjectViaApi(programA.id);

    const missing = new Types.ObjectId().toString();
    const toMissing = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({ programId: missing }) },
      superCookies,
    );
    assert.equal(toMissing.status, 404);
    assert.equal(asError(toMissing.body).message, 'Program not found.');

    const toArchived = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({ programId: archived.id }) },
      superCookies,
    );
    assert.equal(toArchived.status, 400);
    assert.equal(
      asError(toArchived.body).message,
      'Projects cannot be moved to an archived program.',
    );

    const stored = await ProjectModel.findById(created.id);
    assert.ok(stored);
    assert.equal(stored.programId.toString(), programA.id, 'failed move leaves the project intact');
  });

  it('rejects a slug change that conflicts within the program', async () => {
    const program = await createProgramFixture();
    const first = await createProjectViaApi(program.id);
    const second = await createProjectViaApi(program.id);

    const conflict = await request(
      `/api/v1/projects/${first.id}`,
      { method: 'PATCH', body: JSON.stringify({ slug: second.slug }) },
      superCookies,
    );
    assert.equal(conflict.status, 409);
    assert.equal(
      asError(conflict.body).message,
      'A project with this slug already exists in this program.',
    );

    // A fresh slug works.
    const newSlug = `${uniqueToken('renamed')}-slug`;
    const ok = await request(
      `/api/v1/projects/${first.id}`,
      { method: 'PATCH', body: JSON.stringify({ slug: newSlug }) },
      superCookies,
    );
    assert.equal(ok.status, 200);
    assert.equal(asProject(ok.body).slug, newSlug);
  });

  it('rejects an update with no fields or unknown-only fields', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);

    const empty = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({}) },
      superCookies,
    );
    assert.equal(empty.status, 400);

    const unknown = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({ hacker: 'x', role: 'SUPER_ADMIN' }) },
      superCookies,
    );
    assert.equal(unknown.status, 400);
  });

  it('does not persist unknown fields on create or update', async () => {
    const program = await createProgramFixture();
    const result = await request(
      '/api/v1/projects',
      {
        method: 'POST',
        body: JSON.stringify(
          validProjectBody(program.id, {
            hacker: 'field',
            role: 'SUPER_ADMIN',
            status: 'PUBLISHED',
          }),
        ),
      },
      superCookies,
    );
    assert.equal(result.status, 201);
    const project = asProject(result.body);
    trackedProjectIds.push(project.id);
    assert.equal(project.status, 'DRAFT', 'create-body status is ignored');
    const stored = await ProjectModel.findById(project.id);
    assert.ok(stored);
    assert.equal('hacker' in stored, false);
    assert.equal('role' in stored, false);
  });

  it('transitions status through the dedicated endpoint and archived projects remain stored', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);

    const published = await request(
      `/api/v1/projects/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }) },
      superCookies,
    );
    assert.equal(published.status, 200);
    assert.equal(asProject(published.body).status, 'PUBLISHED');

    const archived = await request(
      `/api/v1/projects/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'ARCHIVED' }) },
      superCookies,
    );
    assert.equal(archived.status, 200);
    assert.equal(asProject(archived.body).status, 'ARCHIVED');

    // ARCHIVED projects remain in the database.
    const stored = await ProjectModel.findById(created.id);
    assert.ok(stored, 'archived project must remain in the database');
    assert.equal(stored.status, 'ARCHIVED');
  });

  it('rejects an invalid status value with 400', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);
    const result = await request(
      `/api/v1/projects/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'BANNED' }) },
      superCookies,
    );
    assert.equal(result.status, 400);
    assert.equal(asError(result.body).message, 'Status must be DRAFT, PUBLISHED or ARCHIVED.');
  });

  it('rejects ADMIN update and status changes with 403', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);

    const update = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'PATCH', body: JSON.stringify({ title: 'Hacked Title' }) },
      adminCookies,
    );
    assert.equal(update.status, 403);

    const status = await request(
      `/api/v1/projects/${created.id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'PUBLISHED' }) },
      adminCookies,
    );
    assert.equal(status.status, 403);

    const stored = await ProjectModel.findById(created.id);
    assert.ok(stored);
    assert.equal(stored.title, created.title, 'ADMIN must not have modified the project');
    assert.equal(stored.status, 'DRAFT', 'ADMIN must not have changed the status');
  });

  it('has no DELETE endpoint', async () => {
    const program = await createProgramFixture();
    const created = await createProjectViaApi(program.id);
    const del = await request(
      `/api/v1/projects/${created.id}`,
      { method: 'DELETE' },
      superCookies,
    );
    assert.equal(del.status, 404);
    const stored = await ProjectModel.findById(created.id);
    assert.ok(stored, 'project still exists after attempted DELETE');
  });
});
