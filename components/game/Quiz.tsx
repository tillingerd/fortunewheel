"use client";

import type { MockQuizQuestion } from "@/lib/mock/quiz";

type QuizProps = {
  question: MockQuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  feedback: string;
  onAnswer: (selectedIndex: number) => void;
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
        {question.options.map((option, optionIndex) => (
          <button
            key={option}
            className="w-fit rounded border px-4 py-2 text-left"
            type="button"
            onClick={() => onAnswer(optionIndex)}
          >
            {option}
          </button>
        ))}
      </div>
      {feedback ? <p className="mt-3">{feedback}</p> : null}
    </section>
  );
}
