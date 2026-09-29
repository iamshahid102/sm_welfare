import { Schema, model } from 'mongoose';
import {
  ADMIN_ROLE,
  EMAIL_PATTERN,
  USER_ROLES,
  USER_STATUSES,
} from '../constants/user.js';
import type { UserRole, UserStatus } from '../constants/user.js';

/**
 * Shape of a user document. Mirrors the schema below; `role` is the single
 * ADMIN role and `status` is the strongly-typed union, both derived from
 * constants/user.ts. `createdAt` and `updatedAt` are managed by the timestamps
 * plugin (absent until first save).
 */
export interface User {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Removes passwordHash (and the internal version key) from any serialized
 * representation - the single place that protects user data leaving the
 * server (both res.json() via toJSON and explicit toObject() calls).
 * A fresh object is returned rather than mutating the internal payload.
 * Note: mongoose calls transforms as `transform(doc, ret, options)` - the
 * first argument is the document, the second is the plain object to shape.
 */
function redactSerialized(
  _doc: unknown,
  ret: Record<string, unknown>,
): Record<string, unknown> {
  const { passwordHash: _passwordHash, __v: _version, ...safe } = ret;
  return safe;
}

/**
 * User document schema.
 *
 * Exactly one administrator account exists, carrying the single ADMIN role.
 * The model deliberately contains no authentication logic - it only defines
 * how a user is stored. Passwords are stored exclusively as hashes; plaintext
 * is never written, and the hash is never part of normal serialization.
 */
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    // Normalized to lowercase on write so the unique index is effectively
    // case-insensitive without a special collation.
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_PATTERN, 'email must be a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'passwordHash is required'],
      minlength: 1,
      // Hidden from default queries - it must be requested explicitly
      // (e.g. .select('+passwordHash')) by the code that verifies passwords.
      select: false,
    },
    // Exactly one role exists (ADMIN). The enum is kept so any stored value
    // outside the single role is rejected on write.
    role: {
      type: String,
      enum: { values: [...USER_ROLES], message: '{VALUE} is not a supported role' },
      required: [true, 'role is required'],
      default: ADMIN_ROLE,
    },
    status: {
      type: String,
      enum: { values: [...USER_STATUSES], message: '{VALUE} is not a supported status' },
      required: [true, 'status is required'],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { transform: redactSerialized },
    toObject: { transform: redactSerialized },
  },
);

export const UserModel = model<User>('User', userSchema);
