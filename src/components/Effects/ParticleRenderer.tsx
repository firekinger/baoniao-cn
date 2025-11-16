import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { Particle } from '../../types/game';

interface ParticleRendererProps {
  particles: Particle[];
  canvasWidth: number;
  canvasHeight: number;
}

const ParticleRenderer: React.FC<ParticleRendererProps> = ({
  particles,
  canvasWidth,
  canvasHeight
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 性能优化：只在有粒子时才渲染
  const shouldRender = useMemo(() => {
    return particles.length > 0;
  }, [particles]);

  // 优化的绘制函数
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();

    // 设置透明度
    ctx.globalAlpha = particle.alpha;

    // 设置颜色
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;

    switch (particle.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'star':
        drawStarParticle(ctx, particle);
        break;
      case 'spark':
        drawSparkParticle(ctx, particle);
        break;
      case 'trail':
        drawTrailParticle(ctx, particle);
        break;
      case 'explosion':
        drawExplosionParticle(ctx, particle);
        break;
      default:
        // 默认圆形粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }, []);

  // 粒子绘制函数
  const drawStarParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * particle.size;
      const y = Math.sin(angle) * particle.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawSparkParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.beginPath();
    ctx.moveTo(particle.x - particle.size, particle.y);
    ctx.lineTo(particle.x + particle.size, particle.y);
    ctx.moveTo(particle.x, particle.y - particle.size);
    ctx.lineTo(particle.x, particle.y + particle.size);
    ctx.stroke();
  };

  const drawTrailParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawExplosionParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.alpha * 1.5; // 爆炸粒子更亮
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // 优化的渲染循环
  useEffect(() => {
    if (!shouldRender) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸（只在需要时）
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    // 启用图像平滑
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 批量绘制粒子
    if (particles.length > 0) {
      // 按粒子类型分组以减少状态切换
      const particlesByType = particles.reduce((acc, particle) => {
        if (!acc[particle.type]) {
          acc[particle.type] = [];
        }
        acc[particle.type].push(particle);
        return acc;
      }, {} as Record<string, Particle[]>);

      // 按类型批量绘制
      Object.entries(particlesByType).forEach(([type, typeParticles]) => {
        typeParticles.forEach(particle => {
          drawParticle(ctx, particle);
        });
      });
    }
  }, [particles, canvasWidth, canvasHeight, shouldRender, drawParticle]);

  if (!shouldRender) {
    return null; // 不渲染空画布
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};

export default ParticleRenderer;