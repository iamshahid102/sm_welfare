import { Router } from 'express';
import type { Request, RequestHandler } from 'express';
import { FORM_TYPES, type FormType } from '../../constants/form.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { submissionRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import { FormSubmissionModel } from '../../models/formSubmission.model.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Public forms router (admission/registration/enquiry forms).
 *
 * Follows the same conventions as the versioned v1 routers:
 *  - handlers are async and delegate failures to the centralized error handler
 *    via `next(error)` (never hand-rolled 500 responses)
 *  - every client-supplied field is validated before any database work, so a
 *    malformed payload is a 400 and never reaches Mongoose
 *  - the write endpoint is rate limited because it is open to anonymous clients
 *  - reading a stored submission is administrator-only: the payload contains
 *    personal data (name, email, phone), so it must never be publicly
 *    addressable.
 */

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 32;
const MAX_MESSAGE_LENGTH = 2_000;

// Mirrors the email rule used by the User/SiteSettings schemas.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s-]{7,32}$/;

const VALID_FORM_TYPES = new Set<string>(FORM_TYPES);

export interface FormSubmissionInput {
  formType: FormType;
  name: string;
  email: string;
  phone: string;
  message: string;
}

function assertBodyObject(body: unknown): asserts body is Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Request body must be an object.');
  }
}

function assertRequiredString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${label} is required.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ApiError(400, `${label} must not exceed ${maxLength} characters.`);
  }
  return trimmed;
}

/** Validates a submission payload - unknown fields are never persisted. */
export function validateFormSubmissionInput(body: unknown): FormSubmissionInput {
  assertBodyObject(body);

  const { formType } = body;
  if (typeof formType !== 'string' || !VALID_FORM_TYPES.has(formType)) {
    throw new ApiError(
      400,
      `Form type must be one of: ${FORM_TYPES.join(', ')}.`,
    );
  }

  const name = assertRequiredString(body.name, 'Name', MAX_NAME_LENGTH);
  const email = assertRequiredString(body.email, 'Email', MAX_EMAIL_LENGTH).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'Provide a valid email address.');
  }

  const phone = assertRequiredString(body.phone, 'Phone number', MAX_PHONE_LENGTH);
  if (!PHONE_PATTERN.test(phone)) {
    throw new ApiError(400, 'Provide a valid phone number.');
  }

  const message = assertRequiredString(body.message, 'Message', MAX_MESSAGE_LENGTH);

  return { formType: formType as FormType, name, email, phone, message };
}

/** Accepts only a strict 24-hex-character MongoDB ObjectId (same rule as the other services). */
function validateSubmissionId(id: unknown): string {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, 'Invalid submission id.');
  }
  return id;
}

/** POST /api/v1/forms/submit - public form submission. */
export const submitForm: RequestHandler = async (req, res, next) => {
  try {
    const input = validateFormSubmissionInput(req.body);
    const submission = await FormSubmissionModel.create(input);

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully',
      data: {
        id: submission._id,
        formType: submission.formType,
        name: submission.name,
        submittedAt: submission.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/forms/submission/:id - read a stored submission.
 * Administrator-only: the payload is personal data.
 */
export const getSubmission: RequestHandler = async (req: Request, res, next) => {
  try {
    const id = validateSubmissionId(req.params.id);
    const submission = await FormSubmissionModel.findById(id).lean();
    if (!submission) {
      throw ApiError.notFound('Form submission not found.');
    }

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

// ─── Admin inbox: list stored submissions ─────────────────────────────────

// Pagination bounds mirror the program/project/admin list endpoints so every
// list route rejects malformed input the same way.
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;
const MAX_PAGE = 10_000;

export interface ListSubmissionsQuery {
  page: number;
  limit: number;
  /** Optional whitelist filter — absent means every form type. */
  formType?: FormType;
}

/** Validates the admin inbox list query (page ≤ 10000, limit 1–100, known form type). */
export function validateListSubmissionsQuery(query: {
  page?: unknown;
  limit?: unknown;
  formType?: unknown;
}): ListSubmissionsQuery {
  let page = DEFAULT_PAGE;
  if (query.page !== undefined) {
    if (
      typeof query.page !== 'string' ||
      !/^\d+$/.test(query.page) ||
      Number(query.page) < 1 ||
      Number(query.page) > MAX_PAGE
    ) {
      throw new ApiError(400, `Page must be between 1 and ${MAX_PAGE}.`);
    }
    page = Number(query.page);
  }

  let limit = DEFAULT_PAGE_LIMIT;
  if (query.limit !== undefined) {
    if (typeof query.limit !== 'string' || !/^\d+$/.test(query.limit)) {
      throw new ApiError(400, `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`);
    }
    limit = Number(query.limit);
    if (limit < 1 || limit > MAX_PAGE_LIMIT) {
      throw new ApiError(400, `Limit must be an integer between 1 and ${MAX_PAGE_LIMIT}.`);
    }
  }

  let formType: FormType | undefined;
  if (query.formType !== undefined) {
    if (typeof query.formType !== 'string' || !VALID_FORM_TYPES.has(query.formType)) {
      throw new ApiError(400, `Form type must be one of: ${FORM_TYPES.join(', ')}.`);
    }
    formType = query.formType as FormType;
  }

  return { page, limit, ...(formType !== undefined ? { formType } : {}) };
}

/**
 * GET /api/v1/forms/submissions - newest-first inbox of stored submissions.
 * Administrator-only: every document contains personal data (name, email,
 * phone), so this list must never be publicly addressable.
 */
export const listSubmissions: RequestHandler = async (req, res, next) => {
  try {
    const query = validateListSubmissionsQuery({
      page: req.query.page,
      limit: req.query.limit,
      formType: req.query.formType,
    });
    const match = query.formType !== undefined ? { formType: query.formType } : {};

    const [total, submissions] = await Promise.all([
      FormSubmissionModel.countDocuments(match),
      FormSubmissionModel.find(match)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items: submissions.map((submission) => ({
          id: String(submission._id),
          formType: submission.formType,
          name: submission.name,
          email: submission.email,
          phone: submission.phone,
          message: submission.message,
          createdAt: submission.createdAt,
        })),
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const formRouter = Router();

formRouter.post('/submit', submissionRateLimiter, submitForm);
formRouter.get(
  '/submissions',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  listSubmissions,
);
formRouter.get(
  '/submission/:id',
  requireAuth,
  requireRole('SUPER_ADMIN', 'ADMIN'),
  getSubmission,
);

export { formRouter };
