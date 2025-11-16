import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { GameState, GameConfig, BaoniaoSkin, PowerUpInstance, CoinInstance } from '../../types/game';
import { RARITY_COLORS } from '../../utils/powerUpSystem';

interface GameCanvasProps {
  gameState: GameState;
  config: GameConfig;
  onJump: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, config, onJump }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const backgroundCacheRef = useRef<ImageData | null>(null);

  // 创建离屏Canvas用于背景缓存
  useMemo(() => {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = config.canvasWidth;
    offscreenCanvas.height = config.canvasHeight;
    offscreenCanvasRef.current = offscreenCanvas;

    // 预渲染背景
    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (offscreenCtx) {
      // 绘制背景渐变
      const gradient = offscreenCtx.createLinearGradient(0, 0, 0, config.canvasHeight);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.7, '#98D8E8');
      gradient.addColorStop(1, '#B0E0E6');
      offscreenCtx.fillStyle = gradient;
      offscreenCtx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

      // 绘制云彩
      drawClouds(offscreenCtx, config.canvasWidth, config.canvasHeight);

      backgroundCacheRef.current = offscreenCtx.getImageData(0, 0, config.canvasWidth, config.canvasHeight);
    }
  }, [config.canvasWidth, config.canvasHeight]);

  // 优化的绘制函数
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸（只在需要时）
    if (canvas.width !== config.canvasWidth || canvas.height !== config.canvasHeight) {
      canvas.width = config.canvasWidth;
      canvas.height = config.canvasHeight;
    }

    // 启用图像平滑以获得更好的性能
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 使用缓存的背景
    if (backgroundCacheRef.current) {
      ctx.putImageData(backgroundCacheRef.current, 0, 0);
    } else {
      // 备用背景渲染
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#B0E0E6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 批量绘制管道
    ctx.save();
    if (gameState.pipes.length > 0) {
      gameState.pipes.forEach(pipe => drawPipe(ctx, pipe));
    }
    ctx.restore();

    // 批量绘制金币道具
    ctx.save();
    if (gameState.coinInstances.length > 0) {
      gameState.coinInstances.forEach(coinInstance => {
        if (!coinInstance.collected) {
          drawCoinInstance(ctx, coinInstance);
        }
      });
    }
    ctx.restore();
    
    // 绘制道具
    gameState.powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        drawPowerUp(ctx, powerUp);
      }
    });

    // 批量绘制道具
    ctx.save();
    if (gameState.powerUps.length > 0) {
      gameState.powerUps.forEach(powerUp => {
        if (!powerUp.collected) {
          drawPowerUp(ctx, powerUp);
        }
      });
    }
    ctx.restore();

    // 绘制宝鸟（支持皮肤系统和道具效果）
    drawBaoniao(ctx, gameState.baoniao, gameState.currentSkin, gameState.powerUpEffects);

    // 绘制地面
    drawGround(ctx, canvas.width, canvas.height);

    // 绘制分数
    drawScore(ctx, gameState.score, canvas.width);

    // 绘制游戏状态提示
    if (gameState.status === 'paused') {
      drawPausedOverlay(ctx, canvas.width, canvas.height);
    } else if (gameState.status === 'gameOver') {
      drawGameOverOverlay(ctx, gameState.score, gameState.highScore, canvas.width, canvas.height);
    }
  }, [gameState, config, backgroundCacheRef.current]);

  // 绘制云彩
  const drawClouds = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // 简单的云彩效果
    for (let i = 0; i < 3; i++) {
      const x = (width / 4) * (i + 1);
      const y = height * 0.15 + Math.sin(Date.now() * 0.001 + i) * 10;
      
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 15, y, 25, 0, Math.PI * 2);
      ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
      ctx.arc(x + 15, y - 15, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 绘制管道
  const drawPipe = (ctx: CanvasRenderingContext2D, pipe: any) => {
    // 管道渐变色
    const gradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    gradient.addColorStop(0, '#4ade80'); // 绿色
    gradient.addColorStop(0.5, '#22c55e');
    gradient.addColorStop(1, '#16a34a');
    
    ctx.fillStyle = gradient;
    
    // 上管道
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
    
    // 下管道 - 使用config.canvasHeight而不是硬编码的600
    ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, config.canvasHeight - pipe.bottomY);
    
    // 管道边框
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 2;
    ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
    ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, config.canvasHeight - pipe.bottomY);
    
    // 添加管道缝隙的视觉提示（调试用）
    if (process.env.NODE_ENV === 'development') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
      ctx.fillRect(pipe.x, pipe.topHeight, pipe.width, pipe.gap);
      ctx.restore();
    }
  };

  // 绘制金币道具
  const drawCoinInstance = (ctx: CanvasRenderingContext2D, coin: CoinInstance) => {
    const centerX = coin.x;
    const centerY = coin.y;
    const size = coin.size;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 磁铁效果视觉反馈
    if (coin.magnetTarget) {
      ctx.shadowColor = '#8A2BE2';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // 磁铁吸引的光效
      ctx.strokeStyle = '#8A2BE2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2 + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 金币主体渐变
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, '#FFD700'); // 金色
    gradient.addColorStop(0.7, '#FFA500'); // 橙色
    gradient.addColorStop(1, '#FF8C00'); // 深橙色
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 金币边框
    ctx.strokeStyle = '#B8860B'; // 暗金色
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.stroke();
    
    // 清除阴影效果
    ctx.shadowBlur = 0;
    
    // 绘制金币符号
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制“￥”符号或数字
    if (size >= 20) {
      ctx.strokeText('￥', 0, 0);
      ctx.fillText('￥', 0, 0);
    } else {
      ctx.strokeText(coin.value.toString(), 0, 0);
      ctx.fillText(coin.value.toString(), 0, 0);
    }
    
    // 动画闪烁效果
    const sparkleTime = Date.now() * 0.003 + coin.animationPhase;
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + sparkleTime;
      const distance = size * 0.4;
      const sparkleX = Math.cos(angle) * distance;
      const sparkleY = Math.sin(angle) * distance;
      const opacity = (Math.sin(sparkleTime * 2 + i) + 1) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#FFFF00'; // 黄色闪烁
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    ctx.restore();
  };

  // 绘制道具
  const drawPowerUp = (ctx: CanvasRenderingContext2D, powerUp: PowerUpInstance) => {
    const centerX = powerUp.x;
    const centerY = powerUp.y;
    const size = powerUp.size;
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(powerUp.rotation);
    
    // 稀有度光晕效果
    const rarityColor = RARITY_COLORS[powerUp.type.rarity] || powerUp.type.color;
    
    // 绘制外圈光晕
    if (powerUp.type.rarity === 'legendary') {
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else if (powerUp.type.rarity === 'epic') {
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // 绘制道具主体（圆形背景）
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, powerUp.type.color);
    gradient.addColorStop(0.7, rarityColor);
    gradient.addColorStop(1, '#FFFFFF');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 清除阴影效果
    ctx.shadowBlur = 0;
    
    // 绘制道具图标
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = `bold ${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 根据道具类型绘制不同的图标
    switch (powerUp.type.id) {
      case 'invincible':
        // 绘制盾牌图标
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.25);
        ctx.lineTo(size * 0.2, -size * 0.1);
        ctx.lineTo(size * 0.2, size * 0.25);
        ctx.lineTo(0, size * 0.15);
        ctx.lineTo(-size * 0.2, size * 0.25);
        ctx.lineTo(-size * 0.2, -size * 0.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'speed_boost':
        // 绘制火焰图标
        ctx.fillStyle = '#FF4500';
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.25);
        ctx.lineTo(size * 0.15, -size * 0.1);
        ctx.lineTo(size * 0.1, size * 0.05);
        ctx.lineTo(size * 0.2, size * 0.25);
        ctx.lineTo(-size * 0.05, size * 0.1);
        ctx.lineTo(-size * 0.15, size * 0.25);
        ctx.lineTo(-size * 0.1, 0);
        ctx.lineTo(-size * 0.2, -size * 0.15);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'coin_double':
        // 绘制星星图标
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5;
          const radius = i % 2 === 0 ? size * 0.2 : size * 0.1;
          const x = Math.cos(angle - Math.PI / 2) * radius;
          const y = Math.sin(angle - Math.PI / 2) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'magnet':
        // 绘制磁铁图标
        ctx.fillStyle = '#8A2BE2';
        ctx.beginPath();
        ctx.arc(-size * 0.1, 0, size * 0.15, 0, Math.PI, true);
        ctx.arc(size * 0.1, 0, size * 0.15, 0, Math.PI, true);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'slow_motion':
        // 绘制时钟图标
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 时钟指针
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -size * 0.12);
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.08, 0);
        ctx.stroke();
        break;
    }
    
    // 绘制稀有度边框
    if (powerUp.type.rarity !== 'common') {
      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, size / 2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 动画闪烁效果（传说级）
    if (powerUp.type.rarity === 'legendary') {
      const sparkleTime = Date.now() * 0.005;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + sparkleTime;
        const distance = size * 0.4;
        const sparkleX = Math.cos(angle) * distance;
        const sparkleY = Math.sin(angle) * distance;
        const opacity = (Math.sin(sparkleTime * 2 + i) + 1) * 0.5;
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    
    ctx.restore();
  };
  
  // 绘制小鸟（支持皮肤系统和道具效果）
  const drawBaoniao = (ctx: CanvasRenderingContext2D, baoniao: any, skin: BaoniaoSkin, powerUpEffects: any) => {
    const centerX = baoniao.x + baoniao.size / 2;
    const centerY = baoniao.y + baoniao.size / 2;
    
    // 根据速度计算旋转角度
    const rotation = Math.min(Math.max(baoniao.velocity * 0.05, -0.5), 0.5);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);
    
    // 特效渲染：无敌效果或皮肤发光效果
    if (powerUpEffects.invincible || skin.effects?.glow) {
      ctx.shadowColor = powerUpEffects.invincible ? '#FFD700' : skin.colors.primary;
      ctx.shadowBlur = powerUpEffects.invincible ? 25 : 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // 无敌状态的金色光晕和闪烁效果
    if (powerUpEffects.invincible) {
      ctx.save();
      const time = Date.now() * 0.01;
      
      // 外层光晕
      ctx.globalAlpha = 0.3 + Math.sin(time) * 0.2;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, baoniao.size / 2 + 8, 0, Math.PI * 2);
      ctx.stroke();
      
      // 中层光晕
      ctx.globalAlpha = 0.2 + Math.sin(time * 1.5) * 0.1;
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, baoniao.size / 2 + 12, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.restore();
    }
    
    // 加速效果：蓝色火焰尾迹
    if (powerUpEffects.speedBoost > 1.0) {
      ctx.save();
      const time = Date.now() * 0.02;
      
      for (let i = 0; i < 5; i++) {
        const trailX = -baoniao.size / 2 - i * 3;
        const trailY = Math.sin(time + i * 0.5) * 2;
        const opacity = (5 - i) / 5 * 0.6;
        
        ctx.globalAlpha = opacity;
        const flameGradient = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, 8);
        flameGradient.addColorStop(0, '#1E90FF'); // 蓝色
        flameGradient.addColorStop(0.5, '#00BFFF'); // 深蓝色
        flameGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = flameGradient;
        ctx.beginPath();
        ctx.arc(trailX, trailY, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
    
    // 缓慢效果：绿色滤镜效果
    if (powerUpEffects.speedBoost < 1.0) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#32CD32'; // 绿色
      ctx.beginPath();
      ctx.arc(0, 0, baoniao.size / 2 + 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    // 小鸟身体渲染
    if (skin.effects?.gradient && skin.colors.secondary) {
      // 渐变效果
      const baoniaoGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baoniao.size);
      baoniaoGradient.addColorStop(0, skin.colors.primary);
      baoniaoGradient.addColorStop(0.7, skin.colors.secondary);
      baoniaoGradient.addColorStop(1, skin.colors.accent || skin.colors.secondary);
      ctx.fillStyle = baoniaoGradient;
    } else {
      // 纯色效果
      ctx.fillStyle = skin.colors.primary;
    }
    
    // 特殊皮肤渲染：彩虹效果
    if (skin.id === 'rainbow') {
      const rainbowGradient = ctx.createLinearGradient(-baoniao.size/2, -baoniao.size/2, baoniao.size/2, baoniao.size/2);
      const time = Date.now() * 0.002;
      rainbowGradient.addColorStop(0, `hsl(${(time * 50) % 360}, 70%, 60%)`);
      rainbowGradient.addColorStop(0.33, `hsl(${(time * 50 + 120) % 360}, 70%, 60%)`);
      rainbowGradient.addColorStop(0.66, `hsl(${(time * 50 + 240) % 360}, 70%, 60%)`);
      rainbowGradient.addColorStop(1, `hsl(${(time * 50) % 360}, 70%, 60%)`);
      ctx.fillStyle = rainbowGradient;
    }
    
    // 特殊皮肤渲染：火焰效果
    if (skin.id === 'fire') {
      const fireGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baoniao.size);
      const fireIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
      fireGradient.addColorStop(0, `rgba(255, 255, 0, ${fireIntensity})`);
      fireGradient.addColorStop(0.3, skin.colors.primary);
      fireGradient.addColorStop(0.7, skin.colors.secondary || skin.colors.primary);
      fireGradient.addColorStop(1, skin.colors.accent || '#8b0000');
      ctx.fillStyle = fireGradient;
    }
    
    // 特殊皮肤渲染：冰霜效果
    if (skin.id === 'ice') {
      const iceGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, baoniao.size);
      const shimmer = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
      iceGradient.addColorStop(0, `rgba(255, 255, 255, ${shimmer})`);
      iceGradient.addColorStop(0.3, skin.colors.primary);
      iceGradient.addColorStop(0.7, skin.colors.secondary || skin.colors.primary);
      iceGradient.addColorStop(1, skin.colors.accent || '#4682b4');
      ctx.fillStyle = iceGradient;
    }
    
    // 无敌状态的闪烁效果
    if (powerUpEffects.invincible) {
      const time = Date.now() * 0.01;
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(time) * 0.3;
      
      // 绘制小鸟身体
      ctx.beginPath();
      ctx.arc(0, 0, baoniao.size / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    } else {
      // 绘制小鸟身体
      ctx.beginPath();
      ctx.arc(0, 0, baoniao.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 清除阴影效果
    ctx.shadowBlur = 0;
    
    // 绘制小鸟翅膀
    ctx.fillStyle = skin.colors.accent || skin.colors.secondary || skin.colors.primary;
    
    // 特殊皮肤翅膀效果
    if (skin.id === 'fire') {
      // 火焰翅膀
      const wingTime = Date.now() * 0.02;
      const wingGradient = ctx.createLinearGradient(-baoniao.size/3, -baoniao.size/6, baoniao.size/3, baoniao.size/6);
      wingGradient.addColorStop(0, '#ff4500');
      wingGradient.addColorStop(0.5, `rgba(255, 69, 0, ${Math.sin(wingTime) * 0.3 + 0.7})`);
      wingGradient.addColorStop(1, '#dc143c');
      ctx.fillStyle = wingGradient;
    } else if (skin.id === 'ice') {
      // 冰晶翅膀
      const wingShimmer = Math.cos(Date.now() * 0.008) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(70, 130, 180, ${wingShimmer})`;
    }
    
    ctx.beginPath();
    ctx.ellipse(-baoniao.size / 4, 0, baoniao.size / 3, baoniao.size / 6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制小鸟眼睛
    ctx.fillStyle = skin.colors.eye || 'white';
    ctx.beginPath();
    ctx.arc(baoniao.size / 6, -baoniao.size / 6, baoniao.size / 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 特殊皮肤眼睛效果
    if (skin.id === 'fire') {
      ctx.fillStyle = '#ffff00'; // 黄色眼睛
    } else if (skin.id === 'ice') {
      ctx.fillStyle = '#87cefa'; // 冰蓝色眼睛
    } else {
      ctx.fillStyle = 'black';
    }
    
    ctx.beginPath();
    ctx.arc(baoniao.size / 6 + 2, -baoniao.size / 6, baoniao.size / 16, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制小鸟嘴巴
    ctx.fillStyle = skin.colors.accent || '#ea580c';
    ctx.beginPath();
    ctx.moveTo(baoniao.size / 2, 0);
    ctx.lineTo(baoniao.size / 2 + 8, -3);
    ctx.lineTo(baoniao.size / 2 + 8, 3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    
    // 特效渲染：闪烁效果
    if (skin.effects?.sparkle) {
      drawSparkleEffect(ctx, centerX, centerY, baoniao.size);
    }
    
    // 特效渲染：粒子效果
    if (skin.effects?.particle) {
      drawParticleEffect(ctx, centerX, centerY, skin);
    }
  };
  
  // 闪烁效果
  const drawSparkleEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    const time = Date.now() * 0.005;
    const sparkles = 6;
    
    for (let i = 0; i < sparkles; i++) {
      const angle = (i / sparkles) * Math.PI * 2 + time;
      const distance = size * 0.8;
      const sparkleX = x + Math.cos(angle) * distance;
      const sparkleY = y + Math.sin(angle) * distance;
      const opacity = (Math.sin(time * 2 + i) + 1) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffffff';
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(angle + time);
      
      // 绘制星星形状
      ctx.beginPath();
      for (let j = 0; j < 4; j++) {
        const starAngle = (j / 4) * Math.PI * 2;
        const radius = j % 2 === 0 ? 3 : 1;
        const px = Math.cos(starAngle) * radius;
        const py = Math.sin(starAngle) * radius;
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };
  
  // 粒子效果
  const drawParticleEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, skin: BaoniaoSkin) => {
    const time = Date.now() * 0.003;
    const particles = 8;
    
    for (let i = 0; i < particles; i++) {
      const angle = (i / particles) * Math.PI * 2 + time;
      const distance = 30 + Math.sin(time * 3 + i) * 10;
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      const opacity = (Math.sin(time * 4 + i) + 1) * 0.3;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      
      if (skin.id === 'fire') {
        // 火焰粒子
        const fireColors = ['#ff4500', '#ff6347', '#ffa500', '#ffff00'];
        ctx.fillStyle = fireColors[i % fireColors.length];
      } else if (skin.id === 'ice') {
        // 冰晶粒子
        ctx.fillStyle = '#b0e0e6';
      } else {
        ctx.fillStyle = skin.colors.primary;
      }
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // 绘制地面
  const drawGround = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const groundHeight = 50;
    const groundY = height - groundHeight;
    
    // 地面渐变
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
    groundGradient.addColorStop(0, '#92400e');
    groundGradient.addColorStop(1, '#451a03');
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, width, groundHeight);
    
    // 草地装饰
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < width; i += 20) {
      const grassHeight = Math.random() * 10 + 5;
      ctx.fillRect(i, groundY - grassHeight, 3, grassHeight);
    }
  };

  // 绘制分数
  const drawScore = (ctx: CanvasRenderingContext2D, score: number, width: number) => {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    
    const text = score.toString();
    const x = width / 2;
    const y = 60;
    
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
  };

  // 绘制暂停覆盖
  const drawPausedOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, width, height);
    
    // 暂停文字
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏已暂停', width / 2, height / 2 - 20);
    
    ctx.font = '18px Arial';
    ctx.fillText('按 P 键继续游戏', width / 2, height / 2 + 20);
  };

  // 绘制游戏结束覆盖
  const drawGameOverOverlay = (
    ctx: CanvasRenderingContext2D, 
    score: number, 
    highScore: number, 
    width: number, 
    height: number
  ) => {
    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    // 游戏结束文字
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', width / 2, height / 2 - 60);
    
    // 分数显示
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`得分: ${score}`, width / 2, height / 2 - 10);
    ctx.fillText(`最高分: ${highScore}`, width / 2, height / 2 + 20);
    
    // 操作提示
    ctx.font = '16px Arial';
    ctx.fillStyle = '#d1d5db';
    ctx.fillText('按 R 键重新开始', width / 2, height / 2 + 60);
  };

  // 优化的输入处理 - 添加防抖和多输入支持
  const jumpTimeoutRef = useRef<NodeJS.Timeout>();
  const lastJumpTimeRef = useRef<number>(0);

  const handleJump = useCallback((event?: React.MouseEvent | React.TouchEvent | React.KeyboardEvent) => {
    event?.preventDefault();

    const currentTime = Date.now();
    const timeSinceLastJump = currentTime - lastJumpTimeRef.current;

    // 限制最小跳跃间隔（50ms）防止意外连击
    if (timeSinceLastJump < 50) {
      return;
    }

    // 清除之前的超时
    if (jumpTimeoutRef.current) {
      clearTimeout(jumpTimeoutRef.current);
    }

    // 小延迟确保更好的响应性
    jumpTimeoutRef.current = setTimeout(() => {
      onJump();
      lastJumpTimeRef.current = Date.now();
    }, 10);
  }, [onJump]);

  // 鼠标点击事件
  const handleCanvasClick = (event: React.MouseEvent) => {
    handleJump(event as any);
  };

  // 触摸事件处理
  const handleTouchStart = (event: React.TouchEvent) => {
    handleJump(event as any);
  };

  // 键盘事件处理
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.code) {
      case 'Space':
      case 'ArrowUp':
      case 'KeyW': // 添加W键支持
        event.preventDefault();
        handleJump(event as any);
        break;
    }
  };

  // 优化的全局键盘监听
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
        case 'ArrowUp':
        case 'KeyW':
          if (document.activeElement === canvasRef.current) {
            event.preventDefault();
            handleJump(event as any);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (jumpTimeoutRef.current) {
        clearTimeout(jumpTimeoutRef.current);
      }
    };
  }, [handleJump]);

  // 性能优化的渲染函数
  const shouldRender = gameState.pipes.length > 0 ||
                       gameState.coinInstances.length > 0 ||
                       gameState.powerUps.length > 0 ||
                       gameState.baoniao ||
                       gameState.currentSkin ||
                       gameState.status !== 'start';

  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸（只在需要时）
    if (canvas.width !== config.canvasWidth || canvas.height !== config.canvasHeight) {
      canvas.width = config.canvasWidth;
      canvas.height = config.canvasHeight;
    }

    // 启用图像平滑以获得更好的性能
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 使用缓存的背景
    if (backgroundCacheRef.current) {
      ctx.putImageData(backgroundCacheRef.current, 0, 0);
    } else {
      // 备用背景渲染
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#B0E0E6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 绘制管道
    gameState.pipes.forEach(pipe => {
      drawPipe(ctx, pipe);
    });

    // 绘制金币道具
    gameState.coinInstances.forEach(coinInstance => {
      if (!coinInstance.collected) {
        drawCoinInstance(ctx, coinInstance);
      }
    });

    // 绘制道具
    gameState.powerUps.forEach(powerUp => {
      if (!powerUp.collected) {
        drawPowerUp(ctx, powerUp);
      }
    });

    // 绘制宝鸟
    drawBaoniao(ctx, gameState.baoniao, gameState.currentSkin, gameState.powerUpEffects);

    // 绘制地面
    drawGround(ctx, canvas.width, canvas.height);

    // 绘制分数
    drawScore(ctx, gameState.score, canvas.width);

    // 绘制游戏状态提示
    if (gameState.status === 'paused') {
      drawPausedOverlay(ctx, canvas.width, canvas.height);
    } else if (gameState.status === 'gameOver') {
      drawGameOverOverlay(ctx, gameState.score, gameState.highScore, canvas.width, canvas.height);
  }
  }, [gameState.pipes, gameState.coinInstances, gameState.powerUps, gameState.baoniao, gameState.currentSkin, gameState.powerUpEffects, gameState.status, gameState.score, gameState.highScore, config.canvasWidth, config.canvasHeight, backgroundCacheRef.current]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      className="border-2 border-gray-300 rounded-lg shadow-lg cursor-pointer bg-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
      style={{
        maxWidth: '100%',
        height: 'auto',
        touchAction: 'none', // 防止移动设备上的意外滚动
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none' // 移除焦点轮廓
      }}
      aria-label="宝鸟先飞游戏画布，点击、触摸或按空格键使宝鸟跳跃"
      role="button"
      tabIndex={0}
    />
  );
};

export default GameCanvas;
