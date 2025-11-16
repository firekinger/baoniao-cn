import React from 'react';
import { LeaderboardEntry } from '../../types/game';
import { cn } from '../../lib/utils';

interface LeaderboardProps {
  onBack: () => void;
  currentPlayer?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, currentPlayer }) => {
  // 从localStorage获取排行榜数据
  const getLeaderboardData = (): LeaderboardEntry[] => {
    try {
      const data = localStorage.getItem('flappyBirdLeaderboard');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const leaderboardData = getLeaderboardData();
  
  // 按分数排序，相同昵称只保留最高分
  const processedData = leaderboardData
    .reduce((acc: LeaderboardEntry[], entry) => {
      const existingIndex = acc.findIndex(item => item.playerName === entry.playerName);
      if (existingIndex >= 0) {
        if (entry.score > acc[existingIndex].score) {
          acc[existingIndex] = entry;
        }
      } else {
        acc.push(entry);
      }
      return acc;
    }, [])
    .sort((a, b) => b.score - a.score);

  const top10 = processedData.slice(0, 10);
  const currentPlayerEntry = processedData.find(entry => entry.playerName === currentPlayer);
  const currentPlayerRank = processedData.findIndex(entry => entry.playerName === currentPlayer) + 1;
  
  const isCurrentPlayerInTop10 = currentPlayer && top10.some(entry => entry.playerName === currentPlayer);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'normal': return 'text-blue-600';
      case 'hard': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单';
      case 'normal': return '普通';
      case 'hard': return '困难';
      case 'expert': return '专家';
      default: return '未知';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-300 via-blue-200 to-indigo-300 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-200 via-transparent to-yellow-200 opacity-60 animate-pulse-slow" />
      
      {/* 主内容区域 */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-2xl mx-auto px-6 w-full">
        {/* 标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent drop-shadow-2xl">
            排行榜
          </h1>
          <p className="text-lg text-purple-700 font-medium opacity-80">
            挑战最高分数记录
          </p>
        </div>
        
        {/* 排行榜内容 */}
        <div className="w-full max-w-md">
          {processedData.length === 0 ? (
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
              <div className="text-6xl mb-4">暂无数据</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">暂无记录</h3>
              <p className="text-gray-500">开始游戏创造你的第一个记录吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 前10名 */}
              <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">前10名</h3>
                <div className="space-y-2">
                  {top10.map((entry, index) => (
                    <div
                      key={`${entry.playerName}-${index}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
                        entry.playerName === currentPlayer
                          ? "bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-300"
                          : "bg-gray-50 hover:bg-gray-100",
                        index === 0 && "ring-2 ring-yellow-400 ring-opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 ? "bg-yellow-500 text-white" :
                          index === 1 ? "bg-gray-400 text-white" :
                          index === 2 ? "bg-orange-400 text-white" :
                          "bg-gray-200 text-gray-600"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <div className={cn(
                            "font-semibold",
                            entry.playerName === currentPlayer ? "text-orange-700" : "text-gray-700"
                          )}>
                            {entry.playerName}
                          </div>
                          <div className={cn("text-xs", getDifficultyColor(entry.difficulty))}>
                            {getDifficultyName(entry.difficulty)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-purple-600">{entry.score}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 当前玩家排名（如果不在前10） */}
              {!isCurrentPlayerInTop10 && currentPlayerEntry && (
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">你的排名</h3>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                          {currentPlayerRank}
                        </div>
                        <div>
                          <div className="font-semibold text-blue-700">{currentPlayerEntry.playerName}</div>
                          <div className={cn("text-xs", getDifficultyColor(currentPlayerEntry.difficulty))}>
                            {getDifficultyName(currentPlayerEntry.difficulty)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-purple-600">{currentPlayerEntry.score}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(currentPlayerEntry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 返回按钮 */}
        <div className="mt-8">
          <button
            onClick={onBack}
            className={cn(
              "relative inline-flex items-center justify-center font-semibold rounded-2xl",
              "transition-all duration-150 ease-out",
              "hover:scale-103 active:scale-95",
              "focus:outline-none focus:ring-4 focus:ring-opacity-50",
              "shadow-lg hover:shadow-xl",
              "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800",
              "hover:from-gray-200 hover:to-gray-300",
              "focus:ring-gray-300",
              "shadow-gray-200",
              "px-8 py-3 text-lg min-h-[44px]"
            )}
            aria-label="返回主页"
          >
            ← 返回主页
          </button>
        </div>
      </div>
      
      {/* 底部提示 */}
      <div className="absolute bottom-6 left-6 text-sm text-purple-600 opacity-70">
        <p>继续游戏提升你的排名！</p>
      </div>
    </div>
  );
};

export default Leaderboard;