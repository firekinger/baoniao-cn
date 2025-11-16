import React, { useMemo } from 'react';
import { ActivePowerUp, PowerUpEffect } from '../../types/game';
import { formatPowerUpDuration, getPowerUpEffectText } from '../../utils/powerUpSystem';
import { POWER_UP_EFFECT_COLORS } from '../../utils/particleSystem';

interface PowerUpDisplayEnhancedProps {
  activePowerUps: ActivePowerUp[];
  effects: PowerUpEffect;
  enableEffects?: boolean;
}

const PowerUpDisplayEnhanced: React.FC<PowerUpDisplayEnhancedProps> = ({ 
  activePowerUps, 
  effects, 
  enableEffects = true 
}) => {
  const activeEffectTexts = getPowerUpEffectText(effects);
  
  // 创建发光和脉动动画的样式
  const getGlowStyle = (powerUpId: string, progress: number) => {
    const effectColors = POWER_UP_EFFECT_COLORS[powerUpId as keyof typeof POWER_UP_EFFECT_COLORS];
    if (!effectColors || !enableEffects) return {};
    
    const intensity = 0.3 + Math.sin(Date.now() * 0.005) * 0.1;
    const urgency = progress < 0.2 ? 1 + Math.sin(Date.now() * 0.02) * 0.3 : 1;
    
    return {
      boxShadow: `0 0 ${20 * intensity * urgency}px ${effectColors.primary}`,
      borderColor: effectColors.primary,
      borderWidth: '2px',
      borderStyle: 'solid'
    };
  };
  
  const getProgressBarStyle = (powerUpId: string, progress: number) => {
    const effectColors = POWER_UP_EFFECT_COLORS[powerUpId as keyof typeof POWER_UP_EFFECT_COLORS];
    if (!effectColors) return { backgroundColor: '#4B5563' };
    
    // 创建渐变效果
    const gradient = `linear-gradient(90deg, ${effectColors.secondary} 0%, ${effectColors.primary} 100%)`;
    
    return {
      background: gradient,
      boxShadow: enableEffects ? `0 0 10px ${effectColors.primary}` : 'none'
    };
  };
  
  const getPowerUpIcon = (powerUpId: string) => {
    const icons = {
      invincible: '🛡️',
      speed_boost: '⚡',
      coin_double: '⭐',
      magnet: '🧲',
      slow_motion: '🕐'
    };
    return icons[powerUpId as keyof typeof icons] || '💎';
  };
  
  if (activePowerUps.length === 0 && activeEffectTexts.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {/* 状态总览 */}
      {activeEffectTexts.length > 0 && (
        <div className="bg-black bg-opacity-80 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-yellow-400">
          <div className="text-yellow-300 font-bold mb-2 text-center animate-pulse">
            ✨ 激活效果 ✨
          </div>
          <div className="space-y-1">
            {activeEffectTexts.map((text, index) => (
              <div 
                key={index} 
                className="text-white text-sm font-medium text-center"
                style={{
                  textShadow: enableEffects ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
                }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 道具倒计时 */}
      {activePowerUps.length > 0 && (
        <div className="space-y-2">
          {activePowerUps.map((powerUp, index) => {
            const progress = powerUp.remaining / powerUp.type.duration;
            const progressPercentage = Math.max(0, Math.min(100, progress * 100));
            const isUrgent = progress < 0.2;
            
            return (
              <div 
                key={`${powerUp.type.id}-${index}`}
                className={`bg-black bg-opacity-90 backdrop-blur-sm text-white px-4 py-3 rounded-xl transition-all duration-300 min-w-60 ${
                  isUrgent && enableEffects ? 'animate-pulse' : ''
                }`}
                style={enableEffects ? getGlowStyle(powerUp.type.id, progress) : {}}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-2xl"
                      style={{
                        filter: enableEffects ? `drop-shadow(0 0 5px ${powerUp.type.color})` : 'none'
                      }}
                    >
                      {getPowerUpIcon(powerUp.type.id)}
                    </span>
                    <span className="font-bold text-lg">{powerUp.type.name}</span>
                  </div>
                  <span 
                    className={`font-mono text-lg font-bold ${
                      isUrgent ? 'text-red-300' : 'text-yellow-300'
                    }`}
                    style={{
                      textShadow: enableEffects ? '0 0 3px currentColor' : 'none'
                    }}
                  >
                    {formatPowerUpDuration(powerUp.remaining)}
                  </span>
                </div>
                
                {/* 增强的进度条 */}
                <div className="relative">
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
                    <div 
                      className={`h-full transition-all duration-200 ease-linear relative ${
                        isUrgent && enableEffects ? 'animate-pulse' : ''
                      }`}
                      style={{
                        width: `${progressPercentage}%`,
                        ...getProgressBarStyle(powerUp.type.id, progress)
                      }}
                    >
                      {/* 进度条内的光点动画 */}
                      {enableEffects && progressPercentage > 5 && (
                        <div 
                          className="absolute top-0 right-0 w-2 h-full bg-white opacity-70 animate-pulse"
                          style={{
                            boxShadow: '0 0 8px rgba(255,255,255,0.8)'
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* 进度百分比 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-xs font-bold text-white drop-shadow-md"
                      style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                      }}
                    >
                      {Math.ceil(progressPercentage)}%
                    </span>
                  </div>
                </div>
                
                {/* 稀有度指示器 */}
                <div className="flex justify-center mt-2">
                  <div className="flex space-x-1">
                    {Array.from({ length: getRarityStars(powerUp.type.rarity) }, (_, i) => (
                      <span 
                        key={i}
                        className="text-yellow-400"
                        style={{
                          filter: enableEffects ? 'drop-shadow(0 0 2px #FFD700)' : 'none'
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 根据稀有度获取星星数量
const getRarityStars = (rarity: string): number => {
  switch (rarity) {
    case 'common': return 1;
    case 'rare': return 2;
    case 'epic': return 3;
    case 'legendary': return 4;
    default: return 1;
  }
};

export default PowerUpDisplayEnhanced;