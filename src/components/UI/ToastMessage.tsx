import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import SkinPreview from '../Skins/SkinPreview';
import { BirdSkin } from '../../types/game';

interface ToastMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  skin?: BirdSkin;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const ToastMessage: React.FC<ToastMessageProps> = ({
  type,
  message,
  skin,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // 延迟一帧来触发动画
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
      
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, autoClose, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300); // 等待动画完成
  };

  if (!shouldRender) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 border-green-600 text-white';
      case 'error':
        return 'bg-red-500 border-red-600 text-white';
      case 'info':
        return 'bg-blue-500 border-blue-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto max-w-md w-full mx-4 rounded-2xl border-2 shadow-2xl",
          "transform transition-all duration-300 ease-out",
          getToastStyles(),
          isAnimating
            ? "translate-y-0 opacity-100 scale-100"
            : "-translate-y-4 opacity-0 scale-95"
        )}
      >
        <div className="p-4">
          {/* 顶部关闭按钮 */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getIcon()}</span>
              <span className="font-bold text-lg">购买成功！</span>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors duration-200 text-xl leading-none"
            >
              ×
            </button>
          </div>
          
          {/* 皮肤信息展示 */}
          {skin && (
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white bg-opacity-20 rounded-xl p-2">
                <SkinPreview 
                  skin={skin}
                  size="md"
                  animated={true}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{skin.name}</h3>
                <p className="text-sm opacity-90">{skin.description}</p>
              </div>
            </div>
          )}
          
          {/* 消息内容 */}
          <p className="text-center font-semibold">{message}</p>
          
          {/* 进度条（自动关闭时显示） */}
          {autoClose && (
            <div className="mt-3 w-full bg-white bg-opacity-30 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-linear"
                style={{
                  width: isAnimating ? '0%' : '100%',
                  transitionDuration: `${duration}ms`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToastMessage;