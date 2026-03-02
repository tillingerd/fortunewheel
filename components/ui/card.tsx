"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm", className)}
      {...props}
    />
  );
}

