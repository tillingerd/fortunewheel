"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-800",
        variant === "outline" && "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50",
        variant === "ghost" && "text-zinc-700 hover:bg-zinc-100",
        className,
      )}
      {...props}
    />
  );
}

