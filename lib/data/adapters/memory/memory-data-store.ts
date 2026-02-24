/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  DataRepository,
  GameRepository,
  PlayerRepository,
  PrizeRepository,
  QuizRepository,
} from "@/lib/data/repositories";
import type { Game, Player, Prize, QuizAnswer, QuizQuestion } from "@/lib/types";

class MemoryGameRepository implements GameRepository {
  async list(): Promise<Game[]> {
    // TODO: read from in-memory game collection.
    return [];
  }

  async getById(_id: string): Promise<Game | null> {
    // TODO: load by id.
    return null;
  }

  async getByAccessCode(_accessCode: string): Promise<Game | null> {
    // TODO: load by access code.
    return null;
  }

  async create(input: Omit<Game, "id" | "createdAt">): Promise<Game> {
    // TODO: generate id and persist entity in memory.
    return {
      ...input,
      id: "todo-game-id",
      createdAt: new Date().toISOString(),
    };
  }

  async update(
    _id: string,
    _input: Partial<Omit<Game, "id" | "createdAt">>,
  ): Promise<Game | null> {
    // TODO: update in-memory entity.
    return null;
  }

  async delete(_id: string): Promise<void> {
    // TODO: remove in-memory game entity.
  }
}

class MemoryQuizRepository implements QuizRepository {
  async listQuestionsByGameId(_gameId: string): Promise<QuizQuestion[]> {
    // TODO: read game questions from memory.
    return [];
  }

  async listAnswersByQuestionId(_questionId: string): Promise<QuizAnswer[]> {
    // TODO: read answers from memory.
    return [];
  }

  async upsertQuestion(input: QuizQuestion): Promise<QuizQuestion> {
    // TODO: insert or update in-memory question.
    return input;
  }

  async upsertAnswer(input: QuizAnswer): Promise<QuizAnswer> {
    // TODO: insert or update in-memory answer.
    return input;
  }

  async deleteQuestion(_id: string): Promise<void> {
    // TODO: delete in-memory question.
  }

  async deleteAnswer(_id: string): Promise<void> {
    // TODO: delete in-memory answer.
  }
}

class MemoryPrizeRepository implements PrizeRepository {
  async listByGameId(_gameId: string): Promise<Prize[]> {
    // TODO: read prizes by game from memory.
    return [];
  }

  async upsert(input: Prize): Promise<Prize> {
    // TODO: insert or update prize in memory.
    return input;
  }

  async delete(_id: string): Promise<void> {
    // TODO: delete in-memory prize.
  }
}

class MemoryPlayerRepository implements PlayerRepository {
  async listByGameId(_gameId: string): Promise<Player[]> {
    // TODO: read players by game from memory.
    return [];
  }

  async getByEmail(_gameId: string, _email: string): Promise<Player | null> {
    // TODO: lookup player by unique email per game.
    return null;
  }

  async create(input: Omit<Player, "id" | "playedAt">): Promise<Player> {
    // TODO: persist player in memory.
    return {
      ...input,
      id: "todo-player-id",
      playedAt: new Date().toISOString(),
    };
  }

  async setResult(_playerId: string, _prizeId: string | null): Promise<Player | null> {
    // TODO: update player result in memory.
    return null;
  }
}

export class MemoryDataRepository implements DataRepository {
  games: GameRepository;
  quiz: QuizRepository;
  prizes: PrizeRepository;
  players: PlayerRepository;

  constructor() {
    this.games = new MemoryGameRepository();
    this.quiz = new MemoryQuizRepository();
    this.prizes = new MemoryPrizeRepository();
    this.players = new MemoryPlayerRepository();
  }
}
