"use client";

import { useCallback, useEffect, useRef, useState, type ElementType } from "react";
import Link from "next/link";
import {
  HiArrowPath,
  HiArrowRight,
  HiCheckCircle,
  HiPhoto,
  HiPlus,
  HiRectangleStack,
  HiFolderOpen,
  HiSquares2X2,
} from "react-icons/hi2";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ADMIN_NAV_GROUPS } from "@/components/admin/admin-shell";
import { useAuth } from "@/hooks/use-auth";
import { listPrograms } from "@/services/programs";
import { listProjects } from "@/services/projects";
import { listMedia } from "@/services/media";
import { runCmsSeed, type SeedResult } from "@/services/seed";
import { cn } from "@/lib/utils";

/**
 * Admin dashboard.
 *
 * Answers two questions in order: "what is on the site right now?" (the counts)
 * and "what do I want to change?" (the section cards). Every card links to the
 * one page that does the job, so the panel needs no explanation.
 */

type DashboardCounts = {
  programs: number;
  projects: number;
  media: number;
};

/** Counts are read with limit=1 - only `total` is needed. */
const COUNT_ONLY = { page: 1, limit: 1 } as const;

function CountCard({
  label,
  value,
  hint,
  href,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  icon: ElementType;
  loading: boolean;
}) {
  return (
    <Card className="hover-lift">
      <CardContent className="flex items-start gap-4 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          {loading ? (
            <Skeleton className="mt-1.5 h-8 w-14" />
          ) : (
            <span className="font-heading text-3xl font-bold leading-tight tracking-tight">
              {value}
            </span>
          )}
          <span className="mt-0.5 text-xs text-muted-foreground">{hint}</span>
        </div>
        <Link
          href={href}
          aria-label={`Manage ${label.toLowerCase()}`}
          className="group/arrow mt-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HiArrowRight
            className="size-4 transition-transform duration-200 ease-out group-hover/arrow:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </CardContent>
    </Card>
  );
}

/** Human-readable summary of a completed seed run. */
function describeSeed(result: SeedResult): string {
  return [
    `${result.programs.created} programs added, ${result.programs.reSynced} re-synced`,
    `${result.projects.created} projects added, ${result.projects.reSynced} re-synced`,
    result.siteSettings.created ? "site settings created" : "site settings updated",
    result.media.attached > 0
      ? `${result.media.attached} images linked`
      : "images unchanged",
  ].join(" · ");
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSummary, setSeedSummary] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [programs, projects, media] = await Promise.all([
        listPrograms(COUNT_ONLY),
        listProjects(COUNT_ONLY),
        listMedia(COUNT_ONLY),
      ]);
      setCounts({
        programs: programs.total,
        projects: projects.total,
        media: media.total,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    void fetchCounts();
  }, [fetchCounts]);

  const runSeed = useCallback(
    async (options: { reset?: boolean; uploadMedia?: boolean }) => {
      setIsSeeding(true);
      setSeedSummary(null);
      setSeedError(null);
      try {
        const result = await runCmsSeed(options);
        setSeedSummary(describeSeed(result));
        await fetchCounts();
      } catch (err) {
        setSeedError(
          err instanceof Error ? err.message : "Failed to seed the site content.",
        );
      } finally {
        setIsSeeding(false);
      }
    },
    [fetchCounts],
  );

  const handleSeed = useCallback(
    () => runSeed({ reset: true, uploadMedia: true }),
    [runSeed],
  );

  const sections = ADMIN_NAV_GROUPS.flatMap((group) => group.items).filter(
    (item) => item.href !== "/admin/dashboard",
  );

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`Welcome back${user ? `, ${user.name.split(" ")[0]}` : ""}`}
        description="Everything visitors see on smwelfare.charity is managed from this panel. Pick a section below to add or update content."
        icon={HiSquares2X2}
      />

      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => void fetchCounts()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CountCard
            label="Programs"
            value={counts?.programs ?? 0}
            hint="Main categories the site lists"
            href="/admin/programs"
            icon={HiRectangleStack}
            loading={loading}
          />
          <CountCard
            label="Projects"
            value={counts?.projects ?? 0}
            hint="Pages inside each program"
            href="/admin/projects"
            icon={HiFolderOpen}
            loading={loading}
          />
          <CountCard
            label="Media"
            value={counts?.media ?? 0}
            hint="Images stored on Cloudinary"
            href="/admin/media"
            icon={HiPhoto}
            loading={loading}
          />
        </div>
      )}

      {/* ── Section shortcuts ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">
            What do you want to change?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-start gap-3 rounded-xl border border-border bg-background p-4 transition-[border-color,box-shadow,transform] duration-200 ease-out",
                    "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                    <Icon
                      className="size-4.5 text-muted-foreground transition-[color,transform] duration-200 ease-out group-hover:scale-110 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                  <HiArrowRight
                    className="ml-auto mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── One-click content load ── */}
      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading text-base">
            Load the website&apos;s content
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Writes the site&apos;s real content into the database — 13 programs,
            17 projects, the site settings and the page content (photos,
            sections, cards and facts). Existing programs and projects are
            cleared first, their Cloudinary images re-uploaded and re-linked, so
            the database matches the site exactly. The admin login is never
            touched.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void handleSeed()} disabled={isSeeding}>
              <HiArrowPath
                className={cn("mr-1.5 size-4", isSeeding && "animate-spin")}
                aria-hidden="true"
              />
              {isSeeding ? "Loading content…" : "Reset & reload content"}
            </Button>
            <Button
              variant="outline"
              disabled={isSeeding}
              onClick={() => void runSeed({})}
            >
              Re-sync only
            </Button>
            <Link
              href="/admin/site-settings"
              className={buttonVariants({ variant: "outline" })}
            >
              Edit site settings
              <HiArrowRight className="ml-1.5 size-3.5" aria-hidden="true" />
            </Link>
            {seedSummary ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <HiCheckCircle className="size-4 text-primary" aria-hidden="true" />
                {seedSummary}
              </span>
            ) : null}
          </div>
          {seedError ? (
            <Alert variant="destructive">
              <AlertDescription>{seedError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      {/* ── Shortcut to the most common task ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/programs" className={buttonVariants({ size: "sm" })}>
          <HiPlus className="mr-1.5 size-3.5" aria-hidden="true" />
          New program
        </Link>
        <Link
          href="/admin/projects"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <HiPlus className="mr-1.5 size-3.5" aria-hidden="true" />
          New project
        </Link>
        <Link
          href="/admin/media"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <HiPhoto className="mr-1.5 size-3.5" aria-hidden="true" />
          Upload image
        </Link>
      </div>
    </div>
  );
}
