import React from 'react';
import {
  Box,
  Card as MuiCard,
  Typography,
  Chip
} from '@mui/material';
import type { Card } from '../types/game';

interface CardDisplayProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  isRevealed?: boolean;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  size = 'medium',
  isRevealed = true
}) => {
  const getSuitSymbol = (suit: Card['suit']): string => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getSuitColor = (suit: Card['suit']): string => {
    return suit === 'hearts' || suit === 'diamonds' ? '#d32f2f' : '#000';
  };

  const getCardSize = () => {
    switch (size) {
      case 'small': return { width: 40, height: 56, fontSize: '0.7rem' };
      case 'medium': return { width: 60, height: 84, fontSize: '0.9rem' };
      case 'large': return { width: 80, height: 112, fontSize: '1.1rem' };
      default: return { width: 60, height: 84, fontSize: '0.9rem' };
    }
  };

  const cardSize = getCardSize();

  if (!isRevealed) {
    return (
      <MuiCard
        sx={{
          width: cardSize.width,
          height: cardSize.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
          color: 'white',
          borderRadius: '8px',
          border: '2px solid #0d47a1'
        }}
      >
        <Typography variant="caption" sx={{ fontSize: cardSize.fontSize }}>
          ?
        </Typography>
      </MuiCard>
    );
  }

  return (
    <MuiCard
      sx={{
        width: cardSize.width,
        height: cardSize.height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px',
        background: '#fff',
        border: '2px solid #000',
        borderRadius: '8px',
        position: 'relative'
      }}
    >
      {/* Top left corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 2,
          left: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: getSuitColor(card.suit),
          fontSize: cardSize.fontSize,
          fontWeight: 'bold',
          lineHeight: 1
        }}
      >
        <Typography variant="caption" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          {card.rank}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
          {getSuitSymbol(card.suit)}
        </Typography>
      </Box>

      {/* Center symbol */}
      <Box
        sx={{
          color: getSuitColor(card.suit),
          fontSize: `${parseFloat(cardSize.fontSize) * 1.5}rem`,
          fontWeight: 'bold'
        }}
      >
        {getSuitSymbol(card.suit)}
      </Box>

      {/* Bottom right corner (rotated) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
          color: getSuitColor(card.suit),
          fontSize: cardSize.fontSize,
          fontWeight: 'bold',
          lineHeight: 1,
          transform: 'rotate(180deg)'
        }}
      >
        <Typography variant="caption" sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          {card.rank}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 'inherit' }}>
          {getSuitSymbol(card.suit)}
        </Typography>
      </Box>
    </MuiCard>
  );
};

interface PlayerCardsProps {
  cards: Card[];
  playerName: string;
  isRevealed?: boolean;
  handDescription?: string;
}

export const PlayerCards: React.FC<PlayerCardsProps> = ({
  cards,
  playerName,
  isRevealed = false,
  handDescription
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {playerName}'s Cards
      </Typography>
      
      <Box display="flex" gap={1} mb={1}>
        {cards.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No cards dealt
          </Typography>
        ) : (
          cards.map((card, index) => (
            <CardDisplay
              key={`${card.suit}-${card.rank}-${index}`}
              card={card}
              isRevealed={isRevealed}
              size="medium"
            />
          ))
        )}
      </Box>
      
      {isRevealed && handDescription && (
        <Chip 
          label={handDescription} 
          color="primary" 
          size="small" 
          variant="outlined"
        />
      )}
    </Box>
  );
};

export default CardDisplay;
