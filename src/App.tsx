import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import {
  Casino as CasinoIcon,
  BarChart as StatsIcon,
  People as PlayersIcon
} from '@mui/icons-material';

import PlayerManagement from './components/PlayerManagement';
import GameControls from './components/GameControls';
import WinnerSelection from './components/WinnerSelection';
import Statistics from './components/Statistics';
import FinalWinningsDisplay from './components/FinalWinningsDisplay';
import TeenPattiGameSequence from './components/TeenPattiGameSequence';
import PlayerTurnSequence from './components/PlayerTurnSequence';

import type { GameState, Player, GameResult, GameStats, BetAction } from './types/game';
import { HandRank } from './types/game';
import { getNextPlayerIndex } from './utils/teenPattiRules';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [showFinalWinnings, setShowFinalWinnings] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    pot: 0,
    currentRound: 1,
    bootAmount: 10,
    currentBet: 10,
    minBet: 10,
    currentPlayerIndex: 0,
    dealerIndex: 0,
    bettingPhase: 'boot',
    isGameActive: false,
    gameHistory: []
  });
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    totalWins: 0,
    totalAmountWon: 0,
    totalAmountLost: 0,
    averagePot: 0,
    favoriteHand: HandRank.HIGH_CARD
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedGameHistory = localStorage.getItem('teenPattiGameHistory');
    const savedGameStats = localStorage.getItem('teenPattiGameStats');
    
    if (savedGameHistory) {
      try {
        const history = JSON.parse(savedGameHistory);
        setGameState(prev => ({ ...prev, gameHistory: history }));
      } catch (error) {
        console.error('Error loading game history:', error);
      }
    }
    
    if (savedGameStats) {
      try {
        const stats = JSON.parse(savedGameStats);
        setGameStats(stats);
      } catch (error) {
        console.error('Error loading game stats:', error);
      }
    }
  }, []);

  // Save to localStorage whenever game history changes
  useEffect(() => {
    localStorage.setItem('teenPattiGameHistory', JSON.stringify(gameState.gameHistory));
  }, [gameState.gameHistory]);

  useEffect(() => {
    localStorage.setItem('teenPattiGameStats', JSON.stringify(gameStats));
  }, [gameStats]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculatePot = (players: Player[]): number => {
    return players.reduce((total, player) => total + player.totalBet, 0);
  };

  const handleStartGame = () => {
    // Reset all players for new game
    const updatedPlayers = gameState.players.map(player => ({
      ...player,
      totalBet: gameState.bootAmount,
      currentBet: gameState.bootAmount,
      isFolded: false,
      isActive: true
    }));

    setGameState(prev => ({
      ...prev,
      players: updatedPlayers,
      currentRound: 1,
      pot: calculatePot(updatedPlayers),
      winner: undefined
    }));
  };

  const handleSelectWinner = (winnerId: string) => {
    const winner = gameState.players.find(p => p.id === winnerId);
    
    if (winner) {
      // Calculate winnings with blind play bonus
      const baseWinning = gameState.pot;
      const blindBonus = winner.isBlind ? baseWinning * 0.5 : 0; // 50% bonus for blind winners
      const totalWinning = baseWinning + blindBonus;

      // Update player stats
      const updatedPlayers = gameState.players.map(player => {
        if (player.id === winnerId) {
          const newTotalPoints = player.totalPoints + totalWinning;
          const newNetProfit = newTotalPoints - player.totalBet;
          
          return {
            ...player,
            totalWins: player.totalWins + 1,
            totalPoints: newTotalPoints,
            netProfit: newNetProfit
          };
        } else {
          // Calculate net profit for losing players
          const newNetProfit = player.totalPoints - player.totalBet;
          return {
            ...player,
            totalPoints: player.totalPoints, // Keep existing points
            netProfit: newNetProfit
          };
        }
      });

      // Create game result
      const gameResult: GameResult = {
        id: `game-${Date.now()}`,
        date: new Date(),
        players: gameState.players.map(p => p.name),
        winner: winner.name,
        potAmount: totalWinning,
        rounds: gameState.currentRound
      };

      // Update game stats
      setGameStats(prev => ({
        ...prev,
        totalGames: prev.totalGames + 1,
        totalWins: prev.totalWins + 1,
        totalAmountWon: prev.totalAmountWon + totalWinning,
        averagePot: ((prev.averagePot * prev.totalGames) + gameState.pot) / (prev.totalGames + 1)
      }));

      setGameState(prev => ({
        ...prev,
        players: updatedPlayers,
        winner,
        isGameActive: false,
        gameHistory: [...prev.gameHistory, gameResult]
      }));

      // Show final winnings after a short delay
      setTimeout(() => {
        setShowFinalWinnings(true);
      }, 1000);
    }
  };

  const handleEndGame = () => {
    setGameState(prev => ({
      ...prev,
      isGameActive: false,
      winner: undefined
    }));
  };

  const handleNewRound = () => {
    setGameState(prev => ({
      ...prev,
      currentRound: prev.currentRound + 1,
      winner: undefined
    }));
  };

  // Turn management functions
  const nextPlayerTurn = () => {
    setGameState(prev => {
      const activePlayers = prev.players.filter(p => !p.isFolded);
      
      // If only one or no active players, don't advance turn
      if (activePlayers.length <= 1) {
        console.log('Game should end - only', activePlayers.length, 'active players');
        return prev;
      }

      const nextIndex = getNextPlayerIndex(prev.players, prev.currentPlayerIndex);
      console.log('Current player index:', prev.currentPlayerIndex, 'Next index:', nextIndex);
      console.log('Active players:', activePlayers.map(p => p.name));
      
      // If getNextPlayerIndex returns -1, it means no valid next player
      if (nextIndex === -1) {
        console.log('No valid next player found, keeping current index');
        return prev;
      }

      return {
        ...prev,
        currentPlayerIndex: nextIndex
      };
    });
  };

  const handlePlayerAction = (playerId: string, action: 'bet' | 'fold' | 'show', amount?: number) => {
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => {
        if (player.id === playerId) {
          switch (action) {
            case 'bet':
              return { 
                ...player, 
                totalBet: player.totalBet + (amount || 0),
                currentBet: amount || 0,
                isActive: true,
                isFolded: false
              };
            case 'fold':
              return {
                ...player,
                isFolded: true,
                isActive: false
              };
            case 'show':
              return player; // Show action handled by winner selection
            default:
              return player;
          }
        }
        return player;
      });

      const newPot = calculatePot(updatedPlayers);
      let newCurrentBet = prev.currentBet;
      
      if (action === 'bet' && amount) {
        newCurrentBet = Math.max(newCurrentBet, amount);
      }

      return {
        ...prev,
        players: updatedPlayers,
        pot: newPot,
        currentBet: newCurrentBet
      };
    });
  };

  const handleTeenPattiPlayerAction = (playerId: string, action: BetAction) => {
    console.log('Player action:', playerId, action.type, action.amount);
    
    setGameState(prev => {
      const updatedPlayers = prev.players.map(player => {
        if (player.id === playerId) {
          switch (action.type) {
            case 'see':
              console.log(player.name, 'saw their cards');
              return { ...player, hasSeen: true, isBlind: false };
            case 'pack':
            case 'fold':
              console.log(player.name, 'folded');
              return { ...player, isFolded: true, isActive: false };
            case 'chaal':
            case 'blind':
              console.log(player.name, 'bet', action.amount, '(type:', action.type + ')');
              return { 
                ...player, 
                totalBet: player.totalBet + action.amount,
                currentBet: action.amount,
                isActive: true
              };
            default:
              return player;
          }
        }
        return player;
      });

      const newPot = updatedPlayers.reduce((sum, p) => sum + p.totalBet, 0);
      const newCurrentBet = Math.max(prev.currentBet, action.amount);
      
      console.log('Updated pot:', newPot, 'Current bet:', newCurrentBet);
      
      return {
        ...prev,
        players: updatedPlayers,
        pot: newPot,
        currentBet: newCurrentBet
      };
    });
  };

  const handlePlayersChange = (players: Player[]) => {
    setGameState(prev => ({ ...prev, players }));
  };

  const handleGameStateChange = (newGameState: GameState) => {
    setGameState(newGameState);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <CasinoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Teen Patti Calculator
          </Typography>
          <Typography variant="body2">
            Pot: ₹{gameState.pot} | Round: {gameState.currentRound}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="game tabs">
              <Tab 
                icon={<PlayersIcon />} 
                label="Players & Game" 
                iconPosition="start"
              />
              <Tab 
                icon={<StatsIcon />} 
                label="Statistics" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box display="flex" flexDirection="column" gap={3}>
              {/* Player Turn Sequence */}
              <PlayerTurnSequence
                players={gameState.players}
                currentPlayerIndex={gameState.currentPlayerIndex}
                currentRound={gameState.currentRound}
                isGameActive={gameState.isGameActive}
                onNextPlayer={nextPlayerTurn}
              />

              {/* Player Management */}
              <PlayerManagement
                players={gameState.players}
                onPlayersChange={handlePlayersChange}
                gameActive={gameState.isGameActive}
              />

              {/* Game Controls */}
              <GameControls
                gameState={gameState}
                onGameStateChange={handleGameStateChange}
                onStartGame={handleStartGame}
                onEndGame={handleEndGame}
                onNewRound={handleNewRound}
                onPlayerAction={handlePlayerAction}
              />

              {/* Teen Patti Game Sequence */}
              {gameState.isGameActive && (
                <TeenPattiGameSequence
                  players={gameState.players}
                  currentPlayerIndex={gameState.currentPlayerIndex}
                  currentStake={gameState.currentBet}
                  pot={gameState.pot}
                  isGameActive={gameState.isGameActive}
                  bettingPhase={gameState.bettingPhase}
                  onPlayerAction={handleTeenPattiPlayerAction}
                  onNextPlayer={nextPlayerTurn}
                  onEndGame={handleEndGame}
                />
              )}

              {/* Winner Selection */}
              <WinnerSelection
                players={gameState.players}
                pot={gameState.pot}
                onSelectWinner={handleSelectWinner}
                isGameActive={gameState.isGameActive}
                currentRound={gameState.currentRound}
              />

              {/* Current Game Status */}
              {gameState.isGameActive && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Current Game Status
                  </Typography>
                  <Box 
                    display="grid" 
                    gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" 
                    gap={2}
                  >
                    {gameState.players.map((player) => (
                      <Card key={player.id} variant="outlined">
                        <CardContent>
                          <Typography variant="h6" color={player.isFolded ? 'text.disabled' : 'text.primary'}>
                            {player.name} {player.isFolded && '(Folded)'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Bet: ₹{player.totalBet}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            Total Points: {player.totalPoints}
                          </Typography>
                          <Typography variant="body2" color="primary.main">
                            Wins: {player.totalWins}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Statistics 
              gameHistory={gameState.gameHistory} 
              gameStats={gameStats} 
            />
          </TabPanel>
        </Paper>
      </Container>
      
      <FinalWinningsDisplay 
        isOpen={showFinalWinnings}
        onClose={() => setShowFinalWinnings(false)}
        players={gameState.players}
        totalPot={gameState.pot}
        totalRounds={gameState.currentRound}
      />
    </ThemeProvider>
  );
}

export default App;
