import Link from "next/link";
import { listGamesAction } from "@/app/(admin)/admin/games/actions";

export const dynamic = "force-dynamic";

export default async function AdminGamesPage() {
  const games = await listGamesAction();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Game Builder</h1>
      <div>
        <Link className="underline" href="/admin/games/new">
          Create new game
        </Link>
      </div>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-3 text-lg font-medium">Games</h2>
        {games.length === 0 ? (
          <p>No games yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border-b py-2">Access Code</th>
                <th className="border-b py-2">Status</th>
                <th className="border-b py-2">Players</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => (
                <tr key={game.id}>
                  <td className="border-b py-2 font-mono">
                    <Link className="underline" href={`/admin/games/${game.id}`}>
                      {game.accessCode}
                    </Link>
                  </td>
                  <td className="border-b py-2">{game.status}</td>
                  <td className="border-b py-2">{game.playersCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
