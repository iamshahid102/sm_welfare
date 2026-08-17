"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
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

interface MobileNavigationProps {
  /** Style the trigger for the blue overlay header. */
  light?: boolean;
}

/**
 * Mobile navigation in a shadcn Sheet. The trigger is the only visible
 * affordance below lg; desktop uses Navigation directly.
 */
export function MobileNavigation({ light }: MobileNavigationProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant={light ? "outline" : "outline"}
            size="icon"
            className={light ? "border-white/40 text-white hover:bg-white/10 hover:text-white" : undefined}
          />
        }
        aria-label="Open menu"
      >
        <Menu aria-hidden="true" />
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
          <a
            href={DONATE_HREF}
            onClick={() => setOpen(false)}
            className={cn(buttonVariants(), "mt-2")}
          >
            Donate now
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
