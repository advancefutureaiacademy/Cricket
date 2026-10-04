/**
 * Cricket Hit Master - Main Application Orchestrator
 */

import React, { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { GamePlayScreen } from './game/GamePlayScreen';
import { ResultScreen } from './components/ResultScreen';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SettingsModal } from './components/SettingsModal';
import { ChallengeModal } from './components/ChallengeModal';
import {
  ChallengeTarget,
  GameMode,
  GameState,
  MatchStats,
  PlayerProgress,
  GAME_CONFIG,
} from './types/game';
import {
  loadPlayerProgress,
  savePlayerProgress,
  resetPlayerProgress,
} from './utils/storage';
import { soundEngine } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [currentMode, setCurrentMode] = useState<GameMode>('QUICK_HIT');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeTarget | undefined>(undefined);

  // Player progress & statistics
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress);
  const [lastMatchStats, setLastMatchStats] = useState<MatchStats | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Modals
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState(false);

  // Sync sound settings to soundEngine on boot
  useEffect(() => {
    soundEngine.setSoundEnabled(progress.settings.sound);
    soundEngine.setCrowdEnabled(progress.settings.crowd);
  }, [progress.settings]);

  // Persist progress to localStorage whenever it changes
  useEffect(() => {
    savePlayerProgress(progress);
  }, [progress]);

  // Start Quick Hit Match
  const handlePlayQuickHit = (level = 1) => {
    setSelectedLevel(level);
    setCurrentMode('QUICK_HIT');
    setActiveChallenge(undefined);
    setGameState('BOWLING');
  };

  // Start Super Over Match
  const handlePlaySuperOver = () => {
    // Super Over bowler is challenging fast bowler (Level 3 or 6)
    setSelectedLevel(Math.min(3, progress.unlockedLevels));
    setCurrentMode('SUPER_OVER');
    setActiveChallenge(undefined);
    setGameState('BOWLING');
  };

  // Select Challenge
  const handleSelectChallenge = (challenge: ChallengeTarget) => {
    setActiveChallenge(challenge);
    setCurrentMode('CHALLENGE');
    setSelectedLevel(2);
    setIsChallengesOpen(false);
    setGameState('BOWLING');
  };

  // Handle Match Completed
  const handleMatchComplete = (stats: MatchStats, coinsEarned: number) => {
    const isHigh = stats.score > progress.highScore;
    setIsNewHighScore(isHigh);
    setLastMatchStats(stats);

    // Update player progress
    setProgress((prev) => {
      const nextHighScore = Math.max(prev.highScore, stats.score);
      const nextHighestCombo = Math.max(prev.highestCombo, stats.highestCombo);
      const nextTotalRuns = prev.totalRuns + stats.score;
      const nextSixes = prev.totalSixes + stats.sixes;
      const nextFours = prev.totalFours + stats.fours;
      const nextCoins = prev.coins + coinsEarned;

      // Unlock next level if score >= 12 or challenge completed
      let nextUnlocked = prev.unlockedLevels;
      let nextCurrentLevel = prev.currentLevel;
      if (stats.mode === 'QUICK_HIT' && stats.score >= 12 && stats.level === prev.unlockedLevels) {
        nextUnlocked = Math.min(GAME_CONFIG.BOWLERS.length, prev.unlockedLevels + 1);
        nextCurrentLevel = nextUnlocked;
      }

      // Mark challenge completed
      const nextCompletedChallenges = [...prev.completedChallenges];
      if (stats.challengeCompleted && stats.challengeId && !nextCompletedChallenges.includes(stats.challengeId)) {
        nextCompletedChallenges.push(stats.challengeId);
      }

      return {
        ...prev,
        highScore: nextHighScore,
        highestCombo: nextHighestCombo,
        totalRuns: nextTotalRuns,
        totalSixes: nextSixes,
        totalFours: nextFours,
        totalMatches: prev.totalMatches + 1,
        coins: nextCoins,
        unlockedLevels: nextUnlocked,
        currentLevel: nextCurrentLevel,
        completedChallenges: nextCompletedChallenges,
      };
    });

    setGameState('RESULT');
  };

  // Power Up inventory handlers
  const handleUsePowerUp = (powerUpId: 'six_boost' | 'perfect_timing' | 'extra_life') => {
    setProgress((prev) => ({
      ...prev,
      powerUps: {
        ...prev.powerUps,
        [powerUpId]: Math.max(0, prev.powerUps[powerUpId] - 1),
      },
    }));
  };

  const handleBuyPowerUp = (
    powerUpId: 'six_boost' | 'perfect_timing' | 'extra_life',
    cost: number
  ): boolean => {
    if (progress.coins < cost) return false;
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      powerUps: {
        ...prev.powerUps,
        [powerUpId]: prev.powerUps[powerUpId] + 1,
      },
    }));
    return true;
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: { sound: boolean; crowd: boolean; vibration: boolean }) => {
    setProgress((prev) => ({
      ...prev,
      settings: newSettings,
    }));
  };

  // Reset Progress
  const handleResetProgress = () => {
    const fresh = resetPlayerProgress();
    setProgress(fresh);
    setIsSettingsOpen(false);
    setGameState('HOME');
  };

  return (
    <div className="w-screen h-screen bg-[#060b14] flex items-center justify-center overflow-hidden touch-none select-none">
      {/* Container scaled responsively: fills phone screen, centered smartphone container on desktop */}
      <div className="relative w-full h-full sm:max-w-[430px] sm:max-h-[915px] sm:h-[95vh] sm:rounded-[36px] bg-[#091120] sm:border sm:border-slate-800 sm:shadow-2xl overflow-hidden flex flex-col">
        {/* State Routing */}
        {gameState === 'HOME' && (
          <HomeScreen
            progress={progress}
            onPlayQuickHit={handlePlayQuickHit}
            onPlaySuperOver={handlePlaySuperOver}
            onOpenChallenges={() => setIsChallengesOpen(true)}
            onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onSelectLevel={(lvl) => {
              setSelectedLevel(lvl);
              setProgress((p) => ({ ...p, currentLevel: lvl }));
            }}
          />
        )}

        {(gameState === 'BOWLING' || gameState === 'PLAYING') && (
          <GamePlayScreen
            mode={currentMode}
            level={selectedLevel}
            challenge={activeChallenge}
            progress={progress}
            onMatchComplete={handleMatchComplete}
            onHome={() => setGameState('HOME')}
            onUpdateCoins={(newCoins) => setProgress((p) => ({ ...p, coins: newCoins }))}
            onUsePowerUp={handleUsePowerUp}
            onBuyPowerUp={handleBuyPowerUp}
          />
        )}

        {gameState === 'RESULT' && lastMatchStats && (
          <ResultScreen
            stats={lastMatchStats}
            progress={progress}
            isNewHighScore={isNewHighScore}
            onPlayAgain={() => {
              setGameState('BOWLING');
            }}
            onNextLevel={() => {
              const nextLvl = Math.min(GAME_CONFIG.BOWLERS.length, lastMatchStats.level + 1);
              setSelectedLevel(nextLvl);
              setGameState('BOWLING');
            }}
            onHome={() => setGameState('HOME')}
            hasNextLevel={lastMatchStats.level < GAME_CONFIG.BOWLERS.length}
          />
        )}

        {/* Global Modals */}
        <HowToPlayModal
          isOpen={isHowToPlayOpen}
          onClose={() => setIsHowToPlayOpen(false)}
          onStartGame={() => {
            setIsHowToPlayOpen(false);
            handlePlayQuickHit(progress.currentLevel);
          }}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={progress.settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
        />

        <ChallengeModal
          isOpen={isChallengesOpen}
          onClose={() => setIsChallengesOpen(false)}
          onSelectChallenge={handleSelectChallenge}
          completedChallenges={progress.completedChallenges}
        />
      </div>
    </div>
  );
}
