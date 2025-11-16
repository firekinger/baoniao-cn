# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev              # Install dependencies and start development server
pnpm build            # Install dependencies and build for development
pnpm build:prod       # Install dependencies and build for production
pnpm lint             # Install dependencies and run ESLint
pnpm preview          # Install dependencies and preview production build

# All commands automatically run `pnpm install` first
```

## Project Architecture

This is a React-based 宝鸟先飞 (Baoniao Xianfei) game with extensive game systems. The architecture follows a modular, function-based approach:

### Core Game Loop
- **Game State Management**: Centralized in `src/hooks/useGameState.ts` using React hooks
- **Game Loop**: 60 FPS using `requestAnimationFrame` in `useGameState.ts:1080-1094`
- **Physics Engine**: Gravity, collision detection, and bird movement in `useGameState.ts:702-1057`
- **Canvas Rendering**: HTML5 Canvas in `src/components/GameCanvas/GameCanvas.tsx`

### Game Systems Architecture
The game is built around several independent but interconnected systems:

1. **Coin System** (`src/utils/coinSystem.ts`)
   - Coin rewards, multipliers, and game summary calculations
   - Persistent coin data storage using LocalStorage
   - Reward types: pipe passes, streaks, time bonuses, milestones, perfect runs

2. **Skin System** (`src/utils/skinSystem.ts`)
   - 20+ bird skins with rarity tiers (common, rare, epic, legendary)
   - Skill-based skins with unique abilities (teleport, destroy, shield, etc.)
   - Visual effects: glow, sparkle, gradient, particle effects

3. **Skill System** (`src/utils/skillSystem.ts`)
   - 8 different skill types tied to skins
   - Cooldown management and skill activation logic
   - Skills integrated with visual effects system

4. **Power-Up System** (`src/utils/powerUpSystem.ts`)
   - Temporary in-game power-ups (invincibility, speed boost, coin multiplier, magnet)
   - Power-up spawning and collection mechanics
   - Rarity-based spawn rates and duration management

5. **Particle System** (`src/utils/particleSystem.ts`)
   - Visual effects for skill usage, power-up collection
   - Dynamic particle generation and lifecycle management
   - Performance-optimized rendering

### State Management Pattern
The game uses a single `GameState` interface with multiple subsystems:
- Core game state (bird position, pipes, score)
- Economy data (coins, rewards, purchases)
- Visual effects state (particles, screen effects)
- Player progression (unlocked skins, achievements)

### Data Persistence
- **LocalStorage** for all player data (coins, skins, settings, high scores)
- **Atomic Updates** for critical transactions (e.g., skin purchases)
- **Backup/Restore** mechanisms for data integrity

### Performance Considerations
- Canvas rendering optimized with requestAnimationFrame
- Particle system with lifecycle management
- Memory cleanup for visual effects
- Efficient collision detection algorithms

### Key File Relationships
- `useGameState.ts` ← Central orchestrator, imports from all utility files
- `GameCanvas.tsx` ← Renders game state, imports particle and skin systems
- Utility files are largely independent and can be modified in isolation
- Type definitions in `src/types/game.ts` provide contracts between systems

### Configuration System
- Game difficulty configs with parameterized physics
- Power-up rarity and spawn rate configurations
- Skin skill cooldowns and effect values
- Modular configuration allows easy balancing adjustments

## Development Notes

- Uses Vite with React plugin and custom source-info plugin for development
- TypeScript strict mode enabled
- Tailwind CSS for UI components, Canvas API for game rendering
- All game systems are designed to be extensible through configuration objects
- Debug logging available throughout with `[DEBUG]` tags for development