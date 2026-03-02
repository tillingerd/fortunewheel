import { beforeEach, describe, expect, it } from "vitest";
import { dataRepository } from "@/lib/data";
import { __resetMemoryStoreForTests } from "@/lib/data/adapters/memory/memory-data-store";
import { updatePrizeStockForAdmin } from "@/lib/data/services/gameBuilderService";

describe("gameBuilderService", () => {
  beforeEach(() => {
    __resetMemoryStoreForTests();
  });

  it("persists updated prize stock for admin game detail edits", async () => {
    const game = await dataRepository.games.getByAccessCode("TEST01");
    if (!game) {
      throw new Error("Seed game TEST01 not found");
    }
    const prizes = await dataRepository.prizes.listByGameId(game.id);
    const firstPrize = prizes[0];
    if (!firstPrize) {
      throw new Error("Seed prize not found");
    }

    const updated = await updatePrizeStockForAdmin(dataRepository, {
      gameId: game.id,
      prizeId: firstPrize.id,
      stock: 9,
    });

    expect(updated).toBe(true);
    const refreshed = await dataRepository.prizes.getById(firstPrize.id);
    expect(refreshed?.stock).toBe(9);
  });
});
