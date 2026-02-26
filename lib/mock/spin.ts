export type MockPrize = {
  id: string;
  name: string;
  remaining: number;
};

export type SpinMockResult =
  | {
      type: "noWin";
      message: "No win this time";
    }
  | {
      type: "win";
      prize: Pick<MockPrize, "id" | "name">;
      message: string;
    };

const NO_WIN_CHANCE = 0.4;

// TODO: replace with repository/server-action backed prize inventory.
const mockPrizes: MockPrize[] = [
  { id: "prize_1", name: "Gift Card", remaining: 2 },
  { id: "prize_2", name: "Coffee Mug", remaining: 2 },
  { id: "prize_3", name: "Discount Voucher", remaining: 1 },
];

export function spinMock(): SpinMockResult {
  const availablePrizes = mockPrizes.filter((prize) => prize.remaining > 0);
  if (availablePrizes.length === 0) {
    return { type: "noWin", message: "No win this time" };
  }

  const forceNoWin = Math.random() < NO_WIN_CHANCE;
  if (forceNoWin) {
    return { type: "noWin", message: "No win this time" };
  }

  const selectedPrize =
    availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
  selectedPrize.remaining -= 1;

  return {
    type: "win",
    prize: {
      id: selectedPrize.id,
      name: selectedPrize.name,
    },
    message: `You won: ${selectedPrize.name}`,
  };
}

