"use client";

import { useMemo, useState } from "react";
import { MessageCircle, Phone, Repeat, Landmark } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/constants/site";
import {
  DONATION_PRESETS,
  CUSTOM_AMOUNT_PLACEHOLDER,
  BANK_DETAILS,
  ZAKAT_NOTE,
} from "@/data/donations";
import { PROJECTS } from "@/data/projects";
import { cn } from "@/lib/utils";

const PHONE_DIGITS = SITE.phone.replace(/\D/g, "");

/**
 * Donation builder per the Donate template. Presentation/UX only — the
 * confirmation flow hands off to WhatsApp or phone as the template does;
 * no payment is processed on this site yet.
 */
export function DonationBuilder() {
  const [preset, setPreset] = useState<string>(DONATION_PRESETS[1].amount);
  const [custom, setCustom] = useState("");
  const [project, setProject] = useState<string>(PROJECTS[0].name);
  const [monthly, setMonthly] = useState(false);

  const amount = custom.trim() !== "" ? custom : preset;
  const summaryAmount = `PKR ${amount.replace(/PKR\s*/, "").replace(/,/g, "")}`;

  const whatsappHref = useMemo(() => {
    const text = encodeURIComponent(
      `Salam, I would like to donate ${summaryAmount}${monthly ? " monthly" : ""} to ${project} (SM Welfare Trust).`
    );
    return `https://wa.me/${PHONE_DIGITS}?text=${text}`;
  }, [summaryAmount, monthly, project]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Build your donation */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          Build your donation
        </h2>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 font-heading text-sm font-bold text-muted-foreground">
            Amount
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {DONATION_PRESETS.map((p) => {
              const selected = preset === p.amount;
              return (
                <button
                  key={p.amount}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setPreset(p.amount);
                    setCustom("");
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-secondary"
                      : "border-border bg-white hover:border-primary/40"
                  )}
                >
                  <span
                    className={cn(
                      "block font-heading text-lg font-bold",
                      selected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {p.amount}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <Label htmlFor="custom-amount" className="text-muted-foreground">
            Or enter your own amount
          </Label>
          <Input
            id="custom-amount"
            type="text"
            inputMode="numeric"
            placeholder={CUSTOM_AMOUNT_PLACEHOLDER}
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Label htmlFor="project" className="text-muted-foreground">
            Direct it to
          </Label>
          <select
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PROJECTS.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={monthly}
            onChange={(e) => setMonthly(e.target.checked)}
            className="size-4 rounded border-input accent-[var(--primary)]"
          />
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <Repeat className="size-4 text-primary" aria-hidden="true" />
            Make this a monthly commitment
          </span>
        </label>

        {/* Live summary */}
        <div className="rounded-xl bg-section p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            You are giving
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-primary">
            {summaryAmount}
            {monthly ? <span className="text-sm font-semibold"> / month</span> : null}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">{project}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "flex-1 bg-[#25D366] hover:bg-[#1fb457]")}
          >
            <MessageCircle className="mr-1.5 size-4" aria-hidden="true" />
            Confirm on WhatsApp
          </a>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className={cn(buttonVariants({ size: "lg", variant: "outline" }), "flex-1")}
          >
            <Phone className="mr-1.5 size-4" aria-hidden="true" />
            Call us
          </a>
        </div>
      </div>

      {/* Bank & wallet details */}
      <div className="flex h-fit flex-col gap-6 rounded-2xl border border-border bg-section p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Bank &amp; wallet details
          </h2>
        </div>
        <dl className="flex flex-col gap-5">
          {BANK_DETAILS.map((detail) => (
            <div key={detail.label} className="flex flex-col gap-1">
              <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {detail.label}
              </dt>
              <dd className="text-sm font-semibold text-foreground">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
        <Separator />
        <div className="flex flex-col gap-2">
          <p className="font-heading text-sm font-bold text-primary">Zakat eligible</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ZAKAT_NOTE}
          </p>
        </div>
      </div>
    </div>
  );
}
