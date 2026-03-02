"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataRepository } from "@/lib/data";
import {
  getGameDetailForAdmin,
  updateGameStatusForAdmin,
} from "@/lib/data/services/gameBuilderService";
import type { GameStatus } from "@/lib/types";

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
  status: GameStatus;
}): Promise<{ success: false; message: string } | never> {
  const updated = await updateGameStatusForAdmin(dataRepository, input);
  if (!updated) {
    return {
      success: false,
      message: "Game not found.",
    };
  }

  revalidatePath("/admin/games");
  revalidatePath(`/admin/games/${input.gameId}`);
  redirect(`/admin/games/${input.gameId}`);
}

