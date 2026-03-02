"use client";

type SpinPanelProps = {
  resultMessage: string;
  onSpin: () => void | Promise<void>;
  disabled?: boolean;
  isSpinning?: boolean;
  note?: string;
};

export function SpinPanel({
  resultMessage,
  onSpin,
  disabled = false,
  isSpinning = false,
  note,
}: SpinPanelProps) {
  return (
    <section className="rounded border p-4 text-sm">
      <h2 className="mb-2 text-lg font-medium">Step 3: Spin</h2>
      <button
        className="rounded border px-4 py-2 disabled:opacity-50"
        type="button"
        onClick={onSpin}
        disabled={disabled}
      >
        {isSpinning ? "Spinning..." : "Spin"}
      </button>
      {resultMessage ? (
        <div className="mt-3 rounded border bg-zinc-50 px-3 py-2">
          <p>{resultMessage}</p>
        </div>
      ) : null}
      {note ? <p className="mt-2 text-xs text-zinc-600">{note}</p> : null}
    </section>
  );
}
