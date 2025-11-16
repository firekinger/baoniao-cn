import React from 'react';
import { BirdSkin } from '../../types/game';
import SkinSelector from './SkinSelector';
import SkinPreview from './SkinPreview';

interface SkinsScreenProps {
  skins: BirdSkin[];
  currentSkinId: string;
  coins: number;
  onBack: () => void;
  onSkinSelect: (skinId: string) => void;
  onSkinPurchase: (skinId: string, price: number) => Promise<{ success: boolean; reason: string }>;
}

const SkinsScreen: React.FC<SkinsScreenProps> = ({
  skins,
  currentSkinId,
  coins,
  onBack,
  onSkinSelect,
  onSkinPurchase
}) => {
  const currentSkin = skins.find(skin => skin.id === currentSkinId) || skins[0];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300 p-4">
      {/* 顶部导航 */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              aria-label="返回主菜单"
            >
              ← 返回
            </button>
            
            <div className="bg-white bg-opacity-90 rounded-xl px-6 py-3 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-800">小鸟皮肤</h1>
            </div>
          </div>
          
          {/* 当前使用皮肤 */}
          <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">当前使用</div>
              <div className="font-semibold text-gray-800">{currentSkin?.name}</div>
            </div>
            <SkinPreview 
              skin={currentSkin}
              size="md"
              animated={true}
            />
          </div>
        </div>
        
        {/* 皮肤选择器 */}
        <SkinSelector
          skins={skins}
          currentSkinId={currentSkinId}
          coins={coins}
          onSkinSelect={onSkinSelect}
          onSkinPurchase={onSkinPurchase}
        />
      </div>
    </div>
  );
};

export default SkinsScreen;
