import { describe, expect, it } from "vitest";
import { createGameInputSchema } from "@/lib/validation/admin";

describe("admin validation schemas", () => {
  it("fails when prizes array is empty", () => {
    const result = createGameInputSchema.safeParse({
      accessCode: "AB12CD",
      status: "draft",
      noWinChance: 30,
      prizes: [],
      quizQuestions: [
        {
          question: "Q1",
          answers: [
            { text: "A", correct: true },
            { text: "B", correct: false },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation failure");
    }
    expect(result.error.issues[0]?.message).toContain("At least one prize");
  });

  it("fails when noWinChance is outside 0-100", () => {
    const result = createGameInputSchema.safeParse({
      accessCode: "AB12CD",
      status: "draft",
      noWinChance: 101,
      prizes: [{ name: "Gift Card", stock: 2 }],
      quizQuestions: [
        {
          question: "Q1",
          answers: [
            { text: "A", correct: true },
            { text: "B", correct: false },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation failure");
    }
    expect(result.error.issues[0]?.message).toContain("between 0 and 100");
  });

  it("fails when accessCode is malformed", () => {
    const result = createGameInputSchema.safeParse({
      accessCode: "abc-12",
      status: "draft",
      noWinChance: 30,
      prizes: [{ name: "Gift Card", stock: 2 }],
      quizQuestions: [
        {
          question: "Q1",
          answers: [
            { text: "A", correct: true },
            { text: "B", correct: false },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected validation failure");
    }
    expect(result.error.issues[0]?.message).toContain("Access code must be 6 characters");
  });
});
