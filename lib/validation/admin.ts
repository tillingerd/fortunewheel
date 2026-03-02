import { z } from "zod";

const gameStatusSchema = z.enum(["draft", "active", "closed"]);

export const createGameInputSchema = z.object({
  accessCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6}$/, "Access code must be 6 characters (A-Z, 0-9)."),
  status: gameStatusSchema,
  noWinChance: z
    .number("No-win chance must be a number.")
    .int("No-win chance must be an integer.")
    .min(0, "No-win chance must be between 0 and 100.")
    .max(100, "No-win chance must be between 0 and 100."),
  prizes: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Prize name is required."),
        stock: z
          .number("Prize stock must be a number.")
          .int("Prize stock must be an integer.")
          .min(0, "Prize stock cannot be negative."),
        imageUrl: z.string().optional(),
      }),
    )
    .min(1, "At least one prize is required."),
  quizQuestions: z
    .array(
      z.object({
        question: z.string().trim().min(1, "Question text is required."),
        answers: z
          .array(
            z.object({
              text: z.string().trim().min(1, "Answer text is required."),
              correct: z.boolean(),
            }),
          )
          .min(2, "Each question must have at least 2 answers."),
      }),
    )
    .min(1, "At least one quiz question is required."),
});

export const updatePrizeStockInputSchema = z.object({
  gameId: z.string().trim().min(1, "Game id is required."),
  prizeId: z.string().trim().min(1, "Prize id is required."),
  stock: z
    .number("Stock must be a number.")
    .int("Stock must be an integer.")
    .min(0, "Stock cannot be negative."),
});

export const updateGameStatusInputSchema = z.object({
  gameId: z.string().trim().min(1, "Game id is required."),
  status: gameStatusSchema,
});

export type CreateGameInputValidated = z.infer<typeof createGameInputSchema>;
export type UpdatePrizeStockInputValidated = z.infer<typeof updatePrizeStockInputSchema>;
export type UpdateGameStatusInputValidated = z.infer<typeof updateGameStatusInputSchema>;

export function formatValidationError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message ?? "Invalid input.";
}
