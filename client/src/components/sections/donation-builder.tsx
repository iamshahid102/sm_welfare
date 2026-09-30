"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  HiBanknotes,
  HiCheck,
  HiChatBubbleLeftRight,
  HiDocumentDuplicate,
  HiArrowPath,
  HiBuildingLibrary,
  HiPhone,
} from "react-icons/hi2";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SITE } from "@/constants/site";
import {
  DONATION_PRESETS,
  CUSTOM_AMOUNT_PLACEHOLDER,
  BANK_DETAILS,
  WALLET_DETAILS,
  ZAKAT_NOTE,
  type BankDetail,
} from "@/data/donations";
import { EASYPAISA_LOGO, FAYSAL_BANK_LOGO } from "@/data/site-images";
import { PROJECTS } from "@/data/projects";
import { cn } from "@/lib/utils";

const PHONE_DIGITS = SITE.phone.replace(/\D/g, "");

// ─── Copyable bank / wallet value ──────────────────────────────────────

/**
 * A single bank or wallet field. Values flagged `copyable` get a one-tap
 * copy control, so a donor can paste an IBAN or wallet number straight into
 * their banking app. The value itself is always rendered as text, so it can
 * still be selected by hand when the Clipboard API is unavailable (insecure
 * context or permission denied).
 */
function DetailRow({ detail }: { detail: BankDetail }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(detail.value);
      setCopied(true);
    } catch {
      // Clipboard unavailable — the value stays visible to copy by hand.
    }
  }, [detail.value]);

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {detail.label}
        </dt>
        <dd className="break-words text-sm font-semibold text-foreground">
          {detail.value}
        </dd>
      </div>
      {detail.copyable ? (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? `${detail.label} copied` : `Copy ${detail.label}`}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            copied
              ? "border-primary/40 bg-secondary text-primary"
              : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-primary"
          )}
        >
          {copied ? (
            <HiCheck className="size-3.5" aria-hidden="true" />
          ) : (
            <HiDocumentDuplicate className="size-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Donation builder per the Donate template. Presentation/UX only — the
 * confirmation flow hands off to WhatsApp or phone as the template does;
 * no payment is processed on this site yet.
 *
 * The bank and wallet panel reproduces the live /donate/ page: the Faysal Bank
 * logo above its account details and the EasyPaisa logo above the wallet
 * number, with the live page's own values (see `data/donations.ts`). The logos
 * come from `data/site-images.ts`.
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
    <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      {/* Build your donation */}
      <div className="anim-fade-up flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
            <HiBanknotes className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Build your donation
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose an amount and a cause — then confirm with our team.
            </p>
          </div>
        </div>

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
                    "relative rounded-xl border p-4 text-left transition-[border-color,background-color,color,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-secondary ring-1 ring-primary/30"
                      : "border-border bg-white hover:border-primary/40"
                  )}
                >
                  {selected ? (
                    <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <HiCheck className="size-3" aria-hidden="true" />
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "block font-heading text-lg font-bold",
                      selected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {p.amount}
                  </span>
                  <span className="mt-1 block pr-6 text-xs text-muted-foreground">
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
            <HiArrowPath className="size-4 text-primary" aria-hidden="true" />
            Make this a monthly commitment
          </span>
        </label>

        {/* Live summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-section p-5">
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              You are giving
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-primary">
              {summaryAmount}
              {monthly ? (
                <span className="text-sm font-semibold"> / month</span>
              ) : null}
            </p>
          </div>
          <p className="max-w-[14rem] text-sm font-semibold text-muted-foreground">
            {project}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants(),
              "flex-1 rounded-full bg-[#25D366] px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1fb457]"
            )}
          >
            <HiChatBubbleLeftRight
              className="mr-1.5 size-4"
              aria-hidden="true"
            />
            Confirm on WhatsApp
          </a>
          <a
            href={`tel:${SITE.phone.replace(/\s/g, "")}`}
            className={cn(
              buttonVariants(),
              "flex-1 rounded-full border border-border bg-background px-7 py-3 text-sm font-semibold text-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <HiPhone className="mr-1.5 size-4" aria-hidden="true" />
            Call us
          </a>
        </div>
      </div>

      {/* Bank & wallet details — the live page's own logos and values */}
      <div className="flex h-fit flex-col gap-6 rounded-2xl border border-border bg-section p-6 sm:p-8 lg:sticky lg:top-24">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HiBuildingLibrary className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <h2 className="font-heading text-2xl font-bold tracking-tight">
              Bank &amp; wallet details
            </h2>
            <p className="text-sm text-muted-foreground">
              Pay directly — copy any detail in one tap.
            </p>
          </div>
        </div>

        {/* Faysal Bank transfer */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Image
              src={FAYSAL_BANK_LOGO.src}
              alt={FAYSAL_BANK_LOGO.alt}
              width={FAYSAL_BANK_LOGO.width}
              height={FAYSAL_BANK_LOGO.height}
              sizes="112px"
              className="h-7 w-auto"
            />
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-wider"
            >
              Bank transfer
            </Badge>
          </div>
          <dl className="flex flex-col gap-4">
            {BANK_DETAILS.map((detail) => (
              <DetailRow key={detail.label} detail={detail} />
            ))}
          </dl>
        </div>

        {/* EasyPaisa wallet */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Image
              src={EASYPAISA_LOGO.src}
              alt={EASYPAISA_LOGO.alt}
              width={EASYPAISA_LOGO.width}
              height={EASYPAISA_LOGO.height}
              sizes="40px"
              className="size-9 rounded-lg"
            />
            <Badge
              variant="secondary"
              className="text-[10px] uppercase tracking-wider"
            >
              Mobile wallet
            </Badge>
          </div>
          <dl className="flex flex-col gap-4">
            {WALLET_DETAILS.map((detail) => (
              <DetailRow key={detail.label} detail={detail} />
            ))}
          </dl>
        </div>

        <Separator />
        <div className="flex flex-col gap-2">
          <p className="font-heading text-sm font-bold text-primary">
            Zakat eligible
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {ZAKAT_NOTE}
          </p>
        </div>
      </div>
    </div>
  );
}
