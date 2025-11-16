export interface Baoniao {
  x: number;
  y: number;
  velocity: number;
  size: number;
}

export interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  width: number;
  gap: number;
  passed: boolean;
}

export interface CoinData {
  coins: number;           // 当前金币余额
  totalEarned: number;     // 总共获得的金币
  lastGameCoins: number;   // 上一局获得的金币
}

export interface CoinReward {
  amount: number;
  type: 'pipe' | 'streak' | 'time' | 'milestone' | 'perfect';
  message: string;
  x?: number;
  y?: number;
  id: string;
}

export interface GameStats {
  gameStartTime: number;
  consecutivePipes: number;
  currentStreak: number;
  maxStreak: number;
  timeRewards: number;
  milestoneRewards: Set<number>;
  perfectStreakCount: number;
}

export interface GameState {
  status: 'start' | 'playing' | 'paused' | 'gameOver' | 'leaderboard' | 'settings' | 'shop';
  score: number;
  highScore: number;
  baoniao: Baoniao;
  pipes: Pipe[];
  playerName: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  soundEnabled: boolean;
  volume: number;
  effectsEnabled: boolean;
  // 金币系统相关
  coinData: CoinData;
  currentGameCoins: number;
  gameStats: GameStats;
  coinRewards: CoinReward[];
  showCoinAnimation: boolean;
  // 皮肤系统相关
  skinData: SkinData;
  currentSkin: BaoniaoSkin;
  // 技能系统相关
  skillState: SkillState;
  // 道具系统相关
  powerUps: PowerUpInstance[];      // 游戏中的道具实例
  activePowerUps: ActivePowerUp[];  // 当前激活的道具效果
  powerUpEffects: PowerUpEffect;    // 当前道具效果状态
  // 金币道具系统
  coinInstances: CoinInstance[];    // 游戏中的金币道具实例
}

export interface GameConfig {
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeGap: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
}

export interface DifficultyConfig {
  name: string;
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeGap: number;
  description: string;
}

export interface CoinRewardConfig {
  perPipe: number;
  streak3: number;
  streak5: number;
  streak10: number;
  time30s: number;
  score10: number;
  score20: number;
  score50: number;
  perfect15: number;
}

export interface CoinGameSummary {
  baseRewards: number;     // 基础管道奖励
  streakRewards: number;   // 连击奖励
  timeRewards: number;     // 时长奖励
  milestoneRewards: number; // 里程碑奖励
  perfectRewards: number;  // 完美表现奖励
  totalCoins: number;      // 本局总金币
}

// 皮肤系统相关类型定义
export interface SkinSkill {
  id: string;              // 技能ID
  name: string;            // 技能名称
  description: string;     // 技能描述
  cooldown: number;        // 冷却时间(毫秒)
  icon: string;            // 技能图标
  effectType: 'dash' | 'teleport' | 'destroy' | 'freeze' | 'gravity' | 'shield' | 'shrink' | 'magnet'; // 技能类型
  effectDuration: number;  // 效果持续时间(毫秒)
  effectValue?: number;    // 效果数值（如传送距离）
}

export interface BaoniaoSkin {
  id: string;              // 唯一标识符
  name: string;            // 皮肤名称
  description: string;     // 皮肤描述
  price: number;           // 价格（0表示免费）
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; // 稀有度
  category: 'basic' | 'normal' | 'skill'; // 皮肤类别
  colors: {
    primary: string;       // 主色调
    secondary?: string;    // 次色调（渐变用）
    accent?: string;       // 强调色（翅膀、嘴巴等）
    eye?: string;          // 眼睛颜色
  };
  effects?: {
    glow?: boolean;        // 发光效果
    sparkle?: boolean;     // 闪烁效果
    gradient?: boolean;    // 渐变效果
    particle?: boolean;    // 粒子效果
  };
  skill?: SkinSkill;       // 皮肤技能（技能皮肤专属）
  unlocked: boolean;       // 解锁状态
  owned: boolean;          // 拥有状态
}

export interface SkinData {
  unlockedSkins: string[];     // 已解锁皮肤ID列表
  currentSkin: string;         // 当前使用皮肤ID
  purchaseHistory: string[];   // 购买历史
}

// 技能系统状态
export interface SkillState {
  lastUsedTime: number;        // 上次使用时间
  cooldownRemaining: number;   // 剩余冷却时间
  isActive: boolean;           // 是否正在激活状态
  activeEndTime: number;       // 激活结束时间
}

// 道具系统相关类型定义
export interface PowerUpType {
  id: string;
  name: string;
  icon: string;                 // 图标描述
  color: string;                // 主要颜色
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  duration: number;             // 效果持续时间(毫秒)
  spawnRate: number;            // 出现频率(0-1)
  description: string;          // 道具描述
}

export interface PowerUpInstance {
  id: string;                   // 实例唯一ID
  type: PowerUpType;            // 道具类型
  x: number;                    // x坐标
  y: number;                    // y坐标
  size: number;                 // 大小
  rotation: number;             // 旋转角度
  collected: boolean;           // 是否已被收集
  animationPhase: number;       // 动画相位
}

export interface ActivePowerUp {
  type: PowerUpType;
  startTime: number;            // 开始时间
  endTime: number;              // 结束时间
  remaining: number;            // 剩余时间
}

export interface PowerUpEffect {
  invincible: boolean;          // 无敌状态
  speedBoost: number;           // 速度加成 (1.0 = 正常速度)
  coinMultiplier: number;       // 金币倍数
  magnetActive: boolean;        // 磁铁效果
  slowMotion: boolean;          // 缓慢效果
}

// 游戏中的金币道具
export interface CoinInstance {
  id: string;                   // 实例唯一ID
  x: number;                    // x坐标
  y: number;                    // y坐标
  size: number;                 // 大小
  value: number;                // 金币价值
  collected: boolean;           // 是否已被收集
  animationPhase: number;       // 动画相位
  magnetTarget?: boolean;       // 是否正在被磁铁吸引
  magnetVelocityX?: number;     // 磁铁吸引X方向速度
  magnetVelocityY?: number;     // 磁铁吸引Y方向速度
}

// 特效系统相关类型定义
export interface Particle {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'star' | 'circle' | 'trail' | 'explosion';
  gravity?: number;
  fade?: boolean;
}

export interface VisualEffect {
  id: string;
  type: 'flash' | 'shake' | 'particles' | 'explosion' | 'glow' | 'trail';
  startTime: number;
  duration: number;
  intensity: number;
  color?: string;
  position?: { x: number; y: number };
  particles?: Particle[];
}

export interface PowerUpVisualState {
  collectionEffects: VisualEffect[];      // 道具收集时的特效
  activeEffects: VisualEffect[];          // 道具激活时的持续特效
  screenEffects: VisualEffect[];          // 全屏特效
  particles: Particle[];                  // 粒子系统
}

// 扩展游戏状态，包含特效系统
export interface GameStateWithEffects extends GameState {
  powerUpVisuals: PowerUpVisualState;     // 道具特效状态
  settingsVisuals: {
    enableEffects: boolean;               // 是否启用特效
    particleCount: 'low' | 'medium' | 'high'; // 粒子密度
    screenShake: boolean;                 // 是否启用震屏
  };
}