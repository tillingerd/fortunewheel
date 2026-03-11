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
    <Card className="p-4 text-sm sm:p-5">
      <h2 className="mb-2 text-base font-semibold uppercase tracking-tight text-zinc-900 sm:text-lg">
        Step 3: Spin
      </h2>
      <div className="mt-2 sm:mt-3">
        <Wheel isSpinning={isSpinning} outcome={outcome} reducedMotion={reducedMotion} />
      </div>
      <div className="mt-3 sm:mt-4">
        <Button className="w-full sm:w-auto" onClick={onSpin} disabled={disabled}>
          {isSpinning ? "Spinning..." : "Spin"}
        </Button>
      </div>
      <div className="mt-3 sm:mt-4">
        <ResultCard message={resultMessage} outcome={outcome} />
      </div>
      {note ? <p className="mt-2 text-xs text-zinc-600">{note}</p> : null}
    </Card>
  );
}
