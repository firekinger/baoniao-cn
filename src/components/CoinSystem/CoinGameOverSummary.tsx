import React from 'react';
import { CoinGameSummary } from '../../types/game';
import { cn } from '../../lib/utils';
import CoinIcon from './CoinIcon';

interface CoinGameOverSummaryProps {
  summary: CoinGameSummary;
  totalCoins: number;
  className?: string;
}

const CoinGameOverSummary: React.FC<CoinGameOverSummaryProps> = ({
  summary,
  totalCoins,
  className
}) => {
  const rewardItems = [
    {
      label: '基础奖励',
      amount: summary.baseRewards,
      description: '通过管道获得',
      color: 'text-blue-600'
    },
    {
      label: '连击奖励',
      amount: summary.streakRewards,
      description: '连续通过奖励',
      color: 'text-orange-600'
    },
    {
      label: '时长奖励',
      amount: summary.timeRewards,
      description: '游戏时长奖励',
      color: 'text-green-600'
    },
    {
      label: '里程碑奖励',
      amount: summary.milestoneRewards,
      description: '分数里程碑',
      color: 'text-purple-600'
    },
    {
      label: '完美表现',
      amount: summary.perfectRewards,
      description: '连续15次无撞',
      color: 'text-pink-600'
    }
  ];

  const hasRewards = summary.totalCoins > 0;

  if (!hasRewards) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-gray-100 to-gray-200",
        "rounded-2xl p-6 shadow-lg border-2 border-gray-300",
        className
      )}>
        <div className="text-center">
          <div className="text-2xl mb-2">加油</div>
          <p className="text-gray-600">下次努力获得更多金币吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-br from-yellow-50 to-amber-100",
      "rounded-2xl p-6 shadow-lg border-2 border-yellow-300",
      className
    )}>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <CoinIcon size="lg" animated />
          <h3 className="text-2xl font-bold text-yellow-800">
            恭喜获得 {summary.totalCoins} 金币！
          </h3>
        </div>
        <p className="text-yellow-700">金币余额: {totalCoins}</p>
      </div>

      <div className="space-y-3">
        {rewardItems.map((item, index) => (
          item.amount > 0 && (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white bg-opacity-60 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  item.color.replace('text-', 'bg-')
                )} />
                <div>
                  <div className="font-semibold text-gray-700">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <div className={cn(
                "font-bold text-lg",
                item.color
              )}>
                +{item.amount}
              </div>
            </div>
          )
        ))}
      </div>

      <div className="mt-6 pt-4 border-t-2 border-yellow-300">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-yellow-800">总计:</span>
          <div className="flex items-center gap-2">
            <CoinIcon size="md" />
            <span className="text-2xl font-bold text-yellow-800">
              +{summary.totalCoins}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinGameOverSummary;