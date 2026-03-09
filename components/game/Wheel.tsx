"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function Wheel({
  isSpinning,
  outcome,
  reducedMotion,
  onSpinStart,
}: {
  isSpinning: boolean;
  outcome: "win" | "noWin" | "outOfStock" | null;
  reducedMotion: boolean;
  onSpinStart?: () => void;
}) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const prevSpinning = useRef<boolean>(false);
  const spinningAnimationRef = useRef<Animation | null>(null);
  const settleAnimationRef = useRef<Animation | null>(null);
  const currentRotationRef = useRef<number>(0);
  const [renderRotation, setRenderRotation] = useState<number>(0);

  const outcomeOffset = useMemo(() => {
    if (outcome === "win") {
      return 36;
    }
    return 216;
  }, [outcome]);

  const getCurrentRotation = (): number => {
    const element = wheelRef.current;
    if (!element) {
      return currentRotationRef.current;
    }

    const transform = window.getComputedStyle(element).transform;
    if (!transform || transform === "none") {
      return currentRotationRef.current;
    }

    const matrixMatch = transform.match(/matrix\(([^)]+)\)/);
    if (!matrixMatch) {
      return currentRotationRef.current;
    }

    const values = matrixMatch[1]?.split(",").map((value) => Number(value.trim()));
    if (!values || values.length < 2 || Number.isNaN(values[0]) || Number.isNaN(values[1])) {
      return currentRotationRef.current;
    }

    const angle = Math.atan2(values[1], values[0]) * (180 / Math.PI);
    const normalized = angle < 0 ? angle + 360 : angle;
    const baseTurns = Math.floor(currentRotationRef.current / 360) * 360;
    return baseTurns + normalized;
  };

  useEffect(() => {
    const wheelElement = wheelRef.current;
    if (!wheelElement) {
      return;
    }

    if (isSpinning && !prevSpinning.current) {
      onSpinStart?.();
      if (reducedMotion) {
        prevSpinning.current = true;
        return;
      }

      settleAnimationRef.current?.cancel();
      settleAnimationRef.current = null;

      const from = currentRotationRef.current;
      spinningAnimationRef.current?.cancel();
      spinningAnimationRef.current = wheelElement.animate(
        [
          { transform: `rotate(${from}deg)` },
          { transform: `rotate(${from + 360}deg)` },
        ],
        {
          duration: 900,
          easing: "linear",
          iterations: Infinity,
          fill: "forwards",
        },
      );
    }

    if (!isSpinning && prevSpinning.current && outcome !== null) {
      if (reducedMotion) {
        currentRotationRef.current = currentRotationRef.current + outcomeOffset;
        setRenderRotation(currentRotationRef.current);
        prevSpinning.current = false;
        return;
      }

      currentRotationRef.current = getCurrentRotation();

      if (spinningAnimationRef.current) {
        spinningAnimationRef.current.commitStyles?.();
        spinningAnimationRef.current.cancel();
        spinningAnimationRef.current = null;
      }

      const start = currentRotationRef.current;
      const target = start + 6 * 360 + outcomeOffset;
      const overshoot = target + 8;

      settleAnimationRef.current?.cancel();
      settleAnimationRef.current = wheelElement.animate(
        [
          { transform: `rotate(${start}deg)` },
          { transform: `rotate(${overshoot}deg)`, offset: 0.93 },
          { transform: `rotate(${target}deg)` },
        ],
        {
          duration: 4800,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
          fill: "forwards",
        },
      );

      settleAnimationRef.current.onfinish = () => {
        currentRotationRef.current = target;
        setRenderRotation(target);
      };
    }

    prevSpinning.current = isSpinning;
  }, [isSpinning, onSpinStart, outcome, outcomeOffset, reducedMotion]);

  useEffect(() => {
    return () => {
      spinningAnimationRef.current?.cancel();
      settleAnimationRef.current?.cancel();
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="mx-auto mb-2 h-0 w-0 border-l-[10px] border-r-[10px] border-b-[16px] border-l-transparent border-r-transparent border-b-zinc-900" />
      <div className="relative mx-auto h-64 w-full max-w-[320px] sm:h-72">
        <div
          ref={wheelRef}
          className="absolute inset-0 rounded-full border-[10px] border-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]"
          style={{
            transform: `rotate(${renderRotation}deg)`,
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
