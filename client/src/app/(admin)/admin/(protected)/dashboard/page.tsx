"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/types/auth";
import Link from "next/link";
import {
  listPrograms,
} from "@/services/programs";
import {
  listProjects,
} from "@/services/projects";
import {
  listAdmins,
} from "@/services/admins";

// Title is set via the layout

const PAGE_SIZE = 1;

type DashboardData = {
  programs: { total: number };
  projects: { total: number };
  admins: { total: number };
};

function MetricCard({
  title,
  value,
  description,
  action,
}: {
  title: string;
  value: string | number;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="font-heading text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        {action ?? (
          <div className="text-sm text-muted-foreground">{title}</div>
        )}
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
      const [programsData, projectsData, adminsData] = await Promise.all([
        listPrograms({ page: 1, limit: PAGE_SIZE }),
        listProjects({ page: 1, limit: PAGE_SIZE }),
        listAdmins({ page: 1, limit: PAGE_SIZE }),
      ]);
      setData({
        programs: { total: programsData.total },
        projects: { total: projectsData.total },
        admins: { total: adminsData.total },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchData();
    }
  }, [authLoading]);

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
              <CardHeader>
                <CardDescription>Metric</CardDescription>
                <CardTitle className="font-heading text-2xl">
                  <Skeleton className="h-8 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {user.name}. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {error ? (
        <Card className="border-destructive/50">
          <CardContent className="flex items-center gap-3 py-4">
            <span className="text-destructive font-medium">Error</span>
            <span className="text-sm text-muted-foreground">{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Programs"
              value={isLoading ? "—" : data?.programs.total ?? 0}
              description="Total programmes available"
              action={
                isLoading
                  ? undefined
                  : data && (
                      <Link
                        href="/admin/programs"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Manage programs
                      </Link>
                    )
              }
            />
            <MetricCard
              title="Projects"
              value={isLoading ? "—" : data?.projects.total ?? 0}
              description="Total projects across all programs"
              action={
                isLoading
                  ? undefined
                  : data && (
                      <Link
                        href="/admin/projects"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Manage projects
                      </Link>
                    )
              }
            />
            <MetricCard
              title="Administrators"
              value={isLoading ? "—" : data?.admins.total ?? 0}
              description="Active admin accounts"
              action={
                isLoading
                  ? undefined
                  : userIsSuperAdmin &&
                    data && (
                      <Link
                        href="/admin/admins"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Manage admins
                      </Link>
                    )
              }
            />
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="font-heading">Quick actions</CardTitle>
              <CardDescription>
                Common administrative tasks based on your role.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/programs"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  View programs
                </Link>
                <Link
                  href="/admin/projects"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                  View projects
                </Link>
                <Link
                  href="/admin/media"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5"
                    />
                  </svg>
                  Upload media
                </Link>
                {userIsSuperAdmin && (
                  <Link
                    href="/admin/site-settings"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.42 15.17l-5.25 4.99a2 2 0 01-1.64 0l-1.41-1.41a2 2 0 010-2.83l2.83-2.83a2 2 0 012.83 0l3.54 3.53a2 2 0 010 2.83l-2.83 2.83a2 2 0 01-2.83 0l-1.41-1.41a2 2 0 010-2.83l5.25-4.99a2 2 0 012.83 0l3.53 3.54a2 2 0 010 2.83l-2.83 2.83a2 2 0 01-.75 0"
                      />
                    </svg>
                    Edit site settings
                  </Link>
                )}
                {userIsSuperAdmin && (
                  <Link
                    href="/admin/admins"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.124-1.352 4.125 4.125 0 00-7.533-2.053M15 19.128v-.003c0-1.113-.285-2.16-.765-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.004-.106M15 19.128a9.38 9.38 0 002.625-.372 9.337 9.337 0 004.124 1.352 4.125 4.125 0 00-7.533 2.053M12 6.302a4.125 4.125 0 00-4.125 4.125 4.125 4.125 0 004.125 4.125M12 6.302v12.376m12.376-24.752a4.125 4.125 0 00-4.125 4.125 4.125 4.125 0 004.125 4.125M3.375 20.625a4.125 4.125 0 004.125 4.125 4.125 4.125 0 004.125-4.125V20.625z"
                      />
                    </svg>
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
