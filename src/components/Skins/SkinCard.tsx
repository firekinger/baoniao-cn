import React from 'react';
import { BaoniaoSkin } from '../../types/game';
import { cn } from '../../lib/utils';
import { RARITY_CONFIG } from '../../utils/skinSystem';
import SkinPreview from './SkinPreview';
import CoinIcon from '../CoinSystem/CoinIcon';

interface SkinCardProps {
  skin: BaoniaoSkin;
  isSelected?: boolean;
  isOwned?: boolean;
  canAfford?: boolean;
  coins?: number;
  onAction?: () => void;
  className?: string;
}

const SkinCard: React.FC<SkinCardProps> = ({
  skin,
  isSelected = false,
  isOwned = false,
  canAfford = true,
  coins = 0,
  onAction,
  className
}) => {
  const rarityConfig = RARITY_CONFIG[skin.rarity];
  const isFree = skin.price === 0;
  const isPurchasable = !isOwned && !isFree;
  
  const getActionButtonConfig = () => {
    if (isOwned) {
      return {
        text: isSelected ? '使用中' : '选择',
        className: isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700',
        disabled: false
      };
    } else if (isPurchasable) {
      if (canAfford) {
        return {
          text: '购买',
          className: 'bg-yellow-500 hover:bg-yellow-600 text-white hover:scale-105',
          disabled: false
        };
      } else {
        return {
          text: `需要 ${skin.price - coins} 金币`,
          className: 'bg-gray-300 text-gray-500 cursor-not-allowed',
          disabled: true
        };
      }
    } else {
      return {
        text: '免费获得',
        className: 'bg-green-500 text-white',
        disabled: true
      };
    }
  };
  
  const buttonConfig = getActionButtonConfig();
  
  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group',
        'hover:scale-[1.02] hover:shadow-xl',
        isSelected && 'ring-4 ring-blue-400 ring-opacity-50',
        isOwned ? 'bg-white' : canAfford ? 'bg-white' : 'bg-gray-50',
        className
      )}
      style={{
        borderColor: isSelected ? '#3b82f6' : rarityConfig.borderColor,
        backgroundColor: isOwned || canAfford ? 'white' : '#f9fafb'
      }}
      onClick={onAction}
    >
      {/* 稀有度标签 */}
      <div
        className="absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold text-white z-10"
        style={{ backgroundColor: rarityConfig.color }}
      >
        {rarityConfig.name}
      </div>
      
      {/* 技能皮肤标签 */}
      {skin.skill && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full z-10">
          ⚡ 技能皮肤
        </div>
      )}
      
      {/* 选中标识 */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
          ✓
        </div>
      )}
      
      {/* 锁定标识 */}
      {!isOwned && !canAfford && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs z-10">
          🔒
        </div>
      )}
      
      {/* 皮肤预览 */}
      <div className="flex justify-center mb-4 mt-6">
        <div className={cn(
          "transition-all duration-300",
          !isOwned && !canAfford && "opacity-60 grayscale"
        )}>
          <SkinPreview 
            skin={skin}
            size="lg"
            animated={true}
          />
        </div>
      </div>
      
        {/* 皮肤信息 */}
      <div className="text-center space-y-2">
        <h3 className={cn(
          "font-bold text-lg",
          !isOwned && !canAfford ? "text-gray-500" : "text-gray-800"
        )}>
          {skin.name}
        </h3>
        <p className={cn(
          "text-sm line-clamp-2",
          !isOwned && !canAfford ? "text-gray-400" : "text-gray-600"
        )}>
          {skin.description}
        </p>
        
        {/* 技能信息 */}
        {skin.skill && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 mt-2">
            <div className="flex items-center justify-center gap-2 text-purple-700">
              <span className="text-lg">{skin.skill.icon}</span>
              <span className="text-sm font-medium">{skin.skill.name}</span>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {skin.skill.description}
            </div>
            <div className="text-xs text-purple-500 mt-1">
              冷却: {skin.skill.cooldown / 1000}秒
            </div>
          </div>
        )}
        
        {/* 价格和状态 */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {isFree ? (
            <span className="text-green-600 font-semibold">免费</span>
          ) : isOwned ? (
            <span className="text-blue-600 font-semibold">已拥有</span>
          ) : (
            <div className={cn(
              "flex items-center gap-1",
              !canAfford && "opacity-60"
            )}>
              <CoinIcon size="sm" />
              <span className={cn(
                "font-semibold",
                canAfford ? "text-gray-800" : "text-red-500"
              )}>
                {skin.price}
              </span>
            </div>
          )}
        </div>
        
        {/* 操作按钮 */}
        <div className="mt-4">
          <button
            className={cn(
              "w-full py-2.5 px-4 font-semibold rounded-xl transition-all duration-200",
              buttonConfig.className
            )}
            onClick={onAction}
            disabled={buttonConfig.disabled}
          >
            {buttonConfig.text}
          </button>
        </div>
      </div>
      
      {/* 特效标识 */}
      {skin.effects && (
        <div className="absolute bottom-2 left-2 flex gap-1 z-10">
          {skin.effects.glow && (
            <div className="w-3 h-3 bg-yellow-400 rounded-full" title="发光效果" />
          )}
          {skin.effects.sparkle && (
            <div className="w-3 h-3 bg-purple-400 rounded-full" title="闪烁效果" />
          )}
          {skin.effects.particle && (
            <div className="w-3 h-3 bg-red-400 rounded-full" title="粒子效果" />
          )}
        </div>
      )}
      
      {/* 悬浮发光效果 */}
      {canAfford && !isOwned && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
      )}
    </div>
  );
};

export default SkinCard;
