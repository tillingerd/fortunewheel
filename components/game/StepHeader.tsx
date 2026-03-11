"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STEPS = ["registration", "quiz", "spin"] as const;

function getCurrentIndex(step: "registration" | "quiz" | "quizComplete" | "spin") {
  return step === "registration" ? 0 : step === "spin" ? 2 : 1;
}

export function StepHeader({
  accessCode,
  step,
}: {
  accessCode: string;
  step: "registration" | "quiz" | "quizComplete" | "spin";
}) {
  const currentIndex = getCurrentIndex(step);

  return (
    <header className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm shadow-zinc-200/80 sm:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">Fortune Wheel</h1>
        <Badge className="font-mono text-[11px] uppercase tracking-tight">Code: {accessCode}</Badge>
      </div>
      <Separator className="my-3" />
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-500">
        {STEPS.map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px]",
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

export function MiniStepHeader({
  accessCode,
  step,
}: {
  accessCode: string;
  step: "registration" | "quiz" | "quizComplete" | "spin";
}) {
  const currentIndex = getCurrentIndex(step);
  const label = STEPS[currentIndex] ?? "quiz";

  return (
    <div className="flex items-center justify-between rounded-full border border-zinc-200 bg-white/95 px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-600 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 text-[10px] text-white">
          {currentIndex + 1}
        </span>
        <span className="text-zinc-800">{label}</span>
      </div>
      <Badge className="font-mono text-[10px] uppercase tracking-tight">Code: {accessCode}</Badge>
    </div>
  );
}
