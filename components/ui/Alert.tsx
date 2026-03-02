"use client";

import { cn } from "@/lib/utils";

type AlertProps = {
  message: string;
  tone?: "error" | "info";
};

export function Alert({ message, tone = "error" }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm shadow-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-700",
      )}
      role="status"
    >
      {message}
    </div>
  );
}
