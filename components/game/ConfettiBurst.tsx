"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiBurst({
  triggerKey,
  disabled,
}: {
  triggerKey: string;
  disabled: boolean;
}) {
  useEffect(() => {
    if (!triggerKey || disabled) {
      return;
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [triggerKey, disabled]);

  return null;
}

