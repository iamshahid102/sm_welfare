import { Schema, model, type Types } from 'mongoose';

/**
 * Shape of a persisted refresh session.
 *
 * Only the SHA-256 hash of the refresh token is stored (utils/auth.ts), so a
 * database leak never exposes usable credentials. A session enables revocation
 * and rotation: on refresh, the old session is deleted and a new one created.
 */
export interface RefreshSession {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshSessionSchema = new Schema<RefreshSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, 'tokenHash is required'],
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'expiresAt is required'],
      // TTL index - MongoDB automatically removes the session after expiry.
      expires: 0,
    },
  },
  { timestamps: true },
);

export const RefreshSessionModel = model<RefreshSession>('RefreshSession', refreshSessionSchema);
