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
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          Teen Patti Game Sequence
        </Typography>
        
        {/* Game Status */}
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 0.5, sm: 1 },
              mb: 1
            }}
          >
            <Typography 
              variant="body2"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Current Pot: <strong>₹{pot}</strong>
            </Typography>
            <Typography 
              variant="body2"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Current Stake: <strong>₹{currentStake}</strong>
            </Typography>
          </Box>
          
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 0.5, sm: 1 },
              mb: { xs: 1.5, sm: 2 }
            }}
          >
            <Typography 
              variant="body2"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Active Players: <strong>{activePlayers.length}</strong>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                variant="body2"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Phase:
              </Typography>
              <Chip 
                label={bettingPhase} 
                size="small" 
                color="primary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              />
            </Box>
          </Box>
          
          {/* Progress indicator */}
          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
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
          <Card 
            variant="outlined" 
            sx={{ 
              mb: { xs: 1.5, sm: 2 }, 
              bgcolor: 'action.hover',
              border: '2px solid',
              borderColor: 'primary.main'
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography 
                variant="h6" 
                color="primary"
                sx={{ 
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  mb: { xs: 1, sm: 1.5 }
                }}
              >
                {currentPlayer.name}'s Turn
              </Typography>
              
              <Box 
                sx={{
                  display: 'flex', 
                  gap: 1, 
                  my: 1,
                  flexWrap: 'wrap'
                }}
              >
                <Chip 
                  icon={isBlindPlayer ? <BlindIcon /> : <SeeIcon />}
                  label={isBlindPlayer ? 'Playing Blind' : 'Seen Cards'}
                  color={isBlindPlayer ? 'warning' : 'success'}
                  size="small"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
                <Chip 
                  label={`Bet Range: ₹${minBet} - ₹${maxBet}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              </Box>

              {/* Action Buttons */}
              <Box 
                sx={{
                  display: 'flex', 
                  gap: { xs: 1, sm: 1.5 }, 
                  flexWrap: 'wrap', 
                  mt: { xs: 1.5, sm: 2 }
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BetIcon />}
                  onClick={() => handleBetAction(isBlindPlayer ? 'blind' : 'chaal')}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 36, sm: 40 },
                    flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' }
                  }}
                >
                  {isBlindPlayer ? 'Blind Bet' : 'Chaal'}
                </Button>
                
                {!currentPlayer.hasSeen && (
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<SeeIcon />}
                    onClick={handleSeeCards}
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minHeight: { xs: 36, sm: 40 },
                      flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' }
                    }}
                  >
                    See Cards
                  </Button>
                )}
                
                {activePlayers.length === 2 && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleBetAction('show')}
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minHeight: { xs: 36, sm: 40 },
                      flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' }
                    }}
                  >
                    Show (₹{currentStake * TEEN_PATTI_RULES.showCost})
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleFold}
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    minHeight: { xs: 36, sm: 40 },
                    flex: { xs: '1 1 calc(50% - 4px)', sm: 'none' }
                  }}
                >
                  Pack/Fold
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Players Status */}
        <Typography 
          variant="subtitle2" 
          gutterBottom
          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
        >
          Players Status
        </Typography>
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(180px, 1fr))',
              md: 'repeat(auto-fit, minmax(200px, 1fr))'
            },
            gap: { xs: 1, sm: 1.5 },
            mb: { xs: 1.5, sm: 2 }
          }}
        >
          {players.map((player, index) => (
            <Card 
              key={player.id} 
              variant="outlined"
              sx={{ 
                bgcolor: index === currentPlayerIndex ? 'primary.light' : 
                        player.isFolded ? 'action.disabledBackground' : 'background.paper',
                opacity: player.isFolded ? 0.6 : 1,
                border: index === currentPlayerIndex ? '2px solid' : '1px solid',
                borderColor: index === currentPlayerIndex ? 'primary.main' : 'divider'
              }}
            >
              <CardContent sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    mb: 0.5
                  }}
                >
                  {player.name} {index === currentPlayerIndex && '(Current)'}
                </Typography>
                <Typography 
                  variant="caption" 
                  display="block"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
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
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 44, sm: 48 }
            }}
          >
            End Game
          </Button>
        )}
      </CardContent>

      {/* Bet Dialog */}
      <Dialog 
        open={showBetDialog} 
        onClose={() => setShowBetDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
            maxWidth: { xs: 'calc(100vw - 32px)', sm: 'sm' }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {actionType === 'show' ? 'Show Cards' : 
           actionType === 'blind' ? 'Blind Bet' : 'Chaal Bet'}
        </DialogTitle>
        <DialogContent>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            mb={2}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
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
              size="small"
              sx={{
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
          )}
          
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
          >
            Current player: {currentPlayer?.name} 
            ({isBlindPlayer ? 'Blind' : 'Seen'} player)
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Button 
            onClick={() => setShowBetDialog(false)}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmBetAction}
            variant="contained"
            disabled={betAmount < minBet || betAmount > maxBet}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Confirm {actionType === 'show' ? 'Show' : 'Bet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TeenPattiGameSequence;
