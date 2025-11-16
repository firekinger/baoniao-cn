import React, { useState, useMemo, useEffect } from 'react';
import { BirdSkin } from '../../types/game';
import { cn } from '../../lib/utils';
import { RARITY_CONFIG } from '../../utils/skinSystem';
import SkinCard from '../Skins/SkinCard';
import SkinPreview from '../Skins/SkinPreview';
import CoinDisplay from '../CoinSystem/CoinDisplay';
import PurchaseConfirmDialog from './PurchaseConfirmDialog';
import InsufficientCoinsDialog from './InsufficientCoinsDialog';
import { useToast } from '../UI/ToastProvider';

interface ShopProps {
  skins: BirdSkin[];
  currentSkinId: string;
  coins: number;
  onBack: () => void;
  onSkinSelect: (skinId: string) => void;
  onSkinPurchase: (skinId: string, price: number) => Promise<{ success: boolean; reason: string; skin?: BirdSkin }>;
}

type FilterType = 'all' | 'owned' | 'unowned' | 'basic' | 'normal' | 'skill' | 'common' | 'rare' | 'epic' | 'legendary';
type SortType = 'default' | 'price-low' | 'price-high' | 'rarity' | 'name';

const Shop: React.FC<ShopProps> = ({
  skins,
  currentSkinId,
  coins,
  onBack,
  onSkinSelect,
  onSkinPurchase
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');
  const [selectedSkin, setSelectedSkin] = useState<BirdSkin | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showInsufficientDialog, setShowInsufficientDialog] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  
  const { showPurchaseSuccess, showToast } = useToast();
  const currentSkin = skins.find(skin => skin.id === currentSkinId) || skins[0];
  
  // 筛选和排序皮肤
  const filteredAndSortedSkins = useMemo(() => {
    let filtered = [...skins];
    
    // 应用筛选器
    switch (filter) {
      case 'owned':
        filtered = filtered.filter(skin => skin.owned || skin.id === 'classic');
        break;
      case 'unowned':
        filtered = filtered.filter(skin => !skin.owned && skin.id !== 'classic');
        break;
      case 'basic':
      case 'normal':
      case 'skill':
        filtered = filtered.filter(skin => skin.category === filter);
        break;
      case 'common':
      case 'rare':
      case 'epic':
      case 'legendary':
        filtered = filtered.filter(skin => skin.rarity === filter);
        break;
      default:
        // 'all' - 不过滤
        break;
    }
    
    // 应用排序
    switch (sort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rarity':
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // 'default' - 按稀有度和价格排序
        const defaultRarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        filtered.sort((a, b) => {
          const rarityDiff = defaultRarityOrder[a.rarity] - defaultRarityOrder[b.rarity];
          if (rarityDiff !== 0) return rarityDiff;
          return a.price - b.price;
        });
        break;
    }
    
    return filtered;
  }, [skins, filter, sort]);
  
  // 统计信息
  const stats = useMemo(() => {
    const owned = skins.filter(skin => skin.owned || skin.id === 'classic').length;
    const total = skins.length;
    const unowned = total - owned;
    const rarityCount = {
      common: skins.filter(skin => skin.rarity === 'common').length,
      rare: skins.filter(skin => skin.rarity === 'rare').length,
      epic: skins.filter(skin => skin.rarity === 'epic').length,
      legendary: skins.filter(skin => skin.rarity === 'legendary').length
    };
    
    const categoryCount = {
      basic: skins.filter(skin => skin.category === 'basic').length,
      normal: skins.filter(skin => skin.category === 'normal').length,
      skill: skins.filter(skin => skin.category === 'skill').length
    };
    
    return { owned, total, unowned, rarityCount, categoryCount };
  }, [skins]);
  
  // 组件卸载时清理所有皮肤预览的动画帧
  useEffect(() => {
    // 当厂商卸载时进行清理
    return () => {
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
      
      // 清理所有正在进行的动画帧请求
      const highestId = window.requestAnimationFrame(() => {});
      for (let i = 0; i < highestId; i++) {
        window.cancelAnimationFrame(i);
      }
    };
  }, []);
  
  const handleSkinAction = (skin: BirdSkin) => {
    const isOwned = skin.owned || skin.id === 'classic';
    
    console.log('Skin action:', { skinId: skin.id, isOwned, coins, price: skin.price });
    
    if (isOwned) {
      // 选择皮肤
      onSkinSelect(skin.id);
    } else {
      // 购买皮肤
      if (coins >= skin.price) {
        console.log('Showing purchase dialog');
        setSelectedSkin(skin);
        setShowPurchaseDialog(true);
      } else {
        console.log('Showing insufficient coins dialog');
        setSelectedSkin(skin);
        setShowInsufficientDialog(true);
      }
    }
  };
  
  const handleConfirmPurchase = async () => {
    if (!selectedSkin) return;
    
    setPurchaseLoading(true);
    try {
      const result = await onSkinPurchase(selectedSkin.id, selectedSkin.price);
      if (result.success && result.skin) {
        setShowPurchaseDialog(false);
        // 显示购买成功的Toast提示
        showPurchaseSuccess(result.skin);
      } else {
        // 显示错误信息
        showToast(result.reason || '购买失败', 'error');
      }
    } catch (error) {
      console.error('购买皮肤时出错:', error);
      showToast('购买失败，请重试', 'error');
    } finally {
      setPurchaseLoading(false);
      setSelectedSkin(null);
    }
  };
  
  const handleCancelPurchase = () => {
    setShowPurchaseDialog(false);
    setSelectedSkin(null);
  };
  
  const handleCloseInsufficientDialog = () => {
    setShowInsufficientDialog(false);
    setSelectedSkin(null);
  };
  
  const handleGoToGame = () => {
    setShowInsufficientDialog(false);
    setSelectedSkin(null);
    onBack();
    // 这里可能需要额外的逻辑来启动游戏
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-400 to-orange-400 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 顶部区域 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-800 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              aria-label="返回主菜单"
            >
              ← 返回
            </button>
            
            <div className="bg-white bg-opacity-95 rounded-xl px-6 py-3 shadow-lg">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🛒 皮肤商店
              </h1>
            </div>
          </div>
          
          {/* 金币余额 */}
          <div className="bg-white bg-opacity-95 rounded-xl px-6 py-3 shadow-lg">
            <CoinDisplay coins={coins} size="lg" />
          </div>
        </div>
        
        {/* 当前使用皮肤展示 */}
        <div className="bg-white bg-opacity-95 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">当前使用</h2>
              <p className="text-gray-600">你的小鸟现在的外观</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">{currentSkin?.name}</div>
                <div className="text-sm text-gray-600">{currentSkin?.description}</div>
              </div>
              <SkinPreview 
                skin={currentSkin}
                size="lg"
                animated={true}
              />
            </div>
          </div>
        </div>
        
        {/* 统计信息 */}
        <div className="bg-white bg-opacity-95 rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">收藏统计</h2>
          <div className="space-y-4">
            {/* 总体统计 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.owned}/{stats.total}</div>
                <div className="text-sm text-gray-600">已收集</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.unowned}</div>
                <div className="text-sm text-gray-600">待解锁</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.categoryCount.skill}</div>
                <div className="text-sm text-gray-600">技能皮肤</div>
              </div>
            </div>
            
            {/* 类别统计 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">类别分布</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{stats.categoryCount.basic}</div>
                  <div className="text-xs text-gray-500">基础皮肤</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.categoryCount.normal}</div>
                  <div className="text-xs text-gray-500">普通皮肤</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{stats.categoryCount.skill}</div>
                  <div className="text-xs text-gray-500">技能皮肤</div>
                </div>
              </div>
            </div>
            
            {/* 稀有度统计 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">品质分布</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-600">{stats.rarityCount.common}</div>
                  <div className="text-xs text-gray-500">普通</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{stats.rarityCount.rare}</div>
                  <div className="text-xs text-gray-500">稀有</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{stats.rarityCount.epic}</div>
                  <div className="text-xs text-gray-500">史诗</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{stats.rarityCount.legendary}</div>
                  <div className="text-xs text-gray-500">传说</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 筛选和排序控制 */}
        <div className="bg-white bg-opacity-95 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* 分类筛选 */}
            <div className="flex flex-wrap gap-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">分类:</label>
              {[
                { value: 'all', label: '全部' },
                { value: 'owned', label: '已拥有' },
                { value: 'unowned', label: '未拥有' },
                { value: 'basic', label: '基础皮肤' },
                { value: 'normal', label: '普通皮肤' },
                { value: 'skill', label: '技能皮肤' },
                { value: 'common', label: '普通品质' },
                { value: 'rare', label: '稀有品质' },
                { value: 'epic', label: '史诗品质' },
                { value: 'legendary', label: '传说品质' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as FilterType)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200",
                    filter === value
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {/* 排序选择 */}
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700">排序:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white"
              >
                <option value="default">默认顺序</option>
                <option value="price-low">价格由低到高</option>
                <option value="price-high">价格由高到低</option>
                <option value="rarity">按稀有度</option>
                <option value="name">按名称</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 皮肤网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedSkins.map((skin) => {
            const isOwned = skin.owned || skin.id === 'classic';
            const isSelected = skin.id === currentSkinId;
            const canAfford = coins >= skin.price;
            
            return (
              <SkinCard
                key={skin.id}
                skin={skin}
                isSelected={isSelected}
                isOwned={isOwned}
                canAfford={canAfford}
                coins={coins}
                onAction={() => handleSkinAction(skin)}
                className="hover:shadow-xl transition-shadow duration-300"
              />
            );
          })}
        </div>
        
        {/* 无结果提示 */}
        {filteredAndSortedSkins.length === 0 && (
          <div className="bg-white bg-opacity-95 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">没有找到皮肤</h3>
            <p className="text-gray-600">尝试调整筛选条件看看其他皮肤吧！</p>
          </div>
        )}
      </div>
      
      {/* 购买确认对话框 */}
      {selectedSkin && (
        <PurchaseConfirmDialog
          skin={selectedSkin}
          coins={coins}
          isOpen={showPurchaseDialog}
          isLoading={purchaseLoading}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )}
      
      {/* 金币不足对话框 */}
      {selectedSkin && (
        <InsufficientCoinsDialog
          isOpen={showInsufficientDialog}
          required={selectedSkin.price}
          current={coins}
          skinName={selectedSkin.name}
          onClose={handleCloseInsufficientDialog}
          onGoToGame={handleGoToGame}
        />
      )}
    </div>
  );
};

export default Shop;