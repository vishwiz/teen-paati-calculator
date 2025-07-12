import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import {
  Stop as StopIcon,
  Visibility as SeeIcon,
  VisibilityOff as BlindIcon,
  MonetizationOn as BetIcon
} from '@mui/icons-material';
import type { Player, BetAction } from '../types/game';
import { 
  calculateBetLimits, 
  validateBetAction, 
  TEEN_PATTI_RULES 
} from '../utils/teenPattiRules';

interface TeenPattiGameSequenceProps {
  players: Player[];
  currentPlayerIndex: number;
  currentStake: number;
  pot: number;
  isGameActive: boolean;
  bettingPhase: 'boot' | 'betting' | 'showdown' | 'finished';
  onPlayerAction: (playerId: string, action: BetAction) => void;
  onNextPlayer: () => void;
  onEndGame: () => void;
}

const TeenPattiGameSequence: React.FC<TeenPattiGameSequenceProps> = ({
  players,
  currentPlayerIndex,
  currentStake,
  pot,
  isGameActive,
  bettingPhase,
  onPlayerAction,
  onNextPlayer,
  onEndGame
}) => {
  const [betAmount, setBetAmount] = useState<number>(0);
  const [showBetDialog, setShowBetDialog] = useState(false);
  const [actionType, setActionType] = useState<'chaal' | 'blind' | 'show'>('chaal');

  const currentPlayer = players[currentPlayerIndex];
  const activePlayers = players.filter(p => !p.isFolded);

  // Calculate betting limits for current player
  const isBlindPlayer = currentPlayer?.isBlind && !currentPlayer?.hasSeen;
  const { minBet, maxBet } = currentPlayer ? 
    calculateBetLimits(currentStake, isBlindPlayer) : 
    { minBet: 0, maxBet: 0 };

  const handleBetAction = (type: 'chaal' | 'blind' | 'show') => {
    if (!currentPlayer) return;
    
    setActionType(type);
    
    if (type === 'show') {
      const showCost = currentStake * TEEN_PATTI_RULES.showCost;
      setBetAmount(showCost);
    } else {
      setBetAmount(minBet);
    }
    
    setShowBetDialog(true);
  };

  const confirmBetAction = () => {
    if (!currentPlayer) return;

    const action: BetAction = {
      type: actionType,
      playerId: currentPlayer.id,
      amount: betAmount,
      timestamp: new Date(),
      isBlindAction: isBlindPlayer
    };

    const validation = validateBetAction(
      currentPlayer,
      action,
      currentStake,
      { players }
    );

    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Always process the player action first
    onPlayerAction(currentPlayer.id, action);
    setShowBetDialog(false);
    
    // Always advance to next player after any action (except game ending scenarios)
    const activePlayers = players.filter(p => !p.isFolded);
    if (activePlayers.length > 1) {
      // Small delay to allow state update, then advance turn
      setTimeout(() => {
        onNextPlayer();
      }, 100);
    }
  };

  const handleFold = () => {
    if (!currentPlayer) return;

    const action: BetAction = {
      type: 'pack',
      playerId: currentPlayer.id,
      amount: 0,
      timestamp: new Date()
    };

    onPlayerAction(currentPlayer.id, action);
    
    // Always advance to next player after fold
    const activePlayers = players.filter(p => !p.isFolded);
    if (activePlayers.length > 1) {
      setTimeout(() => {
        onNextPlayer();
      }, 100);
    }
  };

  const handleSeeCards = () => {
    if (!currentPlayer) return;

    const action: BetAction = {
      type: 'see',
      playerId: currentPlayer.id,
      amount: 0,
      timestamp: new Date()
    };

    onPlayerAction(currentPlayer.id, action);
  };

  if (!isGameActive || bettingPhase === 'finished') {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Game Status
          </Typography>
          <Alert severity="info">
            {bettingPhase === 'finished' ? 'Game Finished' : 'Game Not Active'}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Teen Patti Game Sequence
        </Typography>
        
        {/* Game Status */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">
              Current Pot: <strong>₹{pot}</strong>
            </Typography>
            <Typography variant="body2">
              Current Stake: <strong>₹{currentStake}</strong>
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="body2">
              Active Players: <strong>{activePlayers.length}</strong>
            </Typography>
            <Typography variant="body2">
              Phase: <Chip label={bettingPhase} size="small" color="primary" />
            </Typography>
          </Box>
          
          {/* Progress indicator */}
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Turn Progress
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentPlayerIndex + 1) / players.length * 100} 
              sx={{ mt: 0.5 }}
            />
          </Box>
        </Box>

        {/* Current Player Turn */}
        {currentPlayer && (
          <Card variant="outlined" sx={{ mb: 2, bgcolor: 'action.hover' }}>
            <CardContent>
              <Typography variant="h6" color="primary">
                {currentPlayer.name}'s Turn
              </Typography>
              
              <Box display="flex" gap={1} my={1}>
                <Chip 
                  icon={isBlindPlayer ? <BlindIcon /> : <SeeIcon />}
                  label={isBlindPlayer ? 'Playing Blind' : 'Seen Cards'}
                  color={isBlindPlayer ? 'warning' : 'success'}
                  size="small"
                />
                <Chip 
                  label={`Bet Range: ₹${minBet} - ₹${maxBet}`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={1} flexWrap="wrap" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BetIcon />}
                  onClick={() => handleBetAction(isBlindPlayer ? 'blind' : 'chaal')}
                >
                  {isBlindPlayer ? 'Blind Bet' : 'Chaal'}
                </Button>
                
                {!currentPlayer.hasSeen && (
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<SeeIcon />}
                    onClick={handleSeeCards}
                  >
                    See Cards
                  </Button>
                )}
                
                {activePlayers.length === 2 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleBetAction('show')}
                  >
                    Show (₹{currentStake * TEEN_PATTI_RULES.showCost})
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleFold}
                >
                  Pack/Fold
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Players Status */}
        <Typography variant="subtitle2" gutterBottom>
          Players Status
        </Typography>
        <Box 
          display="grid" 
          gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
          gap={1}
          mb={2}
        >
          {players.map((player, index) => (
            <Card 
              key={player.id} 
              variant="outlined"
              sx={{ 
                bgcolor: index === currentPlayerIndex ? 'primary.light' : 
                        player.isFolded ? 'action.disabledBackground' : 'background.paper',
                opacity: player.isFolded ? 0.6 : 1
              }}
            >
              <CardContent sx={{ py: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {player.name} {index === currentPlayerIndex && '(Current)'}
                </Typography>
                <Typography variant="caption" display="block">
                  Bet: ₹{player.totalBet} | Status: {
                    player.isFolded ? 'Folded' :
                    player.isBlind && !player.hasSeen ? 'Blind' :
                    player.hasSeen ? 'Seen' : 'Active'
                  }
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* End Game Button */}
        {activePlayers.length <= 1 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={onEndGame}
            fullWidth
          >
            End Game
          </Button>
        )}
      </CardContent>

      {/* Bet Dialog */}
      <Dialog open={showBetDialog} onClose={() => setShowBetDialog(false)}>
        <DialogTitle>
          {actionType === 'show' ? 'Show Cards' : 
           actionType === 'blind' ? 'Blind Bet' : 'Chaal Bet'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {actionType === 'show' 
              ? `Cost to show: ₹${currentStake * TEEN_PATTI_RULES.showCost}`
              : `Bet amount (₹${minBet} - ₹${maxBet})`
            }
          </Typography>
          
          {actionType !== 'show' && (
            <TextField
              type="number"
              label="Bet Amount"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              inputProps={{ min: minBet, max: maxBet }}
              fullWidth
              margin="normal"
            />
          )}
          
          <Typography variant="caption" color="text.secondary">
            Current player: {currentPlayer?.name} 
            ({isBlindPlayer ? 'Blind' : 'Seen'} player)
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBetDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmBetAction}
            variant="contained"
            disabled={betAmount < minBet || betAmount > maxBet}
          >
            Confirm {actionType === 'show' ? 'Show' : 'Bet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TeenPattiGameSequence;
