// 排行榜数据管理工具
import { LeaderboardEntry } from '../types/game';

export const addToLeaderboard = (
  playerName: string, 
  score: number, 
  difficulty: 'easy' | 'normal' | 'hard' | 'expert'
): void => {
  try {
    const existingData = localStorage.getItem('flappyBirdLeaderboard');
    const leaderboard: LeaderboardEntry[] = existingData ? JSON.parse(existingData) : [];
    
    const newEntry: LeaderboardEntry = {
      playerName,
      score,
      date: new Date().toISOString(),
      difficulty
    };
    
    leaderboard.push(newEntry);
    localStorage.setItem('flappyBirdLeaderboard', JSON.stringify(leaderboard));
  } catch (error) {
    console.error('Error saving to leaderboard:', error);
  }
};

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem('flappyBirdLeaderboard');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
};

export const clearLeaderboard = (): void => {
  try {
    localStorage.removeItem('flappyBirdLeaderboard');
  } catch (error) {
    console.error('Error clearing leaderboard:', error);
  }
};

// 设置数据管理工具
export const saveSettings = (settings: {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  soundEnabled: boolean;
  volume: number;
  effectsEnabled: boolean;
}): void => {
  try {
    localStorage.setItem('flappyBirdSettings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

export const loadSettings = (): {
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  soundEnabled: boolean;
  volume: number;
  effectsEnabled: boolean;
} => {
  try {
    const data = localStorage.getItem('flappyBirdSettings');
    return data ? JSON.parse(data) : {
      difficulty: 'normal',
      soundEnabled: true,
      volume: 0.7,
      effectsEnabled: true
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      difficulty: 'normal',
      soundEnabled: true,
      volume: 0.7,
      effectsEnabled: true
    };
  }
};