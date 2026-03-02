import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/telemetry/events", () => ({
  trackEvent: vi.fn(),
}));

import { registerPlayer, spin } from "@/app/(public)/g/[accessCode]/actions";
import { dataRepository } from "@/lib/data";
import { __resetMemoryStoreForTests } from "@/lib/data/adapters/memory/memory-data-store";
import { trackEvent } from "@/lib/telemetry/events";

describe("public actions telemetry", () => {
  beforeEach(() => {
    __resetMemoryStoreForTests();
    vi.clearAllMocks();
  });

  it("tracks register attempt and success events", async () => {
    const result = await registerPlayer({
      accessCode: "TEST01",
      firstName: "Test",
      lastName: "User",
      email: "telemetry-register@test.dev",
      acceptTerms: true,
    });

    expect(result.success).toBe(true);
    const trackEventMock = vi.mocked(trackEvent);
    const eventNames = trackEventMock.mock.calls.map(([event]) => event.name);

    expect(eventNames).toContain("public.register.attempt");
    expect(eventNames).toContain("public.register.success");
  });

  it("tracks spin attempt and result events", async () => {
    const game = await dataRepository.games.getByAccessCode("TEST01");
    if (!game) {
      throw new Error("Seed game TEST01 not found");
    }

    const player = await dataRepository.players.create({
      gameId: game.id,
      firstName: "Spin",
      lastName: "Tester",
      email: "telemetry-spin@test.dev",
      result: undefined,
      quizPassed: true,
      quizAttempts: 1,
    });

    const result = await spin({
      accessCode: "TEST01",
      playerId: player.id,
    });

    expect(result.success).toBe(true);
    const trackEventMock = vi.mocked(trackEvent);
    const eventNames = trackEventMock.mock.calls.map(([event]) => event.name);

    expect(eventNames).toContain("public.spin.attempt");
    expect(eventNames).toContain("public.spin.result");
  });
});
