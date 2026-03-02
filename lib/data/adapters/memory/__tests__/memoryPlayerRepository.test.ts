import { beforeEach, describe, expect, it } from "vitest";
import { dataRepository } from "@/lib/data";
import { __resetMemoryStoreForTests } from "@/lib/data/adapters/memory/memory-data-store";

describe("MemoryPlayerRepository.getById", () => {
  beforeEach(() => {
    __resetMemoryStoreForTests();
  });

  it("returns cloned player when found, and null when missing", async () => {
    const game = await dataRepository.games.getByAccessCode("TEST01");
    if (!game) {
      throw new Error("Expected seeded TEST01 game");
    }

    const created = await dataRepository.players.create({
      gameId: game.id,
      firstName: "Memory",
      lastName: "Tester",
      email: "memory@getbyid.test",
      result: undefined,
      quizPassed: false,
      quizAttempts: 0,
    });

    const found = await dataRepository.players.getById(created.id);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(created.id);

    if (!found) {
      throw new Error("Expected found player");
    }
    found.firstName = "Mutated";

    const afterMutation = await dataRepository.players.getById(created.id);
    expect(afterMutation?.firstName).toBe("Memory");

    const missing = await dataRepository.players.getById("missing-player-id");
    expect(missing).toBeNull();
  });
});

