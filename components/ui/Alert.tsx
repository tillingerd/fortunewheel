"use client";

type AlertProps = {
  message: string;
  tone?: "error" | "info";
};

export function Alert({ message, tone = "error" }: AlertProps) {
  const toneClass =
    tone === "error"
      ? "border-red-300 bg-red-50 text-red-700"
      : "border-zinc-300 bg-zinc-50 text-zinc-700";

  return (
    <div className={`rounded border px-3 py-2 text-sm ${toneClass}`}>
      {message}
    </div>
  );
}

