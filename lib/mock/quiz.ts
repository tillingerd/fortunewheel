export type MockQuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export const MOCK_QUIZ_QUESTIONS: MockQuizQuestion[] = [
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
