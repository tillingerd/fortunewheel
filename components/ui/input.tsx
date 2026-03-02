"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800",
        className,
      )}
      {...props}
    />
  );
}

