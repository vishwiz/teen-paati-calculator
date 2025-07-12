import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Avatar,
  Alert,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  VisibilityOff as BlindIcon,
  Visibility as SeeIcon
} from '@mui/icons-material';
import type { Player } from '../types/game';

interface PlayerManagementProps {
  players: Player[];
  onPlayersChange: (players: Player[]) => void;
  gameActive: boolean;
}

const PlayerManagement: React.FC<PlayerManagementProps> = ({
  players,
  onPlayersChange,
  gameActive
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 6) {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: newPlayerName.trim(),
        totalBet: 0,
        currentBet: 0,
        isActive: true,
        isFolded: false,
        isBlind: false,
        totalWins: 0,
        totalPoints: 0,
        initialBalance: 1000, // Default starting balance
        netProfit: 0,
        hasSeen: false, // Player hasn't seen cards yet
        turnOrder: players.length + 1 // Assign turn order
      };
      
      onPlayersChange([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (playerId: string) => {
    if (!gameActive) {
      onPlayersChange(players.filter(p => p.id !== playerId));
    }
  };

  const updatePlayerName = (playerId: string, name: string) => {
    if (!gameActive) {
      onPlayersChange(
        players.map(p => p.id === playerId ? { ...p, name } : p)
      );
    }
  };

  const getPlayerStatus = (player: Player) => {
    if (player.isFolded) return 'Folded';
    if (player.isBlind && !player.hasSeen) return 'Playing Blind';
    if (player.hasSeen && !player.isBlind) return 'Seen Cards';
    if (player.isActive) return 'Active';
    return 'Waiting';
  };

  const getPlayerStatusColor = (player: Player): 'error' | 'warning' | 'success' | 'primary' | 'default' => {
    if (player.isFolded) return 'error';
    if (player.isBlind && !player.hasSeen) return 'warning';
    if (player.hasSeen) return 'success';
    if (player.isActive) return 'primary';
    return 'default';
  };

  const toggleBlindMode = (playerId: string) => {
    if (gameActive) {
      onPlayersChange(
        players.map(p => 
          p.id === playerId ? { 
            ...p, 
            isBlind: !p.isBlind,
            hasSeen: p.isBlind ? p.hasSeen : false // Reset hasSeen when enabling blind
          } : p
        )
      );
    }
  };

  const seeCards = (playerId: string) => {
    if (gameActive) {
      onPlayersChange(
        players.map(p => 
          p.id === playerId ? { 
            ...p, 
            hasSeen: true,
            isBlind: false // Can't be blind after seeing cards
          } : p
        )
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Player Management ({players.length}/6)
        </Typography>
        
        {players.length < 2 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            At least 2 players are required to start the game
          </Alert>
        )}

        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(280px, 1fr))'
            },
            gap: { xs: 1.5, sm: 2 }
          }}
        >
          {players.map((player) => (
            <Card 
              variant="outlined" 
              sx={{ 
                position: 'relative',
                minHeight: { xs: 'auto', sm: 160 }
              }} 
              key={player.id}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box 
                  sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 1,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}
                >
                  <Avatar sx={{ width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } }}>
                    <PersonIcon />
                  </Avatar>
                  <TextField
                    size="small"
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    disabled={gameActive}
                    variant="outlined"
                    fullWidth
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                  />
                  {!gameActive && (
                    <IconButton
                      size="small"
                      onClick={() => removePlayer(player.id)}
                      color="error"
                      sx={{ minWidth: 'auto' }}
                    >
                      <RemoveIcon />
                    </IconButton>
                  )}
                </Box>
                
                <Box 
                  sx={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 1, sm: 0 }
                  }}
                >
                  <Chip
                    label={getPlayerStatus(player)}
                    color={getPlayerStatusColor(player)}
                    size="small"
                    icon={player.isBlind && !player.hasSeen ? <BlindIcon /> : 
                          player.hasSeen ? <SeeIcon /> : undefined}
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    Bet: ₹{player.totalBet}
                  </Typography>
                </Box>

                {gameActive && (
                  <Box 
                    sx={{
                      mb: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: { xs: 0.5, sm: 1 }
                    }}
                  >
                    <Tooltip title="Blind players bet half amount but can't see cards">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={player.isBlind && !player.hasSeen}
                            onChange={() => toggleBlindMode(player.id)}
                            size="small"
                            color="warning"
                            disabled={player.hasSeen}
                          />
                        }
                        label="Play Blind"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.8rem' },
                          '& .MuiFormControlLabel-label': {
                            fontSize: { xs: '0.75rem', sm: '0.8rem' }
                          }
                        }}
                      />
                    </Tooltip>
                    
                    {!player.hasSeen && !player.isFolded && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<SeeIcon />}
                        onClick={() => seeCards(player.id)}
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          minHeight: { xs: 32, sm: 36 }
                        }}
                      >
                        See Cards
                      </Button>
                    )}
                  </Box>
                )}
                
                <Box 
                  sx={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 0.5, sm: 0 }
                  }}
                >
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Wins: {player.totalWins}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="primary" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Points: {player.totalPoints}
                  </Typography>
                </Box>

                <Box 
                  sx={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 0.5,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: { xs: 0.5, sm: 0 }
                  }}
                >
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Balance: ₹{player.initialBalance - player.totalBet + player.totalPoints}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color={player.netProfit >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    Net: {player.netProfit >= 0 ? '+' : ''}₹{player.netProfit}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
          
          {!gameActive && players.length < 6 && (
            <Card 
              variant="outlined" 
              sx={{ 
                minHeight: { xs: 120, sm: 140 }, 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
              <CardContent 
                sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  p: { xs: 1.5, sm: 2 }
                }}
              >
                <TextField
                  placeholder="Enter player name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addPlayer();
                    }
                  }}
                  size="small"
                  fullWidth
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={addPlayer}
                  disabled={!newPlayerName.trim()}
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minHeight: { xs: 40, sm: 44 }
                  }}
                >
                  Add Player
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlayerManagement;
