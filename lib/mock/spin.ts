export type SpinMockResult = {
  didWin: boolean;
  message: string;
};

export function spinMock(): SpinMockResult {
  const didWin = Math.random() >= 0.5;

  return {
    didWin,
    message: didWin ? "You won a prize!" : "No win this time.",
  };
}
