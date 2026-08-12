import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ApiError } from '../utils/ApiError.js';
import {
  serializeSiteSettings,
  validateCreateSiteSettingsInput,
  validateUpdateSiteSettingsInput,
} from './siteSettings.service.js';

/** Asserts the callback throws an ApiError with the given status code. */
function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

const VALID_BODY = {
  organizationName: ' SM Welfare ',
  tagline: 'Helping communities',
  description: 'A short description',
  contact: {
    email: ' Contact@Example.COM ',
    phone: '+1 555 000 111',
    address: '123 Main Street',
  },
  socialLinks: {
    facebook: 'https://facebook.com/smwelfare',
    instagram: 'https://instagram.com/smwelfare',
    website: 'https://www.smwelfare.example',
  },
  footer: {
    shortDescription: 'Welfare organization',
    copyrightText: '© 2026 SM Welfare',
  },
};

describe('site settings service - create input validation', () => {
  it('accepts valid input and trims/normalizes values', () => {
    const input = validateCreateSiteSettingsInput(VALID_BODY);
    assert.equal(input.organizationName, 'SM Welfare');
    assert.equal(input.tagline, 'Helping communities');
    assert.equal(input.contact?.email, 'contact@example.com', 'contact email normalized (trim + lowercase)');
    assert.equal(input.socialLinks?.facebook, 'https://facebook.com/smwelfare');
    assert.equal(input.footer?.copyrightText, '© 2026 SM Welfare');
  });

  it('accepts a minimal body with only organizationName', () => {
    const input = validateCreateSiteSettingsInput({ organizationName: 'SM Welfare' });
    assert.deepEqual(input, {
      organizationName: 'SM Welfare',
      contact: {},
      socialLinks: {},
      footer: {},
    });
  });

  it('rejects a non-object body', () => {
    expectsError(400, () => validateCreateSiteSettingsInput(undefined), 'undefined body');
    expectsError(400, () => validateCreateSiteSettingsInput(null), 'null body');
    expectsError(400, () => validateCreateSiteSettingsInput(['x']), 'array body');
    expectsError(400, () => validateCreateSiteSettingsInput('string'), 'string body');
  });

  it('rejects a missing or whitespace-only organizationName', () => {
    expectsError(400, () => validateCreateSiteSettingsInput({}), 'missing organizationName');
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: '   ' }),
      'whitespace organizationName',
    );
  });

  it('rejects a non-string organizationName', () => {
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 123 }),
      'numeric organizationName',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: ['x'] }),
      'array organizationName',
    );
  });

  it('rejects an over-long organizationName', () => {
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'a'.repeat(121) }),
      'organizationName over 120 chars',
    );
  });

  it('rejects an empty or over-long tagline', () => {
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', tagline: '' }),
      'empty tagline',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', tagline: 'a'.repeat(201) }),
      'tagline over 200 chars',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', tagline: 42 }),
      'numeric tagline',
    );
  });

  it('rejects an over-long description', () => {
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', description: 'a'.repeat(2_001) }),
      'description over 2000 chars',
    );
  });

  it('rejects an invalid contact email', () => {
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', contact: { email: 'not-an-email' } }),
      'malformed contact email',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', contact: { email: '' } }),
      'empty contact email',
    );
  });

  it('rejects non-object contact/socialLinks/footer sections', () => {
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', contact: ['a@b.com'] }),
      'array contact',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', contact: null }),
      'null contact',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', socialLinks: 'facebook.com' }),
      'string social links',
    );
    expectsError(
      400,
      () => validateCreateSiteSettingsInput({ organizationName: 'X', footer: 7 }),
      'numeric footer',
    );
  });

  it('rejects invalid social URLs', () => {
    for (const url of ['not-a-url', 'www.facebook.com', 'ftp://files.example.com', 'javascript:alert(1)', '']) {
      expectsError(
        400,
        () => validateCreateSiteSettingsInput({ organizationName: 'X', socialLinks: { facebook: url } }),
        `facebook url=${url} must be rejected`,
      );
    }
  });

  it('accepts http and https social URLs', () => {
    const input = validateCreateSiteSettingsInput({
      organizationName: 'X',
      socialLinks: {
        facebook: 'http://facebook.com/smwelfare',
        twitter: 'https://x.com/smwelfare',
      },
    });
    assert.equal(input.socialLinks?.facebook, 'http://facebook.com/smwelfare');
    assert.equal(input.socialLinks?.twitter, 'https://x.com/smwelfare');
  });

  it('ignores unexpected top-level fields', () => {
    const input = validateCreateSiteSettingsInput({ organizationName: 'X', hacker: 'field', role: 'SUPER_ADMIN' });
    assert.deepEqual(Object.keys(input).sort(), ['contact', 'footer', 'organizationName', 'socialLinks']);
  });

  it('ignores unknown keys inside sections', () => {
    const input = validateCreateSiteSettingsInput({
      organizationName: 'X',
      contact: { email: 'a@b.com', evil: 'field' },
    });
    assert.deepEqual(input.contact, { email: 'a@b.com' });
  });
});

describe('site settings service - update input validation', () => {
  it('rejects a body with no recognized fields', () => {
    expectsError(400, () => validateUpdateSiteSettingsInput({}), 'empty object');
    expectsError(400, () => validateUpdateSiteSettingsInput({ unknown: 'x' }), 'only unknown fields');
    expectsError(400, () => validateUpdateSiteSettingsInput(undefined), 'missing body');
  });

  it('treats an empty section as a no-op (does not count as a field)', () => {
    expectsError(
      400,
      () => validateUpdateSiteSettingsInput({ contact: {} }),
      'empty contact section must not count as an update',
    );
  });

  it('accepts a single top-level field', () => {
    assert.deepEqual(validateUpdateSiteSettingsInput({ tagline: 'New tagline' }), {
      tagline: 'New tagline',
    });
  });

  it('accepts partial nested updates', () => {
    assert.deepEqual(
      validateUpdateSiteSettingsInput({ contact: { phone: '+1 999 000 111' } }),
      { contact: { phone: '+1 999 000 111' } },
    );
  });

  it('validates updated values like create values', () => {
    expectsError(
      400,
      () => validateUpdateSiteSettingsInput({ organizationName: '' }),
      'empty organizationName',
    );
    expectsError(
      400,
      () => validateUpdateSiteSettingsInput({ contact: { email: 'bad' } }),
      'bad email',
    );
    expectsError(
      400,
      () => validateUpdateSiteSettingsInput({ socialLinks: { website: 'no-scheme' } }),
      'bad url',
    );
    expectsError(
      400,
      () => validateUpdateSiteSettingsInput({ description: 'a'.repeat(2_001) }),
      'over-long description',
    );
  });
});

describe('site settings service - serialization', () => {
  it('returns only the intended fields - never _id, key or metadata', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');
    const settings = serializeSiteSettings({
      key: 'site_settings',
      organizationName: 'SM Welfare',
      tagline: 'Helping',
      contact: { email: 'a@b.com' },
      socialLinks: {},
      footer: {},
      createdAt,
      updatedAt,
    });

    assert.deepEqual(Object.keys(settings).sort(), [
      'contact',
      'createdAt',
      'footer',
      'organizationName',
      'socialLinks',
      'tagline',
      'updatedAt',
    ]);
    assert.equal(JSON.stringify(settings).includes('site_settings'), false);
    assert.equal(JSON.stringify(settings).includes('_id'), false);
    assert.equal(JSON.stringify(settings).includes('passwordHash'), false);
    assert.equal(JSON.stringify(settings).includes('token'), false);
    assert.equal(JSON.stringify(settings).includes('secret'), false);
  });
});
