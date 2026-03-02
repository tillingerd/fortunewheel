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
import { Alert } from "@/components/ui/Alert";
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
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertTone, setAlertTone] = useState<"error" | "info">("error");
  const [isResuming, setIsResuming] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isQuizSubmitting, setIsQuizSubmitting] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [spinResult, setSpinResult] = useState<string>("");
  const [spinNote, setSpinNote] = useState<string>("");

  const activeQuestion = useMemo(() => quizQuestions[quizIndex], [quizIndex, quizQuestions]);

  useEffect(() => {
    let cancelled = false;

    async function resumeFromStorage() {
      const savedPlayerId = window.localStorage.getItem(storageKey);
      if (!savedPlayerId) {
        return;
      }

      setIsResuming(true);
      const result = await getPlayerState({
        accessCode,
        playerId: savedPlayerId,
      });
      if (cancelled) {
        return;
      }
      setIsResuming(false);

      if (!result.success) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      setPlayerId(result.player.id);
      setQuizQuestions(result.quizQuestions);
      setQuizPassed(result.player.quizPassed);
      if (result.statusMessage) {
        setAlertMessage(result.statusMessage);
        setAlertTone("info");
      }

      if (result.existingResult) {
        if (result.existingResult.outcome === "win" && result.existingResult.prize) {
          setSpinResult(`You won: ${result.existingResult.prize.name}`);
        } else {
          setSpinResult("No win this time");
        }
        setHasSpun(true);
        setSpinNote("Showing your saved spin result.");
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
    setIsRegistering(true);
    setAlertMessage("");
    setSpinNote("");

    const result = await registerPlayer({
      accessCode,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      acceptTerms: form.acceptTerms,
    });
    setIsRegistering(false);

    if (!result.success) {
      setAlertMessage(result.message);
      setAlertTone("error");
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
    setAlertMessage("");
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

    setIsQuizSubmitting(true);
    setAlertMessage("");
    const result = await submitQuizAnswers({
      accessCode,
      playerId,
      answers: updatedAnswers,
    });
    setIsQuizSubmitting(false);

    if (result.success) {
      setQuizPassed(true);
      setQuizFeedback("");
      setStep("quizComplete");
      return;
    }

    setQuizIndex(0);
    setSelectedAnswers([]);
    setQuizFeedback("Wrong answer — try again from Question 1.");
  };

  const handleSpin = async () => {
    if (!playerId) {
      setAlertMessage("Please complete registration first.");
      setAlertTone("error");
      return;
    }

    if (!quizPassed || hasSpun || isSpinning) {
      return;
    }

    setIsSpinning(true);
    setAlertMessage("");
    setSpinNote("");
    const result = await spin({ accessCode, playerId });
    setIsSpinning(false);

    if (!result.success) {
      if (result.code === "ALREADY_SPUN" && result.existingResult) {
        if (result.existingResult.outcome === "win" && result.existingResult.prize) {
          setSpinResult(`You won: ${result.existingResult.prize.name}`);
        } else {
          setSpinResult("No win this time");
        }
        setHasSpun(true);
        setSpinNote("You already spun the wheel. Showing your saved result.");
      } else {
        setAlertMessage(result.message);
        setAlertTone("error");
      }
      return;
    }

    if (result.outcome === "win" && result.prize) {
      setSpinResult(`You won: ${result.prize.name}`);
    } else {
      setSpinResult("No win this time");
    }
    setHasSpun(true);
    setSpinNote("");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Public Game</h1>
      <p className="text-sm text-zinc-700">Access code: {accessCode}</p>
      {alertMessage ? <Alert message={alertMessage} tone={alertTone} /> : null}

      {step === "registration" ? (
        <RegistrationForm
          form={form}
          isSubmitting={isRegistering}
          onSubmit={handleStartQuiz}
          onChange={setForm}
        />
      ) : null}

      {step === "quiz" && activeQuestion ? (
        <Quiz
          key={activeQuestion.id}
          question={activeQuestion}
          questionIndex={quizIndex}
          totalQuestions={quizQuestions.length}
          feedback={quizFeedback}
          isSubmitting={isQuizSubmitting}
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
          isSpinning={isSpinning}
          note={spinNote}
        />
      ) : null}

      {isResuming ? <p className="text-sm text-zinc-600">Loading saved progress...</p> : null}

      <Link className="underline" href={`/g/${accessCode}/close`}>
        Go to close game page
      </Link>
    </main>
  );
}
