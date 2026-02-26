import type {
  DataRepository,
  GameRepository,
  PlayerRepository,
  PrizeRepository,
  QuizRepository,
} from "@/lib/data/repositories";
import type { Game, Player, Prize, QuizAnswer, QuizQuestion } from "@/lib/types";

type MemoryStore = {
  games: Map<string, Game>;
  gameIdsByAccessCode: Map<string, string>;
  questions: Map<string, QuizQuestion>;
  questionIdsByGameId: Map<string, string[]>;
  answersByQuestionId: Map<string, QuizAnswer[]>;
  prizes: Map<string, Prize>;
  prizeIdsByGameId: Map<string, string[]>;
  players: Map<string, Player>;
  playerIdsByGameId: Map<string, string[]>;
  playerIdByEmailByGameId: Map<string, Map<string, string>>;
};

type SeededQuizQuestion = {
  id: string;
  question: string;
  answers: Array<{
    id: string;
    text: string;
    correct: boolean;
  }>;
};

type SeededGame = {
  game: Game;
  quizQuestions: SeededQuizQuestion[];
  prizes: Prize[];
};

const memoryStore: MemoryStore = {
  games: new Map<string, Game>(),
  gameIdsByAccessCode: new Map<string, string>(),
  questions: new Map<string, QuizQuestion>(),
  questionIdsByGameId: new Map<string, string[]>(),
  answersByQuestionId: new Map<string, QuizAnswer[]>(),
  prizes: new Map<string, Prize>(),
  prizeIdsByGameId: new Map<string, string[]>(),
  players: new Map<string, Player>(),
  playerIdsByGameId: new Map<string, string[]>(),
  playerIdByEmailByGameId: new Map<string, Map<string, string>>(),
};

let seeded = false;

const SEEDED_GAMES: SeededGame[] = [
  {
    game: {
      id: "game_test01",
      name: "Seed Game TEST01",
      accessCode: "TEST01",
      isActive: true,
      noWinChance: 40,
      createdAt: new Date().toISOString(),
    },
    quizQuestions: [
      {
        id: "q1",
        question: "Which planet is known as the Red Planet?",
        answers: [
          { id: "a1_1", text: "Venus", correct: false },
          { id: "a1_2", text: "Mars", correct: true },
          { id: "a1_3", text: "Jupiter", correct: false },
        ],
      },
      {
        id: "q2",
        question: "What does HTML stand for?",
        answers: [
          { id: "a2_1", text: "HyperText Markup Language", correct: true },
          { id: "a2_2", text: "HighText Machine Language", correct: false },
          { id: "a2_3", text: "Home Tool Markup Language", correct: false },
        ],
      },
      {
        id: "q3",
        question: "How many days are there in a leap year?",
        answers: [
          { id: "a3_1", text: "365", correct: false },
          { id: "a3_2", text: "366", correct: true },
          { id: "a3_3", text: "364", correct: false },
        ],
      },
    ],
    prizes: [
      {
        id: "prize_1",
        gameId: "game_test01",
        name: "Gift Card",
        imageUrl: "/prizes/gift-card.png",
        stock: 5,
        wonCount: 0,
      },
      {
        id: "prize_2",
        gameId: "game_test01",
        name: "Coffee Mug",
        imageUrl: "/prizes/coffee-mug.png",
        stock: 4,
        wonCount: 0,
      },
    ],
  },
];

function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function pushUnique(collection: Map<string, string[]>, key: string, value: string): void {
  const existing = collection.get(key) ?? [];
  if (!existing.includes(value)) {
    existing.push(value);
  }
  collection.set(key, existing);
}

function seedMemoryStore(): void {
  if (seeded) {
    return;
  }

  // TODO: remove hardcoded seed data after Firebase + Admin CRUD are implemented.
  for (const seededGame of SEEDED_GAMES) {
    memoryStore.games.set(seededGame.game.id, seededGame.game);
    memoryStore.gameIdsByAccessCode.set(seededGame.game.accessCode, seededGame.game.id);

    seededGame.quizQuestions.forEach((quizQuestion, index) => {
      const question: QuizQuestion = {
        id: quizQuestion.id,
        gameId: seededGame.game.id,
        text: quizQuestion.question,
        order: index + 1,
      };
      memoryStore.questions.set(question.id, question);
      pushUnique(memoryStore.questionIdsByGameId, seededGame.game.id, question.id);
      memoryStore.answersByQuestionId.set(
        question.id,
        quizQuestion.answers.map((answer) => ({
          id: answer.id,
          questionId: question.id,
          text: answer.text,
          isCorrect: answer.correct,
        })),
      );
    });

    for (const prize of seededGame.prizes) {
      memoryStore.prizes.set(prize.id, prize);
      pushUnique(memoryStore.prizeIdsByGameId, seededGame.game.id, prize.id);
    }
  }

  seeded = true;
}

class MemoryGameRepository implements GameRepository {
  constructor() {
    seedMemoryStore();
  }

  async list(): Promise<Game[]> {
    return Array.from(memoryStore.games.values()).map((game) => clone(game));
  }

  async getById(id: string): Promise<Game | null> {
    const game = memoryStore.games.get(id);
    return game ? clone(game) : null;
  }

  async getByAccessCode(accessCode: string): Promise<Game | null> {
    const gameId = memoryStore.gameIdsByAccessCode.get(accessCode);
    if (!gameId) {
      return null;
    }

    const game = memoryStore.games.get(gameId);
    return game ? clone(game) : null;
  }

  async create(input: Omit<Game, "id" | "createdAt">): Promise<Game> {
    const createdGame: Game = {
      ...input,
      id: createId("game"),
      createdAt: new Date().toISOString(),
    };

    memoryStore.games.set(createdGame.id, createdGame);
    memoryStore.gameIdsByAccessCode.set(createdGame.accessCode, createdGame.id);
    return clone(createdGame);
  }

  async update(
    id: string,
    input: Partial<Omit<Game, "id" | "createdAt">>,
  ): Promise<Game | null> {
    const existing = memoryStore.games.get(id);
    if (!existing) {
      return null;
    }

    const previousAccessCode = existing.accessCode;
    const updated: Game = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    memoryStore.games.set(id, updated);
    if (input.accessCode && input.accessCode !== previousAccessCode) {
      memoryStore.gameIdsByAccessCode.delete(previousAccessCode);
      memoryStore.gameIdsByAccessCode.set(input.accessCode, id);
    }

    return clone(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = memoryStore.games.get(id);
    if (!existing) {
      return;
    }

    memoryStore.gameIdsByAccessCode.delete(existing.accessCode);
    memoryStore.games.delete(id);
  }
}

class MemoryQuizRepository implements QuizRepository {
  constructor() {
    seedMemoryStore();
  }

  async listQuestionsByGameId(gameId: string): Promise<QuizQuestion[]> {
    const questionIds = memoryStore.questionIdsByGameId.get(gameId) ?? [];
    const questions = questionIds
      .map((questionId) => memoryStore.questions.get(questionId))
      .filter((question): question is QuizQuestion => Boolean(question))
      .sort((left, right) => left.order - right.order);

    return questions.map((question) => clone(question));
  }

  async listAnswersByQuestionId(questionId: string): Promise<QuizAnswer[]> {
    const answers = memoryStore.answersByQuestionId.get(questionId) ?? [];
    return answers.map((answer) => clone(answer));
  }

  async upsertQuestion(input: QuizQuestion): Promise<QuizQuestion> {
    memoryStore.questions.set(input.id, clone(input));
    pushUnique(memoryStore.questionIdsByGameId, input.gameId, input.id);
    return clone(input);
  }

  async upsertAnswer(input: QuizAnswer): Promise<QuizAnswer> {
    const currentAnswers = memoryStore.answersByQuestionId.get(input.questionId) ?? [];
    const filteredAnswers = currentAnswers.filter((answer) => answer.id !== input.id);
    filteredAnswers.push(clone(input));
    memoryStore.answersByQuestionId.set(input.questionId, filteredAnswers);
    return clone(input);
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = memoryStore.questions.get(id);
    if (!question) {
      return;
    }

    memoryStore.questions.delete(id);
    memoryStore.answersByQuestionId.delete(id);
    const gameQuestionIds = memoryStore.questionIdsByGameId.get(question.gameId) ?? [];
    memoryStore.questionIdsByGameId.set(
      question.gameId,
      gameQuestionIds.filter((questionId) => questionId !== id),
    );
  }

  async deleteAnswer(id: string): Promise<void> {
    for (const [questionId, answers] of memoryStore.answersByQuestionId.entries()) {
      const nextAnswers = answers.filter((answer) => answer.id !== id);
      if (nextAnswers.length !== answers.length) {
        memoryStore.answersByQuestionId.set(questionId, nextAnswers);
        return;
      }
    }
  }
}

class MemoryPrizeRepository implements PrizeRepository {
  constructor() {
    seedMemoryStore();
  }

  async listByGameId(gameId: string): Promise<Prize[]> {
    const prizeIds = memoryStore.prizeIdsByGameId.get(gameId) ?? [];
    const prizes = prizeIds
      .map((prizeId) => memoryStore.prizes.get(prizeId))
      .filter((prize): prize is Prize => Boolean(prize));

    return prizes.map((prize) => clone(prize));
  }

  async upsert(input: Prize): Promise<Prize> {
    memoryStore.prizes.set(input.id, clone(input));
    pushUnique(memoryStore.prizeIdsByGameId, input.gameId, input.id);
    return clone(input);
  }

  async delete(id: string): Promise<void> {
    const prize = memoryStore.prizes.get(id);
    if (!prize) {
      return;
    }

    memoryStore.prizes.delete(id);
    const gamePrizeIds = memoryStore.prizeIdsByGameId.get(prize.gameId) ?? [];
    memoryStore.prizeIdsByGameId.set(
      prize.gameId,
      gamePrizeIds.filter((prizeId) => prizeId !== id),
    );
  }
}

class MemoryPlayerRepository implements PlayerRepository {
  constructor() {
    seedMemoryStore();
  }

  async listByGameId(gameId: string): Promise<Player[]> {
    const playerIds = memoryStore.playerIdsByGameId.get(gameId) ?? [];
    const players = playerIds
      .map((playerId) => memoryStore.players.get(playerId))
      .filter((player): player is Player => Boolean(player));

    return players.map((player) => clone(player));
  }

  async getByEmail(gameId: string, email: string): Promise<Player | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const playerIdsByEmail = memoryStore.playerIdByEmailByGameId.get(gameId);
    if (!playerIdsByEmail) {
      return null;
    }

    const playerId = playerIdsByEmail.get(normalizedEmail);
    if (!playerId) {
      return null;
    }

    const player = memoryStore.players.get(playerId);
    return player ? clone(player) : null;
  }

  async create(input: Omit<Player, "id" | "playedAt">): Promise<Player> {
    const createdPlayer: Player = {
      ...input,
      id: createId("player"),
      playedAt: new Date().toISOString(),
      email: input.email.trim().toLowerCase(),
    };

    memoryStore.players.set(createdPlayer.id, createdPlayer);
    pushUnique(memoryStore.playerIdsByGameId, createdPlayer.gameId, createdPlayer.id);
    const playerIdsByEmail = memoryStore.playerIdByEmailByGameId.get(createdPlayer.gameId) ?? new Map();
    playerIdsByEmail.set(createdPlayer.email, createdPlayer.id);
    memoryStore.playerIdByEmailByGameId.set(createdPlayer.gameId, playerIdsByEmail);
    return clone(createdPlayer);
  }

  async setResult(playerId: string, prizeId: string | null): Promise<Player | null> {
    const existing = memoryStore.players.get(playerId);
    if (!existing) {
      return null;
    }

    const updatedPlayer: Player = {
      ...existing,
      result: prizeId,
    };
    memoryStore.players.set(playerId, updatedPlayer);
    return clone(updatedPlayer);
  }

  async updateQuizStatus(playerId: string, quizPassed: boolean): Promise<Player | null> {
    const existing = memoryStore.players.get(playerId);
    if (!existing) {
      return null;
    }

    const updatedPlayer: Player = {
      ...existing,
      quizPassed,
      quizAttempts: existing.quizAttempts + 1,
    };
    memoryStore.players.set(playerId, updatedPlayer);
    return clone(updatedPlayer);
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
