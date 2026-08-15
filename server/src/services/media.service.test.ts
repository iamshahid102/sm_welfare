import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Types } from 'mongoose';
import {
  ALLOWED_IMAGE_FORMATS,
  MAX_MEDIA_BYTES,
  MEDIA_UPLOAD_FOLDER,
} from '../constants/media.js';
import { MediaModel } from '../models/media.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  detectImageFormat,
  serializeSafeMedia,
  validateImageBuffer,
  validateMediaId,
} from './media.service.js';

/**
 * Media foundation unit tests - pure in-memory, no MongoDB, no Cloudinary.
 * Covers content-based format detection, upload validation rules, id
 * validation and response serialization. Database behavior and the HTTP layer
 * are covered in media.routes.db.test.ts (real MongoDB) and
 * media.cloudinary.test.ts (live Cloudinary, skipped without credentials).
 */

/** Minimal real 1x1 PNG (valid signature, decodable by Cloudinary). */
const VALID_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/** Minimal JPEG: signature bytes plus padding (enough for detection). */
function jpegBuffer(size = 128): Buffer {
  const buffer = Buffer.alloc(size, 0x00);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  return buffer;
}

/** Minimal WebP: "RIFF" + size + "WEBP" header plus padding. */
function webpBuffer(size = 64): Buffer {
  const buffer = Buffer.alloc(size, 0x00);
  buffer.write('RIFF', 0, 'latin1');
  buffer.writeUInt32LE(size - 8, 4);
  buffer.write('WEBP', 8, 'latin1');
  return buffer;
}

function expectsError(statusCode: number, callback: () => unknown, message: string): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof ApiError, message);
    assert.equal(error.statusCode, statusCode, message);
    return true;
  });
}

describe('media - content-based format detection', () => {
  it('detects JPEG from its magic bytes', () => {
    assert.equal(detectImageFormat(jpegBuffer()), 'jpg');
  });

  it('detects PNG from its magic bytes', () => {
    assert.equal(detectImageFormat(VALID_PNG), 'png');
  });

  it('detects WebP from its RIFF/WEBP header', () => {
    assert.equal(detectImageFormat(webpBuffer()), 'webp');
  });

  it('rejects buffers that are not images', () => {
    assert.equal(detectImageFormat(Buffer.from('hello world, this is text', 'utf8')), null);
    assert.equal(detectImageFormat(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04])), null);
  });

  it('rejects an empty or too-short buffer', () => {
    assert.equal(detectImageFormat(Buffer.alloc(0)), null);
    assert.equal(detectImageFormat(Buffer.from([0x89, 0x50, 0x4e])), null);
  });

  it('does not trust a forged extension - detection is purely content-based', () => {
    // A "filename" of fake.jpg carrying text bytes must NOT pass.
    assert.equal(detectImageFormat(Buffer.from('not really a jpeg', 'utf8')), null);
    // Text bytes that start with JPEG magic are still rejected as too short/invalid.
    assert.equal(detectImageFormat(Buffer.from([0xff, 0xd8, 0xff, 0x00, 0x01])), null);
  });
});

describe('media - upload validation', () => {
  it('accepts a valid PNG within the size limit', () => {
    assert.equal(validateImageBuffer(VALID_PNG), 'png');
  });

  it('rejects an empty buffer with 400', () => {
    expectsError(400, () => validateImageBuffer(Buffer.alloc(0)), 'empty buffer');
  });

  it('rejects an oversize buffer with 413', () => {
    expectsError(
      413,
      () => validateImageBuffer(Buffer.alloc(MAX_MEDIA_BYTES + 1, 0x00)),
      'oversize buffer',
    );
  });

  it('accepts a buffer at exactly the size limit', () => {
    const buffer = Buffer.alloc(MAX_MEDIA_BYTES, 0x00);
    buffer[0] = 0xff;
    buffer[1] = 0xd8;
    buffer[2] = 0xff;
    assert.equal(validateImageBuffer(buffer), 'jpg');
  });

  it('rejects an unsupported file type with 400 and lists the allowed formats', () => {
    assert.throws(
      () => validateImageBuffer(Buffer.from('definitely not an image', 'utf8')),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.statusCode, 400);
        assert.match(error.message, /Unsupported file type/);
        assert.match(error.message, /jpg, png, webp/);
        return true;
      },
    );
  });
});

describe('media - id validation', () => {
  it('accepts a well-formed ObjectId', () => {
    const id = '64b7f2c4a1b2c3d4e5f6a7b8';
    const objectId = validateMediaId(id);
    assert.equal(objectId.toString(), id);
  });

  it('rejects a non-string id', () => {
    expectsError(400, () => validateMediaId(undefined), 'missing id');
    expectsError(400, () => validateMediaId(123), 'numeric id');
  });

  it('rejects a malformed ObjectId', () => {
    expectsError(400, () => validateMediaId('not-an-id'), 'malformed id');
    expectsError(400, () => validateMediaId(''), 'empty id');
    expectsError(400, () => validateMediaId('abcdefghijkl'), '12-char id');
    expectsError(400, () => validateMediaId('zzzzzzzzzzzzzzzzzzzzzzzz'), 'non-hex id');
  });
});

describe('media - response serialization', () => {
  it('exposes only safe fields - never _id, __v or internal shapes', () => {
    const doc = new MediaModel({
      publicId: 'sm-welfare/test-image',
      secureUrl: 'https://res.cloudinary.com/example/image/upload/v1/sm-welfare/test-image.png',
      resourceType: 'image',
      format: 'png',
      width: 800,
      height: 600,
      bytes: 12_345,
      folder: MEDIA_UPLOAD_FOLDER,
      originalFilename: 'photo.png',
      createdBy: new Types.ObjectId(),
    });

    const safe = serializeSafeMedia(doc);

    assert.equal(typeof safe.id, 'string');
    assert.equal(safe.publicId, 'sm-welfare/test-image');
    assert.equal(safe.resourceType, 'image');
    assert.equal(safe.format, 'png');
    assert.equal(safe.width, 800);
    assert.equal(safe.height, 600);
    assert.equal(safe.bytes, 12_345);
    assert.equal(safe.folder, MEDIA_UPLOAD_FOLDER);
    assert.equal(safe.originalFilename, 'photo.png');
    assert.equal(typeof safe.createdBy, 'string');
    assert.equal(typeof safe.createdAt, 'string');
    assert.equal(typeof safe.updatedAt, 'string');

    const json = JSON.stringify(safe);
    assert.equal(json.includes('_id'), false, 'internal _id must not be exposed');
    assert.equal(json.includes('__v'), false, 'internal __v must not be exposed');
    assert.equal(json.includes('passwordHash'), false);
  });

  it('serializes a missing originalFilename as null', () => {
    const doc = new MediaModel({
      publicId: 'sm-welfare/no-name',
      secureUrl: 'https://res.cloudinary.com/example/image/upload/v1/sm-welfare/no-name.png',
      resourceType: 'image',
      format: 'png',
      width: 1,
      height: 1,
      bytes: 100,
      folder: MEDIA_UPLOAD_FOLDER,
      createdBy: new Types.ObjectId(),
    });

    const safe = serializeSafeMedia(doc);
    assert.equal(safe.originalFilename, null);
  });
});

describe('media - shared constants', () => {
  it('keeps upload rules centralized and consistent', () => {
    assert.equal(MEDIA_UPLOAD_FOLDER, 'sm-welfare');
    assert.deepEqual(ALLOWED_IMAGE_FORMATS, ['jpg', 'png', 'webp']);
    assert.equal(MAX_MEDIA_BYTES, 5 * 1024 * 1024);
  });
});
