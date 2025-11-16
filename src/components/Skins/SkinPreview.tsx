import React from 'react';
import { BirdSkin } from '../../types/game';
import { cn } from '../../lib/utils';
import { RARITY_CONFIG } from '../../utils/skinSystem';
import CoinIcon from '../CoinSystem/CoinIcon';

interface SkinPreviewProps {
  skin: BirdSkin;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const SkinPreview: React.FC<SkinPreviewProps> = ({
  skin,
  size = 'md',
  animated = true,
  className
}) => {
  const instanceId = React.useId(); // 生成唯一ID
  const canvasId = `skin-preview-${skin.id}-${instanceId}`.replace(/:/g, '-'); // 更清理ID
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };
  
  const birdSize = {
    sm: 24,
    md: 32,
    lg: 48
  };
  
  React.useEffect(() => {
    if (!animated) return;
    
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasSize = birdSize[size];
    canvas.width = canvasSize * 2;
    canvas.height = canvasSize * 2;
    
    let animationFrameId: number;
    
    const animate = () => {
      // 如果画布已经被标记为不活跃，则停止渲染
      if (canvas.getAttribute('data-inactive') === 'true') {
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() * 0.003;
      const floatY = Math.sin(time) * 3;
      
      ctx.save();
      ctx.translate(centerX, centerY + floatY);
      
      // 特效渲染：发光效果
      if (skin.effects?.glow) {
        ctx.shadowColor = skin.colors.primary;
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      
      // 小鸟身体渲染
      if (skin.effects?.gradient && skin.colors.secondary) {
        const birdGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, canvasSize);
        birdGradient.addColorStop(0, skin.colors.primary);
        birdGradient.addColorStop(0.7, skin.colors.secondary);
        birdGradient.addColorStop(1, skin.colors.accent || skin.colors.secondary);
        ctx.fillStyle = birdGradient;
      } else {
        ctx.fillStyle = skin.colors.primary;
      }
      
      // 特殊皮肤效果
      if (skin.id === 'rainbow') {
        const rainbowGradient = ctx.createLinearGradient(-canvasSize/2, -canvasSize/2, canvasSize/2, canvasSize/2);
        rainbowGradient.addColorStop(0, `hsl(${(time * 100) % 360}, 70%, 60%)`);
        rainbowGradient.addColorStop(0.33, `hsl(${(time * 100 + 120) % 360}, 70%, 60%)`);
        rainbowGradient.addColorStop(0.66, `hsl(${(time * 100 + 240) % 360}, 70%, 60%)`);
        rainbowGradient.addColorStop(1, `hsl(${(time * 100) % 360}, 70%, 60%)`);
        ctx.fillStyle = rainbowGradient;
      } else if (skin.id === 'fire') {
        const fireGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, canvasSize);
        const fireIntensity = Math.sin(time * 2) * 0.3 + 0.7;
        fireGradient.addColorStop(0, `rgba(255, 255, 0, ${fireIntensity})`);
        fireGradient.addColorStop(0.3, skin.colors.primary);
        fireGradient.addColorStop(0.7, skin.colors.secondary || skin.colors.primary);
        fireGradient.addColorStop(1, skin.colors.accent || '#8b0000');
        ctx.fillStyle = fireGradient;
      } else if (skin.id === 'ice') {
        const iceGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, canvasSize);
        const shimmer = Math.sin(time) * 0.2 + 0.8;
        iceGradient.addColorStop(0, `rgba(255, 255, 255, ${shimmer})`);
        iceGradient.addColorStop(0.3, skin.colors.primary);
        iceGradient.addColorStop(0.7, skin.colors.secondary || skin.colors.primary);
        iceGradient.addColorStop(1, skin.colors.accent || '#4682b4');
        ctx.fillStyle = iceGradient;
      }
      
      // 绘制小鸟身体
      ctx.beginPath();
      ctx.arc(0, 0, canvasSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      // 绘制翅膀
      ctx.fillStyle = skin.colors.accent || skin.colors.secondary || skin.colors.primary;
      ctx.beginPath();
      ctx.ellipse(-canvasSize / 4, 0, canvasSize / 3, canvasSize / 6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制眼睛
      ctx.fillStyle = skin.colors.eye || 'white';
      ctx.beginPath();
      ctx.arc(canvasSize / 6, -canvasSize / 6, canvasSize / 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(canvasSize / 6 + 1, -canvasSize / 6, canvasSize / 16, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制嘴巴
      ctx.fillStyle = skin.colors.accent || '#ea580c';
      ctx.beginPath();
      ctx.moveTo(canvasSize / 2, 0);
      ctx.lineTo(canvasSize / 2 + 6, -2);
      ctx.lineTo(canvasSize / 2 + 6, 2);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // 特效渲染
      if (skin.effects?.sparkle) {
        drawSparkles(ctx, centerX, centerY + floatY, canvasSize, time);
      }
      
      if (animated) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    // 清理函数，不在引用闭包中的变量
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [skin, size, animated]);
  
  const drawSparkles = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, time: number) => {
    const sparkles = 4;
    for (let i = 0; i < sparkles; i++) {
      const angle = (i / sparkles) * Math.PI * 2 + time;
      const distance = size * 0.6;
      const sparkleX = x + Math.cos(angle) * distance;
      const sparkleY = y + Math.sin(angle) * distance;
      const opacity = (Math.sin(time * 3 + i) + 1) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ffffff';
      ctx.translate(sparkleX, sparkleY);
      ctx.rotate(angle + time);
      
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.lineTo(1, 0);
      ctx.lineTo(0, 2);
      ctx.lineTo(-1, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };
  
  return (
    <div className={cn(
      sizeClasses[size],
      'relative flex items-center justify-center',
      className
    )}>
      <canvas
        id={canvasId}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default SkinPreview;
