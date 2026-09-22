"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  listFormSubmissions,
  listContactMessages,
  type FormSubmission,
  type ContactMessage,
} from "@/services/submissions";
import type { PublicFormType } from "@/types/forms";
import { PUBLIC_FORMS } from "@/constants/forms";
import { cn } from "@/lib/utils";
import { HiEnvelope, HiInbox } from "react-icons/hi2";

// Title is set via the layout

const PAGE_SIZE = 10;

/** Compact labels for the form-type filter and table badges. */
const FORM_LABELS: Readonly<Record<PublicFormType, string>> = Object.fromEntries(
  PUBLIC_FORMS.map((form) => [form.id, form.shortLabel]),
) as Record<PublicFormType, string>;

type FormFilter = PublicFormType | "all";

type FormsState =
  | { status: "loading"; formType: FormFilter }
  | { status: "error"; message: string; formType: FormFilter; page: number }
  | {
      status: "ready";
      items: FormSubmission[];
      page: number;
      total: number;
      totalPages: number;
      formType: FormFilter;
      refreshing: boolean;
    };

type ContactState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      items: ContactMessage[];
      page: number;
      total: number;
      totalPages: number;
      refreshing: boolean;
    };

type InboxTab = "forms" | "contact";

/** Local date+time formatting for the "Received" columns. */
function formatReceived(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Message cell — two-line clamp with the full text in the native tooltip. */
function MessageCell({ message }: { message: string }) {
  return (
    <p
      className="line-clamp-2 max-w-md whitespace-pre-line text-sm text-muted-foreground"
      title={message}
    >
      {message}
    </p>
  );
}

/**
 * Submissions inbox — administrator-only reads of everything the public
 * site writes:
 *
 *   - "Forms" tab  → GET /api/v1/forms/submissions (filterable by formType)
 *   - "Contact" tab → GET /api/v1/contact
 *
 * Both endpoints require ADMIN / SUPER_ADMIN (HttpOnly cookie session via the
 * shared API client); the payloads are personal data, so nothing here is
 * public. Read-only by design: the models document an inbox for review —
 * deletion of submitted personal data is a separate, deliberate action.
 */
export default function SubmissionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<InboxTab>("forms");
  const [forms, setForms] = useState<FormsState>({
    status: "loading",
    formType: "all",
  });
  const [contact, setContact] = useState<ContactState>({ status: "loading" });
  const loadedTabs = useRef<{ forms: boolean; contact: boolean }>({
    forms: false,
    contact: false,
  });

  const loadForms = useCallback(
    async (page: number, formType: FormFilter) => {
      setForms((prev) =>
        prev.status === "ready" &&
        prev.formType === formType &&
        prev.items.length > 0
          ? { ...prev, refreshing: true }
          : { status: "loading", formType },
      );
      try {
        const data = await listFormSubmissions({
          page,
          limit: PAGE_SIZE,
          ...(formType !== "all" ? { formType } : {}),
        });
        setForms({
          status: "ready",
          items: data.items,
          page: data.page,
          total: data.total,
          totalPages: data.totalPages,
          formType,
          refreshing: false,
        });
      } catch (error) {
        setForms({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load submissions.",
          formType,
          page,
        });
      }
    },
    [],
  );

  const loadContact = useCallback(async (page: number) => {
    setContact((prev) =>
      prev.status === "ready" && prev.items.length > 0
        ? { ...prev, refreshing: true }
        : { status: "loading" },
    );
    try {
      const data = await listContactMessages({ page, limit: PAGE_SIZE });
      setContact({
        status: "ready",
        items: data.items,
        page: data.page,
        total: data.total,
        totalPages: data.totalPages,
        refreshing: false,
      });
    } catch (error) {
      setContact({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to load contact messages.",
      });
    }
  }, []);

  // Lazy-load each tab the first time it is opened.
  useEffect(() => {
    if (authLoading) return;
    if (tab === "forms" && !loadedTabs.current.forms) {
      loadedTabs.current.forms = true;
      void loadForms(1, "all");
    }
    if (tab === "contact" && !loadedTabs.current.contact) {
      loadedTabs.current.contact = true;
      void loadContact(1);
    }
  }, [tab, authLoading, loadForms, loadContact]);

  if (!user) return null;

  const formsReady = forms.status === "ready" ? forms : null;
  const contactReady = contact.status === "ready" ? contact : null;

  const tabButton = (id: InboxTab, label: string, count?: number) => (
    <Button
      key={id}
      variant={tab === id ? "default" : "outline"}
      size="sm"
      onClick={() => setTab(id)}
      aria-pressed={tab === id}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
            tab === id
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {count}
        </span>
      )}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Submissions</h1>
        <p className="text-sm text-muted-foreground">
          Everything the public site sends us — application forms and contact
          messages, newest first.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <CardTitle className="font-heading">Inbox</CardTitle>
            <CardDescription>
              {tab === "forms"
                ? formsReady
                  ? `${formsReady.total} form submission${formsReady.total === 1 ? "" : "s"} total${formsReady.refreshing ? " · Refreshing…" : ""}`
                  : "Application and registration forms"
                : contactReady
                  ? `${contactReady.total} contact message${contactReady.total === 1 ? "" : "s"} total${contactReady.refreshing ? " · Refreshing…" : ""}`
                  : "Messages from the contact page"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {tabButton("forms", "Form submissions")}
            {tabButton("contact", "Contact messages")}
          </div>
        </CardHeader>

        <CardContent>
          {/* ── Forms tab ─────────────────────────────────────────────── */}
          {tab === "forms" && forms.status === "loading" && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {tab === "forms" && forms.status === "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <span className="text-sm font-medium text-destructive">Error</span>
              <span className="text-sm text-muted-foreground">
                {forms.message}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => void loadForms(forms.page, forms.formType)}
              >
                Retry
              </Button>
            </div>
          )}

          {tab === "forms" && formsReady && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <label
                  htmlFor="form-type-filter"
                  className="text-sm text-muted-foreground"
                >
                  Filter by form:
                </label>
                <select
                  id="form-type-filter"
                  value={formsReady.formType}
                  onChange={(e) =>
                    void loadForms(1, e.target.value as FormFilter)
                  }
                  className="rounded-lg border-border bg-background px-2 py-1.5 text-sm"
                >
                  <option value="all">All forms</option>
                  {PUBLIC_FORMS.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.shortLabel}
                    </option>
                  ))}
                </select>
              </div>

              {formsReady.items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
                  <HiInbox
                    className="size-10 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">No submissions yet</span>
                  <span className="text-sm text-muted-foreground">
                    Application forms sent from the website will appear here.
                  </span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-border/60 text-left">
                          <th className="px-4 py-2 text-sm font-medium">Received</th>
                          <th className="px-4 py-2 text-sm font-medium">Form</th>
                          <th className="px-4 py-2 text-sm font-medium">Name</th>
                          <th className="px-4 py-2 text-sm font-medium">Contact</th>
                          <th className="px-4 py-2 text-sm font-medium">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formsReady.items.map((submission) => (
                          <tr
                            key={submission.id}
                            className="border-border/50 align-top"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                              {formatReceived(submission.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary">
                                {FORM_LABELS[submission.formType] ??
                                  submission.formType}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {submission.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              <div className="flex flex-col">
                                <a
                                  href={`mailto:${submission.email}`}
                                  className="text-primary hover:underline"
                                >
                                  {submission.email}
                                </a>
                                <span>{submission.phone}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <MessageCell message={submission.message} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {formsReady.totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {formsReady.page} of {formsReady.totalPages}
                      </div>
                      <PaginationControls
                        page={formsReady.page}
                        totalPages={formsReady.totalPages}
                        onPageChange={(p) => void loadForms(p, formsReady.formType)}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Contact tab ───────────────────────────────────────────── */}
          {tab === "contact" && contact.status === "loading" && (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}

          {tab === "contact" && contact.status === "error" && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
              <span className="text-sm font-medium text-destructive">Error</span>
              <span className="text-sm text-muted-foreground">
                {contact.message}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto"
                onClick={() => void loadContact(1)}
              >
                Retry
              </Button>
            </div>
          )}

          {tab === "contact" && contactReady && (
            <>
              {contactReady.items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
                  <HiEnvelope
                    className="size-10 text-muted-foreground/60"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">No messages yet</span>
                  <span className="text-sm text-muted-foreground">
                    Messages sent from the contact page will appear here.
                  </span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-border/60 text-left">
                          <th className="px-4 py-2 text-sm font-medium">Received</th>
                          <th className="px-4 py-2 text-sm font-medium">Name</th>
                          <th className="px-4 py-2 text-sm font-medium">Email</th>
                          <th className="px-4 py-2 text-sm font-medium">Topic</th>
                          <th className="px-4 py-2 text-sm font-medium">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactReady.items.map((message) => (
                          <tr
                            key={message.id}
                            className="border-border/50 align-top"
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                              {formatReceived(message.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {message.name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <a
                                href={`mailto:${message.email}`}
                                className="text-primary hover:underline"
                              >
                                {message.email}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {message.topic || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <MessageCell message={message.message} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {contactReady.totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {contactReady.page} of {contactReady.totalPages}
                      </div>
                      <PaginationControls
                        page={contactReady.page}
                        totalPages={contactReady.totalPages}
                        onPageChange={(p) => void loadContact(p)}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Prev/Next + numbered pages — same component the other admin lists use. */
function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    // flex-wrap keeps a long page list from forcing horizontal page overflow
    // on narrow screens.
    <div className="flex max-w-full flex-wrap items-center gap-1">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
