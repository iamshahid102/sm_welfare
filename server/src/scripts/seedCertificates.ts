/**
 * Certificate seed CLI — uploads the trust's certificates to Cloudinary and
 * records one Media document per asset.
 *
 * Usage (from server/):
 *   npm run seed:certificates            # upload/sync the certificates
 *   npm run seed:certificates -- --force # re-upload even if a record exists
 *
 * The four certificates are byte-identical copies of the ones the live
 * smwelfare.charity /about-us/ page publishes, stored in
 * `client/public/images/certificates`. They are uploaded into the dedicated
 * `sm-welfare/certificates` Cloudinary folder, so the public media endpoint
 * can serve exactly this group with `GET /public/media?folder=sm-welfare/certificates`.
 *
 * IDEMPOTENT: an asset that already has a Media record for the same
 * folder + original filename is reused as-is (admin edits to its title or
 * description are preserved). Pass `--force` to re-upload and refresh metadata.
 *
 * Output policy: the MongoDB URI and Cloudinary credentials are never printed.
 */
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { connectToDatabase, disconnectFromDatabase } from '../config/database.js';
import { APP_NAME } from '../constants/index.js';
import { cloudinary, cloudinaryConfigured } from '../config/cloudinary.js';
import { MEDIA_CERTIFICATES_FOLDER } from '../constants/media.js';
import { MediaModel } from '../models/media.model.js';
import { UserModel } from '../models/user.model.js';

const EXIT_FAILURE = 1;
const IMAGE_FILE_PATTERN = /\.(?:jpe?g|png|webp)$/i;

/**
 * Curated certificate metadata, in live-page order. The titles/descriptions
 * mirror `client/src/data/certificates.ts`, which is the local fallback the
 * Founder's Profile page renders when the API is unavailable.
 */
const CERTIFICATES: readonly {
  file: string;
  title: string;
  description: string;
}[] = [
  {
    file: 'fbr-registration.png',
    title: 'FBR Registration',
    description:
      'Sirat-e-Mustaqeem Welfare Trust is registered with the Federal Board of Revenue (FBR), Government of Pakistan.',
  },
  {
    file: 'sm-trust-certificate.png',
    title: 'Trust Registration Certificate',
    description:
      'Official registration certificate of Sirat-e-Mustaqeem Welfare Trust.',
  },
  {
    file: 'ntn-certificate.png',
    title: 'NTN Certificate',
    description:
      'National Tax Number certificate issued to the trust by the Federal Board of Revenue.',
  },
  {
    file: 'recognition-certificate-2026.jpg',
    title: 'Recognition Certificate',
    description:
      "A further recognition certificate published on the trust's About Us page.",
  },
];

/** Absolute path to the curated certificate folder (server runs from server/). */
function resolveCertificatesDir(): string {
  return path.resolve(process.cwd(), '..', 'client', 'public', 'images', 'certificates');
}

/** The certificate files present on disk, filtered to real image extensions. */
async function listCertificateFiles(): Promise<string[]> {
  const dir = resolveCertificatesDir();
  const entries = await readdir(dir);
  return entries.filter((entry) => IMAGE_FILE_PATTERN.test(entry)).sort();
}

interface SeedSummary {
  uploaded: number;
  reused: number;
  missing: number;
}

async function seedCertificates(force: boolean): Promise<SeedSummary> {
  const files = await listCertificateFiles();
  const summary: SeedSummary = { uploaded: 0, reused: 0, missing: 0 };

  const admin = await UserModel.findOne().sort({ createdAt: 1 }).select('_id').lean();
  if (!admin) {
    throw new Error(
      'No admin account found. Run `npm run provision:admin` before seeding the certificates.',
    );
  }

  for (const certificate of CERTIFICATES) {
    if (!files.includes(certificate.file)) {
      summary.missing += 1;
      console.warn(`  ! missing file: ${certificate.file}`);
      continue;
    }

    const existing = await MediaModel.findOne({
      folder: MEDIA_CERTIFICATES_FOLDER,
      originalFilename: certificate.file,
    }).lean();

    if (existing && !force) {
      summary.reused += 1;
      console.log(`  = reused ${certificate.title} (${existing.publicId})`);
      continue;
    }

    const result = await cloudinary.uploader.upload(
      path.join(resolveCertificatesDir(), certificate.file),
      {
        folder: MEDIA_CERTIFICATES_FOLDER,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
    );

    // Upsert keyed by publicId, matching the seed media helper. A --force
    // re-upload creates a new publicId, so the previous record for the same
    // file is replaced to avoid leaving two certificates behind.
    if (existing && existing.publicId !== result.public_id) {
      await MediaModel.deleteOne({ _id: existing._id });
    }

    await MediaModel.updateOne(
      { publicId: result.public_id },
      {
        $set: {
          publicId: result.public_id,
          secureUrl: result.secure_url,
          resourceType: 'image',
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          folder: MEDIA_CERTIFICATES_FOLDER,
          originalFilename: certificate.file,
          title: certificate.title,
          description: certificate.description,
          createdBy: admin._id,
        },
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    summary.uploaded += 1;
    console.log(`  + uploaded ${certificate.title} (${result.public_id})`);
  }

  return summary;
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');

  if (!cloudinaryConfigured) {
    console.error(
      `[${APP_NAME}] Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in server/.env.`,
    );
    process.exitCode = EXIT_FAILURE;
    return;
  }

  console.log(`[${APP_NAME}] connecting to MongoDB...`);
  await connectToDatabase();
  console.log(`[${APP_NAME}] connected to MongoDB`);

  try {
    const summary = await seedCertificates(force);
    const total = await MediaModel.countDocuments({ folder: MEDIA_CERTIFICATES_FOLDER });
    console.log(`[${APP_NAME}] certificates seed complete:`);
    console.log(`  uploaded: ${summary.uploaded}, reused: ${summary.reused}, missing: ${summary.missing}`);
    console.log(`  certificates in "${MEDIA_CERTIFICATES_FOLDER}": ${total}`);
  } finally {
    await disconnectFromDatabase();
    console.log(`[${APP_NAME}] MongoDB connection closed`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${APP_NAME}] certificates seed failed: ${message}`);
  process.exitCode = EXIT_FAILURE;
});
