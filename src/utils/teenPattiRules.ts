import type { Player, Card, HandEvaluation, BetAction, TeenPattiRules } from '../types/game';

// Standard Teen Patti Rules Configuration
export const TEEN_PATTI_RULES: TeenPattiRules = {
  maxPlayers: 6,
  bootAmount: 10, // Default boot/ante amount
  blindBetMultiplier: 1, // Blind players bet 1x
  seenBetMultiplier: 2,  // Seen players bet 2x
  maxBetLimit: 2, // Maximum bet is 4x current stake
  showCost: 2 // Cost multiplier for show
};

// Hand Rankings (highest to lowest)
export const HAND_RANKINGS = {
  TRAIL: 6,        // Three of a kind (e.g., AAA)
  PURE_SEQUENCE: 5, // Straight flush (e.g., A♠2♠3♠)
  SEQUENCE: 4,     // Straight (e.g., A-2-3 different suits)
  COLOR: 3,        // Flush (same suit, not sequence)
  PAIR: 2,         // One pair
  HIGH_CARD: 1     // No combination
} as const;

/**
 * Calculate minimum and maximum bet for a player based on Teen Patti rules
 */
export function calculateBetLimits(
  currentStake: number, 
  isBlindPlayer: boolean
): { minBet: number; maxBet: number } {
  const multiplier = isBlindPlayer ? TEEN_PATTI_RULES.blindBetMultiplier : TEEN_PATTI_RULES.seenBetMultiplier;
  
  const minBet = currentStake * multiplier;
  const maxBet = currentStake * TEEN_PATTI_RULES.maxBetLimit * multiplier;
  
  return { minBet, maxBet };
}

/**
 * Validate if a bet action is legal according to Teen Patti rules
 */
export function validateBetAction(
  player: Player,
  action: BetAction,
  currentStake: number,
  gameState: any
): { isValid: boolean; error?: string } {
  
  if (player.isFolded) {
    return { isValid: false, error: "Folded players cannot bet" };
  }

  const { minBet, maxBet } = calculateBetLimits(currentStake, player.isBlind && !player.hasSeen);
  
  switch (action.type) {
    case 'boot':
      if (action.amount !== TEEN_PATTI_RULES.bootAmount) {
        return { isValid: false, error: `Boot amount must be ₹${TEEN_PATTI_RULES.bootAmount}` };
      }
      break;
      
    case 'chaal':
    case 'blind':
      if (action.amount < minBet) {
        return { isValid: false, error: `Minimum bet is ₹${minBet}` };
      }
      if (action.amount > maxBet) {
        return { isValid: false, error: `Maximum bet is ₹${maxBet}` };
      }
      break;
      
    case 'show':
      const showCost = currentStake * TEEN_PATTI_RULES.showCost;
      if (action.amount !== showCost) {
        return { isValid: false, error: `Show cost is ₹${showCost}` };
      }
      // Show is only allowed between last 2 players
      const activePlayers = gameState.players.filter((p: Player) => !p.isFolded);
      if (activePlayers.length > 2) {
        return { isValid: false, error: "Show only allowed between last 2 players" };
      }
      break;
      
    case 'see':
      // Seeing cards is free but changes betting rules
      if (action.amount !== 0) {
        return { isValid: false, error: "Seeing cards is free" };
      }
      if (player.hasSeen) {
        return { isValid: false, error: "Player has already seen cards" };
      }
      break;
  }
  
  return { isValid: true };
}

/**
 * Determine next player in turn sequence
 */
export function getNextPlayerIndex(
  players: Player[], 
  currentIndex: number
): number {
  const activePlayers = players.filter(p => !p.isFolded);
  
  // If only one or no active players, game should end
  if (activePlayers.length <= 1) {
    console.log('getNextPlayerIndex: Game should end, only', activePlayers.length, 'active players');
    return -1;
  }
  
  // Start searching from next position
  let nextIndex = (currentIndex + 1) % players.length;
  let attempts = 0;
  const maxAttempts = players.length; // Prevent infinite loop
  
  // Skip folded players
  while (players[nextIndex].isFolded && attempts < maxAttempts) {
    nextIndex = (nextIndex + 1) % players.length;
    attempts++;
  }
  
  // If we've checked all players and none are active, return -1
  if (attempts >= maxAttempts) {
    console.log('getNextPlayerIndex: No active players found after checking all positions');
    return -1;
  }
  
  console.log('getNextPlayerIndex: Current:', currentIndex, 'Next:', nextIndex, 'Player:', players[nextIndex].name);
  return nextIndex;
}

/**
 * Check if betting round should end
 */
export function shouldEndBettingRound(
  players: Player[]
): boolean {
  const activePlayers = players.filter(p => !p.isFolded);
  
  // Game ends if only 1 player remains
  if (activePlayers.length <= 1) {
    return true;
  }
  
  // Check if all active players have equal current bets
  const currentBets = activePlayers.map(p => p.currentBet);
  const allBetsEqual = currentBets.every(bet => bet === currentBets[0]);
  
  return allBetsEqual && currentBets[0] > 0;
}

/**
 * Calculate pot distribution for winner(s)
 */
export function calculatePotDistribution(
  players: Player[],
  winner: Player
): { [playerId: string]: number } {
  const totalPot = players.reduce((sum, player) => sum + player.totalBet, 0);
  
  // Winner takes the entire pot in Teen Patti
  return {
    [winner.id]: totalPot
  };
}

/**
 * Evaluate hand strength for comparison
 */
export function evaluateHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 3) {
    throw new Error("Teen Patti hands must have exactly 3 cards");
  }
  
  const ranks = cards.map(c => c.value).sort((a, b) => a - b);
  const suits = cards.map(c => c.suit);
  
  // Check for Trail (Three of a kind)
  if (ranks[0] === ranks[1] && ranks[1] === ranks[2]) {
    return {
      rank: HAND_RANKINGS.TRAIL,
      score: 6000 + ranks[0] * 100,
      description: `Trail of ${ranks[0]}s`,
      cards
    };
  }
  
  // Check for Pure Sequence (Straight Flush)
  const isSequence = isConsecutive(ranks);
  const isFlush = suits.every(suit => suit === suits[0]);
  
  if (isSequence && isFlush) {
    return {
      rank: HAND_RANKINGS.PURE_SEQUENCE,
      score: 5000 + getSequenceScore(ranks),
      description: `Pure Sequence ${ranks.join('-')}`,
      cards
    };
  }
  
  // Check for Sequence (Straight)
  if (isSequence) {
    return {
      rank: HAND_RANKINGS.SEQUENCE,
      score: 4000 + getSequenceScore(ranks),
      description: `Sequence ${ranks.join('-')}`,
      cards
    };
  }
  
  // Check for Color (Flush)
  if (isFlush) {
    return {
      rank: HAND_RANKINGS.COLOR,
      score: 3000 + ranks[2] * 100 + ranks[1] * 10 + ranks[0],
      description: `Color (${suits[0]})`,
      cards
    };
  }
  
  // Check for Pair
  if (ranks[0] === ranks[1] || ranks[1] === ranks[2] || ranks[0] === ranks[2]) {
    const pairRank = ranks[0] === ranks[1] ? ranks[0] : 
                    ranks[1] === ranks[2] ? ranks[1] : ranks[0];
    const kicker = ranks.find(r => r !== pairRank) || 0;
    
    return {
      rank: HAND_RANKINGS.PAIR,
      score: 2000 + pairRank * 100 + kicker,
      description: `Pair of ${pairRank}s`,
      cards
    };
  }
  
  // High Card
  return {
    rank: HAND_RANKINGS.HIGH_CARD,
    score: 1000 + ranks[2] * 100 + ranks[1] * 10 + ranks[0],
    description: `High Card ${ranks[2]}`,
    cards
  };
}

/**
 * Check if ranks form a consecutive sequence
 */
function isConsecutive(ranks: number[]): boolean {
  // Special case: A-2-3
  if (ranks[0] === 1 && ranks[1] === 2 && ranks[2] === 3) return true;
  
  // Special case: Q-K-A (12-13-1 becomes 12-13-14)
  if (ranks[0] === 1 && ranks[1] === 12 && ranks[2] === 13) return true;
  
  // Normal sequence
  return ranks[1] === ranks[0] + 1 && ranks[2] === ranks[1] + 1;
}

/**
 * Calculate sequence score considering special cases
 */
function getSequenceScore(ranks: number[]): number {
  // A-2-3 is the second-highest sequence
  if (ranks[0] === 1 && ranks[1] === 2 && ranks[2] === 3) return 199;
  
  // Q-K-A is the highest sequence
  if (ranks[0] === 1 && ranks[1] === 12 && ranks[2] === 13) return 200;
  
  // Normal sequence - use highest card
  return ranks[2];
}

/**
 * Compare two hands and return the winner
 */
export function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  if (hand1.rank !== hand2.rank) {
    return hand1.rank - hand2.rank;
  }
  
  return hand1.score - hand2.score;
}

/**
 * Generate play sequence based on dealer position
 */
export function generatePlaySequence(
  players: Player[], 
  dealerIndex: number
): Player[] {
  const sequence: Player[] = [];
  const playerCount = players.length;
  
  // Start from player after dealer
  for (let i = 1; i <= playerCount; i++) {
    const playerIndex = (dealerIndex + i) % playerCount;
    if (!players[playerIndex].isFolded) {
      sequence.push(players[playerIndex]);
    }
  }
  
  return sequence;
}
