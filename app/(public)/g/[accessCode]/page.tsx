"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  RegistrationForm,
  type RegistrationFormValues,
} from "@/components/game/RegistrationForm";
import { Quiz } from "@/components/game/Quiz";
import { SpinPanel } from "@/components/game/SpinPanel";
import {
  getPlayerState,
  registerPlayer,
  spin,
  submitQuizAnswers,
  type RegisterPlayerResult,
} from "@/app/(public)/g/[accessCode]/actions";
import type { SubmittedQuizAnswer } from "@/lib/data/services/quizService";

type GameStep = "registration" | "quiz" | "quizComplete" | "spin";
type RegisteredQuestion = Extract<RegisterPlayerResult, { success: true }>["quizQuestions"][number];

export default function PublicGamePage() {
  const params = useParams<{ accessCode: string }>();
  const accessCode = Array.isArray(params.accessCode) ? params.accessCode[0] : params.accessCode;
  const storageKey = `fw_playerId_${accessCode}`;

  const [step, setStep] = useState<GameStep>("registration");
  const [form, setForm] = useState<RegistrationFormValues>({
    firstName: "",
    lastName: "",
    email: "",
    acceptTerms: false,
  });
  const [playerId, setPlayerId] = useState<string>("");
  const [quizPassed, setQuizPassed] = useState<boolean>(false);
  const [hasSpun, setHasSpun] = useState<boolean>(false);
  const [quizQuestions, setQuizQuestions] = useState<RegisteredQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<SubmittedQuizAnswer[]>([]);
  const [formError, setFormError] = useState<string>("");
  const [requestError, setRequestError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [spinResult, setSpinResult] = useState<string>("");

  const activeQuestion = useMemo(() => quizQuestions[quizIndex], [quizIndex, quizQuestions]);

  useEffect(() => {
    let cancelled = false;

    async function resumeFromStorage() {
      const savedPlayerId = window.localStorage.getItem(storageKey);
      if (!savedPlayerId) {
        return;
      }

      setIsLoading(true);
      const result = await getPlayerState({
        accessCode,
        playerId: savedPlayerId,
      });
      if (cancelled) {
        return;
      }
      setIsLoading(false);

      if (!result.success) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      setPlayerId(result.player.id);
      setQuizQuestions(result.quizQuestions);
      setQuizPassed(result.player.quizPassed);
      if (result.statusMessage) {
        setRequestError(result.statusMessage);
      }

      if (result.existingResult) {
        if (result.existingResult.outcome === "win" && result.existingResult.prize) {
          setSpinResult(`You won: ${result.existingResult.prize.name}`);
        } else {
          setSpinResult("No win this time");
        }
        setHasSpun(true);
        setStep("spin");
        return;
      }

      if (result.player.quizPassed) {
        setStep("spin");
      } else {
        setStep("quiz");
      }
    }

    void resumeFromStorage();
    return () => {
      cancelled = true;
    };
  }, [accessCode, storageKey]);

  const handleStartQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setFormError("");
    setRequestError("");

    const result = await registerPlayer({
      accessCode,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      acceptTerms: form.acceptTerms,
    });
    setIsLoading(false);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    window.localStorage.setItem(storageKey, result.playerId);
    setPlayerId(result.playerId);
    setQuizPassed(false);
    setHasSpun(false);
    setQuizQuestions(result.quizQuestions);
    setSelectedAnswers([]);
    setQuizIndex(0);
    setQuizFeedback("");
    setSpinResult("");
    setStep("quiz");
  };

  const handleAnswer = async (answerId: string) => {
    if (!activeQuestion) {
      return;
    }

    const updatedAnswers = [
      ...selectedAnswers.filter((item) => item.questionId !== activeQuestion.id),
      { questionId: activeQuestion.id, answerId },
    ];
    setSelectedAnswers(updatedAnswers);

    const isLastQuestion = quizIndex === quizQuestions.length - 1;
    if (!isLastQuestion) {
      setQuizIndex((current) => current + 1);
      setQuizFeedback("");
      return;
    }

    setIsLoading(true);
    setRequestError("");
    const result = await submitQuizAnswers({
      accessCode,
      playerId,
      answers: updatedAnswers,
    });
    setIsLoading(false);

    if (result.success) {
      setQuizPassed(true);
      setQuizFeedback("");
      setStep("quizComplete");
      return;
    }

    setQuizIndex(0);
    setSelectedAnswers([]);
    setQuizFeedback("Wrong answer. Restarted from question 1.");
  };

  const handleSpin = async () => {
    if (!playerId) {
      setRequestError("Please complete registration first.");
      return;
    }

    if (!quizPassed || hasSpun || isSpinning) {
      return;
    }

    setIsSpinning(true);
    setRequestError("");
    const result = await spin({ accessCode, playerId });
    setIsSpinning(false);

    if (!result.success) {
      setRequestError(result.message);
      if (result.code === "ALREADY_SPUN" && result.existingResult) {
        if (result.existingResult.outcome === "win" && result.existingResult.prize) {
          setSpinResult(`You won: ${result.existingResult.prize.name}`);
        } else {
          setSpinResult("No win this time");
        }
        setHasSpun(true);
      }
      return;
    }

    if (result.outcome === "win" && result.prize) {
      setSpinResult(`You won: ${result.prize.name}`);
    } else {
      setSpinResult("No win this time");
    }
    setHasSpun(true);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Public Game</h1>
      <p className="text-sm text-zinc-700">Access code: {accessCode}</p>
      {requestError ? <p className="text-sm text-red-600">{requestError}</p> : null}

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
          totalQuestions={quizQuestions.length}
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

      {step === "spin" ? (
        <SpinPanel
          resultMessage={spinResult}
          onSpin={handleSpin}
          disabled={isSpinning || hasSpun || !quizPassed}
        />
      ) : null}

      {isLoading ? <p className="text-sm text-zinc-600">Processing...</p> : null}

      <Link className="underline" href={`/g/${accessCode}/close`}>
        Go to close game page
      </Link>
    </main>
  );
}

