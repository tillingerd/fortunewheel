"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataRepository } from "@/lib/data";
import {
  createGameWithContent,
  listGamesForAdmin,
  type CreateGameInput,
} from "@/lib/data/services/gameBuilderService";

export async function listGamesAction() {
  return listGamesForAdmin(dataRepository);
}

export async function createGameAction(input: CreateGameInput) {
  try {
    await createGameWithContent(dataRepository, input);
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : "Failed to create game.",
    };
  }

  revalidatePath("/admin/games");
  redirect("/admin/games");
}
