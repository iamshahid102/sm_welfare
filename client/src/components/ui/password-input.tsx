"use client";

import * as React from "react";
import { HiEye, HiEyeSlash } from "react-icons/hi2";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputProps extends React.ComponentProps<"input"> {
  /** Whether the password should start visible. Defaults to hidden. */
  defaultVisible?: boolean;
}

/**
 * Password input with a show/hide toggle button.
 *
 * Drop-in replacement for `Input type="password"` — all input props
 * (id, name, value, onChange, autoComplete, required, disabled, …) pass
 * through unchanged, so existing form logic and layout are untouched.
 */
function PasswordInput({
  className,
  defaultVisible = false,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(defaultVisible);

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
        disabled={disabled}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((prev) => !prev)}
        className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <HiEyeSlash /> : <HiEye />}
      </Button>
    </div>
  );
}

export { PasswordInput };