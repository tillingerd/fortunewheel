import { beforeEach, describe, expect, it, vi } from "vitest";
import { dataRepository } from "@/lib/data";
import { __resetMemoryStoreForTests } from "@/lib/data/adapters/memory/memory-data-store";
import { spinForPlayer } from "@/lib/data/services/spinService";
import type { Game, Player, Prize } from "@/lib/types";

async function getSeededGame(): Promise<Game> {
  const game = await dataRepository.games.getByAccessCode("TEST01");
  if (!game) {
    throw new Error("Seed game TEST01 not found");
  }
  return game;
}

async function createPlayerForSpin(
  gameId: string,
  input: Partial<Omit<Player, "id" | "playedAt" | "gameId" | "email">> & { email: string },
) {
  return dataRepository.players.create({
    gameId,
    firstName: input.firstName ?? "Test",
    lastName: input.lastName ?? "Player",
    email: input.email,
    result: input.result,
    quizPassed: input.quizPassed ?? true,
    quizAttempts: input.quizAttempts ?? 1,
  });
}

describe("spinService", () => {
  beforeEach(() => {
    __resetMemoryStoreForTests();
    vi.restoreAllMocks();
  });

  it("returns ALREADY_SPUN and does not decrement stock when player already spun", async () => {
    const game = await getSeededGame();
    const player = await createPlayerForSpin(game.id, {
      email: "already@spin.test",
      result: null,
    });
    const prizesBefore = await dataRepository.prizes.listByGameId(game.id);

    const result = await spinForPlayer(dataRepository, {
      gameId: game.id,
      playerId: player.id,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected error result");
    }
    expect(result.code).toBe("ALREADY_SPUN");
    const prizesAfter = await dataRepository.prizes.listByGameId(game.id);
    expect(prizesAfter).toEqual(prizesBefore);
  });

  it("decrements selected prize stock by 1 on successful win", async () => {
    const game = await getSeededGame();
    await dataRepository.games.updateGame(game.id, { noWinChance: 0 });
    const player = await createPlayerForSpin(game.id, {
      email: "win@spin.test",
      result: undefined,
    });
    const prizesBefore = await dataRepository.prizes.listByGameId(game.id);
    const selectedPrizeBefore = prizesBefore[0] as Prize;

    vi.spyOn(Math, "random").mockReturnValue(0);
    const result = await spinForPlayer(dataRepository, {
      gameId: game.id,
      playerId: player.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || result.outcome !== "win") {
      throw new Error("Expected win result");
    }

    const prizesAfter = await dataRepository.prizes.listByGameId(game.id);
    const selectedPrizeAfter = prizesAfter.find((prize) => prize.id === selectedPrizeBefore.id);
    expect(selectedPrizeAfter?.stock).toBe(selectedPrizeBefore.stock - 1);
    expect(selectedPrizeAfter?.stock).toBeGreaterThanOrEqual(0);
  });

  it("does not award out-of-stock prizes and never drops stock below zero", async () => {
    const game = await getSeededGame();
    await dataRepository.games.updateGame(game.id, { noWinChance: 0 });
    const prizesBefore = await dataRepository.prizes.listByGameId(game.id);
    const firstPrize = prizesBefore[0] as Prize;
    const secondPrize = prizesBefore[1] as Prize;

    await dataRepository.prizes.upsert({ ...firstPrize, stock: 0 });
    await dataRepository.prizes.upsert({ ...secondPrize, stock: 1 });

    const player = await createPlayerForSpin(game.id, {
      email: "stock@spin.test",
      result: undefined,
    });
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = await spinForPlayer(dataRepository, {
      gameId: game.id,
      playerId: player.id,
    });

    expect(result.success).toBe(true);
    if (!result.success || result.outcome !== "win") {
      throw new Error("Expected win result");
    }
    expect(result.prize.id).toBe(secondPrize.id);

    const prizesAfter = await dataRepository.prizes.listByGameId(game.id);
    const firstAfter = prizesAfter.find((prize) => prize.id === firstPrize.id);
    const secondAfter = prizesAfter.find((prize) => prize.id === secondPrize.id);
    expect(firstAfter?.stock).toBe(0);
    expect(secondAfter?.stock).toBe(0);
    expect(prizesAfter.every((prize) => prize.stock >= 0)).toBe(true);
  });

  it("is race-safe: concurrent spins for same player only decrement stock once", async () => {
    const game = await getSeededGame();
    await dataRepository.games.updateGame(game.id, { noWinChance: 0 });
    const player = await createPlayerForSpin(game.id, {
      email: "race@spin.test",
      result: undefined,
    });
    const prizesBefore = await dataRepository.prizes.listByGameId(game.id);
    const totalStockBefore = prizesBefore.reduce((sum, prize) => sum + prize.stock, 0);

    vi.spyOn(Math, "random").mockReturnValue(0);
    const [first, second] = await Promise.all([
      spinForPlayer(dataRepository, { gameId: game.id, playerId: player.id }),
      spinForPlayer(dataRepository, { gameId: game.id, playerId: player.id }),
    ]);

    const results = [first, second];
    const successCount = results.filter((result) => result.success).length;
    const alreadySpunCount = results.filter(
      (result) => !result.success && result.code === "ALREADY_SPUN",
    ).length;

    expect(successCount).toBe(1);
    expect(alreadySpunCount).toBe(1);

    const prizesAfter = await dataRepository.prizes.listByGameId(game.id);
    const totalStockAfter = prizesAfter.reduce((sum, prize) => sum + prize.stock, 0);
    expect(totalStockBefore - totalStockAfter).toBeLessThanOrEqual(1);
  });
});

