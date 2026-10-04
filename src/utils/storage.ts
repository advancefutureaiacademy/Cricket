/**
 * Cricket Hit Master - Local Storage & Player Progress Manager
 */

import { PlayerProgress } from '../types/game';

const STORAGE_KEY = 'cricket_hit_master_progress_v1';

export const DEFAULT_PLAYER_PROGRESS: PlayerProgress = {
  coins: 100, // Free starter coins for instant powerup fun
  highScore: 0,
  highestCombo: 0,
  totalRuns: 0,
  totalSixes: 0,
  totalFours: 0,
  totalMatches: 0,
  currentLevel: 1,
  unlockedLevels: 1,
  completedChallenges: [],
  powerUps: {
    six_boost: 1,
    perfect_timing: 1,
    extra_life: 1,
  },
  settings: {
    sound: true,
    crowd: true,
    vibration: true,
  },
};

export const loadPlayerProgress = (): PlayerProgress => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ...DEFAULT_PLAYER_PROGRESS };
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return { ...DEFAULT_PLAYER_PROGRESS };
    }
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_PLAYER_PROGRESS,
      ...parsed,
      powerUps: {
        ...DEFAULT_PLAYER_PROGRESS.powerUps,
        ...(parsed.powerUps || {}),
      },
      settings: {
        ...DEFAULT_PLAYER_PROGRESS.settings,
        ...(parsed.settings || {}),
      },
    };
  } catch (err) {
    console.warn('Failed to read localStorage, using default player progress', err);
    return { ...DEFAULT_PLAYER_PROGRESS };
  }
};

export const savePlayerProgress = (progress: PlayerProgress): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
    return false;
  }
};

export const resetPlayerProgress = (): PlayerProgress => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.warn('Failed to clear localStorage', err);
  }
  return { ...DEFAULT_PLAYER_PROGRESS };
};

// Safe haptic feedback helper
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light', enabled = true) => {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    if (type === 'light') {
      navigator.vibrate(15);
    } else if (type === 'medium') {
      navigator.vibrate(35);
    } else if (type === 'heavy') {
      navigator.vibrate([40, 30, 60]);
    }
  } catch {
    // Silently ignore if denied
  }
};
