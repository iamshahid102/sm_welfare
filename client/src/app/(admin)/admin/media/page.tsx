import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Media",
};

export default function AdminMediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Media library</h1>
        <p className="text-sm text-muted-foreground">
          Manage images uploaded through the Cloudinary media foundation.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Foundation placeholder</CardTitle>
          <CardDescription>Media management will be implemented in the admin phase.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Upload, browse and delete media assets here.
        </CardContent>
      </Card>
    </div>
  );
}
