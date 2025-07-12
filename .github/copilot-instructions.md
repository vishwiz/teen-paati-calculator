# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive React.js Teen Patti (3-Card Poker) game calculator application built with TypeScript and Material-UI. It's a fully functional card game application with advanced features including real-time gameplay, betting systems, player management, statistics tracking, and persistent data storage.

## Architecture & Design Patterns

### Component Architecture
- **Functional Components**: All components use React hooks and functional patterns
- **Separation of Concerns**: Clear division between UI components, game logic, and data management
- **Component Hierarchy**: App.tsx → Major Components → Sub-components
- **Props-Down Pattern**: State flows down through props, events bubble up through callbacks

### State Management
- **React Hooks**: useState, useEffect for local component state
- **Centralized Game State**: Main game state managed in App.tsx
- **LocalStorage Integration**: Automatic persistence of game history and statistics
- **Real-time Updates**: State changes immediately reflect in UI

## Technology Stack

### Core Dependencies
- **React 18** with TypeScript for modern React development
- **Material-UI (MUI) v6** for comprehensive UI components and theming
- **Vite** for fast development server and optimized builds
- **Emotion** for CSS-in-JS styling integration with MUI

### Development Tools
- **TypeScript 5.8+** for static type checking
- **ESLint** with React-specific rules for code quality
- **Node.js 18+** required for development environment

## Key Features & Components

### Core Components
1. **PlayerManagement.tsx** - Add/remove players, manage player states, blind/seen modes
2. **GameControls.tsx** - Start/stop games, betting actions, game flow control
3. **TeenPattiGameSequence.tsx** - Turn-based gameplay, betting interface, action validation
4. **WinnerSelection.tsx** - Manual winner selection and game conclusion
5. **Statistics.tsx** - Game history display, analytics, performance tracking
6. **PlayerTurnSequence.tsx** - Visual turn indicator and player status
7. **FinalWinningsDisplay.tsx** - Game result modal with detailed breakdown

### Game Logic Modules
1. **types/game.ts** - Complete TypeScript interfaces and type definitions
2. **utils/teenPattiRules.ts** - Teen Patti rule validation, betting logic, hand evaluation
3. **utils/gameLogic.ts** - Card evaluation, hand comparison, game mechanics

### Features Implemented
- **Player Management**: 2-6 players with customizable names and betting status
- **Betting System**: Boot amounts, blind/chaal betting, fold/pack/show actions
- **Hand Evaluation**: Complete Teen Patti hand ranking system
- **Turn Management**: Proper turn sequence with active player tracking
- **Statistics**: Game history, win rates, profit/loss tracking
- **Data Persistence**: LocalStorage for game history and player statistics
- **Responsive UI**: Mobile-friendly Material Design interface

## Teen Patti Rules Implementation

### Hand Rankings (Highest to Lowest)
1. **Trail/Set** (Three of a Kind) - e.g., AAA, KKK
2. **Pure Sequence** (Straight Flush) - e.g., A♠2♠3♠, K♥Q♥J♥
3. **Sequence** (Straight) - e.g., A-2-3 mixed suits
4. **Color** (Flush) - Same suit, not sequential
5. **Pair** - Two cards of same rank
6. **High Card** - No combination

### Special Sequences
- **A-2-3**: Lowest sequence (beats high card only)
- **Q-K-A**: Highest sequence
- **Ace Handling**: Can be 1 or 14 in sequences

### Betting Rules
- **Boot**: Initial ante amount (default ₹10)
- **Blind Betting**: 1x current stake (playing without seeing cards)
- **Seen Betting**: 2x current stake (after seeing cards)
- **Maximum Bet**: 2x current stake limit
- **Show Cost**: 2x current stake (reveal cards between last 2 players)

### Game Flow
1. All players contribute boot amount
2. Players take turns: bet/blind/fold/see cards/show
3. Game continues until only 1 player remains or show is called
4. Winner takes entire pot

## Code Guidelines & Best Practices

### TypeScript Usage
- **Strict Type Checking**: Use defined interfaces from `types/game.ts`
- **Interface Definitions**: All data structures must have proper TypeScript interfaces
- **Type Safety**: Avoid `any` types, use proper type assertions
- **Generic Functions**: Use generic types for reusable utility functions

### Component Development
- **Functional Components**: Use React.FC or function declarations
- **Hook Usage**: Prefer hooks over class components
- **Props Interface**: Define props interface for each component
- **Default Props**: Use destructuring with default values
- **Error Boundaries**: Implement error handling in components

### Material-UI Integration
- **Theme Usage**: Use the established MUI theme configuration
- **Component Consistency**: Stick to MUI components for UI consistency
- **Responsive Design**: Use MUI's breakpoint system and responsive utilities
- **Accessibility**: Follow MUI accessibility patterns and ARIA labels

### State Management Patterns
- **Immutable Updates**: Use spread operators and immutable patterns
- **State Normalization**: Keep state flat and normalized where possible
- **Effect Dependencies**: Properly manage useEffect dependencies
- **Callback Optimization**: Use useCallback for expensive operations

### Performance Considerations
- **Component Memoization**: Use React.memo for expensive renders
- **State Updates**: Batch state updates where possible
- **LocalStorage**: Debounce localStorage writes for performance
- **Large Lists**: Use virtualization for large player lists (future)

## File Structure & Organization

```
src/
├── components/           # React components
│   ├── PlayerManagement.tsx      # Player CRUD operations
│   ├── GameControls.tsx          # Game state management
│   ├── TeenPattiGameSequence.tsx # Turn-based gameplay
│   ├── WinnerSelection.tsx       # Winner selection UI
│   ├── Statistics.tsx            # Game analytics
│   ├── PlayerTurnSequence.tsx    # Turn indicators
│   ├── FinalWinningsDisplay.tsx  # Results modal
│   └── CardDisplay.tsx           # Card visualization
├── types/               # TypeScript definitions
│   ├── game.ts                   # Main game interfaces
│   ├── game_new.ts              # Alternative type definitions
│   └── game_backup.ts           # Backup type definitions
├── utils/               # Game logic utilities
│   ├── teenPattiRules.ts        # Teen Patti rule engine
│   └── gameLogic.ts             # Card evaluation logic
└── App.tsx             # Main application component
```

## Development Workflow

### Setup & Installation
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
```

### Development Server
- **Local URL**: http://localhost:5173
- **Hot Reload**: Enabled for all file changes
- **TypeScript**: Real-time type checking

### Common Development Tasks
1. **Adding Components**: Create in `src/components/` with proper TypeScript interfaces
2. **Game Logic**: Add rules to `utils/teenPattiRules.ts` or `utils/gameLogic.ts`
3. **Type Definitions**: Update `types/game.ts` for new data structures
4. **Styling**: Use MUI components and theme system

## Testing Approach
- **Manual Testing**: Use browser dev tools and game simulation
- **Type Safety**: TypeScript compiler catches type-related issues
- **Game Logic**: Test betting scenarios, hand evaluations, edge cases
- **UI Responsiveness**: Test on different screen sizes

## Common Pitfalls & Solutions

### State Management Issues
- **Problem**: State updates not reflecting immediately
- **Solution**: Use functional state updates and proper effect dependencies

### Teen Patti Logic Errors
- **Problem**: Incorrect hand evaluation or betting validation
- **Solution**: Reference `utils/teenPattiRules.ts` for rule implementation

### Material-UI Theme Issues
- **Problem**: Inconsistent styling or theme conflicts
- **Solution**: Use established theme configuration and MUI's sx prop

### Performance Problems
- **Problem**: Slow renders or excessive re-renders
- **Solution**: Use React.memo, optimize state structure, profile components

## Data Models & Interfaces

### Key Interfaces
```typescript
interface Player {
  id: string;
  name: string;
  totalBet: number;
  currentBet: number;
  isActive: boolean;
  isFolded: boolean;
  isBlind: boolean;
  hasSeen: boolean;
  totalWins: number;
  totalPoints: number;
  netProfit: number;
  // ... more properties
}

interface GameState {
  players: Player[];
  pot: number;
  currentRound: number;
  currentPlayerIndex: number;
  bettingPhase: 'boot' | 'betting' | 'showdown' | 'finished';
  isGameActive: boolean;
  // ... more properties
}
```

## Security Considerations
- **Client-Side Only**: No server communication, all data stored locally
- **Input Validation**: Validate all user inputs (bet amounts, player names)
- **XSS Prevention**: Use React's built-in XSS protection
- **LocalStorage Limits**: Handle storage quota exceeded errors

## Future Enhancement Areas
1. **Multiplayer Support**: Real-time multiplayer with WebSocket/WebRTC
2. **Advanced Statistics**: Charts, trends, detailed analytics
3. **Card Animations**: Smooth card dealing and flipping animations
4. **Sound Effects**: Audio feedback for game actions
5. **Tournament Mode**: Multi-round tournament structure
6. **Export Features**: CSV/PDF export of game history
7. **Theming**: Multiple UI themes and customization options
8. **Offline PWA**: Progressive Web App with offline support

## Error Handling Patterns
- **Graceful Degradation**: Handle localStorage failures
- **Input Validation**: Validate all game actions and bets
- **Edge Cases**: Handle invalid game states gracefully
- **User Feedback**: Clear error messages and validation feedback
