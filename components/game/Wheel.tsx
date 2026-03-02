"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function Wheel({
  isSpinning,
  outcome,
  reducedMotion,
  onSpinStart,
}: {
  isSpinning: boolean;
  outcome: "win" | "noWin" | null;
  reducedMotion: boolean;
  onSpinStart?: () => void;
}) {
  const settleRotation =
    outcome === null ? 0 : outcome === "win" ? 1080 + 36 : 1080 + 216;
  const prevSpinning = useRef(false);

  useEffect(() => {
    if (isSpinning && !prevSpinning.current) {
      onSpinStart?.();
    }
    prevSpinning.current = isSpinning;
  }, [isSpinning, onSpinStart]);

  const wheelClass =
    isSpinning && !reducedMotion
      ? "animate-[spin_1s_linear_infinite]"
      : "transition-transform duration-[1400ms] ease-out";

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="mx-auto mb-2 h-0 w-0 border-l-[10px] border-r-[10px] border-b-[16px] border-l-transparent border-r-transparent border-b-zinc-900" />
      <div className="relative mx-auto h-72 w-72">
        <div
          className={cn(
            "absolute inset-0 rounded-full border-[10px] border-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]",
            wheelClass,
          )}
          style={{
            transform:
              reducedMotion || isSpinning ? undefined : `rotate(${settleRotation}deg)`,
            background:
              "conic-gradient(from 0deg,#111827 0 60deg,#1f2937 60deg 120deg,#334155 120deg 180deg,#475569 180deg 240deg,#64748b 240deg 300deg,#94a3b8 300deg 360deg)",
          }}
        />
        <div className="absolute inset-[22%] rounded-full bg-white/90 shadow-inner" />
        <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900" />
      </div>
    </div>
  );
}
