import React from 'react';
import { cn } from '../../lib/utils';
import CoinIcon from '../CoinSystem/CoinIcon';

interface InsufficientCoinsDialogProps {
  isOpen: boolean;
  required: number;
  current: number;
  skinName: string;
  onClose: () => void;
  onGoToGame: () => void;
}

const InsufficientCoinsDialog: React.FC<InsufficientCoinsDialogProps> = ({
  isOpen,
  required,
  current,
  skinName,
  onClose,
  onGoToGame
}) => {
  const needed = required - current;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* 对话框内容 */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-4 text-white text-center">
            <div className="text-4xl mb-2">😅</div>
            <h2 className="text-xl font-bold">金币不足</h2>
          </div>
          
          {/* 内容区域 */}
          <div className="p-6 space-y-6">
            {/* 信息显示 */}
            <div className="text-center space-y-3">
              <p className="text-gray-700">
                购买 <span className="font-semibold text-gray-900">{skinName}</span> 需要
              </p>
              
              <div className="flex items-center justify-center gap-1">
                <CoinIcon size="md" />
                <span className="text-2xl font-bold text-gray-800">{required}</span>
                <span className="text-gray-600">金币</span>
              </div>
            </div>
            
            {/* 金币状态 */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">当前拥有：</span>
                <div className="flex items-center gap-1">
                  <CoinIcon size="sm" />
                  <span className="font-bold">{current}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-gray-600">还需要：</span>
                <div className="flex items-center gap-1">
                  <CoinIcon size="sm" />
                  <span className="font-bold text-red-600">{needed}</span>
                </div>
              </div>
            </div>
            
            {/* 提示信息 */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-blue-800 font-semibold mb-1">如何获得金币？</p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• 游戏中通过管道获得 10 金币</li>
                    <li>• 连续通过管道获得连击奖励</li>
                    <li>• 每 30 秒游戏时间获得 5 金币</li>
                    <li>• 达成分数里程碑获得额外奖励</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* 按钮区域 */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors duration-200"
            >
              关闭
            </button>
            
            <button
              onClick={onGoToGame}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              去游戏
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCoinsDialog;