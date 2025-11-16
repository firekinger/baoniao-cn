import React, { useEffect } from 'react';
import { CoinReward } from '../../types/game';

interface CoinRewardAnimationProps {
  rewards: CoinReward[];
  onRewardComplete: (id: string) => void;
}

/**
 * 金币奖励动画组件
 * 
 * 已禁用消息提示显示功能，但保留奖励处理逻辑以确保系统正常工作。
 * 金币仍会正常累积，只是不显示获取消息。
 */
const CoinRewardAnimation: React.FC<CoinRewardAnimationProps> = ({
  rewards,
  onRewardComplete
}) => {
  useEffect(() => {
    // 立即完成所有奖励，不显示任何动画或消息
    rewards.forEach(reward => {
      // 使用setTimeout确保在下一个事件循环中调用，避免状态更新冲突
      setTimeout(() => {
        onRewardComplete(reward.id);
      }, 0);
    });
  }, [rewards, onRewardComplete]);

  // 返回null - 不渲染任何内容，完全禁用金币获取消息提示
  return null;
};

export default CoinRewardAnimation;

/* 
原始实现已被注释掉以禁用金币获取消息提示:
- 删除了 AnimatedReward 组件
- 删除了所有动画和消息显示逻辑
- 保留了奖励完成回调以维持系统完整性
- 金币系统本身继续正常工作，只是不显示获取通知

如需恢复消息提示功能，可以从 git 历史中找回原始实现。
*/