import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  PlayArrow as CurrentTurnIcon,
  CheckCircle as CompletedIcon,
  Schedule as WaitingIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import type { Player } from '../types/game';

interface PlayerTurnSequenceProps {
  players: Player[];
  currentPlayerIndex: number;
  currentRound: number;
  isGameActive: boolean;
  onPlayerClick?: (playerId: string) => void;
  onNextPlayer?: () => void;
}

const PlayerTurnSequence: React.FC<PlayerTurnSequenceProps> = ({
  players,
  currentPlayerIndex,
  currentRound,
  isGameActive,
  onPlayerClick,
  onNextPlayer
}) => {
  const activePlayers = players.filter(p => !p.isFolded);
  const currentPlayer = players[currentPlayerIndex];

  const getPlayerTurnStatus = (playerIndex: number) => {
    if (!isGameActive) return 'waiting';
    if (players[playerIndex].isFolded) return 'folded';
    if (playerIndex === currentPlayerIndex) return 'current';
    if (playerIndex < currentPlayerIndex) return 'completed';
    return 'waiting';
  };

  const getStatusColor = (status: string): 'primary' | 'success' | 'error' | 'default' => {
    switch (status) {
      case 'current': return 'primary';
      case 'completed': return 'success';
      case 'folded': return 'error';
      case 'waiting': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return <CurrentTurnIcon />;
      case 'completed': return <CompletedIcon />;
      case 'waiting': return <WaitingIcon />;
      default: return <PersonIcon />;
    }
  };

  const calculateTurnProgress = () => {
    if (!isGameActive || activePlayers.length === 0) return 0;
    return ((currentPlayerIndex + 1) / players.length) * 100;
  };

  return (
    <Card sx={{ mb: { xs: 1.5, sm: 2 } }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Box 
          sx={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: { xs: 1.5, sm: 2 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            Player Turn Sequence
          </Typography>
          <Chip 
            label={`Round ${currentRound}`} 
            color="primary" 
            size="small"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          />
        </Box>

        {/* Current Player Highlight */}
        {isGameActive && currentPlayer && (
          <Card 
            variant="outlined" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              bgcolor: 'primary.light', 
              border: '2px solid',
              borderColor: 'primary.main',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.8 }
              },
              animation: 'pulse 2s infinite'
            }}
          >
            <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 1.5, sm: 2 } }}>
              <Box 
                sx={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: { xs: 1.5, sm: 2 }
                }}
              >
                <Avatar sx={{ 
                  bgcolor: 'primary.main',
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  '@keyframes bounce': {
                    '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%': { transform: 'translateY(-4px)' },
                    '60%': { transform: 'translateY(-2px)' }
                  },
                  animation: 'bounce 1s infinite'
                }}>
                  <CurrentTurnIcon />
                </Avatar>
                <Box flex={1}>
                  <Typography 
                    variant="h6" 
                    color="primary.main" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    🎯 {currentPlayer.name}'s Turn
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentPlayer.isBlind && !currentPlayer.hasSeen ? 
                      '👁️‍🗨️ Playing Blind (Bet 1x stake)' : 
                      currentPlayer.hasSeen ? 
                      '👀 Has Seen Cards (Bet 2x stake)' : 
                      '🎮 Active Player'
                    }
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Position {currentPlayerIndex + 1} of {players.length}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption" color="text.secondary">
                    Current Bet
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    ₹{currentPlayer.totalBet}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Turn Progress Bar */}
        {isGameActive && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Turn Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentPlayerIndex + 1} of {players.length}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={calculateTurnProgress()} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.5s ease-in-out'
                }
              }} 
            />
          </Box>
        )}

        {/* Player Sequence Grid */}
        <Typography variant="subtitle2" gutterBottom>
          All Players ({activePlayers.length} active)
        </Typography>
        
        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" 
          gap={1}
        >
          {players.map((player, index) => {
            const status = getPlayerTurnStatus(index);
            const isCurrentTurn = status === 'current';
            
            return (
              <Tooltip 
                key={player.id} 
                title={
                  isCurrentTurn ? "Current player's turn" :
                  status === 'completed' ? "Turn completed" :
                  status === 'folded' ? "Player folded" :
                  "Waiting for turn"
                }
              >
                <Card 
                  variant="outlined"
                  sx={{ 
                    cursor: onPlayerClick ? 'pointer' : 'default',
                    bgcolor: 
                      isCurrentTurn ? 'primary.light' : 
                      status === 'completed' ? 'success.light' :
                      status === 'folded' ? 'error.light' : 
                      'background.paper',
                    opacity: status === 'folded' ? 0.6 : 1,
                    border: isCurrentTurn ? '2px solid' : '1px solid',
                    borderColor: 
                      isCurrentTurn ? 'primary.main' : 
                      status === 'completed' ? 'success.main' :
                      status === 'folded' ? 'error.main' :
                      'divider',
                    transform: isCurrentTurn ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': onPlayerClick ? {
                      transform: 'scale(1.02)',
                      boxShadow: 2
                    } : {}
                  }}
                  onClick={() => onPlayerClick?.(player.id)}
                >
                  <CardContent sx={{ py: 1.5 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar 
                        sx={{ 
                          width: 24, 
                          height: 24, 
                          bgcolor: getStatusColor(status) + '.main',
                          fontSize: '0.8rem'
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Typography 
                        variant="body2" 
                        fontWeight={isCurrentTurn ? 'bold' : 'normal'}
                        color={isCurrentTurn ? 'primary.main' : 'text.primary'}
                        noWrap
                      >
                        {player.name}
                      </Typography>
                      <Box ml="auto">
                        <IconButton size="small" disabled>
                          {getStatusIcon(status)}
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip
                        size="small"
                        label={
                          status === 'current' ? 'YOUR TURN' :
                          status === 'completed' ? 'Done' :
                          status === 'folded' ? 'Folded' :
                          'Waiting'
                        }
                        color={getStatusColor(status) as any}
                        variant={isCurrentTurn ? 'filled' : 'outlined'}
                      />
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        fontWeight={isCurrentTurn ? 'bold' : 'normal'}
                      >
                        ₹{player.totalBet}
                      </Typography>
                    </Box>

                    {/* Player status indicators */}
                    <Box mt={0.5} display="flex" gap={0.5}>
                      {player.isBlind && !player.hasSeen && (
                        <Chip label="Blind" size="small" color="warning" variant="outlined" />
                      )}
                      {player.hasSeen && (
                        <Chip label="Seen" size="small" color="success" variant="outlined" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            );
          })}
        </Box>

        {/* Next Player Preview */}
        {isGameActive && (
          <Box mt={2} p={1} bgcolor="action.hover" borderRadius={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Next up: {
                  (() => {
                    const nextIndex = (currentPlayerIndex + 1) % players.length;
                    let searchIndex = nextIndex;
                    let attempts = 0;
                    
                    while (attempts < players.length && players[searchIndex].isFolded) {
                      searchIndex = (searchIndex + 1) % players.length;
                      attempts++;
                    }
                    
                    return attempts < players.length ? players[searchIndex].name : 'Game end';
                  })()
                }
              </Typography>
              
              {/* Manual Next Player Button (for debugging) */}
              <Button
                size="small"
                variant="outlined"
                onClick={onNextPlayer}
                disabled={activePlayers.length <= 1}
                sx={{ fontSize: '0.7rem' }}
              >
                Next Player →
              </Button>
            </Box>
          </Box>
        )}

        {!isGameActive && (
          <Box mt={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Game not active - Add players to start
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerTurnSequence;
