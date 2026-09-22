"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyContent, EmptyDescription } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/client";
import { isSuperAdmin } from "@/types/auth";
import {
  getSiteSettings,
  initializeSiteSettings,
  updateSiteSettings,
  type CreateSiteSettingsInput,
  type UpdateSiteSettingsInput,
  type SiteSettings,
} from "@/services/site-settings";

// Title is set via the layout

type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "not-found" }
  | {
      status: "ready";
      settings: SiteSettings;
      unsavedChanges: UpdateSiteSettingsInput | null;
      submitting: boolean;
      lastError: string | null;
    };

function SiteSettingsForm({
  settings,
  unsavedChanges,
  submitting,
  lastError,
  onSave,
  onCancel,
  canEdit,
}: {
  settings: SiteSettings;
  unsavedChanges: UpdateSiteSettingsInput | null;
  submitting: boolean;
  lastError: string | null;
  onSave: (values: UpdateSiteSettingsInput) => void;
  onCancel: () => void;
  canEdit: boolean;
}) {
  const [organizationName, setOrganizationName] = useState(settings.organizationName);
  const [tagline, setTagline] = useState(settings.tagline ?? "");
  const [description, setDescription] = useState(settings.description ?? "");
  const [contactEmail, setContactEmail] = useState(settings.contact.email ?? "");
  const [contactPhone, setContactPhone] = useState(settings.contact.phone ?? "");
  const [contactAddress, setContactAddress] = useState(settings.contact.address ?? "");
  const [socialFacebook, setSocialFacebook] = useState(settings.socialLinks.facebook ?? "");
  const [socialInstagram, setSocialInstagram] = useState(settings.socialLinks.instagram ?? "");
  const [socialLinkedin, setSocialLinkedin] = useState(settings.socialLinks.linkedin ?? "");
  const [socialYoutube, setSocialYoutube] = useState(settings.socialLinks.youtube ?? "");
  const [socialTwitter, setSocialTwitter] = useState(settings.socialLinks.twitter ?? "");
  const [socialWebsite, setSocialWebsite] = useState(settings.socialLinks.website ?? "");
  const [footerShortDescription, setFooterShortDescription] = useState(settings.footer.shortDescription ?? "");
  const [footerCopyrightText, setFooterCopyrightText] = useState(settings.footer.copyrightText ?? "");

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          organizationName: organizationName.trim(),
          ...(tagline.trim() && { tagline: tagline.trim() }),
          ...(description.trim() && { description: description.trim() }),
          contact: {
            ...(contactEmail.trim() && { email: contactEmail.trim() }),
            ...(contactPhone.trim() && { phone: contactPhone.trim() }),
            ...(contactAddress.trim() && { address: contactAddress.trim() }),
          },
          socialLinks: {
            ...(socialFacebook.trim() && { facebook: socialFacebook.trim() }),
            ...(socialInstagram.trim() && { instagram: socialInstagram.trim() }),
            ...(socialLinkedin.trim() && { linkedin: socialLinkedin.trim() }),
            ...(socialYoutube.trim() && { youtube: socialYoutube.trim() }),
            ...(socialTwitter.trim() && { twitter: socialTwitter.trim() }),
            ...(socialWebsite.trim() && { website: socialWebsite.trim() }),
          },
          footer: {
            ...(footerShortDescription.trim() && {
              shortDescription: footerShortDescription.trim(),
            }),
            ...(footerCopyrightText.trim() && {
              copyrightText: footerCopyrightText.trim(),
            }),
          },
        });
      }}
    >
      {lastError && (
        <Alert variant="destructive">
          <AlertTitle>Could not save changes</AlertTitle>
          <AlertDescription>{lastError}</AlertDescription>
        </Alert>
      )}      <section>
        <h2 className="font-heading text-lg font-medium mb-4">Organisation</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="organizationName">
              Organisation name *
            </Label>
            <Input
              id="organizationName"
              value={organizationName}
              onChange={(e) => {
                setOrganizationName(e.target.value);
              }}
              required
              disabled={submitting || !canEdit}
              aria-invalid={lastError ? true : undefined}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => {
                setTagline(e.target.value);
              }}
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              disabled={submitting || !canEdit}
              rows={3}
            />
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="font-heading text-lg font-medium mb-4">Contact</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value);
              }}
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
              }}
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactAddress">Address</Label>
            <Input
              id="contactAddress"
              value={contactAddress}
              onChange={(e) => {
                setContactAddress(e.target.value);
              }}
              disabled={submitting || !canEdit}
            />
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="font-heading text-lg font-medium mb-4">Social links</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="socialFacebook">Facebook</Label>
            <Input
              id="socialFacebook"
              type="url"
              value={socialFacebook}
              onChange={(e) => {
                setSocialFacebook(e.target.value);
              }}
              placeholder="https://facebook.com/your-page"
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="socialInstagram">Instagram</Label>
            <Input
              id="socialInstagram"
              type="url"
              value={socialInstagram}
              onChange={(e) => {
                setSocialInstagram(e.target.value);
              }}
              placeholder="https://instagram.com/your-page"
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="socialLinkedin">LinkedIn</Label>
            <Input
              id="socialLinkedin"
              type="url"
              value={socialLinkedin}
              onChange={(e) => {
                setSocialLinkedin(e.target.value);
              }}
              placeholder="https://linkedin.com/company/your-page"
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="socialYoutube">YouTube</Label>
            <Input
              id="socialYoutube"
              type="url"
              value={socialYoutube}
              onChange={(e) => {
                setSocialYoutube(e.target.value);
              }}
              placeholder="https://youtube.com/@your-channel"
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="socialTwitter">X (Twitter)</Label>
            <Input
              id="socialTwitter"
              type="url"
              value={socialTwitter}
              onChange={(e) => {
                setSocialTwitter(e.target.value);
              }}
              placeholder="https://x.com/your-handle"
              disabled={submitting || !canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="socialWebsite">Website</Label>
            <Input
              id="socialWebsite"
              type="url"
              value={socialWebsite}
              onChange={(e) => {
                setSocialWebsite(e.target.value);
              }}
              placeholder="https://yoursite.org"
              disabled={submitting || !canEdit}
            />
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="font-heading text-lg font-medium mb-4">Footer</h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="footerShortDescription">
              Footer short description
            </Label>
            <Textarea
              id="footerShortDescription"
              value={footerShortDescription}
              onChange={(e) => {
                setFooterShortDescription(e.target.value);
              }}
              disabled={submitting || !canEdit}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="footerCopyrightText">
              Copyright text
            </Label>
            <Input
              id="footerCopyrightText"
              value={footerCopyrightText}
              onChange={(e) => {
                setFooterCopyrightText(e.target.value);
              }}
              disabled={submitting || !canEdit}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {canEdit && (
          <>
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
            >
              {submitting ? "Saving…" : "Save changes"}
            </Button>
            {unsavedChanges && (
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={onCancel}
                size="lg"
              >
                Discard changes
              </Button>
            )}
          </>
        )}
        {!canEdit && (
          <Button variant="outline" size="lg" disabled>
            Editing restricted to super administrators
          </Button>
        )}
      </div>
    </form>
  );
}

export default function AdminSiteSettingsPage() {
  const { user } = useAuth();
  const [state, setState] = useState<PageState>({ status: "loading" });
  // Remounting the form (via `key`) is how "Discard changes" restores every
  // field to the persisted settings - the form seeds its fields on mount.
  const [formKey, setFormKey] = useState(0);

  const userIsSuperAdmin = isSuperAdmin(user);
  const canEdit = userIsSuperAdmin;

  const loadSettings = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const settings = await getSiteSettings();
      setState({
        status: "ready",
        settings,
        unsavedChanges: null,
        submitting: false,
        lastError: null,
      });
    } catch (error) {
      // 404 means "not initialized yet" - a normal pre-production state that
      // renders the initialization form instead of an error screen.
      if (error instanceof ApiError && error.statusCode === 404) {
        setState({ status: "not-found" });
      } else {
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Failed to load settings.",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, loadSettings]);

  const handleSave = useCallback(
    async (values: UpdateSiteSettingsInput) => {
      setState((prev) =>
        prev.status === "ready"
          ? { ...prev, unsavedChanges: values, submitting: true, lastError: null }
          : prev,
      );

      try {
        const updated = await updateSiteSettings(values);
        setState({
          status: "ready",
          settings: updated,
          unsavedChanges: null,
          submitting: false,
          lastError: null,
        });
      } catch (error) {
        setState((prev) =>
          prev.status === "ready"
            ? {
                ...prev,
                submitting: false,
                lastError:
                  error instanceof Error
                    ? error.message
                    : "Failed to save settings.",
              }
            : prev,
        );
      }
    },
    [],
  );

  const handleCancel = useCallback(() => {
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, unsavedChanges: null, lastError: null, submitting: false }
        : prev,
    );
    // Remount the form so its fields fall back to the saved values.
    setFormKey((key) => key + 1);
  }, []);

  if (!user) {
    return null;
  }

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Site settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage organisation information shown across the website.
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-destructive font-medium">Error</span>
            <span className="text-sm text-muted-foreground">
              {state.message}
            </span>
            <Button variant="outline" size="sm" onClick={loadSettings}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === "not-found") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Site settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage organisation information shown across the website.
          </p>
        </div>
        {canEdit ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">
                Site settings not yet configured
              </CardTitle>
              <CardDescription>
                The organisation&apos;s settings have not been initialized yet.
                Create them to populate the website with contact details,
                social links and footer content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InitializeSiteSettings
                onCreate={(values) => {
                  setState({
                    status: "ready",
                    settings: values,
                    unsavedChanges: null,
                    submitting: false,
                    lastError: null,
                  });
                }}
              />
            </CardContent>
          </Card>
        ) : (
        <Empty>
          <EmptyContent>
            <EmptyDescription>Site settings have not been configured yet.</EmptyDescription>
            <Button variant="outline" disabled>
              Contact a super administrator
            </Button>
          </EmptyContent>
        </Empty>
        )
        }
      </div>
    );
  }

  if (state.status === "ready") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold">
            Site settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage organisation information shown across the website.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">
              Organisation settings
            </CardTitle>
            <CardDescription>
              {canEdit
                ? "Edit the organisation-wide values displayed across the website."
                : "View-only mode. Only super administrators can edit these values."}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl">
            <SiteSettingsForm
              key={formKey}
              settings={state.settings}
              unsavedChanges={state.unsavedChanges}
              submitting={state.submitting}
              lastError={state.lastError}
              onSave={handleSave}
              onCancel={handleCancel}
              canEdit={canEdit}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}function InitializeSiteSettings({
  onCreate,
}: {
  onCreate: (settings: SiteSettings) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [socialFacebook, setSocialFacebook] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [socialLinkedin, setSocialLinkedin] = useState("");
  const [socialYoutube, setSocialYoutube] = useState("");
  const [socialTwitter, setSocialTwitter] = useState("");
  const [socialWebsite, setSocialWebsite] = useState("");
  const [footerShortDescription, setFooterShortDescription] = useState("");
  const [footerCopyrightText, setFooterCopyrightText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const input: CreateSiteSettingsInput = {
        organizationName: organizationName.trim(),
        ...(tagline.trim() && { tagline: tagline.trim() }),
        ...(description.trim() && { description: description.trim() }),
        contact: {
          ...(contactEmail.trim() && { email: contactEmail.trim() }),
          ...(contactPhone.trim() && { phone: contactPhone.trim() }),
          ...(contactAddress.trim() && { address: contactAddress.trim() }),
        },
        socialLinks: {
          ...(socialFacebook.trim() && { facebook: socialFacebook.trim() }),
          ...(socialInstagram.trim() && { instagram: socialInstagram.trim() }),
          ...(socialLinkedin.trim() && { linkedin: socialLinkedin.trim() }),
          ...(socialYoutube.trim() && { youtube: socialYoutube.trim() }),
          ...(socialTwitter.trim() && { twitter: socialTwitter.trim() }),
          ...(socialWebsite.trim() && { website: socialWebsite.trim() }),
        },
        footer: {
          ...(footerShortDescription.trim() && {
            shortDescription: footerShortDescription.trim(),
          }),
          ...(footerCopyrightText.trim() && {
            copyrightText: footerCopyrightText.trim(),
          }),
        },
      };
      const created = await initializeSiteSettings(input);
      onCreate(created);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create site settings.",
      );
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not create site settings</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="initOrganizationName">
            Organisation name *
          </Label>
          <Input
            id="initOrganizationName"
            value={organizationName}
            onChange={(e) => {
              setOrganizationName(e.target.value);
            }}
            required
            disabled={submitting}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="initTagline">Tagline</Label>
          <Input
            id="initTagline"
            value={tagline}
            onChange={(e) => {
              setTagline(e.target.value);
            }}
            disabled={submitting}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="initDescription">Description</Label>
        <Textarea
          id="initDescription"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          disabled={submitting}
          rows={3}
        />
      </div>

      <Separator />

      <div>
        <h3 className="font-heading text-base font-medium mb-3">Contact</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="initContactEmail">Email</Label>
            <Input
              id="initContactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value);
              }}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initContactPhone">Phone</Label>
            <Input
              id="initContactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => {
                setContactPhone(e.target.value);
              }}
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initContactAddress">Address</Label>
            <Input
              id="initContactAddress"
              value={contactAddress}
              onChange={(e) => {
                setContactAddress(e.target.value);
              }}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-heading text-base font-medium mb-3">Social links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="initSocialFacebook">Facebook</Label>
            <Input
              id="initSocialFacebook"
              type="url"
              value={socialFacebook}
              onChange={(e) => {
                setSocialFacebook(e.target.value);
              }}
              placeholder="https://facebook.com/your-page"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initSocialInstagram">Instagram</Label>
            <Input
              id="initSocialInstagram"
              type="url"
              value={socialInstagram}
              onChange={(e) => {
                setSocialInstagram(e.target.value);
              }}
              placeholder="https://instagram.com/your-page"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initSocialLinkedin">LinkedIn</Label>
            <Input
              id="initSocialLinkedin"
              type="url"
              value={socialLinkedin}
              onChange={(e) => {
                setSocialLinkedin(e.target.value);
              }}
              placeholder="https://linkedin.com/company/your-page"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initSocialYoutube">YouTube</Label>
            <Input
              id="initSocialYoutube"
              type="url"
              value={socialYoutube}
              onChange={(e) => {
                setSocialYoutube(e.target.value);
              }}
              placeholder="https://youtube.com/@your-channel"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initSocialTwitter">X (Twitter)</Label>
            <Input
              id="initSocialTwitter"
              type="url"
              value={socialTwitter}
              onChange={(e) => {
                setSocialTwitter(e.target.value);
              }}
              placeholder="https://x.com/your-handle"
              disabled={submitting}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initSocialWebsite">Website</Label>
            <Input
              id="initSocialWebsite"
              type="url"
              value={socialWebsite}
              onChange={(e) => {
                setSocialWebsite(e.target.value);
              }}
              placeholder="https://yoursite.org"
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-heading text-base font-medium mb-3">Footer</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="initFooterShortDescription">
              Short description
            </Label>
            <Textarea
              id="initFooterShortDescription"
              value={footerShortDescription}
              onChange={(e) => {
                setFooterShortDescription(e.target.value);
              }}
              disabled={submitting}
              rows={2}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="initFooterCopyrightText">
              Copyright text
            </Label>
            <Input
              id="initFooterCopyrightText"
              value={footerCopyrightText}
              onChange={(e) => {
                setFooterCopyrightText(e.target.value);
              }}
              disabled={submitting}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting} size="lg">
          {submitting ? "Creating…" : "Create site settings"}
        </Button>
      </div>
    </form>
  );
}
