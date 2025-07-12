import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import type { Player } from '../types/game';

interface FinalWinningsDisplayProps {
  players: Player[];
  totalPot: number;
  totalRounds: number;
  isOpen: boolean;
  onClose: () => void;
}

interface PlayerSummary extends Player {
  finalBalance: number;
  winPercentage: number;
  rank: number;
}

const FinalWinningsDisplay: React.FC<FinalWinningsDisplayProps> = ({
  players,
  totalPot,
  totalRounds,
  isOpen,
  onClose
}) => {
  // Calculate comprehensive player statistics
  const playerSummaries: PlayerSummary[] = players
    .map((player) => {
      const finalBalance = player.initialBalance - player.totalBet + player.totalPoints;
      const winPercentage = totalRounds > 0 ? (player.totalWins / totalRounds) * 100 : 0;
      const netProfit = player.totalPoints - player.totalBet;
      
      return {
        ...player,
        netProfit,
        finalBalance,
        winPercentage,
        rank: 0 // Will be assigned after sorting
      };
    })
    .sort((a, b) => b.netProfit - a.netProfit) // Sort by net profit descending
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const totalWinnings = playerSummaries.reduce((sum, p) => sum + Math.max(0, p.netProfit), 0);
  const totalLosses = Math.abs(playerSummaries.reduce((sum, p) => sum + Math.min(0, p.netProfit), 0));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank.toString();
    }
  };

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'success.main';
    if (profit < 0) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <TrophyIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Final Game Results
            </Typography>
          </Box>
          <Button onClick={onClose} color="inherit">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Game Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Game Summary
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={2}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {totalRounds}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Rounds
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {formatCurrency(totalPot)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Pot
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {formatCurrency(totalWinnings)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Winnings
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {formatCurrency(totalLosses)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Losses
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Player Rankings */}
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.50' }}>
                <TableCell><strong>Rank</strong></TableCell>
                <TableCell><strong>Player</strong></TableCell>
                <TableCell align="right"><strong>Wins</strong></TableCell>
                <TableCell align="right"><strong>Win %</strong></TableCell>
                <TableCell align="right"><strong>Total Bet</strong></TableCell>
                <TableCell align="right"><strong>Points Won</strong></TableCell>
                <TableCell align="right"><strong>Net Profit</strong></TableCell>
                <TableCell align="right"><strong>Final Balance</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playerSummaries.map((player) => (
                <TableRow 
                  key={player.id}
                  sx={{ 
                    backgroundColor: player.rank === 1 ? 'success.50' : 'inherit',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6" component="span">
                        {getRankIcon(player.rank)}
                      </Typography>
                      {player.rank === 1 && <TrophyIcon color="warning" fontSize="small" />}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {player.name}
                        </Typography>
                        {player.isBlind && (
                          <Chip label="Played Blind" size="small" color="warning" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {player.totalWins}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2">
                      {player.winPercentage.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(player.totalBet)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography variant="body2" color="success.main">
                      {formatCurrency(player.totalPoints)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                      {player.netProfit > 0 ? <ProfitIcon color="success" fontSize="small" /> : 
                       player.netProfit < 0 ? <LossIcon color="error" fontSize="small" /> : null}
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={getProfitColor(player.netProfit)}
                      >
                        {player.netProfit >= 0 ? '+' : ''}{formatCurrency(player.netProfit)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Typography 
                      variant="body1" 
                      fontWeight="bold"
                      color={player.finalBalance >= player.initialBalance ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(player.finalBalance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Winner Highlight */}
        {playerSummaries.length > 0 && (
          <Card sx={{ mt: 3, border: '2px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TrophyIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    🎉 {playerSummaries[0].name} Wins!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Net Profit: {formatCurrency(playerSummaries[0].netProfit)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close Results
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FinalWinningsDisplay;
