import { Router } from 'express';
import type { Request, RequestHandler } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { submissionRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { ContactMessageModel } from '../../models/contactMessage.model.js';
import { ApiError } from '../../utils/ApiError.js';

/**
 * Public contact router.
 *
 * Follows the same conventions as the forms router:
 *  - handlers are async and delegate failures to the centralized error handler
 *    via `next(error)` (never hand-rolled 500 responses)
 *  - every client-supplied field is validated before any database work, so a
 *    malformed payload is a 400 and never reaches Mongoose
 *  - the write endpoint is rate limited because it is open to anonymous clients
 *  - reading a stored message is administrator-only: the payload contains
 *    personal data (name, email), so it must never be publicly addressable.
 */

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_TOPIC_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2_000;

// Mirrors the email rule used by the User/SiteSettings/FormSubmission schemas.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactMessageInput {
  name: string;
  email: string;
  topic: string;
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

function assertOptionalString(
  value: unknown,
  label: string,
  maxLength: number,
): string {
  if (value === undefined || value === null) {
    return '';
  }
  if (typeof value !== 'string') {
    throw new ApiError(400, `${label} must be a string.`);
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ApiError(400, `${label} must not exceed ${maxLength} characters.`);
  }
  return trimmed;
}

/** Validates a contact payload - unknown fields are never persisted. */
export function validateContactMessageInput(body: unknown): ContactMessageInput {
  assertBodyObject(body);

  const name = assertRequiredString(body.name, 'Name', MAX_NAME_LENGTH);
  const email = assertRequiredString(body.email, 'Email', MAX_EMAIL_LENGTH).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, 'Provide a valid email address.');
  }

  const topic = assertOptionalString(body.topic, 'Topic', MAX_TOPIC_LENGTH);
  const message = assertRequiredString(body.message, 'Message', MAX_MESSAGE_LENGTH);

  return { name, email, topic, message };
}

/** Accepts only a strict 24-hex-character MongoDB ObjectId (same rule as the other services). */
function validateMessageId(id: unknown): string {
  if (typeof id !== 'string' || !/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ApiError(400, 'Invalid message id.');
  }
  return id;
}

/** POST /api/v1/contact - public contact-form submission. */
export const sendContactMessage: RequestHandler = async (req, res, next) => {
  try {
    const input = validateContactMessageInput(req.body);
    const contactMessage = await ContactMessageModel.create(input);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        id: contactMessage._id,
        name: contactMessage.name,
        subject: contactMessage.topic,
        submittedAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/contact/:id - read a stored contact message.
 * Administrator-only: the payload is personal data.
 */
export const getContactMessage: RequestHandler = async (req: Request, res, next) => {
  try {
    const id = validateMessageId(req.params.id);
    const contactMessage = await ContactMessageModel.findById(id).lean();
    if (!contactMessage) {
      throw ApiError.notFound('Contact message not found.');
    }

    res.status(200).json({ success: true, data: contactMessage });
  } catch (error) {
    next(error);
  }
};

// ─── Admin inbox: list stored contact messages ───────────────────────────

// Pagination bounds mirror the program/project/admin list endpoints so every
// list route rejects malformed input the same way.
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 100;
const MAX_PAGE = 10_000;

export interface ListMessagesQuery {
  page: number;
  limit: number;
}

/** Validates the admin inbox list query (page ≤ 10000, limit 1–100). */
export function validateListMessagesQuery(query: {
  page?: unknown;
  limit?: unknown;
}): ListMessagesQuery {
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

  return { page, limit };
}

/**
 * GET /api/v1/contact - newest-first inbox of stored contact messages.
 * Administrator-only: every document contains personal data (name, email),
 * so this list must never be publicly addressable.
 */
export const listContactMessages: RequestHandler = async (req, res, next) => {
  try {
    const query = validateListMessagesQuery({
      page: req.query.page,
      limit: req.query.limit,
    });

    const [total, messages] = await Promise.all([
      ContactMessageModel.countDocuments(),
      ContactMessageModel.find()
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items: messages.map((message) => ({
          id: String(message._id),
          name: message.name,
          email: message.email,
          topic: message.topic,
          message: message.message,
          createdAt: message.createdAt,
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

const contactRouter = Router();

contactRouter.post('/', submissionRateLimiter, sendContactMessage);
contactRouter.get('/', requireAuth, listContactMessages);
contactRouter.get('/:id', requireAuth, getContactMessage);

export { contactRouter };
