import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Paper
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { Player } from '../types/game';

interface WinnerSelectionProps {
  players: Player[];
  pot: number;
  onSelectWinner: (playerId: string) => void;
  isGameActive: boolean;
  currentRound: number;
}

const WinnerSelection: React.FC<WinnerSelectionProps> = ({
  players,
  pot,
  onSelectWinner,
  isGameActive,
  currentRound
}) => {
  const activePlayers = players.filter(p => !p.isFolded && p.isActive);

  if (!isGameActive || activePlayers.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Winner - Round {currentRound}
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Pot Amount: ₹{pot}</strong> - Click on the winning player to award the pot and calculate points.
          </Typography>
        </Alert>

        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))" 
          gap={2}
        >
          {activePlayers.map((player) => (
            <Paper
              key={player.id}
              elevation={2}
              sx={{
                p: 2,
                border: '2px solid transparent',
                transition: 'all 0.2s',
                cursor: 'pointer',
                '&:hover': {
                  border: '2px solid',
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                }
              }}
              onClick={() => onSelectWinner(player.id)}
            >
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  {player.name}
                </Typography>
              </Box>
              
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={`Bet: ₹${player.totalBet}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={`Wins: ${player.totalWins}`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
                <Chip 
                  label={`Points: ${player.totalPoints}`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<TrophyIcon />}
                sx={{
                  bgcolor: 'success.main',
                  '&:hover': {
                    bgcolor: 'success.dark'
                  }
                }}
              >
                Declare Winner
              </Button>
            </Paper>
          ))}
        </Box>

        <Box mt={3}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            💡 Tip: The winner receives the pot amount as points. All players' bet amounts are added to their total points.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WinnerSelection;
