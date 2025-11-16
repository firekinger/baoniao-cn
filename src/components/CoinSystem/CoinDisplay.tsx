import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import CoinIcon from './CoinIcon';
import { formatCoins } from '../../utils/coinSystem';

interface CoinDisplayProps {
  coins: number;
  showAnimation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({
  coins,
  showAnimation = false,
  size = 'md',
  className,
  label
}) => {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);

  // 数字动画效果
  useEffect(() => {
    if (showAnimation && coins !== displayCoins) {
      setIsAnimating(true);
      const difference = coins - displayCoins;
      const steps = Math.min(Math.abs(difference), 20);
      const stepValue = difference / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayCoins(coins);
          setIsAnimating(false);
          clearInterval(interval);
        } else {
          setDisplayCoins(prev => Math.round(prev + stepValue));
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayCoins(coins);
    }
  }, [coins, showAnimation]);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      "bg-gradient-to-r from-yellow-50 to-amber-50",
      "border-2 border-yellow-300 rounded-xl px-3 py-2",
      "shadow-md",
      isAnimating && "animate-pulse",
      className
    )}>
      <CoinIcon 
        size={size} 
        animated={isAnimating || showAnimation}
      />
      
      <div className="flex flex-col">
        {label && (
          <span className="text-xs text-yellow-700 font-medium">
            {label}
          </span>
        )}
        <span className={cn(
          "font-bold text-yellow-800",
          sizeClasses[size],
          isAnimating && "animate-bounce"
        )}>
          {formatCoins(displayCoins)}
        </span>
      </div>
    </div>
  );
};

export default CoinDisplay;