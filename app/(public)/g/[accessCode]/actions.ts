"use server";

import { dataRepository } from "@/lib/data";
import {
  getQuizQuestionsForGame,
  submitQuizForPlayer,
  type QuizQuestionView,
  type SubmittedQuizAnswer,
} from "@/lib/data/services/quizService";
import { spinForPlayer } from "@/lib/data/services/spinService";
import { trackEvent } from "@/lib/telemetry/events";
import type { Game, Player } from "@/lib/types";

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

export type SubmitQuizAnswersResult = | { success: true } | { success: false; reset: true };

export type SpinInput = {
  accessCode: string;
  playerId: string;
};

export type SpinResult =
  | {
      success: true;
      outcome: "win" | "noWin" | "outOfStock";
      prize?: { id: string; name: string };
    }
  | {
      success: false;
      code: "GAME_UNAVAILABLE" | "PLAYER_NOT_FOUND" | "ALREADY_SPUN" | "QUIZ_NOT_PASSED";
      message: string;
      existingResult?: ExistingResult;
    };

export type GetPlayerStateInput = {
  accessCode: string;
  playerId: string;
};

export type GetPlayerStateResult =
  | {
      success: true;
      game: Pick<Game, "id" | "accessCode" | "status" | "noWinChance">;
      player: Pick<Player, "id" | "quizPassed" | "quizAttempts" | "result">;
      quizQuestions: QuizQuestionView[];
      existingResult?: {
        outcome: "win" | "noWin";
        prize?: { id: string; name: string };
      };
      statusMessage?: string;
    }
  | {
      success: false;
      code: "GAME_NOT_FOUND" | "PLAYER_NOT_FOUND";
      message: string;
    };

type ExistingResult = {
  outcome: "win" | "noWin";
  prize?: { id: string; name: string };
};

function getGameUnavailableMessage(game: Game | null): string {
  if (!game) {
    return "Game not found.";
  }
  if (game.status === "draft") {
    return "This game is in draft mode and not available yet.";
  }
  if (game.status === "closed") {
    return "This game is closed.";
  }
  return "Game is not available.";
}

function toExistingResult(
  player: Pick<Player, "result">,
  prizes: Array<{ id: string; name: string }>,
): ExistingResult | undefined {
  if (player.result === undefined) {
    return undefined;
  }
  if (player.result === null) {
    return { outcome: "noWin" };
  }

  const prize = prizes.find((candidate) => candidate.id === player.result);
  return prize
    ? { outcome: "win", prize: { id: prize.id, name: prize.name } }
    : { outcome: "noWin" };
}

export async function registerPlayer(input: RegisterPlayerInput): Promise<RegisterPlayerResult> {
  trackEvent({
    name: "public.register.attempt",
    accessCode: input.accessCode,
  });

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();

  if (!firstName || !lastName || !email || !input.acceptTerms) {
    trackEvent({
      name: "public.register.failed",
      accessCode: input.accessCode,
      reason: "VALIDATION_ERROR",
    });
    return {
      success: false,
      errorCode: "VALIDATION_ERROR",
      message: "Please complete all fields and accept the terms.",
    };
  }

  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game || game.status !== "active") {
    trackEvent({
      name: "public.game_unavailable",
      source: "register",
      accessCode: input.accessCode,
      status: game?.status ?? "missing",
    });
    return {
      success: false,
      errorCode: "GAME_UNAVAILABLE",
      message: getGameUnavailableMessage(game),
    };
  }

  const existingPlayer = await dataRepository.players.getByEmail(game.id, email);
  if (existingPlayer) {
    trackEvent({
      name: "public.register.failed",
      accessCode: input.accessCode,
      reason: "EMAIL_ALREADY_PLAYED",
    });
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
    result: undefined,
    quizPassed: false,
    quizAttempts: 0,
  });

  const quizQuestions = await getQuizQuestionsForGame(dataRepository, game.id);
  trackEvent({
    name: "public.register.success",
    accessCode: input.accessCode,
    gameId: game.id,
    playerId: player.id,
  });
  return { success: true, playerId: player.id, quizQuestions };
}

export async function submitQuizAnswers(
  input: SubmitQuizAnswersInput,
): Promise<SubmitQuizAnswersResult> {
  trackEvent({
    name: "public.quiz.submit",
    accessCode: input.accessCode,
    playerId: input.playerId,
    answersCount: input.answers.length,
  });

  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game || game.status !== "active") {
    trackEvent({
      name: "public.game_unavailable",
      source: "quiz",
      accessCode: input.accessCode,
      status: game?.status ?? "missing",
    });
    return { success: false, reset: true };
  }
  const submission = await submitQuizForPlayer(dataRepository, {
    gameId: game.id,
    playerId: input.playerId,
    answers: input.answers,
  });
  trackEvent({
    name: "public.quiz.result",
    accessCode: input.accessCode,
    playerId: input.playerId,
    success: submission.success,
  });
  return submission.success ? { success: true } : { success: false, reset: true };
}

export async function spin(input: SpinInput): Promise<SpinResult> {
  trackEvent({
    name: "public.spin.attempt",
    accessCode: input.accessCode,
    playerId: input.playerId,
  });

  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game || game.status !== "active") {
    trackEvent({
      name: "public.game_unavailable",
      source: "spin",
      accessCode: input.accessCode,
      status: game?.status ?? "missing",
    });
    return {
      success: false,
      code: "GAME_UNAVAILABLE",
      message: getGameUnavailableMessage(game),
    };
  }

  const serviceResult = await spinForPlayer(dataRepository, {
    gameId: game.id,
    playerId: input.playerId,
  });
  if (!serviceResult.success) {
    if (serviceResult.code === "ALREADY_SPUN") {
      const player = await dataRepository.players.getById(input.playerId);
      const prizes = await dataRepository.prizes.listByGameId(game.id);
      trackEvent({
        name: "public.spin.result",
        accessCode: input.accessCode,
        playerId: input.playerId,
        success: false,
        errorCode: "ALREADY_SPUN",
      });
      return {
        success: false,
        code: "ALREADY_SPUN",
        message: serviceResult.message,
        existingResult: player
          ? toExistingResult(
              { result: player.result },
              prizes.map((prize) => ({ id: prize.id, name: prize.name })),
            )
          : undefined,
      };
    }

    trackEvent({
      name: "public.spin.result",
      accessCode: input.accessCode,
      playerId: input.playerId,
      success: false,
      errorCode: serviceResult.code,
    });
    return {
      success: false,
      code: serviceResult.code,
      message: serviceResult.message,
    };
  }

  if (serviceResult.outcome === "win") {
    trackEvent({
      name: "public.spin.result",
      accessCode: input.accessCode,
      playerId: input.playerId,
      success: true,
      outcome: "win",
    });
    return {
      success: true,
      outcome: "win",
      prize: serviceResult.prize,
    };
  }

  if (serviceResult.outcome === "noWin") {
    trackEvent({
      name: "public.spin.result",
      accessCode: input.accessCode,
      playerId: input.playerId,
      success: true,
      outcome: "noWin",
    });
    return { success: true, outcome: "noWin" };
  }

  trackEvent({
    name: "public.spin.result",
    accessCode: input.accessCode,
    playerId: input.playerId,
    success: true,
    outcome: "outOfStock",
  });
  return { success: true, outcome: "outOfStock" };
}

export async function getPlayerState(input: GetPlayerStateInput): Promise<GetPlayerStateResult> {
  const game = await dataRepository.games.getByAccessCode(input.accessCode);
  if (!game) {
    return {
      success: false,
      code: "GAME_NOT_FOUND",
      message: "Game not found.",
    };
  }

  const player = await dataRepository.players.getById(input.playerId);
  if (!player || player.gameId !== game.id) {
    return {
      success: false,
      code: "PLAYER_NOT_FOUND",
      message: "Player not found.",
    };
  }

  const quizQuestions = await getQuizQuestionsForGame(dataRepository, game.id);
  const prizes = await dataRepository.prizes.listByGameId(game.id);

  return {
    success: true,
    game: {
      id: game.id,
      accessCode: game.accessCode,
      status: game.status,
      noWinChance: game.noWinChance,
    },
    player: {
      id: player.id,
      quizPassed: player.quizPassed,
      quizAttempts: player.quizAttempts,
      result: player.result,
    },
    quizQuestions,
    existingResult: toExistingResult(
      { result: player.result },
      prizes.map((prize) => ({ id: prize.id, name: prize.name })),
    ),
    statusMessage: game.status === "active" ? undefined : getGameUnavailableMessage(game),
  };
}

// TODO: replace memory adapter usage with Firebase-backed repositories.
