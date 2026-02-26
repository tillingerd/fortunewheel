import type { DataRepository } from "@/lib/data/repositories";

export type SpinInput = {
  gameId: string;
  playerId: string;
};

export type SpinResult = {
  didWin: boolean;
  message: string;
  prizeId: string | null;
};

export async function spinForPlayer(
  repository: DataRepository,
  input: SpinInput,
): Promise<SpinResult> {
  const game = await repository.games.getById(input.gameId);
  if (!game) {
    return {
      didWin: false,
      message: "Game not found.",
      prizeId: null,
    };
  }

  const availablePrizes = (await repository.prizes.listByGameId(input.gameId)).filter(
    (prize) => prize.stock > 0,
  );
  const noWinRoll = Math.random() * 100 < game.noWinChance;

  if (noWinRoll || availablePrizes.length === 0) {
    await repository.players.setResult(input.playerId, null);
    return {
      didWin: false,
      message: "No win this time.",
      prizeId: null,
    };
  }

  const selectedPrize =
    availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
  await repository.prizes.upsert({
    ...selectedPrize,
    stock: selectedPrize.stock - 1,
    wonCount: selectedPrize.wonCount + 1,
  });
  await repository.players.setResult(input.playerId, selectedPrize.id);

  return {
    didWin: true,
    message: "You won a prize!",
    prizeId: selectedPrize.id,
  };
}
