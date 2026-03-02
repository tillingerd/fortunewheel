"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ResultCard } from "@/components/game/ResultCard";
import { Wheel } from "@/components/game/Wheel";

type SpinPanelProps = {
  resultMessage: string;
  onSpin: () => void | Promise<void>;
  disabled?: boolean;
  isSpinning?: boolean;
  note?: string;
  outcome?: "win" | "noWin" | "outOfStock" | null;
  reducedMotion?: boolean;
};

export function SpinPanel({
  resultMessage,
  onSpin,
  disabled = false,
  isSpinning = false,
  note,
  outcome = null,
  reducedMotion = false,
}: SpinPanelProps) {
  return (
    <Card className="text-sm">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900">Step 3: Spin</h2>
      <Wheel isSpinning={isSpinning} outcome={outcome} reducedMotion={reducedMotion} />
      <div className="mt-4">
        <Button onClick={onSpin} disabled={disabled}>
          {isSpinning ? "Spinning..." : "Spin"}
        </Button>
      </div>
      <div className="mt-3">
        <ResultCard message={resultMessage} outcome={outcome} />
      </div>
      {note ? <p className="mt-2 text-xs text-zinc-600">{note}</p> : null}
    </Card>
  );
}
