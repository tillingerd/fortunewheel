"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  RegistrationForm,
  type RegistrationFormValues,
} from "@/components/game/RegistrationForm";
import { Quiz } from "@/components/game/Quiz";
import { SpinPanel } from "@/components/game/SpinPanel";
import { MOCK_QUIZ_QUESTIONS } from "@/lib/mock/quiz";
import { spinMock } from "@/lib/mock/spin";

type GameStep = "registration" | "quiz" | "quizComplete" | "spin";

export default function PublicGamePage() {
  const params = useParams<{ accessCode: string }>();
  const accessCode = Array.isArray(params.accessCode) ? params.accessCode[0] : params.accessCode;

  const [step, setStep] = useState<GameStep>("registration");
  const [form, setForm] = useState<RegistrationFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
  });
  const [formError, setFormError] = useState<string>("");
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [spinResult, setSpinResult] = useState<string>("");

  const activeQuestion = useMemo(() => MOCK_QUIZ_QUESTIONS[quizIndex], [quizIndex]);

  const handleStartQuiz = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setFormError("Please complete all fields.");
      return;
    }

    if (!form.acceptTerms) {
      setFormError("You must accept the terms.");
      return;
    }

    setFormError("");
    setQuizIndex(0);
    setQuizFeedback("");
    setStep("quiz");

    // TODO: replace with repository call for registration and unique-email validation.
  };

  const handleAnswer = (selectedIndex: number) => {
    if (!activeQuestion) {
      return;
    }

    if (selectedIndex !== activeQuestion.correctIndex) {
      setQuizIndex(0);
      setQuizFeedback("Wrong answer. Restarted from question 1.");
      return;
    }

    const isLastQuestion = quizIndex === MOCK_QUIZ_QUESTIONS.length - 1;
    if (isLastQuestion) {
      setQuizFeedback("");
      setStep("quizComplete");
      return;
    }

    setQuizIndex((current) => current + 1);
    setQuizFeedback("Correct answer. Moving to the next question.");
  };

  const handleSpin = () => {
    const result = spinMock();
    setSpinResult(result.message);

    // TODO: replace with repository/service call (noWinChance, stock checks, persistence).
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Public Game</h1>
      <p className="text-sm text-zinc-700">Access code: {accessCode}</p>

      {step === "registration" ? (
        <RegistrationForm
          form={form}
          error={formError}
          onSubmit={handleStartQuiz}
          onChange={setForm}
        />
      ) : null}

      {step === "quiz" && activeQuestion ? (
        <Quiz
          question={activeQuestion}
          questionIndex={quizIndex}
          totalQuestions={MOCK_QUIZ_QUESTIONS.length}
          feedback={quizFeedback}
          onAnswer={handleAnswer}
        />
      ) : null}

      {step === "quizComplete" ? (
        <section className="rounded border p-4 text-sm">
          <h2 className="mb-2 text-lg font-medium">Step 2: Quiz</h2>
          <p>Congratulations, your answers are correct!</p>
          <button className="mt-3 rounded border px-4 py-2" type="button" onClick={() => setStep("spin")}>
            Let&apos;s spin the wheel!
          </button>
        </section>
      ) : null}

      {step === "spin" ? <SpinPanel resultMessage={spinResult} onSpin={handleSpin} /> : null}

      <Link className="underline" href={`/g/${accessCode}/close`}>
        Go to close game page
      </Link>
    </main>
  );
}
