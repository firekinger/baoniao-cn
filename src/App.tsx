import React from 'react';
import { useGameState } from './hooks/useGameState';
import StartScreen from './components/StartScreen/StartScreen';
import GameScreen from './components/GameScreen/GameScreen';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Settings from './components/Settings/Settings';
import Shop from './components/Shop/Shop';
import ToastProvider from './components/UI/ToastProvider';
import PowerUpDisplayEnhanced from './components/PowerUp/PowerUpDisplayEnhanced';
import ScreenEffects from './components/Effects/ScreenEffects';
import './components/StartScreen/StartScreen.css';
import './index.css';

function App() {
  const { gameState, config, powerUpVisuals, actions } = useGameState();

  // 根据游戏状态显示不同的界面
  const renderCurrentScreen = () => {
    switch (gameState.status) {
      case 'start':
        return (
          <StartScreen
            playerName={gameState.playerName}
            coinData={gameState.coinData}
            currentSkin={gameState.currentSkin}
            coinRewards={gameState.coinRewards}
            onPlayerNameChange={actions.savePlayerName}
            onStartGame={actions.startGame}
            onShowLeaderboard={actions.showLeaderboard}
            onShowSettings={actions.showSettings}
            onShowShop={actions.showShop}
            onRemoveCoinReward={actions.removeCoinReward}

          />
        );
        
      case 'leaderboard':
        return (
          <Leaderboard
            onBack={actions.backToStart}
            currentPlayer={gameState.playerName}
          />
        );
        
      case 'settings':
        return (
          <Settings
            onBack={actions.backToStart}
            difficulty={gameState.difficulty}
            soundEnabled={gameState.soundEnabled}
            volume={gameState.volume}
            effectsEnabled={gameState.effectsEnabled}
            onDifficultyChange={actions.updateDifficulty}
            onSoundToggle={actions.updateSoundEnabled}
            onVolumeChange={actions.updateVolume}
            onEffectsToggle={actions.updateEffectsEnabled}
          />
        );
        
      case 'shop':
        return (
          <Shop
            skins={actions.getAllSkins()}
            currentSkinId={gameState.currentSkin.id}
            coins={gameState.coinData.coins}
            onBack={actions.backToStart}
            onSkinSelect={actions.changeSkin}
            onSkinPurchase={actions.purchaseSkin}
          />
        );
        
      default:
        return (
          <ScreenEffects effects={gameState.effectsEnabled ? powerUpVisuals.screenEffects : []}>
            <GameScreen
              gameState={gameState}
              config={config}
              powerUpVisuals={gameState.effectsEnabled ? powerUpVisuals : {
                collectionEffects: [],
                activeEffects: [],
                screenEffects: [],
                particles: []
              }}
              onJump={actions.jump}
              onPause={actions.pauseGame}
              onResume={actions.resumeGame}
              onRestart={actions.resetGame}
              onRemoveCoinReward={actions.removeCoinReward}
              getCoinSummary={actions.getCoinSummary}
              onUseSkill={actions.useSkill}
            />
            <PowerUpDisplayEnhanced 
              activePowerUps={gameState.activePowerUps} 
              effects={gameState.powerUpEffects}
              enableEffects={gameState.effectsEnabled}
            />
          </ScreenEffects>
        );
    }
  };

  return (
    <ToastProvider>
      {renderCurrentScreen()}
    </ToastProvider>
  );
}

export default App;