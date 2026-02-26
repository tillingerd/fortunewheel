import type { DataRepository } from "@/lib/data/repositories";

export type QuizQuestionView = {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
  }>;
};

export type SubmittedQuizAnswer = {
  questionId: string;
  answerId: string;
};

export async function getQuizQuestionsForGame(
  repository: DataRepository,
  gameId: string,
): Promise<QuizQuestionView[]> {
  const questions = await repository.quiz.listQuestionsByGameId(gameId);

  return Promise.all(
    questions.map(async (question) => {
      const answers = await repository.quiz.listAnswersByQuestionId(question.id);

      return {
        id: question.id,
        prompt: question.text,
        options: answers.map((answer) => ({
          id: answer.id,
          text: answer.text,
        })),
      };
    }),
  );
}

export async function validateQuizSubmission(
  repository: DataRepository,
  gameId: string,
  submittedAnswers: SubmittedQuizAnswer[],
): Promise<{ allCorrect: boolean }> {
  const questions = await repository.quiz.listQuestionsByGameId(gameId);
  if (questions.length === 0) {
    return { allCorrect: false };
  }

  for (const question of questions) {
    const selected = submittedAnswers.find((answer) => answer.questionId === question.id);
    if (!selected) {
      return { allCorrect: false };
    }

    const answers = await repository.quiz.listAnswersByQuestionId(question.id);
    const selectedAnswer = answers.find((answer) => answer.id === selected.answerId);
    if (!selectedAnswer || !selectedAnswer.isCorrect) {
      return { allCorrect: false };
    }
  }

  return { allCorrect: true };
}
