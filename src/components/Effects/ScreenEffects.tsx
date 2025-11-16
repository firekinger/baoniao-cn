import React from 'react';
import { VisualEffect } from '../../types/game';
import { getFlashOpacity, getShakeOffset } from '../../utils/particleSystem';

interface ScreenEffectsProps {
  effects: VisualEffect[];
  children: React.ReactNode;
}

const ScreenEffects: React.FC<ScreenEffectsProps> = ({ effects, children }) => {
  const currentTime = Date.now();
  
  // 获取震屏偏移
  const shakeOffset = getShakeOffset(effects, currentTime);
  
  // 获取闪光效果
  const flash = getFlashOpacity(effects, currentTime);
  
  return (
    <div className="relative overflow-hidden">
      {/* 震屏容器 */}
      <div
        style={{
          transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
          transition: 'none'
        }}
      >
        {children}
      </div>
      
      {/* 全屏闪光效果 */}
      {flash.opacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: flash.color,
            opacity: flash.opacity,
            zIndex: 50,
            mixBlendMode: 'screen'
          }}
        />
      )}
    </div>
  );
};

export default ScreenEffects;