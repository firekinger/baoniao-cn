import React from 'react';
import { BirdSkin } from '../../types/game';
import { cn } from '../../lib/utils';
import SkinPreview from '../Skins/SkinPreview';
import CoinIcon from '../CoinSystem/CoinIcon';
import { RARITY_CONFIG } from '../../utils/skinSystem';

interface PurchaseConfirmDialogProps {
  skin: BirdSkin;
  coins: number;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PurchaseConfirmDialog: React.FC<PurchaseConfirmDialogProps> = ({
  skin,
  coins,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const rarityConfig = RARITY_CONFIG[skin.rarity];
  const afterPurchaseCoins = coins - skin.price;
  const canAfford = coins >= skin.price;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
        onClick={onCancel}
      />
      
      {/* 对话框内容 */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* 头部 */}
          <div 
            className="px-6 py-4 text-white text-center font-bold"
            style={{ backgroundColor: rarityConfig.color }}
          >
            <h2 className="text-xl">确认购买</h2>
          </div>
          
          {/* 内容区域 */}
          <div className="p-6 space-y-6">
            {/* 皮肤预览 */}
            <div className="flex flex-col items-center space-y-3">
              <div 
                className="p-4 rounded-2xl border-2"
                style={{ 
                  borderColor: rarityConfig.borderColor,
                  backgroundColor: rarityConfig.bgColor 
                }}
              >
                <SkinPreview 
                  skin={skin}
                  size="lg"
                  animated={true}
                />
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800">{skin.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{skin.description}</p>
                <div 
                  className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mt-2"
                  style={{ backgroundColor: rarityConfig.color }}
                >
                  {rarityConfig.name}
                </div>
              </div>
            </div>
            
            {/* 价格信息 */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">价格：</span>
                <div className="flex items-center gap-1">
                  <CoinIcon size="sm" />
                  <span className="font-bold text-lg">{skin.price}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">当前余额：</span>
                <div className="flex items-center gap-1">
                  <CoinIcon size="sm" />
                  <span className="font-bold text-lg">{coins}</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">购买后余额：</span>
                  <div className="flex items-center gap-1">
                    <CoinIcon size="sm" />
                    <span 
                      className={cn(
                        "font-bold text-lg",
                        canAfford ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {afterPurchaseCoins}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 警告提示 */}
            {!canAfford && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-red-800 font-semibold">金币不足</p>
                    <p className="text-red-600 text-sm">还需要 {skin.price - coins} 枚金币</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 按钮区域 */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-colors duration-200"
              disabled={isLoading}
            >
              取消
            </button>
            
            <button
              onClick={onConfirm}
              disabled={!canAfford || isLoading}
              className={cn(
                "flex-1 py-3 px-4 font-semibold rounded-xl transition-all duration-200",
                canAfford && !isLoading
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>购买中...</span>
                </div>
              ) : (
                "确认购买"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseConfirmDialog;