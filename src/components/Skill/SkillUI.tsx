import React, { useState, useEffect } from 'react';
import { SkinSkill, SkillState } from '../../types/game';
import { getSkillCooldownProgress, formatCooldownTime, isSkillAvailable } from '../../utils/skillSystem';
import { cn } from '../../lib/utils';

interface SkillUIProps {
  skill?: SkinSkill;
  skillState: SkillState;
  onSkillActivate: () => void;
  isMobile?: boolean;
}

const SkillUI: React.FC<SkillUIProps> = ({ 
  skill, 
  skillState, 
  onSkillActivate, 
  isMobile = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [justActivated, setJustActivated] = useState(false);
  
  if (!skill) {
    return null;
  }

  const progress = getSkillCooldownProgress(skillState, skill);
  const isAvailable = isSkillAvailable(skillState, skill);
  const cooldownText = formatCooldownTime(skillState.cooldownRemaining);
  
  // 监听技能激活状态变化，触发动画效果
  useEffect(() => {
    if (skillState.isActive && !justActivated) {
      setJustActivated(true);
      // 激活动画持续时间
      const timer = setTimeout(() => {
        setJustActivated(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [skillState.isActive, justActivated]);
  
  // 处理技能点击
  const handleSkillClick = () => {
    if (isAvailable) {
      setIsPressed(true);
      onSkillActivate();
      // 点击动画持续时间
      setTimeout(() => setIsPressed(false), 150);
    }
  };
  
  // 获取技能颜色
  const getSkillColor = (skill: SkinSkill): string => {
    switch (skill.effectType) {
      case 'dash': return '#06b6d4';
      case 'teleport': return '#8b5cf6';
      case 'destroy': return '#ff4500';
      case 'freeze': return '#67e8f9';
      case 'gravity': return '#9333ea';
      case 'shield': return '#ffd700';
      case 'shrink': return '#ec4899';
      case 'magnet': return '#8A2BE2';
      default: return 'rgba(255,255,255,0.3)';
    }
  };

  // 获取技能状态颜色
  const getStatusColor = () => {
    if (skillState.isActive) return 'border-yellow-400 bg-yellow-900 shadow-lg shadow-yellow-500/50';
    if (isAvailable) return 'border-green-400 bg-green-900 shadow-md shadow-green-500/30';
    return 'border-red-400 bg-red-900';
  };
  
  // 获取技能状态文本
  const getStatusText = () => {
    if (skillState.isActive) return '激活中';
    if (isAvailable) return isMobile ? '点击' : '按E';
    return cooldownText;
  };
  
  return (
    <div className="fixed left-4 top-20 z-50">
      <div className="bg-black bg-opacity-50 rounded-lg p-2 flex flex-col items-center space-y-2">
        {/* 技能信息提示 */}
        <div className="bg-black bg-opacity-80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm max-w-48">
          <div className="font-semibold text-center">{skill.name}</div>
          <div className="text-xs text-gray-300 text-center mt-1">{skill.description}</div>
          <div className="text-xs text-center mt-1">
            <span className="text-yellow-300">冷却: 30秒</span>
          </div>
        </div>
        
        {/* 技能按钮 */}
        <div className="relative">
          <button
            onClick={handleSkillClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={!isAvailable && !skillState.isActive}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              "transition-all duration-300 border-2 relative overflow-hidden",
              "focus:outline-none focus:ring-4 focus:ring-opacity-50",
              // 基础状态样式
              isAvailable || skillState.isActive ? "cursor-pointer" : "cursor-not-allowed",
              // 悬停动画
              isHovered && isAvailable ? "scale-110 shadow-xl" : "scale-100",
              // 按压动画
              isPressed ? "scale-95" : "",
              // 激活时的特殊动画
              justActivated ? "animate-bounce" : "",
              // 状态颜色
              getStatusColor(),
              // 激活时的脉冲效果
              skillState.isActive ? "animate-pulse" : ""
            )}
            style={{
              background: skillState.isActive 
                ? `radial-gradient(circle at center, ${getSkillColor(skill)} 0%, transparent 70%)` 
                : 'rgba(0,0,0,0.6)',
              // 添加发光效果
              boxShadow: skillState.isActive 
                ? `0 0 20px ${getSkillColor(skill)}, 0 0 40px ${getSkillColor(skill)}66` 
                : isHovered && isAvailable 
                  ? `0 0 15px ${getSkillColor(skill)}88` 
                  : 'none'
            }}
            aria-label={`使用技能: ${skill.name}`}
          >
            {/* 背景粒子效果 */}
            {(skillState.isActive || justActivated) && (
              <div className="absolute inset-0 rounded-full">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-ping" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-20 animate-pulse" />
              </div>
            )}
            
            {/* 技能图标 */}
            <div 
              className={cn(
                "text-2xl relative z-10 transition-all duration-300",
                skillState.isActive ? "animate-spin" : "",
                isHovered && isAvailable ? "animate-pulse" : "",
                justActivated ? "animate-bounce" : ""
              )} 
              style={{
                filter: skillState.isActive 
                  ? 'brightness(1.8) saturate(1.8) drop-shadow(0 0 8px rgba(255,255,255,0.9))' 
                  : isHovered && isAvailable 
                    ? 'brightness(1.2) saturate(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.5))'
                    : 'none',
                transform: skillState.isActive 
                  ? 'scale(1.3)' 
                  : isHovered && isAvailable 
                    ? 'scale(1.1)' 
                    : isPressed 
                      ? 'scale(0.9)'
                      : 'scale(1)'
              }}
            >
              {skill.icon}
            </div>
            
            {/* 冷却进度圆环 */}
            {!isAvailable && !skillState.isActive && (
              <svg 
                className="absolute inset-0 w-16 h-16 -rotate-90 transition-all duration-300"
                viewBox="0 0 64 64"
              >
                {/* 背景圆环 */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
                {/* 进度圆环 */}
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={getSkillColor(skill)}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${176 * progress} ${176 * (1 - progress)}`}
                  className="transition-all duration-200 animate-pulse"
                  style={{
                    filter: `drop-shadow(0 0 2px ${getSkillColor(skill)})`
                  }}
                />
                {/* 动画效果圆环 */}
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke={getSkillColor(skill)}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeDasharray="4 8"
                  className="animate-spin opacity-40"
                  style={{
                    animationDuration: '3s'
                  }}
                />
              </svg>
            )}
            
            {/* 激活状态的多层光环效果 */}
            {skillState.isActive && (
              <>
                {/* 内层光环 */}
                <div 
                  className="absolute inset-2 rounded-full animate-pulse opacity-60" 
                  style={{
                    background: `radial-gradient(circle, ${getSkillColor(skill)} 0%, transparent 70%)`,
                    animation: 'pulse 1s ease-in-out infinite'
                  }}
                />
                {/* 中层光环 */}
                <div 
                  className="absolute -inset-1 rounded-full animate-ping opacity-30" 
                  style={{
                    background: `radial-gradient(circle, ${getSkillColor(skill)} 0%, transparent 60%)`,
                    animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
                  }}
                />
                {/* 外层光环 */}
                <div 
                  className="absolute -inset-2 rounded-full animate-pulse opacity-20" 
                  style={{
                    background: `radial-gradient(circle, ${getSkillColor(skill)} 0%, transparent 50%)`,
                    animation: 'pulse 1.5s ease-in-out infinite reverse'
                  }}
                />
              </>
            )}
          </button>
          
          {/* 状态文本 */}
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-300">
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded transition-all duration-300",
              // 状态颜色和动画
              skillState.isActive ? "text-yellow-300 bg-yellow-900 bg-opacity-50 animate-pulse" :
              isAvailable ? "text-green-300 bg-green-900 bg-opacity-50" :
              "text-red-300 bg-red-900 bg-opacity-50",
              // 悬停动画
              isHovered && isAvailable ? "scale-110" : "scale-100",
              // 激活时的特殊效果
              justActivated ? "animate-bounce" : ""
            )}
            style={{
              // 激活时的发光效果
              boxShadow: skillState.isActive 
                ? `0 0 8px ${getSkillColor(skill)}66` 
                : 'none'
            }}>
              {getStatusText()}
            </span>
          </div>
        </div>
        
        {/* 键盘提示（仅桌面端） */}
        {!isMobile && (
          <div className={cn(
            "bg-black bg-opacity-60 rounded px-2 py-1 transition-all duration-300",
            isHovered && isAvailable ? "scale-105 bg-opacity-80" : "scale-100",
            skillState.isActive ? "animate-pulse" : ""
          )}>
            <span className={cn(
              "text-white text-xs transition-all duration-300",
              isHovered && isAvailable ? "text-yellow-300" : "text-white"
            )}>
              按 <span className={cn(
                "font-bold transition-all duration-300",
                skillState.isActive ? "text-yellow-400 animate-pulse" :
                isHovered && isAvailable ? "text-yellow-300" : "text-yellow-300"
              )}>E</span> 使用技能
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillUI;
