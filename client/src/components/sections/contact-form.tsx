"use client";

import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/constants/site";

/**
 * Contact form per the Contact template. There is no backend endpoint for
 * public messages yet, so submission composes an email to the org address
 * (pre-filled via mailto) — an honest fallback until a contact API exists.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(
      topic ? `${topic} — ${name}` : `Message from ${name}`
    );
    const body = encodeURIComponent(
      `${message}\n\n— ${name}${email ? `\nEmail: ${email}` : ""}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        Send a message
      </h2>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-name">Your name</Label>
        <Input
          id="contact-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-email">Email address</Label>
        <Input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-topic">Topic</Label>
        <Input
          id="contact-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Donation, Volunteering, Assistance"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <HiPaperAirplane className="mr-1.5 size-4" aria-hidden="true" />
        Send message
      </Button>

      {sent ? (
        <p className="text-sm text-primary" role="status">
          Your email app is opening with your message ready to send. You can
          also reach us directly at {SITE.email}.
        </p>
      ) : null}
    </form>
  );
}
