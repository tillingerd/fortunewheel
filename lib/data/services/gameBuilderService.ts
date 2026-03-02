import type { DataRepository } from "@/lib/data/repositories";
import type { GameStatus } from "@/lib/types";

export type AdminGameListItem = {
  id: string;
  accessCode: string;
  status: GameStatus;
  playersCount: number;
};

export type CreateGameInput = {
  accessCode: string;
  status: GameStatus;
  noWinChance: number;
  prizes: Array<{
    name: string;
    stock: number;
    imageUrl?: string;
  }>;
  quizQuestions: Array<{
    question: string;
    answers: Array<{
      text: string;
      correct: boolean;
    }>;
  }>;
};

export type AdminGameDetail = {
  game: {
    id: string;
    accessCode: string;
    status: GameStatus;
    noWinChance: number;
  };
  prizes: Array<{
    id: string;
    name: string;
    stock: number;
    imageUrl: string;
  }>;
  quizQuestions: Array<{
    id: string;
    text: string;
    answers: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
  }>;
  players: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    playedAt: string;
    quizAttempts: number;
    quizPassed: boolean;
    result: string | null | undefined;
  }>;
};

export async function listGamesForAdmin(
  repository: DataRepository,
): Promise<AdminGameListItem[]> {
  const games = await repository.games.listGames();
  const items = await Promise.all(
    games.map(async (game) => {
      const playersCount = (await repository.players.listByGameId(game.id)).length;
      return {
        id: game.id,
        accessCode: game.accessCode,
        status: game.status,
        playersCount,
      };
    }),
  );

  return items.sort((left, right) => left.accessCode.localeCompare(right.accessCode));
}

export async function createGameWithContent(
  repository: DataRepository,
  input: CreateGameInput,
): Promise<{ gameId: string }> {
  const accessCode = input.accessCode.trim().toUpperCase();
  if (!accessCode) {
    throw new Error("Access code is required.");
  }

  const existing = await repository.games.getGameByAccessCode(accessCode);
  if (existing) {
    throw new Error("Access code already exists.");
  }

  if (input.noWinChance < 0 || input.noWinChance > 100) {
    throw new Error("noWinChance must be between 0 and 100.");
  }

  if (input.prizes.length === 0) {
    throw new Error("At least one prize is required.");
  }

  if (input.quizQuestions.length === 0) {
    throw new Error("At least one quiz question is required.");
  }

  const game = await repository.games.createGame({
    name: `Game ${accessCode}`,
    accessCode,
    status: input.status,
    noWinChance: input.noWinChance,
  });

  for (const [index, quizQuestion] of input.quizQuestions.entries()) {
    if (!quizQuestion.question.trim()) {
      throw new Error(`Question ${index + 1} is empty.`);
    }
    if (quizQuestion.answers.length < 2) {
      throw new Error(`Question ${index + 1} must have at least 2 answers.`);
    }
    if (!quizQuestion.answers.some((answer) => answer.correct)) {
      throw new Error(`Question ${index + 1} must have at least one correct answer.`);
    }

    const questionId = `${game.id}_q_${index + 1}`;
    await repository.quiz.upsertQuestion({
      id: questionId,
      gameId: game.id,
      text: quizQuestion.question.trim(),
      order: index + 1,
    });

    for (const [answerIndex, answer] of quizQuestion.answers.entries()) {
      await repository.quiz.upsertAnswer({
        id: `${questionId}_a_${answerIndex + 1}`,
        questionId,
        text: answer.text.trim(),
        isCorrect: answer.correct,
      });
    }
  }

  for (const [index, prize] of input.prizes.entries()) {
    if (!prize.name.trim()) {
      throw new Error(`Prize ${index + 1} name is empty.`);
    }

    await repository.prizes.upsert({
      id: `${game.id}_p_${index + 1}`,
      gameId: game.id,
      name: prize.name.trim(),
      imageUrl: prize.imageUrl?.trim() ?? "",
      stock: Math.max(0, Math.floor(prize.stock)),
      wonCount: 0,
    });
  }

  return { gameId: game.id };
}

export async function getGameDetailForAdmin(
  repository: DataRepository,
  gameId: string,
): Promise<AdminGameDetail | null> {
  const game = await repository.games.getGameById(gameId);
  if (!game) {
    return null;
  }

  const prizes = await repository.prizes.listByGameId(game.id);
  const questions = await repository.quiz.listQuestionsByGameId(game.id);
  const quizQuestions = await Promise.all(
    questions.map(async (question) => ({
      id: question.id,
      text: question.text,
      answers: await repository.quiz.listAnswersByQuestionId(question.id),
    })),
  );
  const players = await repository.players.listByGameId(game.id);

  return {
    game: {
      id: game.id,
      accessCode: game.accessCode,
      status: game.status,
      noWinChance: game.noWinChance,
    },
    prizes: prizes.map((prize) => ({
      id: prize.id,
      name: prize.name,
      stock: prize.stock,
      imageUrl: prize.imageUrl,
    })),
    quizQuestions,
    players: players.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      playedAt: player.playedAt,
      quizAttempts: player.quizAttempts,
      quizPassed: player.quizPassed,
      result: player.result,
    })),
  };
}

export async function updateGameStatusForAdmin(
  repository: DataRepository,
  input: { gameId: string; status: GameStatus },
): Promise<boolean> {
  const updated = await repository.games.updateGame(input.gameId, {
    status: input.status,
  });
  return Boolean(updated);
}

export async function updatePrizeStockForAdmin(
  repository: DataRepository,
  input: { gameId: string; prizeId: string; stock: number },
): Promise<boolean> {
  const game = await repository.games.getGameById(input.gameId);
  if (!game) {
    return false;
  }

  const existingPrize = await repository.prizes.getById(input.prizeId);
  if (!existingPrize || existingPrize.gameId !== input.gameId) {
    return false;
  }

  const normalizedStock = Number.isFinite(input.stock) ? Math.max(0, Math.floor(input.stock)) : 0;
  await repository.prizes.upsert({
    ...existingPrize,
    stock: normalizedStock,
  });
  return true;
}
