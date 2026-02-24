import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">FortuneWheel MVP</h1>
      <p className="text-sm text-zinc-700">
        MVP scaffold for public game flow and admin area.
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <Link className="underline" href="/g/ABC123">
          Open sample public game route
        </Link>
        <Link className="underline" href="/admin/login">
          Open admin login route
        </Link>
        <Link className="underline" href="/admin">
          Open admin dashboard route
        </Link>
      </div>
    </main>
  );
}
