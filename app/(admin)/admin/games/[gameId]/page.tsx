import Link from "next/link";
import {
  getGameDetailAction,
  updateGameStatusAction,
  updatePrizeStockAction,
} from "./actions";
import type { GameStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type AdminGameDetailPageProps = {
  params: Promise<{
    gameId: string;
  }>;
};

export default async function AdminGameDetailPage({ params }: AdminGameDetailPageProps) {
  const { gameId } = await params;
  const detail = await getGameDetailAction(gameId);

  if (!detail.success) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-8">
        <h1 className="text-2xl font-semibold">Game Detail</h1>
        <p className="text-sm text-zinc-700">{detail.message}</p>
        <Link className="underline text-sm" href="/admin/games">
          Back to games
        </Link>
      </main>
    );
  }

  const prizeNameById = new Map(
    detail.prizes.map((prize) => [prize.id, prize.name] as const),
  );

  async function updateStatusAction(formData: FormData) {
    "use server";
    const nextStatus = String(formData.get("status") ?? "") as GameStatus;
    await updateGameStatusAction({
      gameId,
      status: nextStatus,
    });
  }

  async function updatePrizeStockFormAction(formData: FormData) {
    "use server";
    const prizeId = String(formData.get("prizeId") ?? "");
    const parsedStock = Number(formData.get("stock") ?? 0);
    const stock = Number.isFinite(parsedStock) ? parsedStock : 0;
    await updatePrizeStockAction({
      gameId,
      prizeId,
      stock,
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-8">
      <Link className="underline text-sm" href="/admin/games">
        Back to games
      </Link>

      <h1 className="text-2xl font-semibold">Game {detail.game.accessCode}</h1>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-3 text-lg font-medium">Game Settings</h2>
        <p className="mb-2">No-win chance: {detail.game.noWinChance}%</p>

        <form action={updateStatusAction} className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            Status
            <select
              className="rounded border px-3 py-2"
              name="status"
              defaultValue={detail.game.status}
            >
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="closed">closed</option>
            </select>
          </label>
          <button className="rounded border px-4 py-2" type="submit">
            Save status
          </button>
        </form>
      </section>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-3 text-lg font-medium">Prizes</h2>
        {detail.prizes.length === 0 ? (
          <p>No prizes configured.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border-b py-2">Prize</th>
                <th className="border-b py-2">Stock (remaining)</th>
                <th className="border-b py-2">PrizeId</th>
              </tr>
            </thead>
            <tbody>
              {detail.prizes.map((prize) => (
                <tr key={prize.id}>
                  <td className="border-b py-2">{prize.name}</td>
                  <td className="border-b py-2">
                    <form action={updatePrizeStockFormAction} className="flex items-center gap-2">
                      <input name="prizeId" type="hidden" value={prize.id} />
                      <input
                        className="w-24 rounded border px-2 py-1"
                        defaultValue={prize.stock}
                        min={0}
                        name="stock"
                        step={1}
                        type="number"
                      />
                      <button className="rounded border px-3 py-1" type="submit">
                        Save stock
                      </button>
                    </form>
                  </td>
                  <td className="border-b py-2 font-mono text-xs">{prize.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-3 text-lg font-medium">Players</h2>
        {detail.players.length === 0 ? (
          <p>No players yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="border-b py-2">playedAt</th>
                <th className="border-b py-2">name</th>
                <th className="border-b py-2">email</th>
                <th className="border-b py-2">quizAttempts</th>
                <th className="border-b py-2">quizPassed</th>
                <th className="border-b py-2">result</th>
              </tr>
            </thead>
            <tbody>
              {detail.players.map((player) => (
                <tr key={player.id}>
                  <td className="border-b py-2">{new Date(player.playedAt).toLocaleString()}</td>
                  <td className="border-b py-2">{`${player.firstName} ${player.lastName}`}</td>
                  <td className="border-b py-2">{player.email}</td>
                  <td className="border-b py-2">{player.quizAttempts}</td>
                  <td className="border-b py-2">{player.quizPassed ? "yes" : "no"}</td>
                  <td className="border-b py-2">
                    {player.result ? prizeNameById.get(player.result) ?? "no win" : "no win"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
