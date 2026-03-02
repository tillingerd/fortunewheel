"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dataRepository } from "@/lib/data";
import {
  createGameWithContent,
  listGamesForAdmin,
  type CreateGameInput,
} from "@/lib/data/services/gameBuilderService";
import { createGameInputSchema, formatValidationError } from "@/lib/validation/admin";

export async function listGamesAction() {
  return listGamesForAdmin(dataRepository);
}

export async function createGameAction(input: CreateGameInput): Promise<
  | {
      success: false;
      code: "VALIDATION_ERROR" | "CREATE_FAILED";
      message: string;
    }
  | never
> {
  const parsed = createGameInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: formatValidationError(parsed.error),
    };
  }

  try {
    await createGameWithContent(dataRepository, parsed.data);
  } catch (error) {
    return {
      success: false,
      code: "CREATE_FAILED",
      message: error instanceof Error ? error.message : "Failed to create game.",
    };
  }

  revalidatePath("/admin/games");
  redirect("/admin/games");
}
