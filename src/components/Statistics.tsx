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
  Chip,
  Paper,
  Alert
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  EmojiEvents as TrophyIcon,
  Casino as CasinoIcon
} from '@mui/icons-material';
import type { GameResult, GameStats } from '../types/game';
import { getHandDescription } from '../utils/gameLogic';

interface StatisticsProps {
  gameHistory: GameResult[];
  gameStats: GameStats;
}

const Statistics: React.FC<StatisticsProps> = ({ gameHistory, gameStats }) => {
  const winRate = gameStats.totalGames > 0 ? ((gameStats.totalWins / gameStats.totalGames) * 100).toFixed(1) : '0';
  const netAmount = gameStats.totalAmountWon - gameStats.totalAmountLost;

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const formatDate = (date: Date) => new Date(date).toLocaleDateString();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Statistics Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Game Statistics
          </Typography>
          
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
            gap={2}
          >
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {gameStats.totalGames}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Games
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {gameStats.totalWins}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Games Won
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {winRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Win Rate
              </Typography>
            </Box>
            
            <Box textAlign="center">
              <Typography 
                variant="h4" 
                color={netAmount >= 0 ? 'success.main' : 'error.main'} 
                fontWeight="bold"
              >
                {formatCurrency(netAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Amount
              </Typography>
            </Box>
          </Box>

          <Box mt={3} display="flex" gap={2} flexWrap="wrap">
            <Chip 
              icon={<TrophyIcon />}
              label={`Avg Pot: ${formatCurrency(gameStats.averagePot)}`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              icon={<CasinoIcon />}
              label={`Favorite Hand: ${getHandDescription(gameStats.favoriteHand)}`}
              color="secondary"
              variant="outlined"
            />
            <Chip 
              icon={<TrendingIcon />}
              label={`Total Won: ${formatCurrency(gameStats.totalAmountWon)}`}
              color="success"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Game History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Games
          </Typography>
          
          {gameHistory.length === 0 ? (
            <Alert severity="info">
              No games played yet. Start a game to see your history here!
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell>Winner</TableCell>
                    <TableCell align="right">Pot Amount</TableCell>
                    <TableCell align="center">Rounds</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gameHistory.slice(-10).reverse().map((game) => (
                    <TableRow key={game.id} hover>
                      <TableCell>
                        {formatDate(game.date)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                          {game.players.slice(0, 3).map((player, index) => (
                            <Chip 
                              key={index}
                              label={player} 
                              size="small" 
                              variant="outlined"
                              color={player === game.winner ? 'success' : 'default'}
                            />
                          ))}
                          {game.players.length > 3 && (
                            <Chip 
                              label={`+${game.players.length - 3}`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={game.winner} 
                          color="success" 
                          size="small"
                          icon={<TrophyIcon />}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(game.potAmount)}
                      </TableCell>
                      <TableCell align="center">
                        {game.rounds}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
