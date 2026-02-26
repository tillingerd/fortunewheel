"use client";

type SpinPanelProps = {
  resultMessage: string;
  onSpin: () => void | Promise<void>;
};

export function SpinPanel({ resultMessage, onSpin }: SpinPanelProps) {
  return (
    <section className="rounded border p-4 text-sm">
      <h2 className="mb-2 text-lg font-medium">Step 3: Spin</h2>
      <button className="rounded border px-4 py-2" type="button" onClick={onSpin}>
        Spin
      </button>
      {resultMessage ? <p className="mt-3">{resultMessage}</p> : null}
    </section>
  );
}
