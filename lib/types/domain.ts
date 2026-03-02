export type GameStatus = "draft" | "active" | "closed";

export interface Game {
  id: string;
  name: string;
  accessCode: string;
  status: GameStatus;
  noWinChance: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  gameId: string;
  text: string;
  order: number;
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface Prize {
  id: string;
  gameId: string;
  name: string;
  imageUrl: string;
  stock: number;
  wonCount: number;
}

export interface Player {
  id: string;
  gameId: string;
  firstName: string;
  lastName: string;
  email: string;
  playedAt: string;
  // `undefined` means the player has not spun yet; `null` means spun with no win.
  result: string | null | undefined;
  quizPassed: boolean;
  quizAttempts: number;
}
