import type { DataRepository } from "@/lib/data/repositories";

export type QuizQuestionView = {
  id: string;
  prompt: string;
  options: string[];
};

export type ValidateQuizAnswerInput = {
  gameId: string;
  questionId: string;
  selectedIndex: number;
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
        options: answers.map((answer) => answer.text),
      };
    }),
  );
}

export async function validateQuizAnswer(
  repository: DataRepository,
  input: ValidateQuizAnswerInput,
): Promise<{ isCorrect: boolean }> {
  const question = (await repository.quiz.listQuestionsByGameId(input.gameId)).find(
    (item) => item.id === input.questionId,
  );
  if (!question) {
    return { isCorrect: false };
  }

  const answers = await repository.quiz.listAnswersByQuestionId(input.questionId);
  const selectedAnswer = answers[input.selectedIndex];
  if (!selectedAnswer) {
    return { isCorrect: false };
  }

  return { isCorrect: selectedAnswer.isCorrect };
}
