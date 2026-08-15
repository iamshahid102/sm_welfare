import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to the SM Welfare admin panel.",
};

/**
 * Foundation placeholder. The real form (HttpOnly-cookie login flow) is
 * implemented in the authentication phase.
 */
export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center py-12">
      <Card>
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Foundation placeholder — authentication lands in the next phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@smwelfare.charity" disabled />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" disabled />
          </div>
          <Button disabled>Sign in</Button>
        </CardContent>
      </Card>
    </div>
  );
}
