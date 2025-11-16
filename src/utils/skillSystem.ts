import { SkinSkill, SkillState, GameConfig } from '../types/game';

// 初始化技能状态
export const getInitialSkillState = (): SkillState => ({
  lastUsedTime: 0,
  cooldownRemaining: 0,
  isActive: false,
  activeEndTime: 0
});

// 更新技能冷却状态
export const updateSkillCooldown = (skillState: SkillState, currentTime: number, skill?: SkinSkill): SkillState => {
  if (!skill) {
    return skillState;
  }
  
  const timeSinceLastUse = currentTime - skillState.lastUsedTime;
  const newCooldownRemaining = Math.max(0, skill.cooldown - timeSinceLastUse);
  const isStillActive = skillState.isActive && currentTime < skillState.activeEndTime;
  
  return {
    ...skillState,
    cooldownRemaining: newCooldownRemaining,
    isActive: isStillActive,
    activeEndTime: isStillActive ? skillState.activeEndTime : 0
  };
};

// 检查技能是否可用
export const isSkillAvailable = (skillState: SkillState, skill?: SkinSkill): boolean => {
  if (!skill || skillState.isActive) {
    return false;
  }
  
  return skillState.cooldownRemaining <= 0;
};

// 激活技能
export const activateSkill = (skillState: SkillState, skill: SkinSkill, currentTime: number): SkillState => {
  if (!isSkillAvailable(skillState, skill)) {
    return skillState;
  }
  
  const activeEndTime = skill.effectDuration > 0 ? currentTime + skill.effectDuration : 0;
  
  return {
    lastUsedTime: currentTime,
    cooldownRemaining: skill.cooldown,
    isActive: skill.effectDuration > 0,
    activeEndTime
  };
};

// 获取技能冷却进度百分比
export const getSkillCooldownProgress = (skillState: SkillState, skill?: SkinSkill): number => {
  if (!skill || skillState.cooldownRemaining <= 0) {
    return 1; // 100%可用
  }
  
  const progress = 1 - (skillState.cooldownRemaining / skill.cooldown);
  return Math.max(0, Math.min(1, progress));
};

// 格式化冷却时间显示
export const formatCooldownTime = (cooldownMs: number): string => {
  if (cooldownMs <= 0) {
    return '就绪';
  }
  
  const seconds = Math.ceil(cooldownMs / 1000);
  return `${seconds}s`;
};

// 技能效果处理器
export const applySkillEffects = {
  // 旋风冲刺：速度加成 + 重力失效
  dash: (config: GameConfig, skillState: SkillState, skill: SkinSkill): GameConfig => {
    if (!skillState.isActive) return config;
    
    return {
      ...config,
      gravity: 0, // 无视重力
      pipeSpeed: config.pipeSpeed * (skill.effectValue || 2.0) // 加速飞行
    };
  },
  
  // 闪电传送：瞬间传送（在游戏逻辑中处理）
  teleport: (config: GameConfig): GameConfig => {
    return config;
  },
  
  // 火球攻击：摧毁管道（在游戏逻辑中处理）
  destroy: (config: GameConfig): GameConfig => {
    return config;
  },
  
  // 时间冰结：停止管道移动
  freeze: (config: GameConfig, skillState: SkillState): GameConfig => {
    if (!skillState.isActive) return config;
    
    return {
      ...config,
      pipeSpeed: 0 // 冻结所有管道
    };
  },
  
  // 重力反转：重力方向反转
  gravity: (config: GameConfig, skillState: SkillState, skill: SkinSkill): GameConfig => {
    if (!skillState.isActive) return config;
    
    return {
      ...config,
      gravity: config.gravity * (skill.effectValue || -1) // 反转重力
    };
  },
  
  // 防护罩：无敌状态（在游戏逻辑中处理）
  shield: (config: GameConfig): GameConfig => {
    return config;
  },
  
  // 迷你化：缩小体型（在游戏逻辑中处理）
  shrink: (config: GameConfig): GameConfig => {
    return config;
  },
  
  // 超级磁铁：吸引金币（在游戏逻辑中处理）
  magnet: (config: GameConfig): GameConfig => {
    return config;
  }
};

// 应用技能效果到游戏配置
export const applySkillEffectsToConfig = (
  config: GameConfig, 
  skillState: SkillState, 
  skill?: SkinSkill
): GameConfig => {
  if (!skill || !skillState.isActive) {
    return config;
  }
  
  const effectHandler = applySkillEffects[skill.effectType];
  return effectHandler ? effectHandler(config, skillState, skill) : config;
};

// 技能特效创建器
export const createSkillEffects = {
  // 旋风冲刺特效
  dash: (x: number, y: number) => ({
    id: `skill-dash-${Date.now()}`,
    type: 'trail' as const,
    startTime: Date.now(),
    duration: 3000,
    intensity: 1.0,
    color: '#06b6d4',
    position: { x, y },
    particles: Array.from({ length: 20 }, (_, i) => ({
      id: `dash-particle-${i}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      velocityX: -2 - Math.random() * 3,
      velocityY: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 2,
      color: '#06b6d4',
      alpha: 0.8,
      life: 0,
      maxLife: 1000 + Math.random() * 500,
      type: 'trail' as const,
      fade: true
    }))
  }),
  
  // 闪电传送特效
  teleport: (startX: number, startY: number, endX: number, endY: number) => ({
    id: `skill-teleport-${Date.now()}`,
    type: 'flash' as const,
    startTime: Date.now(),
    duration: 500,
    intensity: 1.0,
    color: '#8b5cf6',
    particles: [
      // 传送起始位置的闪电
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `teleport-start-${i}`,
        x: startX + (Math.random() - 0.5) * 30,
        y: startY + (Math.random() - 0.5) * 30,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: (Math.random() - 0.5) * 4,
        size: 1 + Math.random() * 2,
        color: '#8b5cf6',
        alpha: 1.0,
        life: 0,
        maxLife: 300,
        type: 'spark' as const,
        fade: true
      })),
      // 传送结束位置的闪电
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `teleport-end-${i}`,
        x: endX + (Math.random() - 0.5) * 30,
        y: endY + (Math.random() - 0.5) * 30,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: (Math.random() - 0.5) * 4,
        size: 1 + Math.random() * 2,
        color: '#8b5cf6',
        alpha: 1.0,
        life: 0,
        maxLife: 300,
        type: 'spark' as const,
        fade: true
      }))
    ]
  }),
  
  // 火球攻击特效
  destroy: (x: number, y: number) => ({
    id: `skill-destroy-${Date.now()}`,
    type: 'explosion' as const,
    startTime: Date.now(),
    duration: 1000,
    intensity: 1.0,
    color: '#ff4500',
    position: { x, y },
    particles: Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      return {
        id: `destroy-particle-${i}`,
        x,
        y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color: i < 15 ? '#ff4500' : '#ff6347',
        alpha: 1.0,
        life: 0,
        maxLife: 800 + Math.random() * 400,
        type: 'explosion' as const,
        gravity: 0.1,
        fade: true
      };
    })
  }),
  
  // 时间冰结特效
  freeze: (x: number, y: number) => ({
    id: `skill-freeze-${Date.now()}`,
    type: 'glow' as const,
    startTime: Date.now(),
    duration: 3000,
    intensity: 0.8,
    color: '#67e8f9',
    position: { x, y },
    particles: Array.from({ length: 25 }, (_, i) => ({
      id: `freeze-particle-${i}`,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      velocityX: (Math.random() - 0.5) * 1,
      velocityY: -0.5 - Math.random() * 1,
      size: 3 + Math.random() * 2,
      color: '#67e8f9',
      alpha: 0.7,
      life: 0,
      maxLife: 2000 + Math.random() * 1000,
      type: 'star' as const,
      fade: true
    }))
  }),
  
  // 重力反转特效
  gravity: (x: number, y: number) => ({
    id: `skill-gravity-${Date.now()}`,
    type: 'glow' as const,
    startTime: Date.now(),
    duration: 3000,
    intensity: 0.8,
    color: '#9333ea',
    position: { x, y },
    particles: Array.from({ length: 25 }, (_, i) => ({
      id: `gravity-particle-${i}`,
      x: x + (Math.random() - 0.5) * 80,
      y: y + (Math.random() - 0.5) * 80,
      velocityX: (Math.random() - 0.5) * 1,
      velocityY: -1 - Math.random() * 2, // 向上飘动
      size: 2 + Math.random() * 3,
      color: '#9333ea',
      alpha: 0.7,
      life: 0,
      maxLife: 1500 + Math.random() * 1000,
      type: 'star' as const,
      fade: true
    }))
  }),
  
  // 防护罩特效
  shield: (x: number, y: number) => ({
    id: `skill-shield-${Date.now()}`,
    type: 'glow' as const,
    startTime: Date.now(),
    duration: 3000,
    intensity: 1.0,
    color: '#ffd700',
    position: { x, y },
    particles: Array.from({ length: 30 }, (_, i) => {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 25 + Math.random() * 5;
      return {
        id: `shield-particle-${i}`,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        velocityX: Math.cos(angle) * 0.5,
        velocityY: Math.sin(angle) * 0.5,
        size: 2 + Math.random() * 2,
        color: '#ffd700',
        alpha: 0.8,
        life: 0,
        maxLife: 2000 + Math.random() * 1000,
        type: 'spark' as const,
        fade: true
      };
    })
  }),
  
  // 迷你化特效
  shrink: (x: number, y: number) => ({
    id: `skill-shrink-${Date.now()}`,
    type: 'flash' as const,
    startTime: Date.now(),
    duration: 300,
    intensity: 0.6,
    color: '#ec4899',
    position: { x, y },
    particles: Array.from({ length: 20 }, (_, i) => ({
      id: `shrink-particle-${i}`,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      velocityX: (Math.random() - 0.5) * 2,
      velocityY: (Math.random() - 0.5) * 2,
      size: 2 + Math.random() * 2,
      color: '#ec4899',
      alpha: 0.8,
      life: 0,
      maxLife: 1000 + Math.random() * 500,
      type: 'circle' as const,
      fade: true
    }))
  }),
  
  // 超级磁铁特效
  magnet: (x: number, y: number) => ({
    id: `skill-magnet-${Date.now()}`,
    type: 'glow' as const,
    startTime: Date.now(),
    duration: 3000,
    intensity: 0.8,
    color: '#8A2BE2',
    position: { x, y },
    particles: Array.from({ length: 25 }, (_, i) => {
      const angle = (i / 25) * Math.PI * 2;
      const radius = 30 + Math.random() * 20;
      return {
        id: `magnet-particle-${i}`,
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        velocityX: -Math.cos(angle) * 2, // 向中心移动
        velocityY: -Math.sin(angle) * 2, // 向中心移动
        size: 2 + Math.random() * 2,
        color: '#8A2BE2',
        alpha: 0.7,
        life: 0,
        maxLife: 1000 + Math.random() * 500,
        type: 'circle' as const,
        fade: true
      };
    })
  })
};
