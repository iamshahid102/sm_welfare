import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Projects",
};

export default function AdminProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground">
          Manage the projects shown on the public Projects page.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Foundation placeholder</CardTitle>
          <CardDescription>Projects CRUD will be implemented in the admin phase.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          List, create, edit and archive projects here.
        </CardContent>
      </Card>
    </div>
  );
}
