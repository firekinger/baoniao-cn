import React from 'react';
import { cn } from '../../lib/utils';

interface CoinIconProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const CoinIcon: React.FC<CoinIconProps> = ({ 
  size = 'md', 
  className,
  animated = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div 
      className={cn(
        "relative inline-block rounded-full",
        "bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600",
        "shadow-lg border-2 border-yellow-500",
        animated && "animate-coin-spin",
        sizeClasses[size],
        className
      )}
    >
      {/* 内部光晶效果 */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-60" />
      
      {/* 中心高亮 */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white rounded-full opacity-80" />
      
      {/* 币上的字母 C */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center",
        "font-bold text-yellow-800",
        size === 'sm' ? "text-xs" : size === 'md' ? "text-sm" : "text-base"
      )}>
        C
      </div>
    </div>
  );
};

export default CoinIcon;