"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type GameStep = "registration" | "quiz" | "quizComplete" | "spin";

type RegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  acceptTerms: boolean;
};

type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter"],
    correctIndex: 1,
  },
  {
    id: "q2",
    prompt: "What does HTML stand for?",
    options: ["HyperText Markup Language", "HighText Machine Language", "Home Tool Markup Language"],
    correctIndex: 0,
  },
  {
    id: "q3",
    prompt: "How many days are there in a leap year?",
    options: ["365", "366", "364"],
    correctIndex: 1,
  },
];

export default function PublicGamePage() {
  const params = useParams<{ accessCode: string }>();
  const accessCode = Array.isArray(params.accessCode) ? params.accessCode[0] : params.accessCode;

  const [step, setStep] = useState<GameStep>("registration");
  const [form, setForm] = useState<RegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
  });
  const [formError, setFormError] = useState<string>("");
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [spinResult, setSpinResult] = useState<string>("");

  const activeQuestion = useMemo(() => QUIZ_QUESTIONS[quizIndex], [quizIndex]);

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

    // TODO: replace with backend registration check (email uniqueness per game).
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

    const isLastQuestion = quizIndex === QUIZ_QUESTIONS.length - 1;
    if (isLastQuestion) {
      setQuizFeedback("");
      setStep("quizComplete");
      return;
    }

    setQuizIndex((current) => current + 1);
    setQuizFeedback("Correct answer. Moving to the next question.");
  };

  const handleSpin = () => {
    const didWin = Math.random() >= 0.5;
    setSpinResult(didWin ? "You won a prize!" : "No win this time.");

    // TODO: replace with backend spin result logic (noWinChance, stock checks, persistence).
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Public Game</h1>
      <p className="text-sm text-zinc-700">Access code: {accessCode}</p>

      {step === "registration" && (
        <section className="rounded border p-4 text-sm">
          <h2 className="mb-3 text-lg font-medium">Step 1: Registration</h2>
          <form className="flex flex-col gap-3" onSubmit={handleStartQuiz}>
            <label className="flex flex-col gap-1">
              First name
              <input
                className="rounded border px-3 py-2"
                name="firstName"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-1">
              Last name
              <input
                className="rounded border px-3 py-2"
                name="lastName"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
              />
            </label>

            <label className="flex flex-col gap-1">
              Email
              <input
                className="rounded border px-3 py-2"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                checked={form.acceptTerms}
                name="acceptTerms"
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    acceptTerms: event.target.checked,
                  }))
                }
              />
              Accept terms
            </label>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

            <button className="w-fit rounded border px-4 py-2" type="submit">
              Start Quiz
            </button>
          </form>
        </section>
      )}

      {step === "quiz" && activeQuestion && (
        <section className="rounded border p-4 text-sm">
          <h2 className="mb-2 text-lg font-medium">Step 2: Quiz</h2>
          <p className="mb-3 font-medium">
            Question {quizIndex + 1} of {QUIZ_QUESTIONS.length}
          </p>
          <p className="mb-3">{activeQuestion.prompt}</p>
          <div className="flex flex-col gap-2">
            {activeQuestion.options.map((option, optionIndex) => (
              <button
                key={option}
                className="w-fit rounded border px-4 py-2 text-left"
                type="button"
                onClick={() => handleAnswer(optionIndex)}
              >
                {option}
              </button>
            ))}
          </div>
          {quizFeedback ? <p className="mt-3">{quizFeedback}</p> : null}
        </section>
      )}

      {step === "quizComplete" && (
        <section className="rounded border p-4 text-sm">
          <h2 className="mb-2 text-lg font-medium">Step 2: Quiz</h2>
          <p>Congratulations, your answers are correct!</p>
          <button className="mt-3 rounded border px-4 py-2" type="button" onClick={() => setStep("spin")}>
            Let&apos;s spin the wheel!
          </button>
        </section>
      )}

      {step === "spin" && (
        <section className="rounded border p-4 text-sm">
          <h2 className="mb-2 text-lg font-medium">Step 3: Spin</h2>
          <button className="rounded border px-4 py-2" type="button" onClick={handleSpin}>
            Spin
          </button>
          {spinResult ? <p className="mt-3">{spinResult}</p> : null}
        </section>
      )}

      <Link className="underline" href={`/g/${accessCode}/close`}>
        Go to close game page
      </Link>
    </main>
  );
}
