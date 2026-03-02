import { beforeEach, describe, expect, it } from "vitest";
import { dataRepository } from "@/lib/data";
import { __resetMemoryStoreForTests } from "@/lib/data/adapters/memory/memory-data-store";
import {
  submitQuizForPlayer,
  type SubmittedQuizAnswer,
} from "@/lib/data/services/quizService";
import type { Game } from "@/lib/types";

async function getSeededGame(): Promise<Game> {
  const game = await dataRepository.games.getByAccessCode("TEST01");
  if (!game) {
    throw new Error("Seed game TEST01 not found");
  }
  return game;
}

async function getCorrectAnswers(gameId: string): Promise<SubmittedQuizAnswer[]> {
  const questions = await dataRepository.quiz.listQuestionsByGameId(gameId);
  const answers: SubmittedQuizAnswer[] = [];

  for (const question of questions) {
    const options = await dataRepository.quiz.listAnswersByQuestionId(question.id);
    const correct = options.find((option) => option.isCorrect);
    if (!correct) {
      throw new Error(`No correct answer configured for ${question.id}`);
    }
    answers.push({
      questionId: question.id,
      answerId: correct.id,
    });
  }

  return answers;
}

describe("quizService", () => {
  beforeEach(() => {
    __resetMemoryStoreForTests();
  });

  it("marks player quizPassed=true and increments attempts on correct answers", async () => {
    const game = await getSeededGame();
    const player = await dataRepository.players.create({
      gameId: game.id,
      firstName: "Correct",
      lastName: "User",
      email: "correct@quiz.test",
      result: undefined,
      quizPassed: false,
      quizAttempts: 0,
    });
    const answers = await getCorrectAnswers(game.id);

    const result = await submitQuizForPlayer(dataRepository, {
      gameId: game.id,
      playerId: player.id,
      answers,
    });

    expect(result.success).toBe(true);
    const updated = await dataRepository.players.getById(player.id);
    expect(updated?.quizPassed).toBe(true);
    expect(updated?.quizAttempts).toBe(1);
  });

  it("marks player quizPassed=false and increments attempts on wrong answers", async () => {
    const game = await getSeededGame();
    const player = await dataRepository.players.create({
      gameId: game.id,
      firstName: "Wrong",
      lastName: "User",
      email: "wrong@quiz.test",
      result: undefined,
      quizPassed: false,
      quizAttempts: 0,
    });
    const answers = await getCorrectAnswers(game.id);
    const firstQuestion = await dataRepository.quiz.listAnswersByQuestionId(answers[0]!.questionId);
    const wrongOption = firstQuestion.find((option) => !option.isCorrect);
    if (!wrongOption) {
      throw new Error("Expected at least one incorrect option");
    }
    answers[0] = { questionId: answers[0]!.questionId, answerId: wrongOption.id };

    const result = await submitQuizForPlayer(dataRepository, {
      gameId: game.id,
      playerId: player.id,
      answers,
    });

    expect(result.success).toBe(false);
    expect(result.reset).toBe(true);
    const updated = await dataRepository.players.getById(player.id);
    expect(updated?.quizPassed).toBe(false);
    expect(updated?.quizAttempts).toBe(1);
  });
});

