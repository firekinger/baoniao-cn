# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "宝鸟先飞" (Baoniao Xianfei), a React-based Flappy Bird game with extensive features including:
- Core Flappy Bird gameplay with multiple difficulty levels
- Comprehensive coin/monetization system with various reward types
- Skin system with special abilities and skills
- Power-up system with visual effects
- Particle effects and screen effects
- Leaderboard and settings management
- Shop system for purchasing skins

## Key Architecture

### State Management
- **Centralized State**: All game state is managed through `useGameState` hook (`src/hooks/useGameState.ts`)
- **Game State Interface**: Complete type definitions in `src/types/game.ts`
- **Local Storage**: Persistent data for player settings, coins, skins, and leaderboard

### Core Game Loop
- **Physics Engine**: Custom game physics in `updateGame` function within `useGameState`
- **Collision Detection**: Pipe, bird, power-up, and coin collision systems
- **Animation Loop**: RequestAnimationFrame-based game loop running at 60 FPS
- **Difficulty System**: Four difficulty levels (easy, normal, hard, expert) with different physics parameters

### Feature Systems
- **Coin System** (`src/utils/coinSystem.ts`): Rewards, streaks, milestones, time bonuses
- **Skin System** (`src/utils/skinSystem.ts`): Character skins with rarities and special skills
- **Skill System** (`src/utils/skillSystem.ts`): Special abilities tied to skins (dash, teleport, destroy, etc.)
- **Power-Up System** (`src/utils/powerUpSystem.ts`): In-game power-ups with temporary effects
- **Particle System** (`src/utils/particleSystem.ts`): Visual effects and animations

### Component Structure
- **App.tsx**: Main router handling different game states (start, playing, paused, shop, etc.)
- **GameScreen**: Container for the active game with UI overlays
- **GameCanvas**: Core game rendering and input handling
- **UI Components**: Modular components for coin display, shop, settings, leaderboard

#### Component Organization
```
src/components/
├── CoinSystem/          # Coin-related UI components
├── Effects/             # Visual effects and particle rendering
├── GameCanvas/          # Core game canvas component
├── GameScreen/          # Game container wrapper
├── Leaderboard/         # Score leaderboard
├── PowerUp/             # Power-up display components
├── Settings/            # Game settings interface
├── Shop/                # Skin purchase dialogs
├── Skill/               # Skill UI components
├── Skins/               # Skin selection and preview
├── StartScreen/         # Main menu and game start
└── UI/                  # Toast and utility UI
```

## Development Commands

```bash
# Start development server (includes automatic dependency installation)
pnpm dev

# Build for development (includes dependency installation and cache cleanup)
pnpm build

# Build for production (includes dependency installation, cache cleanup, and BUILD_MODE=prod)
pnpm build:prod

# Run linting (includes dependency installation)
pnpm lint

# Preview production build (includes dependency installation)
pnpm preview
```

**Important Notes:**
- All commands automatically run `pnpm install` first due to script configuration
- Build commands include `rm -rf node_modules/.vite-temp` for clean builds
- Production build sets `BUILD_MODE=prod` environment variable
- Project uses `yes | pnpm install` to automatically confirm all prompts

## Testing

This project currently does not have a test suite configured. When implementing tests:
- Add testing framework (Jest, Vitest, or React Testing Library) to package.json devDependencies
- Create test files alongside components with `.test.tsx` or `.spec.tsx` extensions
- Focus on testing utility functions in `src/utils/` first
- Test React components with user interaction scenarios
- Test game state management and collision detection logic

## Key Files and Their Purposes

### Core Game Logic
- `src/hooks/useGameState.ts` - Main game state hook containing physics, collision detection, and game loop
- `src/types/game.ts` - Complete TypeScript interfaces for all game entities and state
- `src/components/GameCanvas/GameCanvas.tsx` - Canvas rendering and input handling

### System Utilities
- `src/utils/coinSystem.ts` - Coin rewards, calculations, and reward animations
- `src/utils/skinSystem.ts` - Skin management, skills, and purchasing logic
- `src/utils/skillSystem.ts` - Skill activation, cooldowns, and effects
- `src/utils/powerUpSystem.ts` - Power-up spawning, collision, and effect management
- `src/utils/particleSystem.ts` - Visual effects and particle animations
- `src/utils/gameUtils.ts` - Leaderboard, settings persistence, and utility functions

### Configuration
- `vite.config.ts` - Vite configuration with React plugin, path aliases (@/), and source identifier plugin for development
- `eslint.config.js` - ESLint configuration with TypeScript and React rules
- `package.json` - Dependencies including comprehensive Radix UI component library, Tailwind CSS, React Router, and form validation
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration with strict mode and separate app/node configs
- `components.json` - shadcn/ui components configuration

### Key Dependencies
- **UI Framework**: React 18.3+ with TypeScript
- **Component Library**: Extensive Radix UI collection ( dialogs, navigation, forms, etc.)
- **Styling**: Tailwind CSS with animations and custom components
- **Routing**: React Router DOM v6
- **Forms**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics for deployment monitoring
- **Build Tool**: Vite with source mapping for development

### Deployment
- **Vercel Integration**: Project includes `.vercel` directory for Vercel deployment
- **Build Modes**:
  - Development build: `pnpm build`
  - Production build: `pnpm build:prod` (sets `BUILD_MODE=prod`)
- **Analytics**: @vercel/analytics package integrated for deployment analytics

## Game-Specific Notes

### Project Clarification

**Important**: This is "宝鸟先飞" (Baoniao Xianfei), a Flappy Bird game implementation. The codebase does not contain any dragonfly, predator, or enemy systems. References to `predator.takeDamage` errors or dragonfly gameplay elements are from different project versions or forks.

Current game implementation includes:
- Standard bird and pipe collision mechanics
- Coin collection and power-up systems
- No predator/enemy interaction systems
- No dragonfly-themed gameplay elements

### Difficulty Balancing
The game uses different physics parameters per difficulty level:
- Easy: `gravity: 0.12, pipeGap: 280`
- Normal: `gravity: 0.2, pipeGap: 200`
- Hard: `gravity: 0.35, pipeGap: 160`
- Expert: `gravity: 0.5, pipeGap: 130`

### Monetization Systems
- New players receive 2000 initial coins
- Coins are earned through gameplay, streaks, time bonuses, and milestones
- Skins can be purchased with coins and have different rarities
- Some skins include special skills with cooldowns

### Performance Considerations
- Canvas-based rendering for smooth 60 FPS gameplay
- Effect system can be toggled for performance
- Particle cleanup and memory management in visual effects
- Efficient collision detection with configurable margins

## Development Guidelines

### State Management
- Game state changes should go through the `useGameState` hook actions
- Use the defined action creators (`actions.startGame()`, `actions.jump()`, etc.) rather than direct state manipulation
- All game state is persisted to localStorage automatically through the utility functions

### Adding New Features
- New skins should follow the existing rarity and skill system patterns in `src/utils/skinSystem.ts`
- Visual effects should respect the `effectsEnabled` setting and use the particle system
- All coin-related operations must be atomic to prevent inconsistencies
- Use the existing difficulty configuration system for any new game parameters

### Code Organization
- Game logic should be centralized in `useGameState.ts`
- Utility functions should be placed in appropriate `src/utils/` files
- UI components should be organized in the component directory structure
- TypeScript types should be defined in `src/types/game.ts`

### Performance Considerations
- Canvas rendering runs at 60 FPS - optimize calculations in the game loop
- Particle effects can be toggled for performance via `effectsEnabled`
- Use requestAnimationFrame for smooth animations
- Clean up game objects when they go off-screen to prevent memory leaks