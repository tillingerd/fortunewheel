"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <Card className="p-4 text-sm sm:p-5">
      <h2 className="mb-2 text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
        Step 2: Quiz
      </h2>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:text-sm">
        Question {questionIndex + 1} / {totalQuestions}
      </p>
      <p className="mb-3 text-base font-medium text-zinc-900 sm:text-lg">{question.prompt}</p>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswerId === option.id;
          return (
            <button
              key={option.id}
              className={cn(
                "w-full rounded-3xl border-2 px-4 py-3 text-left text-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2",
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white shadow-lg shadow-zinc-900/25"
                  : "border-zinc-300 bg-white text-zinc-900 hover:border-zinc-900 hover:bg-zinc-50 hover:shadow-sm",
                isSubmitting ? "cursor-wait opacity-70" : "hover:-translate-y-[1px]",
              )}
              type="button"
              onClick={() => setSelectedAnswerId(option.id)}
              disabled={isSubmitting}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{option.text}</span>
                {isSelected ? (
                  <span className="inline-flex h-6 min-w-[48px] items-center justify-center rounded-full border border-white/40 bg-white/10 text-[11px] font-semibold uppercase tracking-wide text-white">
                    Selected
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <Button
        className="mt-3 w-full sm:w-auto"
        variant="default"
        onClick={() => void onAnswer(selectedAnswerId)}
        disabled={!selectedAnswerId || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit Answers" : "Next Question"}
      </Button>
      {feedback ? <p className="mt-3 text-sm text-zinc-700">{feedback}</p> : null}
    </Card>
  );
}
