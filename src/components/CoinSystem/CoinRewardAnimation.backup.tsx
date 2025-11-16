// 这是 CoinRewardAnimation 组件的备份文件
// 包含完整的原始实现，以备将来需要恢复消息提示功能时使用

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CoinReward } from '../../types/game';
import { cn } from '../../lib/utils';

interface CoinRewardAnimationProps {
  rewards: CoinReward[];
  onRewardComplete: (id: string) => void;
}

interface AnimatedRewardProps {
  reward: CoinReward;
  onComplete: () => void;
}

// 原始的动画奖励组件实现
const AnimatedReward: React.FC<AnimatedRewardProps> = ({ reward, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldStartFade, setShouldStartFade] = useState(false);
  
  const fadeTimerRef = useRef<NodeJS.Timeout>();
  const completeTimerRef = useRef<NodeJS.Timeout>();
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const isCleanedUpRef = useRef(false);
  
  const cleanupTimers = useCallback(() => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;
    
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = undefined;
    }
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current);
      completeTimerRef.current = undefined;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);
  
  const handleComplete = useCallback(() => {
    if (isCleanedUpRef.current) return;
    
    cleanupTimers();
    setIsVisible(false);
    
    setTimeout(() => {
      onComplete();
    }, 0);
  }, [onComplete, cleanupTimers]);
  
  const startAnimation = useCallback(() => {
    startTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      if (isCleanedUpRef.current) return;
      
      const elapsed = currentTime - (startTimeRef.current || currentTime);
      
      if (elapsed >= 2000 && !shouldStartFade) {
        setShouldStartFade(true);
      }
      
      if (elapsed >= 3000) {
        handleComplete();
        return;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [shouldStartFade, handleComplete]);
  
  useEffect(() => {
    isCleanedUpRef.current = false;
    cleanupTimers();
    startAnimation();
    
    fadeTimerRef.current = setTimeout(() => {
      if (!isCleanedUpRef.current) {
        setShouldStartFade(true);
      }
    }, 2000);
    
    completeTimerRef.current = setTimeout(() => {
      if (!isCleanedUpRef.current) {
        handleComplete();
      }
    }, 3000);
    
    return () => {
      cleanupTimers();
    };
  }, []);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTimeout(() => {
          if (!isCleanedUpRef.current) {
            handleComplete();
          }
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleComplete]);

  const getRewardStyle = () => {
    switch (reward.type) {
      case 'streak':
        return 'text-orange-500 font-bold text-lg';
      case 'milestone':
        return 'text-purple-600 font-bold text-xl';
      case 'perfect':
        return 'text-pink-500 font-bold text-xl';
      case 'time':
        return 'text-blue-500 font-semibold text-base';
      default:
        return 'text-yellow-600 font-semibold text-base';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute pointer-events-none z-50",
        "transition-all duration-700 ease-out",
        shouldStartFade && "opacity-0 -translate-y-12 scale-90"
      )}
      style={{
        left: `${reward.x || 0}px`,
        top: `${reward.y || 0}px`,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity'
      }}
    >
      <div className={cn(
        "px-4 py-2 rounded-full",
        "bg-black bg-opacity-90 text-white",
        "shadow-2xl border-2 border-yellow-400",
        "transition-all duration-700 ease-out",
        "font-bold text-lg",
        getRewardStyle(),
        reward.type === 'milestone' && "animate-pulse",
        reward.type === 'perfect' && "animate-bounce",
        shouldStartFade && "scale-75 opacity-0"
      )}>
        {reward.message}
      </div>
    </div>
  );
};

// 原始的金币奖励动画组件实现
const CoinRewardAnimationOriginal: React.FC<CoinRewardAnimationProps> = ({
  rewards,
  onRewardComplete
}) => {
  useEffect(() => {
    return () => {
      rewards.forEach(reward => {
        setTimeout(() => {
          onRewardComplete(reward.id);
        }, 0);
      });
    };
  }, []);
  
  return (
    <>
      {rewards.map(reward => (
        <AnimatedReward
          key={reward.id}
          reward={reward}
          onComplete={() => onRewardComplete(reward.id)}
        />
      ))}
    </>
  );
};

export default CoinRewardAnimationOriginal;
