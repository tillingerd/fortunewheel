"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  RegistrationForm,
  type RegistrationFormValues,
} from "@/components/game/RegistrationForm";
import { Quiz } from "@/components/game/Quiz";
import { SpinPanel } from "@/components/game/SpinPanel";
import { Alert } from "@/components/ui/Alert";
import { PublicShell } from "@/components/game/PublicShell";
import { MiniStepHeader, StepHeader } from "@/components/game/StepHeader";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/game/ConfettiBurst";
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

function PanelTransition({ children, panelKey }: { children: React.ReactNode; panelKey: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={panelKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function PublicGamePage() {
  const params = useParams<{ accessCode: string }>();
  const accessCode = Array.isArray(params.accessCode) ? params.accessCode[0] : params.accessCode;
  const storageKey = `fw_playerId_${accessCode}`;
  const reducedMotion = useReducedMotion() ?? false;

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
  const [spinOutcome, setSpinOutcome] = useState<"win" | "noWin" | "outOfStock" | null>(null);
  const [confettiKey, setConfettiKey] = useState<string>("");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [showStickyHeader, setShowStickyHeader] = useState<boolean>(false);
  const [highlightActive, setHighlightActive] = useState<boolean>(false);

  const activeQuestion = useMemo(() => quizQuestions[quizIndex], [quizIndex, quizQuestions]);

  useEffect(() => {
    if (!contentRef.current) {
      return;
    }
    const behavior = reducedMotion ? "auto" : "smooth";
    const raf = window.requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior, block: "start" });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [step, quizIndex, reducedMotion]);

  const triggerHighlight = () => {
    if (reducedMotion) {
      return;
    }
    setHighlightActive(true);
    window.setTimeout(() => setHighlightActive(false), 650);
  };

  useEffect(() => {
    let rafId = 0;
    const updateSticky = () => {
      if (!headerRef.current) {
        return;
      }
      const threshold =
        headerRef.current.offsetTop + headerRef.current.offsetHeight - 8;
      setShowStickyHeader(window.scrollY > threshold);
    };

    const onScroll = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        updateSticky();
        rafId = 0;
      });
    };

    updateSticky();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateSticky);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateSticky);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

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
          setSpinOutcome("win");
          setConfettiKey(`resume-${result.player.id}`);
        } else {
          setSpinResult("No win this time");
          setSpinOutcome("noWin");
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
    setSpinOutcome(null);
    setAlertMessage("");
    triggerHighlight();
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
      triggerHighlight();
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
      triggerHighlight();
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
          setSpinOutcome("win");
          setConfettiKey(`already-${playerId}`);
        } else {
          setSpinResult("No win this time");
          setSpinOutcome("noWin");
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
      setSpinOutcome("win");
      setConfettiKey(`win-${playerId}-${Date.now()}`);
    } else if (result.outcome === "outOfStock") {
      setSpinResult("Sorry, prizes are out of stock.");
      setSpinOutcome("outOfStock");
    } else {
      setSpinResult("No win this time");
      setSpinOutcome("noWin");
    }
    setHasSpun(true);
    setSpinNote("");
  };

  return (
    <PublicShell>
      <ConfettiBurst triggerKey={spinOutcome === "win" ? confettiKey : ""} disabled={reducedMotion} />
      <div
        className={cn(
          "sticky top-3 z-20 mx-auto w-full max-w-2xl transition-all",
          showStickyHeader ? "opacity-100" : "pointer-events-none opacity-0 -translate-y-2",
          reducedMotion ? "transition-none" : "duration-200",
        )}
      >
        <MiniStepHeader accessCode={accessCode} step={step} />
      </div>

      <div ref={headerRef}>
        <StepHeader accessCode={accessCode} step={step} />
      </div>

      {alertMessage ? <Alert message={alertMessage} tone={alertTone} /> : null}

      <div
        ref={contentRef}
        className={cn(
          "flex flex-col gap-4 sm:gap-5 transition-shadow",
          highlightActive && !reducedMotion
            ? "ring-1 ring-zinc-900/10 shadow-[0_0_0_6px_rgba(15,23,42,0.05)]"
            : "ring-0 shadow-none",
        )}
      >
        {step === "registration" ? (
          <PanelTransition panelKey="registration">
            <RegistrationForm
              form={form}
              isSubmitting={isRegistering}
              onSubmit={handleStartQuiz}
              onChange={setForm}
            />
          </PanelTransition>
        ) : null}

        {step === "quiz" && activeQuestion ? (
          <PanelTransition panelKey={activeQuestion.id}>
            <Quiz
              key={activeQuestion.id}
              question={activeQuestion}
              questionIndex={quizIndex}
              totalQuestions={quizQuestions.length}
              feedback={quizFeedback}
              isSubmitting={isQuizSubmitting}
              onAnswer={handleAnswer}
            />
          </PanelTransition>
        ) : null}

        {step === "quizComplete" ? (
          <PanelTransition panelKey="quizComplete">
            <Card className="p-4 sm:p-5">
              <h2 className="mb-2 text-base font-semibold tracking-tight text-zinc-900 sm:text-lg">
                Step 2: Quiz
              </h2>
              <p className="text-sm text-zinc-700">Congratulations, your answers are correct!</p>
              <Button
                className="mt-4 w-full sm:w-fit"
                onClick={() => {
                  triggerHighlight();
                  setStep("spin");
                }}
              >
                Let&apos;s spin the wheel!
              </Button>
            </Card>
          </PanelTransition>
        ) : null}

        {step === "spin" ? (
          <PanelTransition panelKey="spin">
            <SpinPanel
              resultMessage={spinResult}
              onSpin={handleSpin}
              disabled={isSpinning || hasSpun || !quizPassed}
              isSpinning={isSpinning}
              note={spinNote}
              outcome={spinOutcome}
              reducedMotion={reducedMotion}
            />
          </PanelTransition>
        ) : null}
      </div>

      {isResuming ? (
        <p className="text-sm text-zinc-600">Loading saved progress...</p>
      ) : null}

      <div className="mt-8 flex justify-center">
        <Link
          className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100/80 px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-100 sm:w-auto"
          href={`/g/${accessCode}/close`}
        >
          Close game
        </Link>
      </div>
    </PublicShell>
  );
}
