import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <p className="text-sm text-zinc-700">Minimal admin tools for game setup.</p>
      <Link className="underline" href="/admin/games">
        Open Game Builder
      </Link>
    </main>
  );
}
