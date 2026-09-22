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
import { BTN_PRIMARY_AMBER } from "@/components/shared/home-styles";
import { DONATE_HREF } from "@/constants/navigation";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation in a shadcn Sheet. The trigger is the only visible
 * affordance below 980px; above that the header renders Navigation directly.
 * The tap target is 44px (WCAG 2.5.5 minimum) rather than the shadcn icon
 * default of 32px, which is too small for thumbs.
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
            className="size-11 text-white hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/60"
          />
        }
        aria-label="Open menu"
      >
        <HiBars3 className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm gap-3">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Navigate the SM Welfare Trust website
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-6">
          <Navigation variant="mobile" onNavigate={() => setOpen(false)} />
          <Link
            href={DONATE_HREF}
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), BTN_PRIMARY_AMBER, "w-full")}
          >
            Donate now
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
