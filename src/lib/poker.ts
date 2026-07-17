// Pure poker logic — no React, no DOM. Kept framework-free so it can be
// unit-tested and reused anywhere. Five-card evaluation is the engine; a
// hold'em deal and best-of-seven selection sit on top of it.
//
// Card sprite mapping (see public/cards/card-faces.png, a 13×4 grid):
//   suit: 0=Hearts, 1=Diamonds, 2=Spades, 3=Clubs   (row)
//   col : 0..12 = A,2,3,4,5,6,7,8,9,10,J,Q,K         (column)
// The poker "value" of a card is derived from its column, aces high.

export const SUITS = ["H", "D", "S", "C"] as const;
export type Suit = 0 | 1 | 2 | 3;

export interface Card {
  suit: Suit; // 0..3, indexes the sprite row
  col: number; // 0..12, indexes the sprite column (A..K)
}

// Column 0 is the Ace (value 14, high). Columns 1..8 are 2..9, column 9 is
// the ten, then J/Q/K = 11/12/13.
export function cardValue(card: Card): number {
  return card.col === 0 ? 14 : card.col + 1;
}

const RANK_LABEL = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export function cardLabel(card: Card): string {
  return `${RANK_LABEL[card.col]}${SUITS[card.suit]}`;
}

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (let s = 0; s < 4; s++) {
    for (let c = 0; c < 13; c++) {
      deck.push({ suit: s as Suit, col: c });
    }
  }
  return deck;
}

// Fisher–Yates. Mutates and returns the passed array.
export function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface HoldemDeal {
  player: Card[]; // two hole cards
  opponent: Card[]; // two hole cards
  board: Card[]; // five community cards: three flop, then turn, then river
}

// Deal a hold'em hand off a freshly shuffled deck. The whole board is dealt up
// front and the UI turns it over a street at a time.
export function dealHoldem(): HoldemDeal {
  const deck = shuffle(makeDeck());
  return {
    player: deck.slice(0, 2),
    opponent: deck.slice(2, 4),
    board: deck.slice(4, 9),
  };
}

export enum HandRank {
  HighCard = 0,
  Pair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
}

const HAND_NAME: Record<HandRank, string> = {
  [HandRank.HighCard]: "High Card",
  [HandRank.Pair]: "Pair",
  [HandRank.TwoPair]: "Two Pair",
  [HandRank.ThreeOfAKind]: "Three of a Kind",
  [HandRank.Straight]: "Straight",
  [HandRank.Flush]: "Flush",
  [HandRank.FullHouse]: "Full House",
  [HandRank.FourOfAKind]: "Four of a Kind",
  [HandRank.StraightFlush]: "Straight Flush",
};

export interface HandResult {
  rank: HandRank;
  name: string;
  // Ordered values used to break ties within the same rank, most significant
  // first. Compared lexicographically against another hand of equal rank.
  tiebreakers: number[];
}

export function evaluateHand(cards: Card[]): HandResult {
  const values = cards.map(cardValue).sort((a, b) => b - a); // high → low
  const isFlush = cards.every((c) => c.suit === cards[0].suit);

  // Count how many of each value we hold: value -> count.
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  // Sort distinct values by (count desc, value desc) so pairs/trips lead the
  // tiebreaker list ahead of kickers.
  const grouped = [...counts.entries()].sort((a, b) =>
    b[1] - a[1] || b[0] - a[0]
  );
  const countPattern = grouped.map((g) => g[1]).join(""); // e.g. "32", "22", "4"
  const orderedByGroup = grouped.map((g) => g[0]);

  // Straight detection, including the wheel A-2-3-4-5 (ace plays low).
  const distinct = [...new Set(values)];
  let straightHigh = 0;
  if (distinct.length === 5) {
    if (distinct[0] - distinct[4] === 4) {
      straightHigh = distinct[0];
    } else if (
      distinct[0] === 14 &&
      distinct[1] === 5 &&
      distinct[4] === 2
    ) {
      // wheel: ace counts as 1, so the straight is 5-high
      straightHigh = 5;
    }
  }

  const make = (rank: HandRank, tiebreakers: number[]): HandResult => ({
    rank,
    name: HAND_NAME[rank],
    tiebreakers,
  });

  if (straightHigh && isFlush) return make(HandRank.StraightFlush, [straightHigh]);
  if (countPattern === "41") return make(HandRank.FourOfAKind, orderedByGroup);
  if (countPattern === "32") return make(HandRank.FullHouse, orderedByGroup);
  if (isFlush) return make(HandRank.Flush, values);
  if (straightHigh) return make(HandRank.Straight, [straightHigh]);
  if (countPattern === "311") return make(HandRank.ThreeOfAKind, orderedByGroup);
  if (countPattern === "221") return make(HandRank.TwoPair, orderedByGroup);
  if (countPattern === "2111") return make(HandRank.Pair, orderedByGroup);
  return make(HandRank.HighCard, values);
}

// > 0  → hand a wins, < 0 → hand b wins, 0 → tie (identical rank + kickers).
export function compareResults(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.max(a.tiebreakers.length, b.tiebreakers.length); i++) {
    const diff = (a.tiebreakers[i] ?? 0) - (b.tiebreakers[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export interface BestHand {
  result: HandResult;
  cards: Card[]; // the five that play, taken from the cards passed in
}

// Every k-sized subset of items, order-insensitive.
function combinations<T>(items: T[], k: number): T[][] {
  const out: T[][] = [];
  const picked: T[] = [];
  const walk = (start: number) => {
    if (picked.length === k) {
      out.push([...picked]);
      return;
    }
    for (let i = start; i < items.length; i++) {
      picked.push(items[i]);
      walk(i + 1);
      picked.pop();
    }
  };
  walk(0);
  return out;
}

// The best five-card hand playable out of `cards` — seven of them at a hold'em
// showdown (two hole + five board), which is only 21 combinations, so brute
// force is cheaper than being clever. Returned cards are the same objects that
// were passed in, so callers can match them by identity.
export function bestHand(cards: Card[]): BestHand {
  if (cards.length < 5) {
    throw new Error(`bestHand needs at least five cards, got ${cards.length}`);
  }
  const combos = combinations(cards, 5);
  let best: BestHand = { result: evaluateHand(combos[0]), cards: combos[0] };
  for (let i = 1; i < combos.length; i++) {
    const result = evaluateHand(combos[i]);
    if (compareResults(result, best.result) > 0) best = { result, cards: combos[i] };
  }
  return best;
}
