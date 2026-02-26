"use client";

export type QuizQuestionView = {
  id: string;
  prompt: string;
  options: Array<{
    id: string;
    text: string;
  }>;
};

type QuizProps = {
  question: QuizQuestionView;
  questionIndex: number;
  totalQuestions: number;
  feedback: string;
  onAnswer: (answerId: string) => void | Promise<void>;
};

export function Quiz({
  question,
  questionIndex,
  totalQuestions,
  feedback,
  onAnswer,
}: QuizProps) {
  return (
    <section className="rounded border p-4 text-sm">
      <h2 className="mb-2 text-lg font-medium">Step 2: Quiz</h2>
      <p className="mb-3 font-medium">
        Question {questionIndex + 1} of {totalQuestions}
      </p>
      <p className="mb-3">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            className="w-fit rounded border px-4 py-2 text-left"
            type="button"
            onClick={() => onAnswer(option.id)}
          >
            {option.text}
          </button>
        ))}
      </div>
      {feedback ? <p className="mt-3">{feedback}</p> : null}
    </section>
  );
}
