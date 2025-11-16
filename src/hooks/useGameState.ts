import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameConfig, Bird, Pipe, DifficultyConfig, CoinReward, GameStats, CoinGameSummary, BirdSkin, SkinData, PowerUpVisualState, VisualEffect } from '../types/game';
import { addToLeaderboard, loadSettings, saveSettings } from '../utils/gameUtils';
import {
  loadCoinData,
  resetGameCoins,
  addCoins,
  calculatePipeReward,
  calculateStreakReward,
  calculateTimeReward,
  calculateMilestoneReward,
  calculatePerfectReward,
  calculateGameSummary,
  createCoinReward,
  generateRewardMessage,
  generateRewardId
} from '../utils/coinSystem';
import {
  loadSkinData,
  getCurrentSkin,
  switchSkin,
  unlockSkin,
  getAllSkinsInfo
} from '../utils/skinSystem';
import {
  getInitialSkillState,
  updateSkillCooldown,
  isSkillAvailable,
  activateSkill,
  applySkillEffectsToConfig,
  createSkillEffects
} from '../utils/skillSystem';
import {
  shouldSpawnPowerUp,
  getRandomPowerUpType,
  createPowerUpInstance,
  calculatePowerUpPosition,
  checkPowerUpCollision,
  activatePowerUp,
  updatePowerUpEffects,
  updatePowerUpAnimation,
  getInitialPowerUpEffects,
  applyPowerUpEffectsToConfig
} from '../utils/powerUpSystem';
import {
  updateCoinInstances,
  filterOutOfBoundCoins,
  checkCoinCollision,
  shouldSpawnCoinInstance,
  calculateCoinPosition,
  createCoinInstance
} from '../utils/coinInstanceSystem';
import {
  createPowerUpCollectionEffects,
  updateVisualEffects,
  updateParticles,
  createTrailParticles
} from '../utils/particleSystem';

const DIFFICULTY_CONFIGS: Record<string, DifficultyConfig> = {
  easy: {
    name: '简单',
    gravity: 0.12,
    jumpForce: -6,
    pipeSpeed: 0.8,
    pipeGap: 280, // 增加缝隙，确保新手友好
    description: '新手友好，非常容易上手，管道间隙很大'
  },
  normal: {
    name: '普通',
    gravity: 0.2,
    jumpForce: -6,
    pipeSpeed: 1.2,
    pipeGap: 200, // 适中的缝隙
    description: '轻松难度，适合休闲游戏'
  },
  hard: {
    name: '困难',
    gravity: 0.35,
    jumpForce: -6.5,
    pipeSpeed: 1.6,
    pipeGap: 160, // 较小缝隙，但仍可通过
    description: '标准挑战，需要一定技巧'
  },
  expert: {
    name: '专家',
    gravity: 0.5,
    jumpForce: -7,
    pipeSpeed: 2.0,
    pipeGap: 130, // 最小但仍可通过的缝隙
    description: '高难度挑战，考验精准控制'
  }
};

const BASE_CONFIG: GameConfig = {
  gravity: 0.3,
  jumpForce: -8,
  pipeSpeed: 1.5,
  pipeGap: 180,
  canvasWidth: 400,
  canvasHeight: 600,
};

const INITIAL_BIRD: Bird = {
  x: 100,
  y: 300,
  velocity: 0,
  size: 20,
};

export const useGameState = () => {
  const savedSettings = loadSettings();
  const initialCoinData = loadCoinData();
  const initialSkinData = loadSkinData();
  const initialCurrentSkin = getCurrentSkin();
  const initialSkillState = getInitialSkillState();
  
  const [gameState, setGameState] = useState<GameState>({
    status: 'start',
    score: 0,
    highScore: parseInt(localStorage.getItem('flappyBirdHighScore') || '0'),
    bird: { ...INITIAL_BIRD },
    pipes: [],
    playerName: localStorage.getItem('flappyBirdPlayerName') || '',
    difficulty: savedSettings.difficulty || 'easy', // 默认使用简单难度
    soundEnabled: savedSettings.soundEnabled,
    volume: savedSettings.volume,
    effectsEnabled: savedSettings.effectsEnabled,
    // 金币系统相关
    coinData: initialCoinData,
    currentGameCoins: 0,
    gameStats: {
      gameStartTime: 0,
      consecutivePipes: 0,
      currentStreak: 0,
      maxStreak: 0,
      timeRewards: 0,
      milestoneRewards: new Set(),
      perfectStreakCount: 0
    },
    coinRewards: [],
    showCoinAnimation: false,
    // 皮肤系统相关
    skinData: initialSkinData,
    currentSkin: initialCurrentSkin,
    // 技能系统相关
    skillState: initialSkillState,
    // 道具系统相关
    powerUps: [],
    activePowerUps: [],
    powerUpEffects: getInitialPowerUpEffects(),
    // 金币道具系统
    coinInstances: [],
  });
  
  // 特效系统状态
  const [powerUpVisuals, setPowerUpVisuals] = useState<PowerUpVisualState>({
    collectionEffects: [],
    activeEffects: [],
    screenEffects: [],
    particles: []
  });

  const animationFrameRef = useRef<number>();
  const lastPipeTimeRef = useRef<number>(0);
  const lastTimeRewardRef = useRef<number>(0);
  
  // 根据难度获取游戏配置
  const getGameConfig = useCallback((difficulty: string): GameConfig => {
    const diffConfig = DIFFICULTY_CONFIGS[difficulty] || DIFFICULTY_CONFIGS.normal;
    return {
      ...BASE_CONFIG,
      gravity: diffConfig.gravity,
      jumpForce: diffConfig.jumpForce,
      pipeSpeed: diffConfig.pipeSpeed,
      pipeGap: diffConfig.pipeGap,
    };
  }, []);
  
  const currentConfig = getGameConfig(gameState.difficulty);

  const savePlayerName = useCallback((name: string) => {
    localStorage.setItem('flappyBirdPlayerName', name);
    setGameState(prev => ({ ...prev, playerName: name }));
  }, []);

  // 添加测试模式：给用户一些初始金币用于测试
  const startGame = useCallback(() => {
    const gameStartTime = Date.now();
    let newCoinData = resetGameCoins();
    
    console.log('[DEBUG] Game starting - Config:', {
      canvasHeight: BASE_CONFIG.canvasHeight,
      initialBirdY: INITIAL_BIRD.y,
      birdSize: INITIAL_BIRD.size,
      groundBoundary: BASE_CONFIG.canvasHeight - INITIAL_BIRD.size
    });
    
    // 清理所有特效和内存
    setPowerUpVisuals({
      collectionEffects: [],
      activeEffects: [],
      screenEffects: [],
      particles: []
    });
    
    // 重新获取当前皮肤以确保技能正确加载
    const currentSkin = getCurrentSkin();
    console.log('[DEBUG] 游戏开始时加载的皮肤:', {
      id: currentSkin.id, 
      name: currentSkin.name, 
      hasSkill: !!currentSkin.skill,
      skillName: currentSkin.skill?.name
    });
    
    // 重置技能状态
    const freshSkillState = getInitialSkillState();
    
    // 只有新玩家第一次进入游戏时获得2000初始金币
    const isFirstTimeUser = !localStorage.getItem('flappyBirdFirstLogin');
    if (isFirstTimeUser) {
      newCoinData = {
        ...newCoinData,
        coins: 2000,
        totalEarned: newCoinData.totalEarned + (2000 - newCoinData.coins)
      };
      localStorage.setItem('flappyBirdCoins', JSON.stringify(newCoinData));
      // 标记用户已经获得过初始金币
      localStorage.setItem('flappyBirdFirstLogin', 'true');
    }
    
    // 计算安全的初始位置（距离顶部和底部都有安全距离）
    const safeY = Math.max(50, Math.min(INITIAL_BIRD.y, BASE_CONFIG.canvasHeight - 100));
    
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      score: 0,
      bird: { 
        ...INITIAL_BIRD,
        y: safeY, // 使用安全的Y坐标
        velocity: 0 // 确保没有初始速度
      },
      pipes: [],
      coinData: newCoinData,
      currentGameCoins: 0,
      gameStats: {
        gameStartTime,
        consecutivePipes: 0,
        currentStreak: 0,
        maxStreak: 0,
        timeRewards: 0,
        milestoneRewards: new Set(),
        perfectStreakCount: 0
      },
      coinRewards: [],
      showCoinAnimation: false,
      // 重置道具系统
      powerUps: [],
      activePowerUps: [],
      powerUpEffects: getInitialPowerUpEffects(),
      // 重置金币道具系统
      coinInstances: [],
      // 重置技能状态
      skillState: freshSkillState,
      // 更新当前皮肤
      currentSkin: currentSkin
    }));
    lastPipeTimeRef.current = gameStartTime;
    lastTimeRewardRef.current = gameStartTime;
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'playing' }));
  }, []);

  const gameOver = useCallback(() => {
    setGameState(prev => {
      const newHighScore = Math.max(prev.score, prev.highScore);
      if (newHighScore > prev.highScore) {
        localStorage.setItem('flappyBirdHighScore', newHighScore.toString());
      }
      
      // 计算游戏时长
      const gameTime = Math.floor((Date.now() - prev.gameStats.gameStartTime) / 1000);
      
      // 计算最终金币奖励
      const gameSummary = calculateGameSummary(
        prev.score,
        gameTime,
        prev.gameStats.maxStreak,
        prev.gameStats.milestoneRewards,
        prev.gameStats.perfectStreakCount * 50 // 完美表现奖励
      );
      
      // 更新金币数据
      const newCoinData = addCoins(gameSummary.totalCoins);
      
      // 添加到排行榜
      if (prev.playerName && prev.score > 0) {
        addToLeaderboard(prev.playerName, prev.score, prev.difficulty);
      }
      
      return {
        ...prev,
        status: 'gameOver',
        highScore: newHighScore,
        coinData: newCoinData,
        currentGameCoins: gameSummary.totalCoins,
      };
    });
  }, []);

  const jump = useCallback(() => {
    if (gameState.status === 'playing') {
      setGameState(prev => ({
        ...prev,
        bird: {
          ...prev.bird,
          velocity: currentConfig.jumpForce,
        },
      }));
    }
  }, [gameState.status, currentConfig.jumpForce]);

  const resetGame = useCallback(() => {
    // 清理所有特效和内存
    setPowerUpVisuals({
      collectionEffects: [],
      activeEffects: [],
      screenEffects: [],
      particles: []
    });
    
    // 重置游戏状态
    setGameState(prev => ({
      ...prev,
      status: 'start',
      score: 0,
      bird: { ...INITIAL_BIRD },
      pipes: [],
      powerUps: [],
      activePowerUps: [],
      powerUpEffects: getInitialPowerUpEffects(),
      coinInstances: [],
      coinRewards: [],
      skillState: getInitialSkillState()
    }));
    
    // 重置管道生成计时器
    lastPipeTimeRef.current = 0;
    lastTimeRewardRef.current = 0;
  }, []);
  
  const showLeaderboard = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'leaderboard' }));
  }, []);
  
  const showSettings = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'settings' }));
  }, []);
  
  const backToStart = useCallback(() => {
    // 清理所有动画帧
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      // 标记画布不需要继续渲染
      canvas.setAttribute('data-inactive', 'true');
      
      // 清空画布
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    
    // 设置游戏状态
    setGameState(prev => ({ ...prev, status: 'start' }));
  }, []);
  
  const updateDifficulty = useCallback((difficulty: 'easy' | 'normal' | 'hard' | 'expert') => {
    setGameState(prev => ({ ...prev, difficulty }));
    const newSettings = { ...loadSettings(), difficulty };
    saveSettings(newSettings);
  }, []);
  
  const updateSoundEnabled = useCallback((soundEnabled: boolean) => {
    setGameState(prev => ({ ...prev, soundEnabled }));
    const newSettings = { ...loadSettings(), soundEnabled };
    saveSettings(newSettings);
  }, []);
  
  const updateVolume = useCallback((volume: number) => {
    setGameState(prev => ({ ...prev, volume }));
    const newSettings = { ...loadSettings(), volume };
    saveSettings(newSettings);
  }, []);
  
  const updateEffectsEnabled = useCallback((effectsEnabled: boolean) => {
    setGameState(prev => ({ ...prev, effectsEnabled }));
    const newSettings = { ...loadSettings(), effectsEnabled };
    saveSettings(newSettings);
  }, []);
  
  // 金币奖励处理函数
  const addCoinReward = useCallback((type: CoinReward['type'], amount: number, x?: number, y?: number) => {
    if (amount <= 0) return;
    
    const message = generateRewardMessage(type, amount);
    const reward = createCoinReward(amount, type, message, x, y);
    
    setGameState(prev => ({
      ...prev,
      coinRewards: [...prev.coinRewards, reward],
      currentGameCoins: prev.currentGameCoins + amount,
      showCoinAnimation: true
    }));
  }, []);
  
  const removeCoinReward = useCallback((rewardId: string) => {
    setGameState(prev => ({
      ...prev,
      coinRewards: prev.coinRewards.filter(r => r.id !== rewardId)
    }));
  }, []);
  
  // 皮肤系统相关操作
  const showShop = useCallback(() => {
    setGameState(prev => ({ ...prev, status: 'shop' }));
  }, []);
  
  const changeSkin = useCallback((skinId: string) => {
    const success = switchSkin(skinId);
    if (success) {
      // 重新获取皮肤以确保技能正确加载
      const newSkin = getCurrentSkin();
      const newSkinData = loadSkinData();
      
      // 输出日志以追踪皮肤技能
      console.log('[DEBUG] 切换到新皮肤:', {
        id: newSkin.id,
        name: newSkin.name,
        hasSkill: !!newSkin.skill,
        skillName: newSkin.skill?.name,
        skillType: newSkin.skill?.effectType
      });
      
      // 重置技能状态
      const freshSkillState = getInitialSkillState();
      
      setGameState(prev => ({
        ...prev,
        currentSkin: newSkin,
        skinData: newSkinData,
        skillState: freshSkillState
      }));
    }
    return success;
  }, []);
  
  const purchaseSkin = useCallback(async (skinId: string, price: number): Promise<{ success: boolean; reason: string; skin?: BirdSkin }> => {
    // 检查金币是否足够
    if (gameState.coinData.coins < price) {
      return { success: false, reason: '金币不足' };
    }
    
    // 原子性操作：同时更新金币和皮肤数据
    try {
      // 获取当前数据
      const currentCoinData = loadCoinData();
      const currentSkinData = loadSkinData();
      
      // 检查皮肤是否存在且未解锁
      const skinInfo = getAllSkinsInfo().find(skin => skin.id === skinId);
      if (!skinInfo) {
        return { success: false, reason: '皮肤不存在' };
      }
      
      if (currentSkinData.unlockedSkins.includes(skinId)) {
        return { success: false, reason: '皮肤已解锁' };
      }
      
      // 准备新数据
      const newCoinData = {
        ...currentCoinData,
        coins: currentCoinData.coins - price
      };
      
      const newSkinData = {
        ...currentSkinData,
        unlockedSkins: [...currentSkinData.unlockedSkins, skinId],
        purchaseHistory: [...currentSkinData.purchaseHistory, skinId]
      };
      
      // 原子性写入操作：先备份，然后同时更新
      const coinBackup = localStorage.getItem('flappyBirdCoins');
      const skinBackup = localStorage.getItem('flappyBirdSkins');
      
      try {
        // 同时更新两个存储
        localStorage.setItem('flappyBirdCoins', JSON.stringify(newCoinData));
        localStorage.setItem('flappyBirdSkins', JSON.stringify(newSkinData));
        
        // 更新状态
        setGameState(prev => ({
          ...prev,
          coinData: newCoinData,
          skinData: newSkinData
        }));
        
        return { 
          success: true, 
          reason: '购买成功',
          skin: skinInfo
        };
        
      } catch (storageError) {
        // 如果存储失败，还原数据
        if (coinBackup) localStorage.setItem('flappyBirdCoins', coinBackup);
        if (skinBackup) localStorage.setItem('flappyBirdSkins', skinBackup);
        throw storageError;
      }
      
    } catch (error) {
      console.error('Error during skin purchase:', error);
      return { success: false, reason: '购买失败，请重试' };
    }
  }, [gameState.coinData.coins]);
  
  // 技能系统相关操作
  const useSkill = useCallback(() => {
    const currentTime = Date.now();
    const skill = gameState.currentSkin.skill;
    
    console.log('[DEBUG] 尝试使用技能:', { 
      hasSkill: !!skill, 
      skillName: skill?.name,
      skillState: gameState.skillState,
      isAvailable: skill ? isSkillAvailable(gameState.skillState, skill) : false
    });
    
    if (!skill) {
      console.log('[DEBUG] 当前皮肤没有技能');
      return false;
    }
    
    if (!isSkillAvailable(gameState.skillState, skill)) {
      console.log('[DEBUG] 技能不可用:', { skill: skill?.name, skillState: gameState.skillState });
      return false;
    }
    
    setGameState(prev => {
      const newSkillState = activateSkill(prev.skillState, skill, currentTime);
      
      // 根据技能类型执行特殊效果
      let updatedState = {
        ...prev,
        skillState: newSkillState
      };
      
      // 处理特殊技能效果
      switch (skill.effectType) {
        case 'teleport':
          // 闪电传送：瞬间向前移动
          const teleportDistance = skill.effectValue || 200;
          updatedState.bird = {
            ...updatedState.bird,
            x: Math.min(updatedState.bird.x + teleportDistance, currentConfig.canvasWidth - updatedState.bird.size)
          };
          break;
          
        case 'destroy':
          // 火球攻击：摧毁最近的管道
          const nearestPipe = updatedState.pipes
            .filter(pipe => pipe.x > updatedState.bird.x && !pipe.passed)
            .sort((a, b) => a.x - b.x)[0];
          
          if (nearestPipe) {
            // 移除最近的管道
            updatedState.pipes = updatedState.pipes.filter(pipe => pipe !== nearestPipe);
          }
          break;
          
        case 'shield':
          // 防护罩：添加临时无敌效果
          updatedState.powerUpEffects = {
            ...updatedState.powerUpEffects,
            invincible: true // 启用无敌状态
          };
          break;
          
        case 'shrink':
          // 迷你化：缩小体型
          const originalSize = updatedState.bird.size;
          const shrinkFactor = skill.effectValue || 0.5;
          updatedState.bird = {
            ...updatedState.bird,
            size: originalSize * shrinkFactor
          };
          break;
          
        case 'magnet':
          // 超级磁铁：增强磁铁效果
          updatedState.powerUpEffects = {
            ...updatedState.powerUpEffects,
            magnetActive: true, // 启用磁铁效果
          };
          break;
      }
      
      // 创建技能特效
      if (prev.effectsEnabled) {
        let effect;
        switch (skill.effectType) {
          case 'dash':
            effect = createSkillEffects.dash(prev.bird.x, prev.bird.y);
            break;
          case 'teleport':
            // 计算传送终点位置（向前传送200像素，保持Y坐标不变）
            const teleportEndX = updatedState.bird.x;
            const teleportEndY = updatedState.bird.y;
            effect = createSkillEffects.teleport(prev.bird.x, prev.bird.y, teleportEndX, teleportEndY);
            break;
          case 'destroy':
            const targetPipe = prev.pipes.find(pipe => pipe.x > prev.bird.x && !pipe.passed);
            if (targetPipe) {
              effect = createSkillEffects.destroy(targetPipe.x + targetPipe.width / 2, targetPipe.topHeight + targetPipe.gap / 2);
            }
            break;
          case 'freeze':
            effect = createSkillEffects.freeze(prev.bird.x, prev.bird.y);
            break;
          case 'gravity':
            effect = createSkillEffects.gravity(prev.bird.x, prev.bird.y);
            break;
          case 'shield':
            effect = createSkillEffects.shield(prev.bird.x, prev.bird.y);
            break;
          case 'shrink':
            effect = createSkillEffects.shrink(prev.bird.x, prev.bird.y);
            break;
          case 'magnet':
            effect = createSkillEffects.magnet(prev.bird.x, prev.bird.y);
            break;
        }
        
        if (effect) {
          setPowerUpVisuals(prevVisuals => ({
            ...prevVisuals,
            screenEffects: [...prevVisuals.screenEffects, effect],
            particles: [...prevVisuals.particles, ...(effect.particles || [])]
          }));
        }
      }
      
      return updatedState;
    });
    
    return true;
  }, [gameState.skillState, gameState.currentSkin?.skill, gameState.effectsEnabled, currentConfig]);
  
  // 更新技能状态
  useEffect(() => {
    if (gameState.status === 'playing') {
      const updateSkillState = () => {
        setGameState(prev => ({
          ...prev,
          skillState: updateSkillCooldown(prev.skillState, Date.now(), prev.currentSkin?.skill)
        }));
      };
      
      const skillUpdateInterval = setInterval(updateSkillState, 100); // 每100ms更新一次
      return () => clearInterval(skillUpdateInterval);
    }
  }, [gameState.status]);
  
  const getAllSkins = useCallback(() => {
    return getAllSkinsInfo();
  }, []);
  
  // 获取金币总结
  const getCoinSummary = useCallback((): CoinGameSummary => {
    const gameTime = gameState.gameStats.gameStartTime > 0 
      ? Math.floor((Date.now() - gameState.gameStats.gameStartTime) / 1000)
      : 0;
      
    return calculateGameSummary(
      gameState.score,
      gameTime,
      gameState.gameStats.maxStreak,
      gameState.gameStats.milestoneRewards,
      gameState.gameStats.perfectStreakCount * 50
    );
  }, [gameState]);


  // 游戏物理引擎
  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'playing') return prev;

      const newState = { ...prev };
      const currentTime = Date.now();
      
      // 定义全局缓冲期变量（在所有碰撞检测中使用）
      const gameStartGracePeriod = 1000; // 1秒缓冲期
      const gameStartTime = prev.gameStats?.gameStartTime || currentTime;
      const isInGracePeriod = (currentTime - gameStartTime) < gameStartGracePeriod;

      // 更新小鸟
      newState.bird = {
        ...prev.bird,
        y: prev.bird.y + prev.bird.velocity,
        velocity: prev.bird.velocity + currentConfig.gravity,
      };

      // 检查小鸟边界碰撞（关键修复：更合理的边界检测）
      // 更宽松且合理的边界检查
      const groundBoundary = currentConfig.canvasHeight - newState.bird.size; // 正常边界
      const ceilingBoundary = 0;
      
      const groundCollision = newState.bird.y > groundBoundary;
      const ceilingCollision = newState.bird.y < ceilingBoundary;
      
      // 详细的边界检测调试信息
      if ((currentTime - gameStartTime) % 1000 < 16) { // 每秒打印一次详细信息
        console.log('[DEBUG] Boundary Check:', {
          currentTime,
          gameStartTime,
          timeElapsed: currentTime - gameStartTime,
          isInGracePeriod,
          birdY: newState.bird.y,
          birdVelocity: newState.bird.velocity,
          birdSize: newState.bird.size,
          canvasHeight: currentConfig.canvasHeight,
          groundBoundary,
          ceilingBoundary,
          groundCollision,
          ceilingCollision,
          invincible: newState.powerUpEffects.invincible
        });
      }
      
      // 只在非缓冲期、非无敌状态且确实严重越界时才结束游戏
      const shouldEndGame = !newState.powerUpEffects.invincible && !isInGracePeriod && 
                            (newState.bird.y > (groundBoundary + 20) || newState.bird.y < (ceilingBoundary - 20));
      
      if (shouldEndGame) {
        console.log('[DEBUG] Game Over - Boundary collision confirmed:', {
          reason: newState.bird.y > (groundBoundary + 20) ? 'Ground collision' : 'Ceiling collision',
          birdY: newState.bird.y,
          groundLimit: groundBoundary + 20,
          ceilingLimit: ceilingBoundary - 20
        });
        gameOver();
        return prev;
      }

      // 生成新管道和道具
      // 增加管道生成的时间间隔，使两组管道之间的水平距离更大
if (currentTime - lastPipeTimeRef.current > 2500) {
        // 改进的管道生成算法，确保缝隙大小合理
        const minTopHeight = 80; // 上管道最小高度
        const minBottomHeight = 100; // 下管道最小高度（包含地面）
        const totalReservedSpace = minTopHeight + currentConfig.pipeGap + minBottomHeight;
        
        // 确保有足够空间生成合理的管道
        const availableSpace = currentConfig.canvasHeight - totalReservedSpace;
        
        if (availableSpace > 0) {
          // 在可用空间内随机分配高度
          const randomOffset = Math.random() * availableSpace;
          const topHeight = minTopHeight + randomOffset;
          
          const newPipe = {
            x: currentConfig.canvasWidth,
            topHeight,
            bottomY: topHeight + currentConfig.pipeGap,
            width: 50,
            gap: currentConfig.pipeGap,
            passed: false,
          };
          
          // 验证管道合理性
          const bottomPipeHeight = currentConfig.canvasHeight - newPipe.bottomY;
          if (bottomPipeHeight >= minBottomHeight && topHeight >= minTopHeight) {
            newState.pipes.push(newPipe);
            
            // 检查是否在此管道生成道具
            if (shouldSpawnPowerUp(currentConfig.pipeGap, prev.difficulty)) {
              const powerUpType = getRandomPowerUpType();
              if (powerUpType) {
                const powerUpPosition = calculatePowerUpPosition(
                  newPipe.x,
                  newPipe.width,
                  newPipe.topHeight,
                  newPipe.gap
                );
                
                const powerUpInstance = createPowerUpInstance(
                  powerUpType,
                  powerUpPosition.x,
                  powerUpPosition.y
                );
                
                newState.powerUps.push(powerUpInstance);
              }
            }
            
            // 检查是否在此管道生成金币道具
            if (shouldSpawnCoinInstance()) {
              const coinPosition = calculateCoinPosition(
                newPipe.x,
                newPipe.width,
                newPipe.topHeight,
                newPipe.gap
              );
              
              const coinInstance = createCoinInstance(
                coinPosition.x,
                coinPosition.y,
                5 // 基础金币价值
              );
              
              newState.coinInstances.push(coinInstance);
            }
            
            lastPipeTimeRef.current = currentTime;
          }
        }
      }

      // 应用道具效果和技能效果到游戏配置
      let effectiveConfig = applyPowerUpEffectsToConfig(currentConfig, newState.powerUpEffects);
      effectiveConfig = applySkillEffectsToConfig(effectiveConfig, newState.skillState, newState.currentSkin?.skill);
      
      // 更新管道位置
      newState.pipes = prev.pipes
        .map(pipe => ({ ...pipe, x: pipe.x - effectiveConfig.pipeSpeed }))
        .filter(pipe => pipe.x > -50);
      
      // 更新道具位置和动画
      newState.powerUps = updatePowerUpAnimation(
        prev.powerUps
          .map(powerUp => ({ ...powerUp, x: powerUp.x - effectiveConfig.pipeSpeed }))
          .filter(powerUp => powerUp.x > -50 && !powerUp.collected),
        currentTime - (lastPipeTimeRef.current || currentTime)
      );
      
      // 更新金币道具位置和磁铁效果
      newState.coinInstances = updateCoinInstances(
        prev.coinInstances,
        newState.bird,
        newState.powerUpEffects.magnetActive,
        currentTime - (lastPipeTimeRef.current || currentTime),
        effectiveConfig.pipeSpeed
      );
      
      // 清理超出屏幕的金币
      newState.coinInstances = filterOutOfBoundCoins(newState.coinInstances, currentConfig.canvasWidth);
      
      // 检查道具碰撞
      for (const powerUp of newState.powerUps) {
        if (!powerUp.collected && checkPowerUpCollision(newState.bird, powerUp)) {
          // 标记道具为已收集
          powerUp.collected = true;
          
          // 激活道具效果
          const activatedPowerUp = activatePowerUp(powerUp.type, currentTime);
          newState.activePowerUps.push(activatedPowerUp);
          
          // 创建视觉反馈奖励
          const powerUpReward = createCoinReward(
            0, // 道具本身不直接给金币
            'pipe', // 使用pipe类型作为占位符
            `获得道具: ${powerUp.type.name}`,
            powerUp.x,
            powerUp.y
          );
          
          newState.coinRewards.push(powerUpReward);
          
          // 创建华丽的道具收集特效
          const collectionEffects = createPowerUpCollectionEffects(
            powerUp.x,
            powerUp.y,
            powerUp.type
          );
          
          setPowerUpVisuals(prev => ({
            ...prev,
            collectionEffects: [...prev.collectionEffects, ...collectionEffects],
            screenEffects: [...prev.screenEffects, ...collectionEffects.filter(e => e.type === 'flash' || e.type === 'shake')],
            particles: [...prev.particles, ...collectionEffects.flatMap(e => e.particles || [])]
          }));
        }
      }
      
      // 检查金币道具碰撞
      for (const coin of newState.coinInstances) {
        if (!coin.collected && checkCoinCollision(newState.bird, coin)) {
          // 标记金币为已收集
          coin.collected = true;
          
          // 计算金币奖励（受金币倍数影响）
          const coinValue = coin.value * newState.powerUpEffects.coinMultiplier;
          
          // 创建金币奖励
          const coinReward = createCoinReward(
            coinValue,
            'pipe',
            `+${Math.round(coinValue)}`,
            coin.x,
            coin.y
          );
          
          newState.coinRewards.push(coinReward);
          newState.currentGameCoins += coinValue;
        }
      }
      
      // 更新道具效果状态
      const powerUpUpdate = updatePowerUpEffects(newState.activePowerUps, currentTime);
      newState.activePowerUps = powerUpUpdate.activePowerUps;
      newState.powerUpEffects = powerUpUpdate.effects;

      // 检查碰撞和奖励（使用统一的缓冲期变量）
      for (const pipe of newState.pipes) {
        // 更精确的管道碰撞检测（添加容错边距）
        const collisionMargin = 2; // 像素容错边距
        const pipeCollision = (newState.bird.x + newState.bird.size - collisionMargin) > pipe.x &&
            (newState.bird.x + collisionMargin) < (pipe.x + pipe.width) &&
            ((newState.bird.y + collisionMargin) < pipe.topHeight ||
             (newState.bird.y + newState.bird.size - collisionMargin) > pipe.bottomY);
        
        // 只有在非缓冲期、非无敌状态且确实发生精确碰撞时才结束游戏
        if (!newState.powerUpEffects.invincible && !isInGracePeriod && pipeCollision) {
          console.log('[DEBUG] Game Over triggered by pipe collision:', {
            birdX: newState.bird.x,
            birdY: newState.bird.y,
            birdSize: newState.bird.size,
            pipeX: pipe.x,
            pipeWidth: pipe.width,
            pipeTopHeight: pipe.topHeight,
            pipeBottomY: pipe.bottomY,
            pipeGap: pipe.gap,
            collisionMargin,
            gracePeriodRemaining: gameStartGracePeriod - (currentTime - gameStartTime),
            timeElapsed: currentTime - gameStartTime
          });
          gameOver();
          return prev;
        }

        // 检查是否通过管道并计算奖励
        if (!pipe.passed && newState.bird.x > pipe.x + pipe.width) {
          pipe.passed = true;
          newState.score += 1;
          
          // 更新游戏统计
          newState.gameStats = {
            ...newState.gameStats,
            consecutivePipes: newState.gameStats.consecutivePipes + 1,
            currentStreak: newState.gameStats.currentStreak + 1,
            maxStreak: Math.max(newState.gameStats.maxStreak, newState.gameStats.currentStreak + 1)
          };
          
          // 计算所有金币奖励
          const pipeX = pipe.x + pipe.width / 2;
          const pipeY = pipe.topHeight + pipe.gap / 2;
          const rewardsList: CoinReward[] = [];
          let totalRewardAmount = 0;
          
          // 基础管道奖励（受金币倍数影响）
          const basePipeReward = 10 * newState.powerUpEffects.coinMultiplier;
          const pipeReward = createCoinReward(
            basePipeReward, 
            'pipe', 
            generateRewardMessage('pipe', basePipeReward), 
            pipeX, 
            pipeY
          );
          rewardsList.push(pipeReward);
          totalRewardAmount += basePipeReward;
          
          // 连击奖励检查（受金币倍数影响）
          const currentStreak = newState.gameStats.currentStreak + 1;
          if (currentStreak === 3) {
            const baseStreakReward = 5 * newState.powerUpEffects.coinMultiplier;
            const streakReward = createCoinReward(baseStreakReward, 'streak', generateRewardMessage('streak', baseStreakReward), pipeX, pipeY - 30);
            rewardsList.push(streakReward);
            totalRewardAmount += baseStreakReward;
          } else if (currentStreak === 5) {
            const baseStreakReward = 10 * newState.powerUpEffects.coinMultiplier;
            const streakReward = createCoinReward(baseStreakReward, 'streak', generateRewardMessage('streak', baseStreakReward), pipeX, pipeY - 30);
            rewardsList.push(streakReward);
            totalRewardAmount += baseStreakReward;
          } else if (currentStreak === 10) {
            const baseStreakReward = 20 * newState.powerUpEffects.coinMultiplier;
            const streakReward = createCoinReward(baseStreakReward, 'streak', generateRewardMessage('streak', baseStreakReward), pipeX, pipeY - 30);
            rewardsList.push(streakReward);
            totalRewardAmount += baseStreakReward;
          }
          
          // 完美表现奖励（受金币倍数影响）
          if (newState.gameStats.consecutivePipes + 1 === 15) {
            const basePerfectReward = 50 * newState.powerUpEffects.coinMultiplier;
            const perfectReward = createCoinReward(basePerfectReward, 'perfect', generateRewardMessage('perfect', basePerfectReward), pipeX, pipeY - 60);
            rewardsList.push(perfectReward);
            totalRewardAmount += basePerfectReward;
            newState.gameStats.perfectStreakCount += 1;
            newState.gameStats.consecutivePipes = 0;
          }
          
          // 里程碑奖励
          const { reward: milestoneReward, newMilestones } = calculateMilestoneReward(
            newState.score,
            newState.gameStats.milestoneRewards
          );
          
          if (milestoneReward > 0) {
            const adjustedMilestoneReward = milestoneReward * newState.powerUpEffects.coinMultiplier;
            const milestoneRewardObj = createCoinReward(adjustedMilestoneReward, 'milestone', generateRewardMessage('milestone', adjustedMilestoneReward), pipeX, pipeY - 90);
            rewardsList.push(milestoneRewardObj);
            totalRewardAmount += adjustedMilestoneReward;
            newMilestones.forEach(milestone => {
              newState.gameStats.milestoneRewards.add(milestone);
            });
          }
          
          // 更新金币相关状态
          newState.coinRewards = [...newState.coinRewards, ...rewardsList];
          newState.currentGameCoins += totalRewardAmount;
          newState.showCoinAnimation = true;
        }
      }
      
      // 时长奖励检查（每30秒，受金币倍数影响）
      if (currentTime - lastTimeRewardRef.current > 30000) {
        const baseTimeReward = 5 * newState.powerUpEffects.coinMultiplier;
        const timeReward = createCoinReward(baseTimeReward, 'time', generateRewardMessage('time', baseTimeReward), currentConfig.canvasWidth / 2, 100);
        newState.coinRewards = [...newState.coinRewards, timeReward];
        newState.currentGameCoins += baseTimeReward;
        newState.gameStats = {
          ...newState.gameStats,
          timeRewards: newState.gameStats.timeRewards + 1
        };
        lastTimeRewardRef.current = currentTime;
      }

      return newState;
    });
  }, [gameOver, currentConfig]);

  // 特效更新循环
  useEffect(() => {
    const updateEffects = () => {
      setPowerUpVisuals(prev => {
        const currentTime = Date.now();
        
        return {
          collectionEffects: updateVisualEffects(prev.collectionEffects, currentTime),
          activeEffects: updateVisualEffects(prev.activeEffects, currentTime),
          screenEffects: updateVisualEffects(prev.screenEffects, currentTime),
          particles: updateParticles(prev.particles)
        };
      });
    };
    
    const effectsInterval = setInterval(updateEffects, 16); // 60 FPS
    
    return () => clearInterval(effectsInterval);
  }, []);

  // 游戏循环
  useEffect(() => {
    if (gameState.status === 'playing') {
      const gameLoop = () => {
        updateGame();
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.status, updateGame]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          jump();
          break;
        case 'KeyP':
          event.preventDefault();
          if (gameState.status === 'playing') {
            pauseGame();
          } else if (gameState.status === 'paused') {
            resumeGame();
          }
          break;
        case 'KeyR':
          event.preventDefault();
          if (gameState.status === 'gameOver' || gameState.status === 'paused') {
            resetGame();
          }
          break;
        case 'KeyE':
          event.preventDefault();
          if (gameState.status === 'playing') {
            useSkill();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, jump, pauseGame, resumeGame, resetGame, useSkill]);

  return {
    gameState,
    config: currentConfig,
    powerUpVisuals, // 新增特效状态
    actions: {
      startGame,
      pauseGame,
      resumeGame,
      gameOver,
      jump,
      resetGame,
      savePlayerName,
      showLeaderboard,
      showSettings,
      backToStart,
      updateDifficulty,
      updateSoundEnabled,
      updateVolume,
      updateEffectsEnabled,
      // 金币系统相关
      addCoinReward,
      removeCoinReward,
      getCoinSummary,
      // 皮肤系统相关
      showShop,
      changeSkin,
      purchaseSkin,
      getAllSkins,
      // 技能系统相关
      useSkill,
    },
  };
};