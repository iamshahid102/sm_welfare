"use client";

import { useState } from "react";
import { HiCheckCircle, HiPaperAirplane } from "react-icons/hi2";
import { LuLoaderCircle } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/constants/site";
import { sendContactMessage } from "@/services/public-contact";
import { cn } from "@/lib/utils";
import { BTN_PRIMARY_BLUE, BTN_OUTLINE_DEFAULT } from "@/components/shared/home-styles";

// Mirrors the server's contact validation rules (contact.routes.ts).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_TOPIC_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2_000;

interface ContactValues {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const EMPTY_VALUES: ContactValues = { name: "", email: "", topic: "", message: "" };

/**
 * Contact form per the Contact template ("Send a message").
 * Submits to POST /api/v1/contact — the message is validated server-side,
 * stored and rate limited; the team replies by email.
 */
export function ContactForm() {
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof ContactValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ContactValues, string>> = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const topic = values.topic.trim();
    const message = values.message.trim();

    if (name.length === 0) next.name = "Your name is required.";
    else if (name.length > MAX_NAME_LENGTH) next.name = `Must not exceed ${MAX_NAME_LENGTH} characters.`;

    if (email.length === 0) next.email = "Email address is required.";
    else if (email.length > MAX_EMAIL_LENGTH) next.email = `Must not exceed ${MAX_EMAIL_LENGTH} characters.`;
    else if (!EMAIL_PATTERN.test(email)) next.email = "Provide a valid email address.";

    if (topic.length > MAX_TOPIC_LENGTH) next.topic = `Must not exceed ${MAX_TOPIC_LENGTH} characters.`;

    if (message.length === 0) next.message = "Message is required.";
    else if (message.length > MAX_MESSAGE_LENGTH) next.message = `Must not exceed ${MAX_MESSAGE_LENGTH} characters.`;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        topic: values.topic.trim(),
        message: values.message.trim(),
      });
      setValues(EMPTY_VALUES);
      setSubmitted(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <HiCheckCircle className="size-7" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Message sent
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Thank you for reaching out — our team will reply to you by email. You
          can also write to us directly at {SITE.email}.
        </p>
        <Button
          type="button"
          variant="outline"
          className={cn(BTN_OUTLINE_DEFAULT, "mt-2")}
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        Send a message
      </h2>

      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-name">Your name</Label>
        <Input
          id="contact-name"
          value={values.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Your name"
          maxLength={MAX_NAME_LENGTH}
          disabled={submitting}
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name ? (
          <p id="contact-name-error" role="alert" className="text-sm text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-email">Email address</Label>
        <Input
          id="contact-email"
          type="email"
          value={values.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="you@example.com"
          maxLength={MAX_EMAIL_LENGTH}
          disabled={submitting}
          aria-required="true"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
        />
        {errors.email ? (
          <p id="contact-email-error" role="alert" className="text-sm text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-topic">Topic</Label>
        <Input
          id="contact-topic"
          value={values.topic}
          onChange={(e) => updateField("topic", e.target.value)}
          placeholder="e.g. Donation, Volunteering, Assistance"
          maxLength={MAX_TOPIC_LENGTH}
          disabled={submitting}
          aria-invalid={errors.topic ? true : undefined}
          aria-describedby={errors.topic ? "contact-topic-error" : undefined}
        />
        {errors.topic ? (
          <p id="contact-topic-error" role="alert" className="text-sm text-destructive">
            {errors.topic}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          rows={5}
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder="How can we help?"
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={submitting}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" role="alert" className="text-sm text-destructive">
            {errors.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className={cn(BTN_PRIMARY_BLUE, "w-full sm:w-auto")}
      >
        {submitting ? (
          <LuLoaderCircle className="mr-1.5 size-4 animate-spin" aria-hidden="true" />
        ) : (
          <HiPaperAirplane className="mr-1.5 size-4" aria-hidden="true" />
        )}
        {submitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
