# Teen Patti Calculator

A comprehensive React.js web application for managing and calculating Teen Patti (3-Card Poker) games with automatic calculations, player management, and game statistics.

## Features

### 🎮 Game Management
- **Player Management**: Add/remove 2-6 players with names and betting status
- **Automatic Calculations**: Real-time pot calculation and betting tracking  
- **Hand Evaluation**: Complete Teen Patti hand ranking system
- **Game Controls**: Start/stop games, manage rounds, player actions

### 🃏 Teen Patti Rules Support
- **Hand Rankings**: Trail, Pure Sequence, Sequence, Color, Pair, High Card
- **Betting System**: Boot amount, blind/seen betting, fold/show options
- **Card Dealing**: Automatic 3-card dealing with proper shuffling
- **Winner Detection**: Automatic winner determination based on hand strength

### 📊 Statistics & History
- **Game Statistics**: Win rate, total games, net amount tracking
- **Game History**: Complete record of past games with winners and pot amounts
- **Player Analytics**: Individual player performance tracking
- **Persistent Storage**: Local storage for game history and statistics

### 🎨 Modern UI/UX
- **Material-UI Design**: Clean, responsive interface
- **Card Visualization**: Realistic playing card display
- **Real-time Updates**: Live game state and calculations
- **Mobile Responsive**: Works on all device sizes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v6
- **Build Tool**: Vite
- **Styling**: Emotion (CSS-in-JS)
- **State Management**: React Hooks
- **Data Persistence**: LocalStorage

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20+)
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Use

### 1. Player Setup
- Add 2-6 players using the "Add Player" button
- Enter player names (required for game start)
- Players can be removed when game is not active

### 2. Game Configuration
- Set the boot amount (minimum bet)
- Click "Start Game" to begin
- Cards are automatically dealt to all players

### 3. Game Play
- Select players to perform actions:
  - **Bet**: Place additional bets (minimum current bet amount)
  - **Fold**: Player exits the current round
  - **Show**: Reveal cards and determine winner
- Pot automatically updates with each bet
- Game ends when "Show" is called or only one player remains

### 4. Statistics
- View game history in the Statistics tab
- Track win rates, net amounts, and game patterns
- All data is saved locally in your browser

## Teen Patti Hand Rankings

1. **Trail (Three of a Kind)** - Highest
2. **Pure Sequence (Straight Flush)** 
3. **Sequence (Straight)**
4. **Color (Flush)**
5. **Pair**
6. **High Card** - Lowest

### Special Sequences
- **A-2-3**: Lowest sequence
- **Q-K-A**: Highest sequence

## Game Features

### Automatic Calculations
- **Pot Management**: Real-time pot updates with every bet
- **Hand Evaluation**: Automatic hand strength calculation
- **Winner Detection**: Smart winner determination based on Teen Patti rules
- **Bet Validation**: Ensures minimum bet requirements

### Player Management  
- **Active Status**: Track active/folded players
- **Bet Tracking**: Individual and total bet amounts
- **Hand Display**: Visual card representation
- **Status Indicators**: Clear player status (Active, Folded, Winner)

### Statistics Dashboard
- **Game History**: Chronological game records
- **Performance Metrics**: Win rates and profit/loss tracking
- **Trend Analysis**: Favorite hands and playing patterns

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── PlayerManagement.tsx
│   ├── GameControls.tsx  
│   ├── CardDisplay.tsx
│   └── Statistics.tsx
├── types/              # TypeScript definitions
│   └── game.ts
├── utils/              # Game logic utilities
│   └── gameLogic.ts
└── App.tsx            # Main application component
```

### Key Components

- **PlayerManagement**: Handle player CRUD operations
- **GameControls**: Game state management and player actions
- **CardDisplay**: Visual representation of playing cards
- **Statistics**: Game history and analytics display

### Game Logic

- **Hand Evaluation**: Complete Teen Patti hand ranking implementation
- **Card Management**: Deck generation, shuffling, and dealing
- **Winner Calculation**: Rule-based winner determination
- **Bet Management**: Pot calculation and bet validation

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Future Enhancements

- [ ] Multiplayer online support
- [ ] Advanced betting options (side pots)
- [ ] Tournament mode
- [ ] Player avatars and themes
- [ ] Sound effects and animations
- [ ] Export game history
- [ ] Advanced statistics and charts
# teen-paati-calculator
