import React, { useState, useMemo } from 'react';
import { BaoniaoSkin } from '../../types/game';
import { cn } from '../../lib/utils';
import { RARITY_CONFIG } from '../../utils/skinSystem';
import SkinCard from './SkinCard';
import CoinDisplay from '../CoinSystem/CoinDisplay';

interface SkinSelectorProps {
  skins: BaoniaoSkin[];
  currentSkinId: string;
  coins: number;
  onSkinSelect: (skinId: string) => void;
  onSkinPurchase: (skinId: string, price: number) => Promise<{ success: boolean; reason: string }>;
  className?: string;
}

const SkinSelector: React.FC<SkinSelectorProps> = ({
  skins,
  currentSkinId,
  coins,
  onSkinSelect,
  onSkinPurchase,
  className
}) => {
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rarity'>('rarity');
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  
  // 筛选和排序皮肤
  const filteredAndSortedSkins = useMemo(() => {
    let filtered = skins;
    
    // 按稀有度筛选
    if (filterRarity !== 'all') {
      filtered = filtered.filter(skin => skin.rarity === filterRarity);
    }
    
    // 排序
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'rarity':
          const rarityOrder = { common: 1, rare: 2, legendary: 3 };
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [skins, filterRarity, sortBy]);
  
  // 统计信息
  const stats = useMemo(() => {
    const owned = skins.filter(skin => skin.owned || skin.id === 'classic').length;
    const total = skins.length;
    const rarityCount = {
      common: skins.filter(skin => skin.rarity === 'common').length,
      rare: skins.filter(skin => skin.rarity === 'rare').length,
      legendary: skins.filter(skin => skin.rarity === 'legendary').length
    };
    
    return { owned, total, rarityCount };
  }, [skins]);
  
  const handlePurchase = async (skin: BaoniaoSkin) => {
    if (purchaseLoading || skin.owned) return;
    
    setPurchaseLoading(skin.id);
    try {
      const result = await onSkinPurchase(skin.id, skin.price);
      if (result.success) {
        // 购买成功，可以显示成功消息
        console.log('皮肤购买成功:', skin.name);
      } else {
        // 购买失败，显示错误消息
        alert(result.reason);
      }
    } catch (error) {
      console.error('购买皮肤时出错:', error);
      alert('购买失败，请重试');
    } finally {
      setPurchaseLoading(null);
    }
  };
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* 统计信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">皮肤收藏</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.owned}/{stats.total}</div>
            <div className="text-sm text-gray-600">已拥有</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.rarityCount.common}</div>
            <div className="text-sm text-gray-600">普通</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.rarityCount.rare}</div>
            <div className="text-sm text-gray-600">稀有</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rarityCount.legendary}</div>
            <div className="text-sm text-gray-600">传说</div>
          </div>
        </div>
      </div>
      
      {/* 筛选和排序控制 */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            {/* 稀有度筛选 */}
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">稀有度:</label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="all">全部</option>
                <option value="common">普通</option>
                <option value="rare">稀有</option>
                <option value="legendary">传说</option>
              </select>
            </div>
            
            {/* 排序方式 */}
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">排序:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rarity')}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1"
              >
                <option value="rarity">稀有度</option>
                <option value="name">名称</option>
                <option value="price">价格</option>
              </select>
            </div>
          </div>
          
          {/* 金币显示 */}
          <CoinDisplay 
            coins={coins}
            size="md"
            label="可用金币"
          />
        </div>
      </div>
      
      {/* 皮肤网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredAndSortedSkins.map(skin => {
          const isOwned = skin.owned || skin.id === 'classic';
          const isSelected = skin.id === currentSkinId;
          const canAfford = coins >= skin.price;
          
          const handleSkinAction = () => {
            if (isOwned) {
              onSkinSelect(skin.id);
            } else {
              handlePurchase(skin);
            }
          };
          
          return (
            <SkinCard
              key={skin.id}
              skin={{
                ...skin,
                owned: isOwned,
                unlocked: skin.unlocked || skin.id === 'classic'
              }}
              isSelected={isSelected}
              isOwned={isOwned}
              canAfford={canAfford}
              coins={coins}
              onAction={handleSkinAction}
              className={purchaseLoading === skin.id ? 'opacity-50 pointer-events-none' : ''}
            />
          );
        })}
      </div>
      
      {/* 无结果提示 */}
      {filteredAndSortedSkins.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">没有找到符合条件的皮肤</div>
          <button
            onClick={() => {
              setFilterRarity('all');
              setSortBy('rarity');
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            重置筛选
          </button>
        </div>
      )}
    </div>
  );
};

export default SkinSelector;
