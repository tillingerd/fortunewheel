import type { Game, Player, Prize, QuizAnswer, QuizQuestion } from "@/lib/types";

export interface GameRepository {
  list(): Promise<Game[]>;
  getById(id: string): Promise<Game | null>;
  getByAccessCode(accessCode: string): Promise<Game | null>;
  create(input: Omit<Game, "id" | "createdAt">): Promise<Game>;
  update(id: string, input: Partial<Omit<Game, "id" | "createdAt">>): Promise<Game | null>;
  delete(id: string): Promise<void>;
}

export interface QuizRepository {
  listQuestionsByGameId(gameId: string): Promise<QuizQuestion[]>;
  listAnswersByQuestionId(questionId: string): Promise<QuizAnswer[]>;
  upsertQuestion(input: QuizQuestion): Promise<QuizQuestion>;
  upsertAnswer(input: QuizAnswer): Promise<QuizAnswer>;
  deleteQuestion(id: string): Promise<void>;
  deleteAnswer(id: string): Promise<void>;
}

export interface PrizeRepository {
  listByGameId(gameId: string): Promise<Prize[]>;
  upsert(input: Prize): Promise<Prize>;
  delete(id: string): Promise<void>;
}

export interface PlayerRepository {
  listByGameId(gameId: string): Promise<Player[]>;
  getByEmail(gameId: string, email: string): Promise<Player | null>;
  create(input: Omit<Player, "id" | "playedAt">): Promise<Player>;
  setResult(playerId: string, prizeId: string | null): Promise<Player | null>;
}

export interface DataRepository {
  games: GameRepository;
  quiz: QuizRepository;
  prizes: PrizeRepository;
  players: PlayerRepository;
}
