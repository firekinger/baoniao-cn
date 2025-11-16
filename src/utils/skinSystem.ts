import { BaoniaoSkin, SkinData, SkinSkill } from '../types/game';

// 技能定义
export const SKIN_SKILLS: Record<string, SkinSkill> = {
  storm: {
    id: 'storm',
    name: '旋风冲刺',
    description: '按E键触发3秒疾速冲刺，期间无视重力向前飞行',
    cooldown: 30000, // 30秒冷却时间
    icon: '🌪️',
    effectType: 'dash',
    effectDuration: 3000,
    effectValue: 2.0 // 速度倍数
  },
  lightning: {
    id: 'lightning',
    name: '闪电传送',
    description: '按E键瞬间向前传送一段距离，穿透障碍物',
    cooldown: 30000, // 30秒冷却时间
    icon: '⚡',
    effectType: 'teleport',
    effectDuration: 0,
    effectValue: 200 // 传送距离
  },
  flame: {
    id: 'flame',
    name: '火球攻击',
    description: '按E键发射火球，摧毁前方最近的一根管道',
    cooldown: 30000, // 30秒冷却时间
    icon: '🔥',
    effectType: 'destroy',
    effectDuration: 0,
    effectValue: 1 // 摧毁数量
  },
  frost: {
    id: 'frost',
    name: '时间冰结',
    description: '按E键冻结所有管道移动3秒，宝鸟正常飞行',
    cooldown: 30000, // 30秒冷却时间
    icon: '🧊',
    effectType: 'freeze',
    effectDuration: 3000,
    effectValue: 0 // 无额外数值
  },
  gravity: {
    id: 'gravity',
    name: '重力反转',
    description: '按E键反转重力方向3秒，宝鸟向上飘浮',
    cooldown: 30000, // 30秒冷却时间
    icon: '↕️',
    effectType: 'gravity',
    effectDuration: 3000,
    effectValue: -1 // 重力反向系数
  },
  shield: {
    id: 'shield',
    name: '防护罩',
    description: '按E键激活3秒无敌护盾，抵挡一切障碍物',
    cooldown: 30000, // 30秒冷却时间
    icon: '🛡️',
    effectType: 'shield',
    effectDuration: 3000,
    effectValue: 0 // 无额外数值
  },
  shrink: {
    id: 'shrink',
    name: '迷你化',
    description: '按E键缩小体型3秒，更容易穿过障碍物',
    cooldown: 30000, // 30秒冷却时间
    icon: '🔍',
    effectType: 'shrink',
    effectDuration: 3000,
    effectValue: 0.5 // 体型缩放比例
  },
  magnet: {
    id: 'magnet',
    name: '超级磁铁',
    description: '按E键激活3秒超级磁铁，吸引周围所有金币',
    cooldown: 30000, // 30秒冷却时间
    icon: '🧲',
    effectType: 'magnet',
    effectDuration: 3000,
    effectValue: 2.0 // 磁铁效果范围倍数
  }
};

// 所有可用皮肤数据
export const BAONIAO_SKINS: Record<string, BaoniaoSkin> = {
  // 🆓 基础皮肤系列（3种 - 无技能）
  classic: {
    id: 'classic',
    name: '经典宝鸟',
    description: '原版蓝色宝鸟，经典永不过时',
    price: 0,
    rarity: 'common',
    category: 'basic',
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accent: '#1d4ed8',
      eye: 'white'
    },
    effects: {
      gradient: true
    },
    unlocked: true,
    owned: true
  },
  
  fire_basic: {
    id: 'fire_basic',
    name: '炽热宝鸟',
    description: '红色火焰主题，热情洋溢',
    price: 300,
    rarity: 'common',
    category: 'basic',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#b91c1c',
      eye: 'white'
    },
    effects: {
      gradient: true,
      glow: true
    },
    unlocked: false,
    owned: false
  },
  
  frost_basic: {
    id: 'frost_basic',
    name: '冰霜宝鸟',
    description: '蓝白冰雪主题，清凉舒爽',
    price: 300,
    rarity: 'common',
    category: 'basic',
    colors: {
      primary: '#87ceeb',
      secondary: '#b0e0e6',
      accent: '#4682b4',
      eye: '#87cefa'
    },
    effects: {
      gradient: true,
      sparkle: true
    },
    unlocked: false,
    owned: false
  },
  
  // 💰 普通皮肤系列（5种 - 无技能）
  rainbow: {
    id: 'rainbow',
    name: '彩虹宝鸟',
    description: '七彩渐变效果，绚烂多彩',
    price: 500,
    rarity: 'rare',
    category: 'normal',
    colors: {
      primary: '#f59e0b',
      secondary: '#ec4899',
      accent: '#8b5cf6',
      eye: 'white'
    },
    effects: {
      gradient: true,
      sparkle: true
    },
    unlocked: false,
    owned: false
  },
  
  gold: {
    id: 'gold',
    name: '黄金宝鸟',
    description: '金色奢华主题，尊贵无比',
    price: 800,
    rarity: 'rare',
    category: 'normal',
    colors: {
      primary: '#ffd700',
      secondary: '#ffb347',
      accent: '#ff8c00',
      eye: 'white'
    },
    effects: {
      gradient: true,
      glow: true
    },
    unlocked: false,
    owned: false
  },
  
  night: {
    id: 'night',
    name: '夜空宝鸟',
    description: '深蓝星空主题，神秘优雅',
    price: 600,
    rarity: 'rare',
    category: 'normal',
    colors: {
      primary: '#1e1b4b',
      secondary: '#312e81',
      accent: '#4338ca',
      eye: '#fbbf24'
    },
    effects: {
      gradient: true,
      sparkle: true
    },
    unlocked: false,
    owned: false
  },
  
  halloween: {
    id: 'halloween',
    name: '万圣节宝鸟',
    description: '橙色南瓜主题，节日氛围满满',
    price: 700,
    rarity: 'rare',
    category: 'normal',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#c2410c',
      eye: '#facc15'
    },
    effects: {
      gradient: true,
      glow: true
    },
    unlocked: false,
    owned: false
  },
  
  diamond: {
    id: 'diamond',
    name: '钻石宝鸟',
    description: '透明水晶效果，珍贵稀有',
    price: 1000,
    rarity: 'epic',
    category: 'normal',
    colors: {
      primary: '#e0e7ff',
      secondary: '#c7d2fe',
      accent: '#a5b4fc',
      eye: '#3730a3'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true
    },
    unlocked: false,
    owned: false
  },
  
  // ⚡ 技能皮肤系列（12种 - 核心功能）
  storm_bird: {
    id: 'storm_bird',
    name: '风暴宝鸟',
    description: '拥有旋风冲刺技能，可短时间疾速飞行',
    price: 1200,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#0e7490',
      eye: 'white'
    },
    effects: {
      gradient: true,
      glow: true,
      particle: true
    },
    skill: SKIN_SKILLS.storm,
    unlocked: false,
    owned: false
  },
  
  lightning_bird: {
    id: 'lightning_bird',
    name: '雷电宝鸟',
    description: '拥有闪电传送技能，可瞬间穿越障碍',
    price: 1500,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#6d28d9',
      eye: '#fbbf24'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true,
      particle: true
    },
    skill: SKIN_SKILLS.lightning,
    unlocked: false,
    owned: false
  },
  
  flame_bird: {
    id: 'flame_bird',
    name: '烈焰宝鸟',
    description: '拥有火球攻击技能，可摧毁管道障碍',
    price: 1800,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#ff4500',
      secondary: '#ff6347',
      accent: '#dc143c',
      eye: '#ffff00'
    },
    effects: {
      gradient: true,
      glow: true,
      particle: true
    },
    skill: SKIN_SKILLS.flame,
    unlocked: false,
    owned: false
  },
  
  frost_bird: {
    id: 'frost_bird',
    name: '极冰宝鸟',
    description: '拥有时间冰结技能，可冻结所有管道',
    price: 2000,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#67e8f9',
      secondary: '#22d3ee',
      accent: '#06b6d4',
      eye: '#1e40af'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true,
      particle: true
    },
    skill: SKIN_SKILLS.frost,
    unlocked: false,
    owned: false
  },
  
  gravity_bird: {
    id: 'gravity_bird',
    name: '重力宝鸟',
    description: '拥有重力反转技能，可短时间向上飘浮',
    price: 2200,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#9333ea',
      secondary: '#7e22ce',
      accent: '#581c87',
      eye: '#c084fc'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true,
      particle: true
    },
    skill: SKIN_SKILLS.gravity,
    unlocked: false,
    owned: false
  },
  
  shield_bird: {
    id: 'shield_bird',
    name: '护盾宝鸟',
    description: '拥有防护罩技能，短时间无敌状态',
    price: 2400,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#ffd700',
      secondary: '#ffb700',
      accent: '#ff9500',
      eye: '#ffffff'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true,
      particle: true
    },
    skill: SKIN_SKILLS.shield,
    unlocked: false,
    owned: false
  },
  
  mini_bird: {
    id: 'mini_bird',
    name: '迷你宝鸟',
    description: '拥有迷你化技能，短时间缩小体型',
    price: 2600,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#ec4899',
      secondary: '#db2777',
      accent: '#be185d',
      eye: '#f9a8d4'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true,
      particle: true
    },
    skill: SKIN_SKILLS.shrink,
    unlocked: false,
    owned: false
  },
  
  magnet_bird: {
    id: 'magnet_bird',
    name: '磁力宝鸟',
    description: '拥有超级磁铁技能，可吸引所有金币',
    price: 2800,
    rarity: 'legendary',
    category: 'skill',
    colors: {
      primary: '#8A2BE2',
      secondary: '#9370DB',
      accent: '#6A5ACD',
      eye: '#E6E6FA'
    },
    effects: {
      gradient: true,
      glow: true,
      sparkle: true,
      particle: true
    },
    skill: SKIN_SKILLS.magnet,
    unlocked: false,
    owned: false
  }
};

// 稀有度配置
export const RARITY_CONFIG = {
  common: {
    name: '普通',
    color: '#6b7280',
    bgColor: '#f3f4f6',
    borderColor: '#d1d5db'
  },
  rare: {
    name: '稀有',
    color: '#7c3aed',
    bgColor: '#f3e8ff',
    borderColor: '#c4b5fd'
  },
  epic: {
    name: '史诗',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5'
  },
  legendary: {
    name: '传说',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fed7aa'
  }
};

// 皮肤类别配置
export const CATEGORY_CONFIG = {
  basic: {
    name: '基础皮肤',
    description: '经典外观，简单实用'
  },
  normal: {
    name: '普通皮肤',
    description: '精美外观，个性十足'
  },
  skill: {
    name: '技能皮肤',
    description: '拥有特殊技能的强力皮肤'
  }
};

// 获取所有皮肤列表
export const getAllSkins = (): BaoniaoSkin[] => {
  return Object.values(BAONIAO_SKINS);
};

// 根据类别获取皮肤
export const getSkinsByCategory = (category: BaoniaoSkin['category']): BaoniaoSkin[] => {
  return getAllSkins().filter(skin => skin.category === category);
};

// 根据稀有度获取皮肤
export const getSkinsByRarity = (rarity: BaoniaoSkin['rarity']): BaoniaoSkin[] => {
  return getAllSkins().filter(skin => skin.rarity === rarity);
};

// 获取技能皮肤
export const getSkillSkins = (): BaoniaoSkin[] => {
  return getAllSkins().filter(skin => skin.skill);
};

// 获取已解锁的皮肤
export const getUnlockedSkins = (): BaoniaoSkin[] => {
  const skinData = loadSkinData();
  return getAllSkins().filter(skin => skinData.unlockedSkins.includes(skin.id) || skin.id === 'classic');
};

// 加载皮肤数据
export const loadSkinData = (): SkinData => {
  try {
    const data = localStorage.getItem('flappyBaoniaoSkins');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        unlockedSkins: parsed.unlockedSkins || ['classic'],
        currentSkin: parsed.currentSkin || 'classic',
        purchaseHistory: parsed.purchaseHistory || []
      };
    }
    return {
      unlockedSkins: ['classic'],
      currentSkin: 'classic',
      purchaseHistory: []
    };
  } catch (error) {
    console.error('Error loading skin data:', error);
    return {
      unlockedSkins: ['classic'],
      currentSkin: 'classic',
      purchaseHistory: []
    };
  }
};

// 保存皮肤数据
export const saveSkinData = (skinData: SkinData): void => {
  try {
    localStorage.setItem('flappyBaoniaoSkins', JSON.stringify(skinData));
  } catch (error) {
    console.error('Error saving skin data:', error);
  }
};

// 获取当前皮肤
export const getCurrentSkin = (): BaoniaoSkin => {
  try {
    const skinData = loadSkinData();
    const skinId = skinData.currentSkin;
    console.log('[DEBUG] 当前皮肤ID:', skinId);
    
    if (skinId && BAONIAO_SKINS[skinId]) {
      // 确保传说皮肤的技能完整初始化
      const skin = { ...BAONIAO_SKINS[skinId] };
      console.log('[DEBUG] 加载皮肤:', {
        id: skin.id, 
        name: skin.name, 
        rarity: skin.rarity,
        hasSkill: !!skin.skill,
        skillName: skin.skill?.name
      });
      
      // 确保传说皮肤的技能正确装载
      if (skin.rarity === 'legendary' && skin.id.includes('_bird')) {
        // 确保传说皮肤有正确的技能引用
        const skillId = skin.id.replace('_bird', '');
        if (SKIN_SKILLS[skillId]) {
          skin.skill = SKIN_SKILLS[skillId];
          console.log('[DEBUG] 已正确加载传说皮肤技能:', {
            skillId: skillId,
            skillName: skin.skill.name,
            effectType: skin.skill.effectType
          });
        }
      }
      
      return skin;
    }
  } catch (e) {
    console.error('加载当前皮肤出错:', e);
  }
  
  // 默认使用经典皮肤
  return BAONIAO_SKINS.classic;
};

// 切换皮肤
export const switchSkin = (skinId: string): boolean => {
  const skinData = loadSkinData();
  
  // 检查皮肤是否存在且已解锁
  if (!BAONIAO_SKINS[skinId]) {
    console.error('Skin not found:', skinId);
    return false;
  }
  
  if (!skinData.unlockedSkins.includes(skinId) && skinId !== 'classic') {
    console.error('Skin not unlocked:', skinId);
    return false;
  }
  
  // 更新当前皮肤
  const newSkinData: SkinData = {
    ...skinData,
    currentSkin: skinId
  };
  
  saveSkinData(newSkinData);
  return true;
};

// 解锁皮肤
export const unlockSkin = (skinId: string): boolean => {
  const skinData = loadSkinData();
  
  if (!BAONIAO_SKINS[skinId]) {
    console.error('Skin not found:', skinId);
    return false;
  }
  
  if (skinData.unlockedSkins.includes(skinId)) {
    console.log('Skin already unlocked:', skinId);
    return true;
  }
  
  // 添加到已解锁列表
  const newSkinData: SkinData = {
    ...skinData,
    unlockedSkins: [...skinData.unlockedSkins, skinId],
    purchaseHistory: [...skinData.purchaseHistory, skinId]
  };
  
  saveSkinData(newSkinData);
  return true;
};

// 检查皮肤是否已解锁
export const isSkinUnlocked = (skinId: string): boolean => {
  const skinData = loadSkinData();
  return skinData.unlockedSkins.includes(skinId) || skinId === 'classic';
};

// 获取皮肤信息（更新解锁状态）
export const getSkinInfo = (skinId: string): BaoniaoSkin | null => {
  const skin = BAONIAO_SKINS[skinId];
  if (!skin) return null;
  
  const isUnlocked = isSkinUnlocked(skinId);
  return {
    ...skin,
    unlocked: isUnlocked,
    owned: isUnlocked
  };
};

// 获取所有皮肤信息（更新解锁状态）
export const getAllSkinsInfo = (): BaoniaoSkin[] => {
  return getAllSkins().map(skin => getSkinInfo(skin.id)!).filter(Boolean);
};

// 验证皮肤数据完整性
export const validateSkinData = (data: any): SkinData => {
  const defaultSkinData: SkinData = {
    unlockedSkins: ['classic'],
    currentSkin: 'classic',
    purchaseHistory: []
  };
  
  if (!data || typeof data !== 'object') {
    return defaultSkinData;
  }
  
  return {
    unlockedSkins: Array.isArray(data.unlockedSkins) ? data.unlockedSkins : ['classic'],
    currentSkin: typeof data.currentSkin === 'string' && BAONIAO_SKINS[data.currentSkin] 
      ? data.currentSkin 
      : 'classic',
    purchaseHistory: Array.isArray(data.purchaseHistory) ? data.purchaseHistory : []
  };
};
