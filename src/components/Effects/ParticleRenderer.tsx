import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制所有粒子
    particles.forEach(particle => {
      drawParticle(ctx, particle);
    });
  }, [particles, canvasWidth, canvasHeight]);

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    
    // 设置透明度
    ctx.globalAlpha = particle.alpha;
    
    // 设置颜色
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;
    
    switch (particle.type) {
      case 'circle':
        drawCircleParticle(ctx, particle);
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
        drawCircleParticle(ctx, particle);
    }
    
    ctx.restore();
  };

  const drawCircleParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawStarParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const spikes = 5;
    const outerRadius = particle.size;
    const innerRadius = particle.size * 0.5;
    
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = particle.x + Math.cos(angle) * radius;
      const y = particle.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // 添加发光效果
    ctx.shadowBlur = particle.size * 2;
    ctx.shadowColor = particle.color;
    ctx.fill();
  };

  const drawSparkParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    // 绘制十字形火花
    ctx.lineWidth = Math.max(1, particle.size * 0.5);
    
    ctx.beginPath();
    ctx.moveTo(particle.x - particle.size, particle.y);
    ctx.lineTo(particle.x + particle.size, particle.y);
    ctx.moveTo(particle.x, particle.y - particle.size);
    ctx.lineTo(particle.x, particle.y + particle.size);
    ctx.stroke();
    
    // 添加发光效果
    ctx.shadowBlur = particle.size;
    ctx.shadowColor = particle.color;
    ctx.stroke();
  };

  const drawTrailParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    // 绘制带尾迹的圆形
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 2
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawExplosionParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    // 绘制爆炸碎片
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.7, particle.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加发光边缘
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};

export default ParticleRenderer;