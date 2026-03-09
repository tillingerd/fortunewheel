"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PublicShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "relative min-h-[100dvh] overflow-hidden bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 pb-[calc(env(safe-area-inset-bottom,1rem)+2.5rem)] pt-8 sm:px-6 sm:pt-10 sm:pb-[calc(env(safe-area-inset-bottom,1rem)+3rem)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_20%_10%,rgba(120,119,198,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.12),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-4 sm:gap-5">{children}</div>
    </main>
  );
}
