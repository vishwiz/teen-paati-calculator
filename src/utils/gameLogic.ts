// Teen Patti game logic and hand evaluation

import type { Card, HandEvaluation, Player, CardRank } from '../types/game';
import { HandRank } from '../types/game';

// Card rank values for comparison
const RANK_VALUES: Record<CardRank, number> = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

// Special sequence handling for A-2-3 (lowest) and Q-K-A (highest)
const isValidSequence = (ranks: number[]): boolean => {
  const sorted = [...ranks].sort((a, b) => a - b);
  
  // Normal sequence
  if (sorted[1] === sorted[0] + 1 && sorted[2] === sorted[1] + 1) {
    return true;
  }
  
  // A-2-3 sequence
  if (sorted[0] === 1 && sorted[1] === 2 && sorted[2] === 3) {
    return true;
  }
  
  // Q-K-A sequence (treat A as 14)
  if (sorted[0] === 1 && sorted[1] === 12 && sorted[2] === 13) {
    return true;
  }
  
  return false;
};

export const evaluateHand = (cards: Card[]): HandEvaluation => {
  if (cards.length !== 3) {
    throw new Error('Teen Patti hands must have exactly 3 cards');
  }

  const ranks = cards.map(card => RANK_VALUES[card.rank]);
  const suits = cards.map(card => card.suit);
  const sortedRanks = [...ranks].sort((a, b) => b - a); // Sort descending for scoring

  // Check for Trail (Three of a Kind)
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
    return {
      rank: HandRank.TRAIL,
      score: 6000 + ranks[0] * 100,
      description: `Trail of ${cards[0].rank}s`,
      cards
    };
  }

  const isFlush = suits[0] === suits[1] && suits[1] === suits[2];
  const isSequence = isValidSequence(ranks);

  // Check for Pure Sequence (Straight Flush)
  if (isFlush && isSequence) {
    let sequenceScore = Math.max(...ranks);
    // Special scoring for A-2-3 (lowest straight)
    if (ranks.includes(1) && ranks.includes(2) && ranks.includes(3)) {
      sequenceScore = 3;
    }
    // Special scoring for Q-K-A (highest straight)
    if (ranks.includes(1) && ranks.includes(12) && ranks.includes(13)) {
      sequenceScore = 14;
    }
    
    return {
      rank: HandRank.PURE_SEQUENCE,
      score: 5000 + sequenceScore * 100,
      description: 'Pure Sequence',
      cards
    };
  }

  // Check for Sequence (Straight)
  if (isSequence) {
    let sequenceScore = Math.max(...ranks);
    if (ranks.includes(1) && ranks.includes(2) && ranks.includes(3)) {
      sequenceScore = 3;
    }
    if (ranks.includes(1) && ranks.includes(12) && ranks.includes(13)) {
      sequenceScore = 14;
    }
    
    return {
      rank: HandRank.SEQUENCE,
      score: 4000 + sequenceScore * 100,
      description: 'Sequence',
      cards
    };
  }

  // Check for Color (Flush)
  if (isFlush) {
    const score = sortedRanks[0] * 10000 + sortedRanks[1] * 100 + sortedRanks[2];
    return {
      rank: HandRank.COLOR,
      score: 3000 + score,
      description: 'Color',
      cards
    };
  }

  // Check for Pair
  let pairRank = 0;
  let kicker = 0;
  
  if (ranks[0] === ranks[1]) {
    pairRank = ranks[0];
    kicker = ranks[2];
  } else if (ranks[0] === ranks[2]) {
    pairRank = ranks[0];
    kicker = ranks[1];
  } else if (ranks[1] === ranks[2]) {
    pairRank = ranks[1];
    kicker = ranks[0];
  }

  if (pairRank > 0) {
    return {
      rank: HandRank.PAIR,
      score: 2000 + pairRank * 100 + kicker,
      description: `Pair of ${cards.find(c => RANK_VALUES[c.rank] === pairRank)?.rank}s`,
      cards
    };
  }

  // High Card
  const score = sortedRanks[0] * 10000 + sortedRanks[1] * 100 + sortedRanks[2];
  return {
    rank: HandRank.HIGH_CARD,
    score: 1000 + score,
    description: `${cards.find(c => RANK_VALUES[c.rank] === Math.max(...ranks))?.rank} High`,
    cards
  };
};

export const compareHands = (hand1: HandEvaluation, hand2: HandEvaluation): number => {
  return hand2.score - hand1.score; // Higher score wins
};

export const findWinner = (players: Player[]): Player | null => {
  const activePlayers = players.filter(p => !p.isFolded && p.cards.length === 3);
  
  if (activePlayers.length === 0) return null;
  if (activePlayers.length === 1) return activePlayers[0];

  // Evaluate all hands and find the best one
  const evaluatedPlayers = activePlayers.map(player => ({
    player,
    evaluation: evaluateHand(player.cards)
  }));

  evaluatedPlayers.sort((a, b) => compareHands(a.evaluation, b.evaluation));
  
  return evaluatedPlayers[0].player;
};

export const calculatePot = (players: Player[]): number => {
  return players.reduce((total, player) => total + player.totalBet, 0);
};

export const getHandDescription = (rank: HandRank): string => {
  switch (rank) {
    case HandRank.TRAIL: return 'Trail (Three of a Kind)';
    case HandRank.PURE_SEQUENCE: return 'Pure Sequence (Straight Flush)';
    case HandRank.SEQUENCE: return 'Sequence (Straight)';
    case HandRank.COLOR: return 'Color (Flush)';
    case HandRank.PAIR: return 'Pair';
    case HandRank.HIGH_CARD: return 'High Card';
    default: return 'Unknown';
  }
};

export const generateDeck = (): Card[] => {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck: Card[] = [];
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: RANK_VALUES[rank]
      });
    }
  }
  
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
