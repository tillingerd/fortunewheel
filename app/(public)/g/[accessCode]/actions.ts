"use server";

import { dataRepository } from "@/lib/data";
import {
  getQuizQuestionsForGame,
  validateQuizSubmission,
  type QuizQuestionView,
  type SubmittedQuizAnswer,
} from "@/lib/data/services/quizService";

export type RegisterPlayerInput = {
  accessCode: string;
  firstName: string;
  lastName: string;
  email: string;
  acceptTerms: boolean;
};

export type RegisterPlayerResult =
  | {
      success: true;
      playerId: string;
      quizQuestions: QuizQuestionView[];
    }
  | {
      success: false;
      errorCode: "VALIDATION_ERROR" | "EMAIL_ALREADY_PLAYED" | "GAME_UNAVAILABLE";
      message: string;
    };

export type SubmitQuizAnswersInput = {
  accessCode: string;
  playerId: string;
  answers: SubmittedQuizAnswer[];
};

export type SubmitQuizAnswersResult =
  | { success: true }
  | { success: false; reset: true };

export type SpinInput = {
  accessCode: string;
  playerId: string;
};

export type SpinResult =
  | {
      success: true;
      outcome: "win" | "noWin";
      prize?: { id: string; name: string };
    }
  | {
      success: false;
      errorCode: "GAME_UNAVAILABLE" | "PLAYER_NOT_FOUND";
      message: string;
    };

export async function registerPlayer(
  input: RegisterPlayerInput,
): Promise<RegisterPlayerResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();

  if (!firstName || !lastName || !email || !input.acceptTerms) {
    return {
      success: false,
      errorCode: "VALIDATION_ERROR",
      message: "Please complete all fields and accept the terms.",
    };
  }

  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game || !game.isActive) {
    return {
      success: false,
      errorCode: "GAME_UNAVAILABLE",
      message: "Game not found or inactive.",
    };
  }

  const existingPlayer = await dataRepository.players.getByEmail(game.id, email);
  if (existingPlayer) {
    return {
      success: false,
      errorCode: "EMAIL_ALREADY_PLAYED",
      message: "This email already played this game.",
    };
  }

  const player = await dataRepository.players.create({
    gameId: game.id,
    firstName,
    lastName,
    email,
    result: null,
    quizPassed: false,
    quizAttempts: 0,
  });

  const quizQuestions = await getQuizQuestionsForGame(dataRepository, game.id);

  return {
    success: true,
    playerId: player.id,
    quizQuestions,
  };
}

export async function submitQuizAnswers(
  input: SubmitQuizAnswersInput,
): Promise<SubmitQuizAnswersResult> {
  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game || !game.isActive) {
    return { success: false, reset: true };
  }

  const players = await dataRepository.players.listByGameId(game.id);
  const player = players.find((item) => item.id === input.playerId);
  if (!player) {
    return { success: false, reset: true };
  }

  const validation = await validateQuizSubmission(
    dataRepository,
    game.id,
    input.answers,
  );
  if (!validation.allCorrect) {
    await dataRepository.players.updateQuizStatus(player.id, false);
    return { success: false, reset: true };
  }

  await dataRepository.players.updateQuizStatus(player.id, true);
  return { success: true };
}

export async function spin(input: SpinInput): Promise<SpinResult> {
  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game || !game.isActive) {
    return {
      success: false,
      errorCode: "GAME_UNAVAILABLE",
      message: "Game not found or inactive.",
    };
  }

  const players = await dataRepository.players.listByGameId(game.id);
  const player = players.find((item) => item.id === input.playerId);
  if (!player) {
    return {
      success: false,
      errorCode: "PLAYER_NOT_FOUND",
      message: "Player not found.",
    };
  }

  const availablePrizes = (await dataRepository.prizes.listByGameId(game.id)).filter(
    (prize) => prize.stock > 0,
  );

  if (availablePrizes.length === 0 || Math.random() * 100 < game.noWinChance) {
    await dataRepository.players.setResult(player.id, null);
    return { success: true, outcome: "noWin" };
  }

  const selectedPrize =
    availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
  await dataRepository.prizes.upsert({
    ...selectedPrize,
    stock: selectedPrize.stock - 1,
    wonCount: selectedPrize.wonCount + 1,
  });
  await dataRepository.players.setResult(player.id, selectedPrize.id);

  return {
    success: true,
    outcome: "win",
    prize: {
      id: selectedPrize.id,
      name: selectedPrize.name,
    },
  };
}

// TODO: replace memory adapter usage with Firebase-backed repositories.
