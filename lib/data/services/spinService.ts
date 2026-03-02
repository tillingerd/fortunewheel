import type { DataRepository } from "@/lib/data/repositories";

export type SpinInput = {
  gameId: string;
  playerId: string;
};

export type SpinServiceResult =
  | {
      success: true;
      outcome: "win";
      prize: { id: string; name: string };
    }
  | {
      success: true;
      outcome: "noWin";
    }
  | {
      success: true;
      outcome: "outOfStock";
    }
  | {
      success: false;
      code: "PLAYER_NOT_FOUND" | "QUIZ_NOT_PASSED" | "ALREADY_SPUN";
      message: string;
    };

const playerSpinLocks = new Set<string>();

async function withPlayerLock<T>(playerId: string, callback: () => Promise<T>): Promise<T> {
  while (playerSpinLocks.has(playerId)) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }

  playerSpinLocks.add(playerId);
  try {
    return await callback();
  } finally {
    playerSpinLocks.delete(playerId);
  }
}

export async function spinForPlayer(
  repository: DataRepository,
  input: SpinInput,
): Promise<SpinServiceResult> {
  return withPlayerLock(input.playerId, async () => {
    const player = await repository.players.getById(input.playerId);
    if (!player || player.gameId !== input.gameId) {
      return {
        success: false,
        code: "PLAYER_NOT_FOUND",
        message: "Player not found.",
      };
    }

    if (!player.quizPassed) {
      return {
        success: false,
        code: "QUIZ_NOT_PASSED",
        message: "Complete the quiz before spinning.",
      };
    }

    if (player.result !== undefined) {
      return {
        success: false,
        code: "ALREADY_SPUN",
        message: "You already spun the wheel.",
      };
    }

    const game = await repository.games.getById(input.gameId);
    if (!game) {
      return {
        success: false,
        code: "PLAYER_NOT_FOUND",
        message: "Player not found.",
      };
    }

    const availablePrizes = (await repository.prizes.listByGameId(input.gameId)).filter(
      (prize) => prize.stock > 0,
    );
    if (availablePrizes.length === 0) {
      await repository.players.setResult(player.id, null);
      return { success: true, outcome: "outOfStock" };
    }

    const noWinRoll = Math.random() * 100 < game.noWinChance;
    if (noWinRoll) {
      await repository.players.setResult(player.id, null);
      return { success: true, outcome: "noWin" };
    }

    const selectedPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
    await repository.prizes.upsert({
      ...selectedPrize,
      stock: selectedPrize.stock - 1,
      wonCount: selectedPrize.wonCount + 1,
    });
    await repository.players.setResult(player.id, selectedPrize.id);

    return {
      success: true,
      outcome: "win",
      prize: {
        id: selectedPrize.id,
        name: selectedPrize.name,
      },
    };
  });
}
