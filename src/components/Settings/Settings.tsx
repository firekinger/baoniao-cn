import React, { useState } from 'react';
import { DifficultyConfig } from '../../types/game';
import { cn } from '../../lib/utils';

interface SettingsProps {
  onBack: () => void;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  soundEnabled: boolean;
  volume: number;
  effectsEnabled: boolean;
  onDifficultyChange: (difficulty: 'easy' | 'normal' | 'hard' | 'expert') => void;
  onSoundToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onEffectsToggle: (enabled: boolean) => void;
}

const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    name: '简单',
    gravity: 0.12,
    jumpForce: -6,
    pipeSpeed: 0.8,
    pipeGap: 280, // 与 useGameState.ts 保持一致
    description: '适合新手，管道间隙较大，速度较慢'
  },
  normal: {
    name: '普通',
    gravity: 0.2,
    jumpForce: -6,
    pipeSpeed: 1.2,
    pipeGap: 200, // 与 useGameState.ts 保持一致
    description: '标准难度，平衡的挑战体验'
  },
  hard: {
    name: '困难',
    gravity: 0.35,
    jumpForce: -6.5,
    pipeSpeed: 1.6,
    pipeGap: 160, // 与 useGameState.ts 保持一致
    description: '高难度挑战，需要精准控制'
  },
  expert: {
    name: '专家',
    gravity: 0.5,
    jumpForce: -7,
    pipeSpeed: 2.0,
    pipeGap: 130, // 与 useGameState.ts 保持一致
    description: '极限挑战，只适合高手'
  }
};

const Settings: React.FC<SettingsProps> = ({
  onBack,
  difficulty,
  soundEnabled,
  volume,
  effectsEnabled,
  onDifficultyChange,
  onSoundToggle,
  onVolumeChange,
  onEffectsToggle,
}) => {
  const [localVolume, setLocalVolume] = useState(volume);

  const handleVolumeChange = (newVolume: number) => {
    setLocalVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'from-green-400 to-green-600';
      case 'normal': return 'from-blue-400 to-blue-600';
      case 'hard': return 'from-orange-400 to-orange-600';
      case 'expert': return 'from-red-400 to-red-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case 'easy': return '简';
      case 'normal': return '普';
      case 'hard': return '难';
      case 'expert': return '专';
      default: return '默';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 via-purple-200 to-pink-300 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-transparent to-green-200 opacity-60 animate-pulse-slow" />
      
      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto px-6 w-full">
        {/* 标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-2xl">
            设置
          </h1>
          <p className="text-lg text-indigo-700 font-medium opacity-80">
            个性化你的游戏体验
          </p>
        </div>
        
        {/* 设置内容 */}
        <div className="w-full max-w-md space-y-6">
          {/* 难度设置 */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              游戏难度
            </h3>
            <div className="space-y-3">
              {Object.entries(DIFFICULTY_CONFIGS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => onDifficultyChange(key as any)}
                  className={cn(
                    "w-full p-4 rounded-xl transition-all duration-200",
                    "border-2 text-left",
                    "hover:scale-102 active:scale-98",
                    difficulty === key
                      ? "border-purple-300 bg-gradient-to-r from-purple-100 to-pink-100 shadow-md"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  )}
                  aria-label={`选择${config.name}难度`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold",
                        `bg-gradient-to-r ${getDifficultyColor(key)}`
                      )}>
                        {getDifficultyIcon(key)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">{config.name}</div>
                        <div className="text-sm text-gray-500">{config.description}</div>
                      </div>
                    </div>
                    {difficulty === key && (
                      <div className="text-purple-600 text-xl">✓</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 音效设置 */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              音效设置
            </h3>
            
            {/* 音效开关 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{soundEnabled ? '开启' : '关闭'}</div>
                <div>
                  <div className="font-semibold text-gray-700">音效</div>
                  <div className="text-sm text-gray-500">开启或关闭游戏音效</div>
                </div>
              </div>
              <button
                onClick={() => onSoundToggle(!soundEnabled)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors duration-200",
                  soundEnabled ? "bg-green-400" : "bg-gray-300"
                )}
                aria-label={soundEnabled ? "关闭音效" : "开启音效"}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200",
                  soundEnabled ? "transform translate-x-6" : "transform translate-x-1"
                )} />
              </button>
            </div>
            
            {/* 音量调节 */}
            <div className={cn(
              "transition-opacity duration-200",
              soundEnabled ? "opacity-100" : "opacity-50 pointer-events-none"
            )}>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-xl">音量</div>
                <div className="font-semibold text-gray-700">音量</div>
                <div className="text-sm text-purple-600 font-medium">{Math.round(localVolume * 100)}%</div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${localVolume * 100}%, #e5e7eb ${localVolume * 100}%, #e5e7eb 100%)`
                }}
                disabled={!soundEnabled}
                aria-label="调节音量"
              />
            </div>
          </div>
          
          {/* 视觉特效设置 */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              ✨ 视觉特效
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{effectsEnabled ? '✨' : '⚫'}</div>
                <div>
                  <div className="font-semibold text-gray-700">粒子特效</div>
                  <div className="text-sm text-gray-500">
                    开启华丽的道具收集特效和光环动画
                  </div>
                </div>
              </div>
              <button
                onClick={() => onEffectsToggle(!effectsEnabled)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors duration-200",
                  effectsEnabled ? "bg-purple-400" : "bg-gray-300"
                )}
                aria-label={effectsEnabled ? "关闭视觉特效" : "开启视觉特效"}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200",
                  effectsEnabled ? "transform translate-x-6" : "transform translate-x-1"
                )} />
              </button>
            </div>
            
            {effectsEnabled && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-700">
                  <div className="font-medium mb-1">特效包括：</div>
                  <ul className="text-xs space-y-1 text-purple-600">
                    <li>• 道具收集时的粒子爆发效果</li>
                    <li>• 小鸟周围的光环和拖尾特效</li>
                    <li>• 全屏闪光和震屏动画</li>
                    <li>• 道具状态UI的发光效果</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* 其他信息 */}
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              游戏信息
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>当前难度:</span>
                <span className="font-semibold text-purple-600">
                  {DIFFICULTY_CONFIGS[difficulty]?.name || '普通'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>游戏版本:</span>
                <span className="font-semibold">v2.0</span>
              </div>
              <div className="flex justify-between">
                <span>开发者:</span>
                <span className="font-semibold">Baoniao.cn</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 返回按钮 */}
        <div className="mt-8">
          <button
            onClick={onBack}
            className={cn(
              "relative inline-flex items-center justify-center font-semibold rounded-2xl",
              "transition-all duration-150 ease-out",
              "hover:scale-103 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-opacity-50",
              "shadow-lg hover:shadow-xl",
              "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
              "hover:from-gray-200 hover:to-gray-300",
              "focus:ring-gray-300",
              "shadow-gray-200",
              "px-8 py-3 text-lg min-h-[44px]"
            )}
            aria-label="返回主页"
          >
            ← 返回主页
          </button>
        </div>
      </div>
      
      {/* 底部提示 */}
      <div className="absolute bottom-6 left-6 text-sm text-indigo-600 opacity-70">
        <p>设置会自动保存</p>
      </div>
    </div>
  );
};

export default Settings;