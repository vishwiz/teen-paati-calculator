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
  CardContent,
  Chip
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

// Create Material-UI theme with responsive breakpoints
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
      fontSize: 'clamp(1.5rem, 4vw, 2.125rem)',
    },
    h5: {
      fontWeight: 600,
      fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
    },
    h6: {
      fontWeight: 600,
      fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
    },
    body1: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
    },
    body2: {
      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  spacing: 8,
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '16px',
          paddingRight: '16px',
          '@media (min-width: 600px)': {
            paddingLeft: '24px',
            paddingRight: '24px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: '56px',
        },
      },
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
      style={{ height: '100%', overflow: 'auto' }}
      {...other}
    >
      {value === index && (
        <Box 
          sx={{ 
            p: { xs: 2, sm: 3 },
            height: '100%',
            overflow: 'auto'
          }}
        >
          {children}
        </Box>
      )}
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
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
            <CasinoIcon sx={{ mr: 2 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Teen Patti Calculator
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-end', sm: 'center' },
                gap: { xs: 0.5, sm: 2 }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textAlign: 'right'
                }}
              >
                Pot: ₹{gameState.pot}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textAlign: 'right'
                }}
              >
                Round: {gameState.currentRound}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth={false}
          disableGutters
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 1, sm: 2 }
          }}
        >
          <Paper 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: { xs: 2, sm: 3 }
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="game tabs"
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    minHeight: { xs: 48, sm: 56 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }
                }}
              >
                <Tab 
                  icon={<PlayersIcon />} 
                  label="Game" 
                  iconPosition="start"
                  sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                />
                <Tab 
                  icon={<StatsIcon />} 
                  label="Statistics" 
                  iconPosition="start"
                  sx={{ flexDirection: { xs: 'column', sm: 'row' } }}
                />
              </Tabs>
            </Box>

            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <TabPanel value={tabValue} index={0}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: { xs: 2, sm: 3 },
                    height: '100%',
                    overflow: 'auto'
                  }}
                >
                  {/* Player Turn Sequence */}
                  <PlayerTurnSequence
                    players={gameState.players}
                    currentPlayerIndex={gameState.currentPlayerIndex}
                    currentRound={gameState.currentRound}
                    isGameActive={gameState.isGameActive}
                    onNextPlayer={nextPlayerTurn}
                  />

                  {/* Main Game Layout - Responsive Grid */}
                  <Box 
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(300px, 1fr) minmax(400px, 2fr)'
                      },
                      gap: { xs: 2, sm: 3 },
                      flex: 1
                    }}
                  >
                    {/* Left Column - Player Management & Controls */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
                      <PlayerManagement
                        players={gameState.players}
                        onPlayersChange={handlePlayersChange}
                        gameActive={gameState.isGameActive}
                      />

                      <GameControls
                        gameState={gameState}
                        onGameStateChange={handleGameStateChange}
                        onStartGame={handleStartGame}
                        onEndGame={handleEndGame}
                        onNewRound={handleNewRound}
                        onPlayerAction={handlePlayerAction}
                      />

                      <WinnerSelection
                        players={gameState.players}
                        pot={gameState.pot}
                        onSelectWinner={handleSelectWinner}
                        isGameActive={gameState.isGameActive}
                        currentRound={gameState.currentRound}
                      />
                    </Box>

                    {/* Right Column - Game Sequence & Status */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
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

                      {/* Current Game Status */}
                      {gameState.isGameActive && (
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Game Status
                            </Typography>
                            <Box 
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                  xs: '1fr',
                                  sm: 'repeat(auto-fit, minmax(200px, 1fr))'
                                },
                                gap: { xs: 1.5, sm: 2 }
                              }}
                            >
                              {gameState.players.map((player) => (
                                <Card key={player.id} variant="outlined" sx={{ minHeight: 120 }}>
                                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                                    <Typography 
                                      variant="subtitle1" 
                                      color={player.isFolded ? 'text.disabled' : 'text.primary'}
                                      sx={{ 
                                        fontWeight: 600,
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                      }}
                                    >
                                      {player.name}
                                      {player.isFolded && (
                                        <Chip 
                                          label="Folded" 
                                          size="small" 
                                          color="error" 
                                          sx={{ ml: 1, fontSize: '0.7rem' }}
                                        />
                                      )}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      Bet: ₹{player.totalBet}
                                    </Typography>
                                    <Typography variant="body2" color="success.main">
                                      Points: {player.totalPoints}
                                    </Typography>
                                    <Typography variant="body2" color="primary.main">
                                      Wins: {player.totalWins}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Statistics 
                  gameHistory={gameState.gameHistory} 
                  gameStats={gameStats} 
                />
              </TabPanel>
            </Box>
          </Paper>
        </Container>
      </Box>
      
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
