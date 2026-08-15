import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Site Settings",
};

export default function AdminSiteSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Site settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage organisation information shown across the website.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Foundation placeholder</CardTitle>
          <CardDescription>
            Site settings CRUD will be implemented in the admin phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Contact details, social links, hero content and other editable values
          will appear here.
        </CardContent>
      </Card>
    </div>
  );
}
