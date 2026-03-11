"use client";

import { Card } from "@/components/ui/card";

type ResultCardProps = {
  message: string;
  outcome?: "win" | "noWin" | "outOfStock" | null;
};

function getResultLabel(outcome?: ResultCardProps["outcome"]): string {
  if (outcome === "win") {
    return "WIN";
  }
  if (outcome === "outOfStock") {
    return "OUT OF STOCK";
  }
  if (outcome === "noWin") {
    return "NO WIN";
  }
  return "RESULT";
}

export function ResultCard({ message, outcome = null }: ResultCardProps) {
  if (!message) {
    return null;
  }

  return (
    <Card className="border-zinc-300 bg-zinc-50 p-3 sm:p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-800">
        {getResultLabel(outcome)}
      </p>
      <p className="mt-1 text-sm font-semibold text-zinc-900">{message}</p>
    </Card>
  );
}
