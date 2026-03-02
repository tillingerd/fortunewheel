"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataRepository } from "@/lib/data";
import {
  getGameDetailForAdmin,
  updateGameStatusForAdmin,
  updatePrizeStockForAdmin,
} from "@/lib/data/services/gameBuilderService";
import {
  formatValidationError,
  updateGameStatusInputSchema,
  updatePrizeStockInputSchema,
} from "@/lib/validation/admin";

export type GameDetailResult =
  | {
      success: true;
      game: NonNullable<Awaited<ReturnType<typeof getGameDetailForAdmin>>>["game"];
      prizes: NonNullable<Awaited<ReturnType<typeof getGameDetailForAdmin>>>["prizes"];
      quizQuestions: NonNullable<
        Awaited<ReturnType<typeof getGameDetailForAdmin>>
      >["quizQuestions"];
      players: NonNullable<Awaited<ReturnType<typeof getGameDetailForAdmin>>>["players"];
    }
  | {
      success: false;
      message: string;
    };

export async function getGameDetailAction(gameId: string): Promise<GameDetailResult> {
  const detail = await getGameDetailForAdmin(dataRepository, gameId);
  if (!detail) {
    return {
      success: false,
      message: "Game not found.",
    };
  }

  return {
    success: true,
    game: detail.game,
    prizes: detail.prizes,
    quizQuestions: detail.quizQuestions,
    players: detail.players,
  };
}

export async function updateGameStatusAction(input: {
  gameId: string;
  status: string;
}): Promise<{ success: false; code: "VALIDATION_ERROR" | "NOT_FOUND"; message: string } | never> {
  const parsed = updateGameStatusInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: formatValidationError(parsed.error),
    };
  }

  const updated = await updateGameStatusForAdmin(dataRepository, parsed.data);
  if (!updated) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Game not found.",
    };
  }

  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${parsed.data.gameId}`);
  redirect(`/admin/games/${parsed.data.gameId}`);
}

export async function updatePrizeStockAction(input: {
  gameId: string;
  prizeId: string;
  stock: number;
}): Promise<{ success: false; code: "VALIDATION_ERROR" | "NOT_FOUND"; message: string } | never> {
  const parsed = updatePrizeStockInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: formatValidationError(parsed.error),
    };
  }

  const updated = await updatePrizeStockForAdmin(dataRepository, parsed.data);
  if (!updated) {
    return {
      success: false,
      code: "NOT_FOUND",
      message: "Prize not found.",
    };
  }

  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${parsed.data.gameId}`);
  redirect(`/admin/games/${parsed.data.gameId}`);
}
