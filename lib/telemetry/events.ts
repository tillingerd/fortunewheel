export type TelemetryEvent =
  | {
      name: "public.register.attempt";
      accessCode: string;
    }
  | {
      name: "public.register.success";
      accessCode: string;
      gameId: string;
      playerId: string;
    }
  | {
      name: "public.register.failed";
      accessCode: string;
      reason: "VALIDATION_ERROR" | "EMAIL_ALREADY_PLAYED";
    }
  | {
      name: "public.quiz.submit";
      accessCode: string;
      playerId: string;
      answersCount: number;
    }
  | {
      name: "public.quiz.result";
      accessCode: string;
      playerId: string;
      success: boolean;
    }
  | {
      name: "public.spin.attempt";
      accessCode: string;
      playerId: string;
    }
  | {
      name: "public.spin.result";
      accessCode: string;
      playerId: string;
      success: boolean;
      outcome?: "win" | "noWin" | "outOfStock";
      errorCode?: "PLAYER_NOT_FOUND" | "ALREADY_SPUN" | "QUIZ_NOT_PASSED";
    }
  | {
      name: "public.game_unavailable";
      source: "register" | "quiz" | "spin";
      accessCode: string;
      status: "draft" | "active" | "closed" | "missing";
    };

export function trackEvent(event: TelemetryEvent): void {
  if (typeof window !== "undefined") {
    return;
  }

  console.info("[telemetry]", event);
}
