import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '../../lib/utils';
import CoinDisplay from '../CoinSystem/CoinDisplay';
import CoinRewardAnimation from '../CoinSystem/CoinRewardAnimation';
import SkinPreview from '../Skins/SkinPreview';
import ParticleRenderer from '../Effects/ParticleRenderer';
import { CoinData, BirdSkin, CoinReward, Particle } from '../../types/game';
import { BIRD_SKINS } from '../../utils/skinSystem';

interface StartScreenProps {
  playerName: string;
  coinData: CoinData;
  currentSkin: BirdSkin;
  coinRewards?: CoinReward[];
  onPlayerNameChange: (name: string) => void;
  onStartGame: () => void;
  onShowLeaderboard?: () => void;
  onShowSettings?: () => void;
  onShowShop?: () => void;
  onRemoveCoinReward?: (id: string) => void;
}

// 简单的HTML/CSS小鸟组件 - 专为右上角显示设计
interface SimpleBirdPreviewProps {
  skin: BirdSkin;
  className?: string;
}

const SimpleBirdPreview: React.FC<SimpleBirdPreviewProps> = ({ skin, className }) => {
  return (
    <div className={cn(
      "relative w-12 h-12 flex items-center justify-center",
      className
    )}>
      {/* 小鸟身体 */}
      <div 
        className="absolute inset-0 rounded-full animate-bounce-gentle shadow-lg"
        style={{
          background: skin.colors.secondary 
            ? `linear-gradient(45deg, ${skin.colors.primary}, ${skin.colors.secondary})`
            : skin.colors.primary,
          transform: 'rotate(-15deg)'
        }}
      />
      
      {/* 小鸟翅膀 */}
      <div 
        className="absolute top-2 left-1 w-6 h-3 rounded-full animate-wing-flap"
        style={{
          backgroundColor: skin.colors.accent || skin.colors.secondary || '#ea580c',
          transform: 'rotate(-20deg)'
        }}
      />
      
      {/* 小鸟眼睛 */}
      <div className="absolute top-2 right-1 w-3 h-3 bg-white rounded-full border border-gray-300">
        <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-black rounded-full" />
      </div>
      
      {/* 小鸟嘴巴 */}
      <div 
        className="absolute top-3 right-0 w-2 h-1 rounded-r-md"
        style={{
          backgroundColor: skin.colors.accent || '#ea580c',
          transform: 'rotate(10deg)'
        }}
      />
      
      {/* 发光效果 */}
      {skin.effects?.glow && (
        <div 
          className="absolute inset-0 rounded-full animate-glow-pulse opacity-30"
          style={{
            background: `radial-gradient(circle, ${skin.colors.primary}40 0%, transparent 70%)`,
            transform: 'scale(1.5)'
          }}
        />
      )}
      
      {/* 闪烁效果 */}
      {skin.effects?.sparkle && (
        <>
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-white rounded-full animate-sparkle" />
          <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white rounded-full animate-sparkle" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-0 -left-2 w-1 h-1 bg-white rounded-full animate-sparkle" style={{animationDelay: '1s'}} />
        </>
      )}
    </div>
  );
};

// 飞行小鸟组件接口
interface FlyingBirdProps {
  className?: string;
  skin: BirdSkin;
  animationDelay?: number;
  size?: 'sm' | 'md' | 'lg';
}

const FlyingBird: React.FC<FlyingBirdProps> = ({ 
  className, 
  skin, 
  animationDelay = 0, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div 
      className={cn(
        "absolute animate-fly-across",
        sizeClasses[size],
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <SkinPreview 
        skin={skin}
        size={size}
        animated={true}
        className="animate-bounce-gentle"
      />
    </div>
  );
};

// 云朵组件
interface CloudProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  opacity?: number;
}

const Cloud: React.FC<CloudProps> = ({ className, size = 'md', opacity = 0.3 }) => {
  const sizeClasses = {
    sm: 'w-16 h-8',
    md: 'w-24 h-12',
    lg: 'w-32 h-16'
  };

  return (
    <div 
      className={cn(
        "absolute rounded-full bg-white animate-float-slow",
        sizeClasses[size],
        className
      )}
      style={{ opacity }}
    >
      <div className="absolute top-0 left-3 w-6 h-6 bg-white rounded-full opacity-80" />
      <div className="absolute top-1 right-3 w-5 h-5 bg-white rounded-full opacity-60" />
      <div className="absolute bottom-1 left-6 w-4 h-4 bg-white rounded-full opacity-70" />
    </div>
  );
};

// 流星组件
interface MeteorProps {
  className?: string;
  delay?: number;
}

const Meteor: React.FC<MeteorProps> = ({ className, delay = 0 }) => {
  return (
    <div 
      className={cn(
        "absolute w-2 h-2 bg-white rounded-full animate-meteor",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute -left-8 -top-0.5 w-8 h-1 bg-gradient-to-r from-white to-transparent" />
    </div>
  );
};

// 气泡组件
interface BubbleProps {
  className?: string;
  size?: number;
  delay?: number;
}

const Bubble: React.FC<BubbleProps> = ({ className, size = 20, delay = 0 }) => {
  return (
    <div 
      className={cn(
        "absolute rounded-full bg-white bg-opacity-20 animate-bubble-rise",
        className
      )}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        animationDelay: `${delay}ms`
      }}
    />
  );
};

// 光环效果组件
interface GlowRingProps {
  className?: string;
  size?: number;
  color?: string;
  delay?: number;
}

const GlowRing: React.FC<GlowRingProps> = ({ 
  className, 
  size = 100, 
  color = '#f59e0b', 
  delay = 0 
}) => {
  return (
    <div 
      className={cn(
        "absolute rounded-full border-2 animate-glow-pulse",
        className
      )}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        borderColor: color,
        boxShadow: `0 0 20px ${color}40`,
        animationDelay: `${delay}ms`
      }}
    />
  );
};

interface EnhancedTitleAnimationProps {
  title: string;
  className?: string;
}

const EnhancedTitleAnimation: React.FC<EnhancedTitleAnimationProps> = ({ title, className }) => {
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleChars(prev => {
        if (prev < title.length) {
          return prev + 1;
        }
        return prev;
      });
    }, 150);

    return () => clearInterval(timer);
  }, [title]);

  return (
    <div className="relative">
      <h1 className={cn(
        "relative text-5xl md:text-6xl font-bold text-center mb-6",
        "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent",
        "drop-shadow-2xl animate-title-glow",
        className
      )}>
        {title.split('').map((char, index) => (
          <span
            key={index}
            className={cn(
              "inline-block transition-all duration-500 ease-out",
              index < visibleChars
                ? "opacity-100 transform translate-y-0 animate-char-bounce"
                : "opacity-0 transform translate-y-8"
            )}
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const baseClasses = cn(
    "relative inline-flex items-center justify-center font-semibold rounded-2xl",
    "transition-all duration-150 ease-out",
    "hover:scale-103 active:scale-95",
    "focus:outline-none focus:ring-4 focus:ring-opacity-50",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
    "shadow-lg hover:shadow-xl"
  );

  const variantClasses = {
    primary: cn(
      "bg-gradient-to-r from-orange-400 to-red-500 text-white",
      "hover:from-orange-500 hover:to-red-600",
      "focus:ring-orange-300",
      "shadow-orange-200"
    ),
    secondary: cn(
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
      "hover:from-gray-200 hover:to-gray-300",
      "focus:ring-gray-300",
      "shadow-gray-200"
    ),
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm min-h-[44px]",
    md: "px-8 py-3 text-lg min-h-[44px]",
    lg: "px-12 py-4 text-xl min-h-[48px]",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
    >
      {children}
    </button>
  );
};

interface ModernInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  'aria-label'?: string;
  onKeyPress?: (event: React.KeyboardEvent) => void;
}

const ModernInput: React.FC<ModernInputProps> = ({
  value,
  onChange,
  placeholder = "请输入你的昵称",
  maxLength = 20,
  className,
  'aria-label': ariaLabel,
  onKeyPress,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={cn(
        "w-full px-6 py-4 text-lg text-center",
        "bg-white bg-opacity-90 backdrop-blur-sm",
        "border-2 border-orange-200 rounded-2xl",
        "focus:outline-none focus:ring-4 focus:ring-orange-300 focus:border-orange-400",
        "transition-all duration-200",
        "placeholder-gray-400",
        "shadow-lg",
        "min-h-[44px]",
        className
      )}
      aria-label={ariaLabel || "昵称输入框"}
      onKeyDown={onKeyPress}
    />
  );
};

const StartScreen: React.FC<StartScreenProps> = ({
  playerName,
  coinData,
  currentSkin,
  coinRewards = [],
  onPlayerNameChange,
  onStartGame,
  onShowLeaderboard,
  onShowSettings,
  onShowShop,
  onRemoveCoinReward,
}) => {
  const [localPlayerName, setLocalPlayerName] = useState(playerName);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 获取不同的皮肤用于展示
  const displaySkins = useMemo(() => {
    const allSkins = Object.values(BIRD_SKINS);
    // 选择多样化的皮肤进行展示
    return [
      allSkins.find(skin => skin.id === 'classic') || allSkins[0],
      allSkins.find(skin => skin.id === 'fire_basic') || allSkins[1],
      allSkins.find(skin => skin.id === 'rainbow') || allSkins[2],
      allSkins.find(skin => skin.id === 'gold') || allSkins[3],
      allSkins.find(skin => skin.id === 'lightning_bird') || allSkins[4],
      allSkins.find(skin => skin.id === 'flame_bird') || allSkins[5],
    ].filter(Boolean) as BirdSkin[];
  }, []);

  // 粒子效果生成
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = [];
      const container = containerRef.current;
      if (!container) return newParticles;

      const { width, height } = container.getBoundingClientRect();
      
      // 生成不同类型的粒子
      for (let i = 0; i < 15; i++) {
        const types: Particle['type'][] = ['star', 'spark', 'circle'];
        const colors = ['#fbbf24', '#f59e0b', '#f97316', '#ec4899', '#8b5cf6'];
        
        newParticles.push({
          id: `particle-${particleIdRef.current++}`,
          x: Math.random() * width,
          y: Math.random() * height,
          velocityX: (Math.random() - 0.5) * 0.5,
          velocityY: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.8 + 0.2,
          life: Math.random() * 3000 + 2000,
          maxLife: Math.random() * 3000 + 2000,
          type: types[Math.floor(Math.random() * types.length)],
          fade: true
        });
      }
      
      return newParticles;
    };

    const initialParticles = generateParticles();
    setParticles(initialParticles);

    const particleTimer = setInterval(() => {
      setParticles(prev => {
        const container = containerRef.current;
        if (!container) return prev;
        
        const { width, height } = container.getBoundingClientRect();
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.velocityX,
          y: particle.y + particle.velocityY,
          life: particle.life - 16,
          alpha: Math.max(0, particle.life / particle.maxLife)
        })).filter(particle => particle.life > 0);
        
        // 添加新粒子保持数量
        while (updated.length < 15) {
          const colors = ['#fbbf24', '#f59e0b', '#f97316', '#ec4899', '#8b5cf6'];
          const types: Particle['type'][] = ['star', 'spark', 'circle'];
          
          updated.push({
            id: `particle-${particleIdRef.current++}`,
            x: Math.random() * width,
            y: Math.random() * height,
            velocityX: (Math.random() - 0.5) * 0.5,
            velocityY: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.8 + 0.2,
            life: Math.random() * 3000 + 2000,
            maxLife: Math.random() * 3000 + 2000,
            type: types[Math.floor(Math.random() * types.length)],
            fade: true
          });
        }
        
        return updated;
      });
    }, 16);

    return () => clearInterval(particleTimer);
  }, []);

  const handleStartGame = () => {
    if (localPlayerName.trim()) {
      onPlayerNameChange(localPlayerName.trim());
    }
    onStartGame();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleStartGame();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* 增强的背景渐变和动画 */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-yellow-200 to-pink-300 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-transparent to-purple-200 opacity-60 animate-pulse-slow" />
      <div className="absolute inset-0 bg-gradient-to-bl from-purple-300 via-transparent to-cyan-200 opacity-40 animate-gradient-shift" />
      
      {/* 粒子效果渲染 */}
      <ParticleRenderer 
        particles={particles}
        canvasWidth={typeof window !== 'undefined' ? window.innerWidth : 800}
        canvasHeight={typeof window !== 'undefined' ? window.innerHeight : 600}
      />
      
      {/* 增强的云层效果 - 位置优化 */}
      <Cloud className="top-8 left-8" size="md" opacity={0.25} />
      <Cloud className="top-24 right-16" size="sm" opacity={0.2} />
      <Cloud className="bottom-24 left-16" size="md" opacity={0.2} />
      <Cloud className="top-1/4 right-1/3" size="sm" opacity={0.15} />
      <Cloud className="bottom-1/4 right-8" size="sm" opacity={0.18} />
      
      {/* 流星效果 - 位置调整 */}
      <Meteor className="top-16 right-8" delay={0} />
      <Meteor className="top-1/3 left-16" delay={3000} />
      <Meteor className="bottom-1/3 right-1/4" delay={6000} />
      
      {/* 气泡效果 - 减少数量 */}
      <Bubble className="bottom-8 left-8" size={12} delay={0} />
      <Bubble className="bottom-16 left-1/4" size={16} delay={1000} />
      <Bubble className="bottom-12 right-16" size={10} delay={2000} />
      
      {/* 飞行的小鸟们 - 减少数量 */}
      <FlyingBird 
        className="top-20 -left-16" 
        skin={displaySkins[0]} 
        size="sm" 
        animationDelay={0} 
      />
      <FlyingBird 
        className="top-1/2 -left-20" 
        skin={displaySkins[1]} 
        size="md" 
        animationDelay={3000} 
      />
      <FlyingBird 
        className="bottom-1/3 -left-16" 
        skin={displaySkins[2]} 
        size="sm" 
        animationDelay={6000} 
      />
      
      {/* 金币显示 - 顶部左侧 */}
      <div className="absolute top-4 left-4 z-40">
        <CoinDisplay 
          coins={coinData.coins}
          showAnimation={false}
          size="md"
          label="金币余额"
        />
      </div>
      
      {/* 当前皮肤显示 - 右上角 */}
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-white bg-opacity-98 backdrop-blur-md rounded-xl p-2.5 shadow-2xl border-2 border-white border-opacity-40 flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-gray-600 font-medium">当前皮肤</div>
            <div className="font-bold text-gray-800 text-sm">{currentSkin.name}</div>
          </div>
          <div className="relative bg-orange-50 rounded-lg p-1.5 border border-orange-200">
            <SimpleBirdPreview 
              skin={currentSkin}
              className="relative z-10"
            />
          </div>
        </div>
      </div>
      
      {/* 主内容区域 - 紧凑布局 */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg mx-auto px-6">
        {/* 紧凑的标题区域 */}
        <div className="flex items-center justify-center mb-6 relative">
          {/* 左侧小鸟组 */}
          <div className="mr-6 relative">
            <SkinPreview 
              skin={currentSkin}
              size="lg"
              animated={true}
              className="animate-bounce-gentle transform hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -top-1 -left-1 w-16 h-16 border-2 border-orange-400 rounded-full animate-glow-pulse opacity-25" />
          </div>
          
          {/* 主标题 - 减小尺寸 */}
          <div className="flex flex-col items-center relative">
            <EnhancedTitleAnimation title="宝鸟先飞" className="text-4xl md:text-6xl mb-4" />
            <p className="text-lg text-orange-700 font-medium opacity-80 animate-fade-in-up">
              网页版
            </p>
            {/* 装饰性皮肤环绕 - 减小范围 */}
            <div className="absolute -top-6 -left-12">
              <SkinPreview 
                skin={displaySkins[1]}
                size="sm"
                animated={true}
                className="animate-orbit-1"
              />
            </div>
            <div className="absolute -top-6 -right-12">
              <SkinPreview 
                skin={displaySkins[2]}
                size="sm"
                animated={true}
                className="animate-orbit-2"
              />
            </div>
            <div className="absolute -bottom-6 -left-10">
              <SkinPreview 
                skin={displaySkins[3]}
                size="sm"
                animated={true}
                className="animate-orbit-3"
              />
            </div>
            <div className="absolute -bottom-6 -right-10">
              <SkinPreview 
                skin={displaySkins[4]}
                size="sm"
                animated={true}
                className="animate-orbit-4"
              />
            </div>
          </div>
          
          {/* 右侧小鸟组 */}
          <div className="ml-6 relative">
            <SkinPreview 
              skin={displaySkins[5] || currentSkin}
              size="lg"
              animated={true}
              className="animate-bounce-gentle-delayed transform hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -top-1 -right-1 w-16 h-16 border-2 border-pink-400 rounded-full animate-glow-pulse opacity-25" style={{animationDelay: '1s'}} />
          </div>
        </div>
        
        {/* 昵称输入区域 - 紧凑 */}
        <div className="w-full mb-5">
          <ModernInput
            value={localPlayerName}
            onChange={setLocalPlayerName}
            placeholder="请输入你的昵称"
            maxLength={20}
            onKeyPress={handleKeyPress}
            aria-label="游戏玩家昵称输入"
            className="py-3"
          />
        </div>
        
        {/* 按钮区域 - 紧凑布局 */}
        <div className="flex flex-col gap-3 w-full">
          <ModernButton
            variant="primary"
            size="lg"
            onClick={handleStartGame}
            className="w-full"
            aria-label="开始游戏"
          >
            开始游戏
          </ModernButton>
          
          <div className="grid grid-cols-2 gap-3">
            <ModernButton
              variant="secondary"
              size="md"
              onClick={onShowLeaderboard}
              className="flex-1"
              aria-label="查看排行榜"
            >
              排行榜
            </ModernButton>
            
            <ModernButton
              variant="secondary"
              size="md"
              onClick={onShowSettings}
              className="flex-1"
              aria-label="游戏设置"
            >
              设置
            </ModernButton>
          </div>
          
          {/* 商店按钮 */}
          <ModernButton
            variant="secondary"
            size="md"
            onClick={onShowShop}
            className="w-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-purple-300"
            aria-label="进入商店"
          >
            皮肤商店
          </ModernButton>

        </div>
      </div>
      
      {/* 底部提示 - 位置调整 */}
      <div className="absolute bottom-3 left-4 text-xs text-orange-600 opacity-70">
        <p>用空格键跳跃 | P键暂停 | R键重新开始</p>
      </div>
      
      {/* 开发者标识 - 位置调整 */}
      <div className="absolute bottom-3 right-4 text-xs text-orange-600 opacity-70">
        <p>Created by Baoniao</p>
      </div>
      
      {/* 金币奖励动画 */}
      {onRemoveCoinReward && (
        <CoinRewardAnimation 
          rewards={coinRewards}
          onRewardComplete={onRemoveCoinReward}
        />
      )}
    </div>
  );
};

export default StartScreen;