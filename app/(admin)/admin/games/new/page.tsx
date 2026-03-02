"use client";

import Link from "next/link";
import { useState } from "react";
import { createGameAction } from "@/app/(admin)/admin/games/actions";
import type { GameStatus } from "@/lib/types";

type PrizeDraft = {
  name: string;
  stock: number;
  imageUrl: string;
};

type AnswerDraft = {
  text: string;
  correct: boolean;
};

type QuestionDraft = {
  question: string;
  answers: AnswerDraft[];
};

export default function AdminNewGamePage() {
  const [accessCode, setAccessCode] = useState("");
  const [status, setStatus] = useState<GameStatus>("draft");
  const [noWinChance, setNoWinChance] = useState(30);
  const [prizes, setPrizes] = useState<PrizeDraft[]>([
    { name: "Gift Card", stock: 5, imageUrl: "" },
  ]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionDraft[]>([
    {
      question: "",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    },
  ]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      setIsSaving(true);
      const result = await createGameAction({
        accessCode: accessCode.trim().toUpperCase(),
        status,
        noWinChance,
        prizes,
        quizQuestions,
      });

      if (result && !result.success) {
        setError(result.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Create New Game</h1>
      <Link className="underline text-sm" href="/admin/games">
        Back to games
      </Link>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <section className="rounded border p-4 text-sm">
          <h2 className="mb-3 text-lg font-medium">Game Settings</h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              Access Code
              <input
                className="rounded border px-3 py-2 font-mono uppercase"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
              />
            </label>

            <label className="flex flex-col gap-1">
              Status
              <select
                className="rounded border px-3 py-2"
                value={status}
                onChange={(event) => setStatus(event.target.value as GameStatus)}
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="closed">closed</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              noWinChance (0-100)
              <input
                className="rounded border px-3 py-2"
                type="number"
                min={0}
                max={100}
                value={noWinChance}
                onChange={(event) => setNoWinChance(Number(event.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="rounded border p-4 text-sm">
          <h2 className="mb-3 text-lg font-medium">Prizes</h2>
          <div className="flex flex-col gap-4">
            {prizes.map((prize, index) => (
              <div key={`prize-${index}`} className="rounded border p-3">
                <p className="mb-2 font-medium">Prize {index + 1}</p>
                <div className="flex flex-col gap-2">
                  <input
                    className="rounded border px-3 py-2"
                    placeholder="Prize name"
                    value={prize.name}
                    onChange={(event) =>
                      setPrizes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, name: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded border px-3 py-2"
                    placeholder="Stock"
                    type="number"
                    min={0}
                    value={prize.stock}
                    onChange={(event) =>
                      setPrizes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, stock: Number(event.target.value) }
                            : item,
                        ),
                      )
                    }
                  />
                  <input
                    className="rounded border px-3 py-2"
                    placeholder="Image URL (optional)"
                    value={prize.imageUrl}
                    onChange={(event) =>
                      setPrizes((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, imageUrl: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            className="mt-3 rounded border px-3 py-2"
            type="button"
            onClick={() =>
              setPrizes((current) => [...current, { name: "", stock: 1, imageUrl: "" }])
            }
          >
            Add prize
          </button>
        </section>

        <section className="rounded border p-4 text-sm">
          <h2 className="mb-3 text-lg font-medium">Quiz Questions</h2>
          <div className="flex flex-col gap-4">
            {quizQuestions.map((question, questionIndex) => (
              <div key={`question-${questionIndex}`} className="rounded border p-3">
                <p className="mb-2 font-medium">Question {questionIndex + 1}</p>
                <input
                  className="mb-2 w-full rounded border px-3 py-2"
                  placeholder="Question text"
                  value={question.question}
                  onChange={(event) =>
                    setQuizQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === questionIndex
                          ? { ...item, question: event.target.value }
                          : item,
                      ),
                    )
                  }
                />

                <div className="flex flex-col gap-2">
                  {question.answers.map((answer, answerIndex) => (
                    <label
                      key={`question-${questionIndex}-answer-${answerIndex}`}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        checked={answer.correct}
                        onChange={(event) =>
                          setQuizQuestions((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === questionIndex
                                ? {
                                    ...item,
                                    answers: item.answers.map((candidate, candidateIndex) =>
                                      candidateIndex === answerIndex
                                        ? { ...candidate, correct: event.target.checked }
                                        : candidate,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                      <input
                        className="w-full rounded border px-3 py-2"
                        placeholder={`Answer ${answerIndex + 1}`}
                        value={answer.text}
                        onChange={(event) =>
                          setQuizQuestions((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === questionIndex
                                ? {
                                    ...item,
                                    answers: item.answers.map((candidate, candidateIndex) =>
                                      candidateIndex === answerIndex
                                        ? { ...candidate, text: event.target.value }
                                        : candidate,
                                    ),
                                  }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>

                <button
                  className="mt-3 rounded border px-3 py-2"
                  type="button"
                  onClick={() =>
                    setQuizQuestions((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === questionIndex
                          ? {
                              ...item,
                              answers: [...item.answers, { text: "", correct: false }],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  Add answer
                </button>
              </div>
            ))}
          </div>

          <button
            className="mt-3 rounded border px-3 py-2"
            type="button"
            onClick={() =>
              setQuizQuestions((current) => [
                ...current,
                {
                  question: "",
                  answers: [
                    { text: "", correct: false },
                    { text: "", correct: false },
                  ],
                },
              ])
            }
          >
            Add question
          </button>
        </section>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button className="w-fit rounded border px-4 py-2" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save game"}
        </button>
      </form>
    </main>
  );
}
