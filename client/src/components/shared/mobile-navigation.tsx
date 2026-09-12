"use client";

import { useState } from "react";
import Link from "next/link";
import { HiBars3 } from "react-icons/hi2";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Navigation } from "@/components/shared/navigation";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation in a shadcn Sheet. The trigger is the only visible
 * affordance below lg; desktop uses Navigation directly.
 */
export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
          />
        }
        aria-label="Open menu"
      >
        <HiBars3 aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate the SM Welfare Trust website
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-6">
          <Navigation
            className="[&_ul]:flex-col [&_ul]:items-stretch"
            onNavigate={() => setOpen(false)}
          />
          <Link
            href={DONATE_HREF}
            onClick={() => setOpen(false)}
            className={cn(
              buttonVariants(),
              "mt-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90",
            )}
          >
            Donate now
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
