import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  ButtonGroup,
  Chip,
  Alert,
  InputAdornment
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Shuffle as ShuffleIcon,
  CurrencyRupee as RupeeIcon,
  Visibility as ShowIcon
} from '@mui/icons-material';
import type { GameState } from '../types/game';

interface GameControlsProps {
  gameState: GameState;
  onGameStateChange: (gameState: GameState) => void;
  onStartGame: () => void;
  onEndGame: () => void;
  onNewRound: () => void;
  onPlayerAction: (playerId: string, action: 'bet' | 'fold' | 'show', amount?: number) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  onGameStateChange,
  onStartGame,
  onEndGame,
  onNewRound,
  onPlayerAction
}) => {
  const [bootAmount, setBootAmount] = useState(10);
  const [betAmount, setBetAmount] = useState(20);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const canStartGame = gameState.players.length >= 2 && !gameState.isGameActive;
  const activePlayers = gameState.players.filter(p => !p.isFolded);

  const handleStartGame = () => {
    const updatedGameState = {
      ...gameState,
      bootAmount,
      currentBet: bootAmount,
      isGameActive: true,
      pot: bootAmount * gameState.players.length,
      players: gameState.players.map(p => ({
        ...p,
        totalBet: bootAmount,
        currentBet: bootAmount,
        isActive: true,
        isFolded: false
      }))
    };
    onGameStateChange(updatedGameState);
    onStartGame();
  };

  const handlePlayerBet = (playerId: string, amount: number) => {
    onPlayerAction(playerId, 'bet', amount);
  };

  const handlePlayerFold = (playerId: string) => {
    onPlayerAction(playerId, 'fold');
  };

  const handlePlayerShow = (playerId: string) => {
    onPlayerAction(playerId, 'show');
  };

  const getCurrentMinBet = () => {
    return Math.max(gameState.currentBet, bootAmount);
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Game Setup */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Game Controls
          </Typography>
          
          {!gameState.isGameActive ? (
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                label="Boot Amount"
                type="number"
                value={bootAmount}
                onChange={(e) => setBootAmount(Number(e.target.value))}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ width: 120 }}
              />
              
              <Button
                variant="contained"
                startIcon={<StartIcon />}
                onClick={handleStartGame}
                disabled={!canStartGame}
              >
                Start Game
              </Button>
              
              {!canStartGame && gameState.players.length < 2 && (
                <Alert severity="warning" sx={{ flex: 1, minWidth: 250 }}>
                  Add at least 2 players to start the game
                </Alert>
              )}
            </Box>
          ) : (
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <Chip 
                label={`Round ${gameState.currentRound}`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`Pot: ₹${gameState.pot}`} 
                color="success" 
                icon={<RupeeIcon />}
              />
              <Chip 
                label={`Min Bet: ₹${getCurrentMinBet()}`} 
                color="info" 
                variant="outlined"
              />
              <Chip 
                label={`Active: ${activePlayers.length}`} 
                color="secondary" 
                variant="outlined"
              />
              
              <Box sx={{ ml: 'auto' }}>
                <ButtonGroup size="small">
                  <Button
                    startIcon={<ShuffleIcon />}
                    onClick={onNewRound}
                    disabled={activePlayers.length <= 1}
                  >
                    New Round
                  </Button>
                  <Button
                    startIcon={<StopIcon />}
                    onClick={onEndGame}
                    color="error"
                  >
                    End Game
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Player Actions */}
      {/* {gameState.isGameActive && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Player Actions
            </Typography>
            
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
              <TextField
                select
                label="Select Player"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Choose player...</option>
                {activePlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </TextField>
              
              <TextField
                label="Bet Amount"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                sx={{ width: 120 }}
                inputProps={{ min: getCurrentMinBet() }}
              />
            </Box>

            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="contained"
                color="primary"
                onClick={() => selectedPlayerId && handlePlayerBet(selectedPlayerId, betAmount)}
                disabled={!selectedPlayerId || betAmount < getCurrentMinBet()}
                startIcon={<RupeeIcon />}
              >
                Bet ₹{betAmount}
              </Button>
              
              <Button
                variant="outlined"
                color="warning"
                onClick={() => selectedPlayerId && handlePlayerFold(selectedPlayerId)}
                disabled={!selectedPlayerId}
              >
                Fold
              </Button>
              
              <Button
                variant="contained"
                color="success"
                onClick={() => selectedPlayerId && handlePlayerShow(selectedPlayerId)}
                disabled={!selectedPlayerId || activePlayers.length < 2}
                startIcon={<ShowIcon />}
              >
                Show Cards
              </Button>
            </Box>

            {selectedPlayerId && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary">
                  Selected: {gameState.players.find(p => p.id === selectedPlayerId)?.name} 
                  (Current bet: ₹{gameState.players.find(p => p.id === selectedPlayerId)?.totalBet || 0})
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )} */}

      {/* Game Status */}
      {gameState.winner && (
        <Alert severity="success" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              🎉 {gameState.winner.name} wins!
            </Typography>
            <Typography variant="body1">
              Pot: ₹{gameState.pot}
            </Typography>
          </Box>
        </Alert>
      )}
    </Box>
  );
};

export default GameControls;
