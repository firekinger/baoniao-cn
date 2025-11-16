import React from 'react';
import { GameState, PowerUpVisualState } from '../../types/game';
import GameCanvas from '../GameCanvas/GameCanvas';
import CoinDisplay from '../CoinSystem/CoinDisplay';
import CoinRewardAnimation from '../CoinSystem/CoinRewardAnimation';
import CoinGameOverSummary from '../CoinSystem/CoinGameOverSummary';
import ParticleRenderer from '../Effects/ParticleRenderer';
import SkillUI from '../Skill/SkillUI';

interface GameScreenProps {
  gameState: GameState;
  config: any;
  powerUpVisuals: PowerUpVisualState;
  onJump: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onRemoveCoinReward: (id: string) => void;
  getCoinSummary: () => any;
  onUseSkill?: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  config,
  powerUpVisuals,
  onJump,
  onPause,
  onResume,
  onRestart,
  onRemoveCoinReward,
  getCoinSummary,
  onUseSkill,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-500 flex flex-col items-center justify-center p-4 relative">
      {/* 游戏信息栏 */}
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
          宝鸟先飞
        </h1>
        {gameState.playerName && (
          <p className="text-lg text-yellow-200">
            玩家: {gameState.playerName}
          </p>
        )}
      </div>
      
      {/* 游戏中金币显示 - 右上角 */}
      {(gameState.status === 'playing' || gameState.status === 'paused') && (
        <div className="absolute top-4 right-4 z-10">
          <CoinDisplay 
            coins={gameState.currentGameCoins}
            showAnimation={true}
            size="md"
            label="本局获得"
            className="bg-black bg-opacity-50 border-yellow-400"
          />
        </div>
      )}
      
      {/* 游戏画布 */}
      <div className="relative">
        <GameCanvas
          gameState={gameState}
          config={config}
          onJump={onJump}
        />
        
        {/* 粒子特效渲染器 */}
        <ParticleRenderer
          particles={powerUpVisuals.particles}
          canvasWidth={config.canvasWidth}
          canvasHeight={config.canvasHeight}
        />
        
        {/* 金币奖励动画 */}
        <CoinRewardAnimation 
          rewards={gameState.coinRewards}
          onRewardComplete={onRemoveCoinReward}
        />
      </div>
      
      {/* 技能 UI */}
      {(gameState.status === 'playing' || gameState.status === 'paused') && onUseSkill && (
        <SkillUI
          skill={gameState.currentSkin.skill}
          skillState={gameState.skillState}
          onSkillActivate={onUseSkill}
          isMobile={false}
        />
      )}
      
      {/* 游戏结束金币结算 */}
      {gameState.status === 'gameOver' && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 space-y-6">
            {/* 游戏结束信息 */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-red-600 mb-2">游戏结束</h2>
              <div className="space-y-1">
                <p className="text-xl text-gray-700">得分: {gameState.score}</p>
                <p className="text-lg text-gray-600">最高分: {gameState.highScore}</p>
              </div>
            </div>
            
            {/* 金币结算 */}
            <CoinGameOverSummary 
              summary={getCoinSummary()}
              totalCoins={gameState.coinData.coins}
            />
            
            {/* 按钮区域 */}
            <div className="flex gap-3">
              <button
                onClick={onRestart}
                className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
                aria-label="重新开始游戏"
              >
                重新开始
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 控制按钮 */}
      <div className="mt-6 flex gap-4">
        {gameState.status === 'playing' && (
          <button
            onClick={onPause}
            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            aria-label="暂停游戏"
          >
            暂停
          </button>
        )}
        
        {gameState.status === 'paused' && (
          <button
            onClick={onResume}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            aria-label="继续游戏"
          >
            继续
          </button>
        )}
        
        {(gameState.status === 'paused' || gameState.status === 'gameOver') && (
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg transition-colors duration-200"
            aria-label="重新开始游戏"
          >
            重新开始
          </button>
        )}
      </div>
      
      {/* 操作说明 */}
      <div className="mt-6 text-center">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-4">
          <h3 className="text-white font-semibold mb-2">操作说明:</h3>
          <div className="text-sm text-yellow-100 space-y-1">
            <p>点击画布或按空格键跳跃</p>
            <p>P键暂停/继续游戏</p>
            <p>R键重新开始</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;