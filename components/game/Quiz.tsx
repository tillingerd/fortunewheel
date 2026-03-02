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
    <Card className="text-sm">
      <h2 className="mb-2 text-lg font-semibold text-zinc-900">Step 2: Quiz</h2>
      <p className="mb-3 font-medium text-zinc-700">
        Question {questionIndex + 1} / {totalQuestions}
      </p>
      <p className="mb-3 text-zinc-900">{question.prompt}</p>
      <div className="flex flex-col gap-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            className={cn(
              "w-full rounded-xl border px-4 py-2 text-left text-sm transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800",
              selectedAnswerId === option.id
                ? "border-zinc-800 bg-zinc-100"
                : "border-zinc-200 bg-white hover:bg-zinc-50",
            )}
            type="button"
            onClick={() => setSelectedAnswerId(option.id)}
            disabled={isSubmitting}
          >
            {option.text}
          </button>
        ))}
      </div>
      <Button
        className="mt-3 w-fit"
        variant="default"
        onClick={() => void onAnswer(selectedAnswerId)}
        disabled={!selectedAnswerId || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : isLastQuestion ? "Submit Answers" : "Next Question"}
      </Button>
      {feedback ? <p className="mt-3 text-zinc-700">{feedback}</p> : null}
    </Card>
  );
}
