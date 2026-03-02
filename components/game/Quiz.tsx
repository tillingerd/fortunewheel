"use client";

import { useState } from "react";

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
  isSubmitting?: boolean;
  onAnswer: (answerId: string) => void | Promise<void>;
};

export function Quiz({
  question,
  questionIndex,
  totalQuestions,
  feedback,
  isSubmitting = false,
  onAnswer,
}: QuizProps) {
  const [selectedAnswerId, setSelectedAnswerId] = useState<string>("");
  const isLastQuestion = questionIndex === totalQuestions - 1;

  return (
    <section className="rounded border p-4 text-sm">
      <h2 className="mb-2 text-lg font-medium">Step 2: Quiz</h2>
      <p className="mb-3 font-medium">
        Question {questionIndex + 1} / {totalQuestions}
      </p>
      <p className="mb-3">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            className={`w-full rounded border px-4 py-2 text-left ${
              selectedAnswerId === option.id ? "border-zinc-700" : ""
            }`}
            type="button"
            onClick={() => setSelectedAnswerId(option.id)}
            disabled={isSubmitting}
          >
            {option.text}
          </button>
        ))}
      </div>
      <button
        className="mt-3 rounded border px-4 py-2 disabled:opacity-50"
        type="button"
        onClick={() => void onAnswer(selectedAnswerId)}
        disabled={!selectedAnswerId || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit Answers" : "Next Question"}
      </button>
      {feedback ? <p className="mt-3">{feedback}</p> : null}
    </section>
  );
}
