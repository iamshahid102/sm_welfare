"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin, getUserInitials } from "@/types/auth";
import Link from "next/link";
import { listPrograms } from "@/services/programs";
import { listProjects } from "@/services/projects";
import { listAdmins } from "@/services/admins";
import { listMedia } from "@/services/media";
import {
  HiPlus,
  HiPhoto,
  HiCog6Tooth,
  HiUsers,
  HiCommandLine,
  HiFolderOpen,
  HiInbox,
  HiUserGroup,
} from "react-icons/hi2";
import type { ElementType } from "react";

// Title is set via the layout

const PAGE_SIZE = 1;

/**
 * Third metric is role-aware: /admins is SUPER_ADMIN-only, so an ADMIN
 * session would get 403 — it sees the media library count instead (both
 * roles may list media).
 */
type ThirdMetric =
  | { kind: "admins"; total: number }
  | { kind: "media"; total: number };

type DashboardData = {
  programs: { total: number };
  projects: { total: number };
  third: ThirdMetric;
};

function MetricCard({
  title,
  value,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  action?: React.ReactNode;
  icon: ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5 text-primary" aria-hidden="true" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-heading text-3xl font-bold tracking-tight">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
        {action}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [programsData, projectsData, third] = await Promise.all([
        listPrograms({ page: 1, limit: PAGE_SIZE }),
        listProjects({ page: 1, limit: PAGE_SIZE }),
        // Role-aware: asking /admins as an ADMIN would 403 and fail the whole
        // dashboard. "Active admin accounts" also filters ACTIVE so the number
        // matches its label.
        isSuperAdmin(user)
          ? listAdmins({ page: 1, limit: PAGE_SIZE, status: "ACTIVE" }).then(
              (result) => ({ kind: "admins" as const, total: result.total }),
            )
          : listMedia({ page: 1, limit: PAGE_SIZE }).then((result) => ({
              kind: "media" as const,
              total: result.total,
            })),
      ]);
      setData({
        programs: { total: programsData.total },
        projects: { total: projectsData.total },
        third,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // `user` is a dependency because the third metric depends on the role;
    // hasLoadedRef guards the single-run behavior, not the dependency array.
    if (!authLoading && user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchData();
    }
  }, [authLoading, user, fetchData]);

  const userIsSuperAdmin = isSuperAdmin(user);

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = getUserInitials(user);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {initials}
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.name}. Here&apos;s what&apos;s happening.
          </p>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center gap-3">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Programs"
              value={isLoading ? "—" : data?.programs.total ?? 0}
              description="Total programmes available"
              icon={HiCommandLine}
              action={
                isLoading
                  ? undefined
                  : data && (
                      <Link
                        href="/admin/programs"
                        className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2" })}
                      >
                        <HiPlus className="mr-1 size-3.5" aria-hidden="true" />
                        Manage programs
                      </Link>
                    )
              }
            />
            <MetricCard
              title="Projects"
              value={isLoading ? "—" : data?.projects.total ?? 0}
              description="Total projects across all programs"
              icon={HiFolderOpen}
              action={
                isLoading
                  ? undefined
                  : data && (
                      <Link
                        href="/admin/projects"
                        className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2" })}
                      >
                        <HiPlus className="mr-1 size-3.5" aria-hidden="true" />
                        Manage projects
                      </Link>
                    )
              }
            />
            {userIsSuperAdmin ? (
              <MetricCard
                title="Administrators"
                value={
                  isLoading || !data
                    ? "—"
                    : data.third.kind === "admins"
                      ? data.third.total
                      : 0
                }
                description="Active admin accounts"
                icon={HiUserGroup}
                action={
                  isLoading
                    ? undefined
                    : data && (
                        <Link
                          href="/admin/admins"
                          className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2" })}
                        >
                          <HiPlus className="mr-1 size-3.5" aria-hidden="true" />
                          Manage admins
                        </Link>
                      )
                }
              />
            ) : (
              <MetricCard
                title="Media"
                value={
                  isLoading || !data
                    ? "—"
                    : data.third.kind === "media"
                      ? data.third.total
                      : 0
                }
                description="Images in the media library"
                icon={HiPhoto}
                action={
                  isLoading
                    ? undefined
                    : data && (
                        <Link
                          href="/admin/media"
                          className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2" })}
                        >
                          <HiPlus className="mr-1 size-3.5" aria-hidden="true" />
                          Manage media
                        </Link>
                      )
                }
              />
            )}
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="font-heading">Quick actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/programs"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <HiPlus className="mr-1.5 size-3.5" aria-hidden="true" />
                  View programs
                </Link>
                <Link
                  href="/admin/projects"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <HiPlus className="mr-1.5 size-3.5" aria-hidden="true" />
                  View projects
                </Link>
                <Link
                  href="/admin/media"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <HiPhoto className="mr-1.5 size-3.5" aria-hidden="true" />
                  Upload media
                </Link>
                <Link
                  href="/admin/submissions"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <HiInbox className="mr-1.5 size-3.5" aria-hidden="true" />
                  View submissions
                </Link>
                {userIsSuperAdmin && (
                  <Link
                    href="/admin/site-settings"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    <HiCog6Tooth className="mr-1.5 size-3.5" aria-hidden="true" />
                    Edit site settings
                  </Link>
                )}
                {userIsSuperAdmin && (
                  <Link
                    href="/admin/admins"
                    className={buttonVariants({ variant: "secondary", size: "sm" })}
                  >
                    <HiUsers className="mr-1.5 size-3.5" aria-hidden="true" />
                    Manage admins
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && !data && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Loading dashboard data…
          </CardContent>
        </Card>
      )}
    </div>
  );
}
