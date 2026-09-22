import { model, Schema } from 'mongoose';

/**
 * Shape of a stored contact-form message.
 *
 * One document per message sent from the public "Send a message" form
 * (name, email, topic, message). `createdAt` / `updatedAt` come from the
 * timestamps plugin.
 */
export interface ContactMessage {
  name: string;
  email: string;
  /** Optional subject line chosen/typed by the sender. May be empty. */
  topic: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const contactMessageSchema = new Schema<ContactMessage>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
      maxlength: 254,
    },
    topic: {
      type: String,
      trim: true,
      maxlength: 120,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: 1,
      maxlength: 2_000,
    },
  },
  {
    timestamps: true,
    collection: 'contactMessages',
  },
);

// The admin inbox reads newest first.
contactMessageSchema.index({ createdAt: -1 });

export const ContactMessageModel = model<ContactMessage>(
  'ContactMessage',
  contactMessageSchema,
);
