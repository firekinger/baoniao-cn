import React from 'react';
import { ActivePowerUp, PowerUpEffect } from '../../types/game';
import { formatPowerUpDuration, getPowerUpEffectText } from '../../utils/powerUpSystem';

interface PowerUpDisplayProps {
  activePowerUps: ActivePowerUp[];
  effects: PowerUpEffect;
}

const PowerUpDisplay: React.FC<PowerUpDisplayProps> = ({ activePowerUps, effects }) => {
  const activeEffectTexts = getPowerUpEffectText(effects);
  
  if (activePowerUps.length === 0 && activeEffectTexts.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 left-4 z-50 space-y-2">
      {/* 当前激活的道具效果 */}
      {activeEffectTexts.length > 0 && (
        <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium">
          <div className="text-yellow-300 font-bold mb-1">激活效果:</div>
          {activeEffectTexts.map((text, index) => (
            <div key={index} className="text-white">{text}</div>
          ))}
        </div>
      )}
      
      {/* 道具倒计时 */}
      {activePowerUps.length > 0 && (
        <div className="space-y-1">
          {activePowerUps.map((powerUp, index) => {
            const progress = powerUp.remaining / powerUp.type.duration;
            const progressPercentage = Math.max(0, Math.min(100, progress * 100));
            
            return (
              <div 
                key={`${powerUp.type.id}-${index}`}
                className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm font-medium min-w-48"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold">{powerUp.type.name}</span>
                  <span className="text-yellow-300 font-mono">
                    {formatPowerUpDuration(powerUp.remaining)}
                  </span>
                </div>
                
                {/* 进度条 */}
                <div className="w-full bg-gray-600 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-100 ease-linear"
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: powerUp.type.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PowerUpDisplay;