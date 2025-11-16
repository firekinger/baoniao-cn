import { CoinData, CoinReward, CoinRewardConfig, CoinGameSummary } from '../types/game';

// 金币奖励配置
export const COIN_REWARDS: CoinRewardConfig = {
  perPipe: 10,
  streak3: 5,
  streak5: 10,
  streak10: 20,
  time30s: 5,
  score10: 50,
  score20: 100,
  score50: 250,
  perfect15: 50
};

// 生成唯一ID
let rewardIdCounter = 0;
export const generateRewardId = (): string => {
  return `reward_${Date.now()}_${++rewardIdCounter}`;
};

// 加载金币数据
export const loadCoinData = (): CoinData => {
  try {
    const data = localStorage.getItem('flappyBirdCoins');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        coins: parsed.coins || 0,
        totalEarned: parsed.totalEarned || 0,
        lastGameCoins: parsed.lastGameCoins || 0
      };
    }
    return { coins: 0, totalEarned: 0, lastGameCoins: 0 };
  } catch (error) {
    console.error('Error loading coin data:', error);
    return { coins: 0, totalEarned: 0, lastGameCoins: 0 };
  }
};

// 保存金币数据
export const saveCoinData = (coinData: CoinData): void => {
  try {
    localStorage.setItem('flappyBirdCoins', JSON.stringify(coinData));
  } catch (error) {
    console.error('Error saving coin data:', error);
  }
};

// 添加金币
export const addCoins = (amount: number): CoinData => {
  const currentData = loadCoinData();
  const newData: CoinData = {
    coins: currentData.coins + amount,
    totalEarned: currentData.totalEarned + amount,
    lastGameCoins: currentData.lastGameCoins + amount
  };
  saveCoinData(newData);
  return newData;
};

// 开始新游戏时重置本局金币
export const resetGameCoins = (): CoinData => {
  const currentData = loadCoinData();
  const newData: CoinData = {
    ...currentData,
    lastGameCoins: 0
  };
  saveCoinData(newData);
  return newData;
};

// 计算基础管道奖励
export const calculatePipeReward = (pipeCount: number): number => {
  return pipeCount * COIN_REWARDS.perPipe;
};

// 计算连击奖励
export const calculateStreakReward = (streak: number): number => {
  let reward = 0;
  if (streak >= 10) reward += COIN_REWARDS.streak10;
  else if (streak >= 5) reward += COIN_REWARDS.streak5;
  else if (streak >= 3) reward += COIN_REWARDS.streak3;
  return reward;
};

// 计算时长奖励
export const calculateTimeReward = (seconds: number): number => {
  const intervals = Math.floor(seconds / 30);
  return intervals * COIN_REWARDS.time30s;
};

// 计算里程碑奖励
export const calculateMilestoneReward = (score: number, achievedMilestones: Set<number>): { reward: number; newMilestones: number[] } => {
  const milestones = [10, 20, 50];
  const rewards = [COIN_REWARDS.score10, COIN_REWARDS.score20, COIN_REWARDS.score50];
  
  let totalReward = 0;
  const newMilestones: number[] = [];
  
  milestones.forEach((milestone, index) => {
    if (score >= milestone && !achievedMilestones.has(milestone)) {
      totalReward += rewards[index];
      newMilestones.push(milestone);
    }
  });
  
  return { reward: totalReward, newMilestones };
};

// 计算完美表现奖励
export const calculatePerfectReward = (consecutivePipes: number): number => {
  return consecutivePipes >= 15 ? COIN_REWARDS.perfect15 : 0;
};

// 创建奖励显示对象
export const createCoinReward = (
  amount: number,
  type: CoinReward['type'],
  message: string,
  x?: number,
  y?: number
): CoinReward => {
  return {
    amount,
    type,
    message,
    x,
    y,
    id: generateRewardId()
  };
};

// 生成奖励消息
export const generateRewardMessage = (type: CoinReward['type'], amount: number, extra?: any): string => {
  switch (type) {
    case 'pipe':
      return `+${amount}`;
    case 'streak':
      return `连击奖励 +${amount}`;
    case 'time':
      return `时长奖励 +${amount}`;
    case 'milestone':
      return `里程碑 +${amount}`;
    case 'perfect':
      return `完美表现 +${amount}`;
    default:
      return `+${amount}`;
  }
};

// 计算游戏结束时的金币总结
export const calculateGameSummary = (
  score: number,
  gameTime: number,
  maxStreak: number,
  achievedMilestones: Set<number>,
  perfectRewards: number
): CoinGameSummary => {
  const baseRewards = calculatePipeReward(score);
  const streakRewards = calculateStreakReward(maxStreak);
  const timeRewards = calculateTimeReward(gameTime);
  
  // 计算里程碑奖励总和
  let milestoneRewards = 0;
  achievedMilestones.forEach(milestone => {
    if (milestone === 10) milestoneRewards += COIN_REWARDS.score10;
    else if (milestone === 20) milestoneRewards += COIN_REWARDS.score20;
    else if (milestone === 50) milestoneRewards += COIN_REWARDS.score50;
  });
  
  const totalCoins = baseRewards + streakRewards + timeRewards + milestoneRewards + perfectRewards;
  
  return {
    baseRewards,
    streakRewards,
    timeRewards,
    milestoneRewards,
    perfectRewards,
    totalCoins
  };
};

// 格式化金币数字显示
export const formatCoins = (coins: number): string => {
  if (coins >= 1000000) {
    return `${(coins / 1000000).toFixed(1)}M`;
  } else if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}K`;
  }
  return coins.toString();
};

// 验证金币数据完整性
export const validateCoinData = (data: any): CoinData => {
  const defaultData = { coins: 0, totalEarned: 0, lastGameCoins: 0 };
  
  if (!data || typeof data !== 'object') {
    return defaultData;
  }
  
  return {
    coins: typeof data.coins === 'number' && data.coins >= 0 ? data.coins : 0,
    totalEarned: typeof data.totalEarned === 'number' && data.totalEarned >= 0 ? data.totalEarned : 0,
    lastGameCoins: typeof data.lastGameCoins === 'number' && data.lastGameCoins >= 0 ? data.lastGameCoins : 0
  };
};