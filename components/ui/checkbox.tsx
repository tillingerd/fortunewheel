"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-zinc-300 text-zinc-900 focus-visible:ring-zinc-800",
        className,
      )}
      {...props}
    />
  );
}

