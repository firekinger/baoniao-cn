import { PowerUpType, PowerUpInstance, ActivePowerUp, PowerUpEffect } from '../types/game';

// 道具类型配置
export const POWER_UP_TYPES: PowerUpType[] = [
  {
    id: 'invincible',
    name: '无敌道具',
    icon: '盾牌',
    color: '#FFD700', // 金色
    rarity: 'legendary',
    duration: 5000,   // 5秒
    spawnRate: 0.08,  // 8%出现率
    description: '获得无敌状态，可以穿越管道5秒'
  },
  {
    id: 'speed_boost',
    name: '加速道具',
    icon: '火焰',
    color: '#1E90FF', // 蓝色
    rarity: 'rare',
    duration: 10000,  // 10秒
    spawnRate: 0.15,  // 15%出现率
    description: '提升飞行速度，更快穿越障碍10秒'
  },
  {
    id: 'coin_double',
    name: '金币加倍',
    icon: '星星',
    color: '#FFFF00', // 黄色
    rarity: 'epic',
    duration: 15000,  // 15秒
    spawnRate: 0.12,  // 12%出现率
    description: '金币获得翻倍，持续15秒'
  },
  {
    id: 'magnet',
    name: '磁铁道具',
    icon: '磁铁',
    color: '#8A2BE2', // 紫色
    rarity: 'rare',
    duration: 8000,   // 8秒
    spawnRate: 0.18,  // 18%出现率
    description: '自动吸引附近的金币8秒'
  },
  {
    id: 'slow_motion',
    name: '缓慢道具',
    icon: '时钟',
    color: '#32CD32', // 绿色
    rarity: 'common',
    duration: 12000,  // 12秒
    spawnRate: 0.25,  // 25%出现率
    description: '游戏减速，更容易控制12秒'
  }
];

// 道具稀有度颜色配置
export const RARITY_COLORS = {
  common: '#90EE90',     // 浅绿色
  rare: '#87CEEB',       // 天蓝色
  epic: '#DDA0DD',       // 梅红色
  legendary: '#FFD700'   // 金色
};

// 生成唯一ID
let powerUpIdCounter = 0;
export const generatePowerUpId = (): string => {
  return `powerup_${Date.now()}_${++powerUpIdCounter}`;
};

// 根据稀有度获取道具类型
export const getPowerUpTypeById = (id: string): PowerUpType | undefined => {
  return POWER_UP_TYPES.find(type => type.id === id);
};

// 随机选择道具类型（基于出现频率）
export const getRandomPowerUpType = (): PowerUpType | null => {
  const random = Math.random();
  let cumulativeRate = 0;
  
  // 按出现频率累计选择
  for (const powerUpType of POWER_UP_TYPES) {
    cumulativeRate += powerUpType.spawnRate;
    if (random <= cumulativeRate) {
      return powerUpType;
    }
  }
  
  return null; // 不生成道具
};

// 创建道具实例
export const createPowerUpInstance = (
  type: PowerUpType,
  x: number,
  y: number,
  size: number = 24
): PowerUpInstance => {
  return {
    id: generatePowerUpId(),
    type,
    x,
    y,
    size,
    rotation: 0,
    collected: false,
    animationPhase: 0
  };
};

// 检查道具是否应该在指定位置生成
export const shouldSpawnPowerUp = (pipeGap: number, difficulty: string): boolean => {
  // 根据难度调整生成概率
  const difficultyMultiplier = {
    'easy': 1.2,
    'normal': 1.0,
    'hard': 0.8,
    'expert': 0.6
  }[difficulty] || 1.0;
  
  // 基础生成概率：15-25%
  const baseSpawnChance = 0.20;
  const adjustedSpawnChance = baseSpawnChance * difficultyMultiplier;
  
  return Math.random() < adjustedSpawnChance;
};

// 计算道具生成位置（管道间隙中央）
export const calculatePowerUpPosition = (
  pipeX: number,
  pipeWidth: number,
  topHeight: number,
  gap: number
): { x: number; y: number } => {
  return {
    x: pipeX + pipeWidth / 2,
    y: topHeight + gap / 2
  };
};

// AABB碰撞检测
export const checkPowerUpCollision = (
  bird: { x: number; y: number; size: number },
  powerUp: PowerUpInstance
): boolean => {
  const birdLeft = bird.x;
  const birdRight = bird.x + bird.size;
  const birdTop = bird.y;
  const birdBottom = bird.y + bird.size;
  
  const powerUpLeft = powerUp.x - powerUp.size / 2;
  const powerUpRight = powerUp.x + powerUp.size / 2;
  const powerUpTop = powerUp.y - powerUp.size / 2;
  const powerUpBottom = powerUp.y + powerUp.size / 2;
  
  return (
    birdLeft < powerUpRight &&
    birdRight > powerUpLeft &&
    birdTop < powerUpBottom &&
    birdBottom > powerUpTop
  );
};

// 激活道具效果
export const activatePowerUp = (
  powerUpType: PowerUpType,
  currentTime: number
): ActivePowerUp => {
  return {
    type: powerUpType,
    startTime: currentTime,
    endTime: currentTime + powerUpType.duration,
    remaining: powerUpType.duration
  };
};

// 更新道具效果状态
export const updatePowerUpEffects = (
  activePowerUps: ActivePowerUp[],
  currentTime: number
): { effects: PowerUpEffect; activePowerUps: ActivePowerUp[] } => {
  // 更新剩余时间并移除过期的道具
  const updatedActivePowerUps = activePowerUps
    .map(powerUp => ({
      ...powerUp,
      remaining: powerUp.endTime - currentTime
    }))
    .filter(powerUp => powerUp.remaining > 0);
  
  // 计算当前效果状态
  const effects: PowerUpEffect = {
    invincible: false,
    speedBoost: 1.0,
    coinMultiplier: 1.0,
    magnetActive: false,
    slowMotion: false
  };
  
  // 效果冲突处理器
  let hasSpeedBoost = false;
  let hasSlowMotion = false;
  
  updatedActivePowerUps.forEach(powerUp => {
    switch (powerUp.type.id) {
      case 'invincible':
        effects.invincible = true;
        break;
      case 'speed_boost':
        hasSpeedBoost = true;
        break;
      case 'coin_double':
        effects.coinMultiplier = Math.max(effects.coinMultiplier, 2.0); // 金币翻倍
        break;
      case 'magnet':
        effects.magnetActive = true;
        break;
      case 'slow_motion':
        hasSlowMotion = true;
        break;
    }
  });
  
  // 处理速度效果冲突：优先级 加速 > 缓慢
  if (hasSpeedBoost && hasSlowMotion) {
    // 加速优先，但效果减弱
    effects.speedBoost = 1.25; // 降低加速效果
  } else if (hasSpeedBoost) {
    effects.speedBoost = 1.5; // 50%速度提升
  } else if (hasSlowMotion) {
    effects.speedBoost = 0.3; // 70%减速
  }
  
  return {
    effects,
    activePowerUps: updatedActivePowerUps
  };
};

// 更新道具动画
export const updatePowerUpAnimation = (
  powerUps: PowerUpInstance[],
  deltaTime: number
): PowerUpInstance[] => {
  return powerUps.map(powerUp => ({
    ...powerUp,
    rotation: (powerUp.rotation + deltaTime * 0.002) % (Math.PI * 2),
    animationPhase: (powerUp.animationPhase + deltaTime * 0.003) % (Math.PI * 2),
    y: powerUp.y + Math.sin(powerUp.animationPhase) * 0.5 // 轻微浮动效果
  }));
};

// 获取道具效果描述文本（增强版）
export const getPowerUpEffectText = (effects: PowerUpEffect): string[] => {
  const activeEffects: string[] = [];
  
  if (effects.invincible) {
    activeEffects.push('🛡️ 无敌状态');
  }
  if (effects.speedBoost > 1.0) {
    const speedPercentage = Math.round((effects.speedBoost - 1) * 100);
    activeEffects.push(`🔥 速度提升 +${speedPercentage}%`);
  }
  if (effects.speedBoost < 1.0) {
    const slowPercentage = Math.round((1 - effects.speedBoost) * 100);
    activeEffects.push(`🕐 减速 -${slowPercentage}%`);
  }
  if (effects.coinMultiplier > 1.0) {
    activeEffects.push('⭐ 金币翻倍');
  }
  if (effects.magnetActive) {
    activeEffects.push('🧲 磁铁效果');
  }
  
  return activeEffects;
};

// 道具效果持续时间格式化
export const formatPowerUpDuration = (milliseconds: number): string => {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${seconds}s`;
};

// 应用道具效果到游戏配置
export const applyPowerUpEffectsToConfig = (
  baseConfig: any,
  effects: PowerUpEffect
): any => {
  return {
    ...baseConfig,
    pipeSpeed: baseConfig.pipeSpeed * effects.speedBoost,
    gravity: effects.speedBoost < 1.0 ? baseConfig.gravity * 0.7 : baseConfig.gravity, // 缓慢模式下重力也减少
  };
};

// 检查道具效果是否有冲突
export const hasPowerUpConflicts = (activePowerUps: ActivePowerUp[]): boolean => {
  const hasSpeedBoost = activePowerUps.some(p => p.type.id === 'speed_boost');
  const hasSlowMotion = activePowerUps.some(p => p.type.id === 'slow_motion');
  
  return hasSpeedBoost && hasSlowMotion;
};

// 获取当前激活的道具效果数量
export const getActivePowerUpCount = (activePowerUps: ActivePowerUp[]): number => {
  return activePowerUps.length;
};

// 检查特定道具是否激活
export const isPowerUpActive = (activePowerUps: ActivePowerUp[], powerUpId: string): boolean => {
  return activePowerUps.some(p => p.type.id === powerUpId);
};

// 初始化道具效果状态
export const getInitialPowerUpEffects = (): PowerUpEffect => {
  return {
    invincible: false,
    speedBoost: 1.0,
    coinMultiplier: 1.0,
    magnetActive: false,
    slowMotion: false
  };
};