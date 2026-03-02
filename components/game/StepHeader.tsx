"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STEPS = ["registration", "quiz", "spin"] as const;

export function StepHeader({
  accessCode,
  step,
}: {
  accessCode: string;
  step: "registration" | "quiz" | "quizComplete" | "spin";
}) {
  const currentIndex =
    step === "registration" ? 0 : step === "spin" ? 2 : 1;

  return (
    <header className="rounded-2xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Fortune Wheel</h1>
        <Badge className="font-mono">Code: {accessCode}</Badge>
      </div>
      <Separator className="my-4" />
      <div className="grid grid-cols-3 gap-2 text-xs uppercase tracking-wide text-zinc-500">
        {STEPS.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                index <= currentIndex
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 bg-white text-zinc-500",
              )}
            >
              {index + 1}
            </span>
            <span className={cn(index <= currentIndex ? "text-zinc-800" : "")}>{item}</span>
          </div>
        ))}
      </div>
    </header>
  );
}

