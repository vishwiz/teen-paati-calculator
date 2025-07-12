// Types and interfaces for Teen Patti game

export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  value: number; // Numeric value for calculations (A=1, J=11, Q=12, K=13)
}

export interface Player {
  id: string;
  name: string;
  totalBet: number;
  currentBet: number;
  isActive: boolean;
  isFolded: boolean;
  isBlind: boolean;
  totalWins: number;
  totalPoints: number;
  initialBalance: number;
  netProfit: number;
}

export interface GameState {
  players: Player[];
  pot: number;
  currentRound: number;
  bootAmount: number;
  currentBet: number;
  isGameActive: boolean;
  winner?: Player;
  gameHistory: GameResult[];
}

export interface GameResult {
  id: string;
  date: Date;
  players: string[];
  winner: string;
  potAmount: number;
  rounds: number;
}

export const HandRank = {
  HIGH_CARD: 1,
  PAIR: 2,
  COLOR: 3,     // Flush
  SEQUENCE: 4,  // Straight
  PURE_SEQUENCE: 5, // Straight Flush
  TRAIL: 6      // Three of a Kind
} as const;

export type HandRank = typeof HandRank[keyof typeof HandRank];

export interface HandEvaluation {
  rank: HandRank;
  score: number;
  description: string;
  cards: Card[];
}

export interface BetAction {
  type: 'boot' | 'blind' | 'chaal' | 'fold' | 'show';
  playerId: string;
  amount: number;
  timestamp: Date;
}

export interface GameStats {
  totalGames: number;
  totalWins: number;
  totalAmountWon: number;
  totalAmountLost: number;
  averagePot: number;
  favoriteHand: HandRank;
}

export interface BlindPlaySettings {
  enabled: boolean;
  maxBlindBet: number;
  blindMultiplier: number; // Blind players bet at this multiplier
}
