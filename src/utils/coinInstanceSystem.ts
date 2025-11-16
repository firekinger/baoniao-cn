import { CoinInstance } from '../types/game';

// 生成唯一ID
let coinInstanceIdCounter = 0;
export const generateCoinInstanceId = (): string => {
  return `coin_${Date.now()}_${++coinInstanceIdCounter}`;
};

// 创建金币道具实例
export const createCoinInstance = (
  x: number,
  y: number,
  value: number = 5,
  size: number = 16
): CoinInstance => {
  return {
    id: generateCoinInstanceId(),
    x,
    y,
    size,
    value,
    collected: false,
    animationPhase: 0,
    magnetTarget: false,
    magnetVelocityX: 0,
    magnetVelocityY: 0
  };
};

// 检查金币是否应该生成
export const shouldSpawnCoinInstance = (): boolean => {
  // 30%概率生成金币道具
  return Math.random() < 0.30;
};

// 计算金币生成位置（优化为在管道间隙中安全位置）
export const calculateCoinPosition = (
  pipeX: number,
  pipeWidth: number,
  topHeight: number,
  gap: number
): { x: number; y: number } => {
  // 增加安全边距，确保金币不会太接近管道边缘
  const verticalMargin = Math.max(30, gap * 0.15); // 上下边距至少 30 像素或缝隙的15%
  const horizontalMargin = 20; // 水平边距
  
  // 计算安全区域
  const minY = topHeight + verticalMargin;
  const maxY = topHeight + gap - verticalMargin;
  const safeGapHeight = maxY - minY;
  
  // 确保有足够的空间放置金币
  if (safeGapHeight > 20) { // 至少需要 20 像素的安全区域
    const randomY = minY + Math.random() * safeGapHeight;
    
    return {
      x: pipeX + pipeWidth / 2 + (Math.random() - 0.5) * horizontalMargin, // 水平位置添加随机性
      y: randomY
    };
  }
  
  // 如果缝隙太小，放在中间位置
  return {
    x: pipeX + pipeWidth / 2,
    y: topHeight + gap / 2
  };
};

// AABB碰撞检测（金币收集）
export const checkCoinCollision = (
  bird: { x: number; y: number; size: number },
  coin: CoinInstance
): boolean => {
  const birdLeft = bird.x;
  const birdRight = bird.x + bird.size;
  const birdTop = bird.y;
  const birdBottom = bird.y + bird.size;
  
  const coinLeft = coin.x - coin.size / 2;
  const coinRight = coin.x + coin.size / 2;
  const coinTop = coin.y - coin.size / 2;
  const coinBottom = coin.y + coin.size / 2;
  
  return (
    birdLeft < coinRight &&
    birdRight > coinLeft &&
    birdTop < coinBottom &&
    birdBottom > coinTop
  );
};

// 计算两点之间的距离
export const calculateDistance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

// 磁铁效果：检测范围内的金币
export const getMagnetTargets = (
  bird: { x: number; y: number; size: number },
  coins: CoinInstance[],
  magnetRadius: number = 150
): CoinInstance[] => {
  const birdCenterX = bird.x + bird.size / 2;
  const birdCenterY = bird.y + bird.size / 2;
  
  return coins.filter(coin => {
    if (coin.collected) return false;
    
    const distance = calculateDistance(
      birdCenterX,
      birdCenterY,
      coin.x,
      coin.y
    );
    
    return distance <= magnetRadius;
  });
};

// 磁铁效果：计算吸引力
export const calculateMagnetForce = (
  bird: { x: number; y: number; size: number },
  coin: CoinInstance,
  magnetStrength: number = 200
): { forceX: number; forceY: number } => {
  const birdCenterX = bird.x + bird.size / 2;
  const birdCenterY = bird.y + bird.size / 2;
  
  const dx = birdCenterX - coin.x;
  const dy = birdCenterY - coin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) {
    return { forceX: 0, forceY: 0 };
  }
  
  // 标准化方向向量
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  
  // 根据距离调整力度（距离越近，力度越大）
  const forceMagnitude = magnetStrength / Math.max(distance * 0.1, 1);
  
  return {
    forceX: normalizedX * forceMagnitude,
    forceY: normalizedY * forceMagnitude
  };
};

// 更新金币动画和磁铁效果
export const updateCoinInstances = (
  coins: CoinInstance[],
  bird: { x: number; y: number; size: number },
  magnetActive: boolean,
  deltaTime: number,
  gameSpeed: number = 1.0
): CoinInstance[] => {
  return coins.map(coin => {
    if (coin.collected) return coin;
    
    let newCoin = {
      ...coin,
      // 更新动画相位
      animationPhase: (coin.animationPhase + deltaTime * 0.005) % (Math.PI * 2),
      // 应用游戏速度
      x: coin.x - gameSpeed * 1.2 // 金币移动速度稍快于管道
    };
    
    // 磁铁效果处理
    if (magnetActive) {
      const magnetTargets = getMagnetTargets(bird, [coin]);
      
      if (magnetTargets.length > 0) {
        newCoin.magnetTarget = true;
        
        // 计算磁铁吸引力
        const force = calculateMagnetForce(bird, coin);
        
        // 更新磁铁速度（平滑过渡）
        const dampingFactor = 0.8;
        newCoin.magnetVelocityX = (newCoin.magnetVelocityX || 0) * dampingFactor + force.forceX * deltaTime * 0.01;
        newCoin.magnetVelocityY = (newCoin.magnetVelocityY || 0) * dampingFactor + force.forceY * deltaTime * 0.01;
        
        // 应用磁铁移动
        newCoin.x += newCoin.magnetVelocityX;
        newCoin.y += newCoin.magnetVelocityY;
        
        // 限制最大磁铁速度
        const maxSpeed = 8;
        if (Math.abs(newCoin.magnetVelocityX || 0) > maxSpeed) {
          newCoin.magnetVelocityX = Math.sign(newCoin.magnetVelocityX || 0) * maxSpeed;
        }
        if (Math.abs(newCoin.magnetVelocityY || 0) > maxSpeed) {
          newCoin.magnetVelocityY = Math.sign(newCoin.magnetVelocityY || 0) * maxSpeed;
        }
      } else {
        newCoin.magnetTarget = false;
        newCoin.magnetVelocityX = 0;
        newCoin.magnetVelocityY = 0;
      }
    } else {
      newCoin.magnetTarget = false;
      newCoin.magnetVelocityX = 0;
      newCoin.magnetVelocityY = 0;
    }
    
    return newCoin;
  });
};

// 清理超出屏幕的金币
export const filterOutOfBoundCoins = (
  coins: CoinInstance[],
  canvasWidth: number
): CoinInstance[] => {
  return coins.filter(coin => 
    !coin.collected && coin.x > -coin.size && coin.x < canvasWidth + coin.size
  );
};
