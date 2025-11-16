import { Particle, VisualEffect, PowerUpType } from '../types/game';

// 生成唯一ID
let particleIdCounter = 0;
export const generateParticleId = (): string => {
  return `particle_${Date.now()}_${++particleIdCounter}`;
};

let effectIdCounter = 0;
export const generateEffectId = (): string => {
  return `effect_${Date.now()}_${++effectIdCounter}`;
};

// 道具特效颜色配置
export const POWER_UP_EFFECT_COLORS = {
  invincible: {
    primary: '#FFD700',    // 金色
    secondary: '#FFA500',  // 橙色
    particles: ['#FFFF00', '#FFD700', '#FFA500', '#FF8C00']
  },
  speed_boost: {
    primary: '#1E90FF',    // 蓝色
    secondary: '#00BFFF',  // 深蓝色
    particles: ['#87CEEB', '#1E90FF', '#00BFFF', '#4169E1']
  },
  coin_double: {
    primary: '#FFFF00',    // 黄色
    secondary: '#FFD700',  // 金色
    particles: ['#FFFF00', '#FFD700', '#FFA500', '#FFEFD5']
  },
  magnet: {
    primary: '#8A2BE2',    // 紫色
    secondary: '#9370DB',  // 中紫色
    particles: ['#8A2BE2', '#9370DB', '#BA55D3', '#DDA0DD']
  },
  slow_motion: {
    primary: '#32CD32',    // 绿色
    secondary: '#228B22',  // 森林绿
    particles: ['#32CD32', '#228B22', '#90EE90', '#98FB98']
  }
};

// 创建粒子
export const createParticle = (
  x: number,
  y: number,
  type: Particle['type'],
  color: string,
  size: number = 3,
  life: number = 1000
): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 4 + 2;
  
  return {
    id: generateParticleId(),
    x,
    y,
    velocityX: Math.cos(angle) * speed,
    velocityY: Math.sin(angle) * speed,
    size,
    color,
    alpha: 1,
    life,
    maxLife: life,
    type,
    gravity: type === 'spark' ? 0.1 : 0.05,
    fade: true
  };
};

// 创建爆发式粒子效果
export const createExplosionParticles = (
  x: number,
  y: number,
  powerUpType: PowerUpType,
  count: number = 20
): Particle[] => {
  const particles: Particle[] = [];
  const colors = POWER_UP_EFFECT_COLORS[powerUpType.id as keyof typeof POWER_UP_EFFECT_COLORS]?.particles || ['#FFFFFF'];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = Math.random() * 6 + 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 4 + 2;
    
    particles.push({
      id: generateParticleId(),
      x,
      y,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      size,
      color,
      alpha: 1,
      life: 1500,
      maxLife: 1500,
      type: 'explosion',
      gravity: 0.15,
      fade: true
    });
  }
  
  return particles;
};

// 创建星星粒子效果
export const createStarParticles = (
  x: number,
  y: number,
  color: string,
  count: number = 12
): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    const size = Math.random() * 3 + 1;
    
    particles.push({
      id: generateParticleId(),
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      size,
      color,
      alpha: 1,
      life: 1200,
      maxLife: 1200,
      type: 'star',
      gravity: 0.08,
      fade: true
    });
  }
  
  return particles;
};

// 创建尾迹粒子效果（用于加速道具）
export const createTrailParticles = (
  x: number,
  y: number,
  direction: { x: number; y: number },
  color: string,
  count: number = 8
): Particle[] => {
  const particles: Particle[] = [];
  
  for (let i = 0; i < count; i++) {
    const offset = i * 5;
    particles.push({
      id: generateParticleId(),
      x: x - direction.x * offset + (Math.random() - 0.5) * 10,
      y: y - direction.y * offset + (Math.random() - 0.5) * 10,
      velocityX: -direction.x * 2 + (Math.random() - 0.5) * 2,
      velocityY: -direction.y * 2 + (Math.random() - 0.5) * 2,
      size: Math.random() * 2 + 1,
      color,
      alpha: 0.8,
      life: 800,
      maxLife: 800,
      type: 'trail',
      gravity: 0,
      fade: true
    });
  }
  
  return particles;
};

// 更新粒子状态
export const updateParticles = (
  particles: Particle[],
  deltaTime: number = 16
): Particle[] => {
  return particles
    .map(particle => {
      // 更新位置
      particle.x += particle.velocityX * (deltaTime / 16);
      particle.y += particle.velocityY * (deltaTime / 16);
      
      // 应用重力
      if (particle.gravity) {
        particle.velocityY += particle.gravity * (deltaTime / 16);
      }
      
      // 更新生命周期
      particle.life -= deltaTime;
      
      // 更新透明度（渐隐效果）
      if (particle.fade) {
        particle.alpha = Math.max(0, particle.life / particle.maxLife);
      }
      
      // 尾迹粒子的特殊处理
      if (particle.type === 'trail') {
        particle.velocityX *= 0.98; // 减速
        particle.velocityY *= 0.98;
      }
      
      return particle;
    })
    .filter(particle => particle.life > 0 && particle.alpha > 0.01);
};

// 创建全屏闪光效果
export const createScreenFlash = (
  color: string = '#FFFFFF',
  duration: number = 200,
  intensity: number = 0.6
): VisualEffect => {
  return {
    id: generateEffectId(),
    type: 'flash',
    startTime: Date.now(),
    duration,
    intensity,
    color
  };
};

// 创建震屏效果
export const createScreenShake = (
  intensity: number = 5,
  duration: number = 300
): VisualEffect => {
  return {
    id: generateEffectId(),
    type: 'shake',
    startTime: Date.now(),
    duration,
    intensity
  };
};

// 创建道具收集特效组合
export const createPowerUpCollectionEffects = (
  x: number,
  y: number,
  powerUpType: PowerUpType
): VisualEffect[] => {
  const effects: VisualEffect[] = [];
  const effectColors = POWER_UP_EFFECT_COLORS[powerUpType.id as keyof typeof POWER_UP_EFFECT_COLORS];
  
  if (!effectColors) return effects;
  
  // 全屏闪光
  effects.push(createScreenFlash(effectColors.primary, 150, 0.4));
  
  // 震屏效果
  if (powerUpType.rarity === 'legendary') {
    effects.push(createScreenShake(8, 400));
  } else if (powerUpType.rarity === 'epic') {
    effects.push(createScreenShake(5, 300));
  } else {
    effects.push(createScreenShake(3, 200));
  }
  
  // 粒子爆炸效果
  const explosionParticles = createExplosionParticles(x, y, powerUpType, 25);
  const starParticles = createStarParticles(x, y, effectColors.primary, 15);
  
  effects.push({
    id: generateEffectId(),
    type: 'explosion',
    startTime: Date.now(),
    duration: 2000,
    intensity: 1,
    position: { x, y },
    particles: [...explosionParticles, ...starParticles]
  });
  
  return effects;
};

// 更新视觉效果
export const updateVisualEffects = (
  effects: VisualEffect[],
  currentTime: number
): VisualEffect[] => {
  return effects
    .map(effect => {
      // 更新粒子效果
      if (effect.particles) {
        effect.particles = updateParticles(effect.particles);
      }
      
      return effect;
    })
    .filter(effect => {
      const elapsed = currentTime - effect.startTime;
      const isActive = elapsed < effect.duration;
      
      // 粒子效果需要等待所有粒子消失
      if (effect.type === 'explosion' || effect.type === 'particles') {
        return isActive || (effect.particles && effect.particles.length > 0);
      }
      
      return isActive;
    });
};

// 获取震屏偏移值
export const getShakeOffset = (effects: VisualEffect[], currentTime: number): { x: number; y: number } => {
  let totalIntensity = 0;
  
  effects.forEach(effect => {
    if (effect.type === 'shake') {
      const elapsed = currentTime - effect.startTime;
      const progress = elapsed / effect.duration;
      
      if (progress < 1) {
        // 震动强度随时间衰减
        const intensity = effect.intensity * (1 - progress);
        totalIntensity += intensity;
      }
    }
  });
  
  if (totalIntensity === 0) {
    return { x: 0, y: 0 };
  }
  
  return {
    x: (Math.random() - 0.5) * totalIntensity * 2,
    y: (Math.random() - 0.5) * totalIntensity * 2
  };
};

// 获取闪光透明度
export const getFlashOpacity = (effects: VisualEffect[], currentTime: number): { opacity: number; color: string } => {
  let maxOpacity = 0;
  let flashColor = '#FFFFFF';
  
  effects.forEach(effect => {
    if (effect.type === 'flash') {
      const elapsed = currentTime - effect.startTime;
      const progress = elapsed / effect.duration;
      
      if (progress < 1) {
        // 闪光效果：快速达到峰值，然后缓慢衰减
        let opacity;
        if (progress < 0.1) {
          opacity = effect.intensity * (progress / 0.1);
        } else {
          opacity = effect.intensity * (1 - (progress - 0.1) / 0.9);
        }
        
        if (opacity > maxOpacity) {
          maxOpacity = opacity;
          flashColor = effect.color || '#FFFFFF';
        }
      }
    }
  });
  
  return { opacity: maxOpacity, color: flashColor };
};