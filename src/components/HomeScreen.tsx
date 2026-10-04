/**
 * Cricket Hit Master - Home Screen
 */

import React from 'react';
import { Play, Flame, Trophy, HelpCircle, Settings, Coins, Award, Zap, ChevronRight } from 'lucide-react';
import { PlayerProgress } from '../types/game';
import { GAME_CONFIG } from '../types/game';
import { soundEngine } from '../utils/audio';

interface HomeScreenProps {
  progress: PlayerProgress;
  onPlayQuickHit: (level?: number) => void;
  onPlaySuperOver: () => void;
  onOpenChallenges: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onSelectLevel: (lvl: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  onPlayQuickHit,
  onPlaySuperOver,
  onOpenChallenges,
  onOpenHowToPlay,
  onOpenSettings,
  onSelectLevel,
}) => {
  const currentBowler = GAME_CONFIG.BOWLERS.find((b) => b.id === progress.currentLevel) || GAME_CONFIG.BOWLERS[0];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 text-slate-100 overflow-y-auto select-none stadium-gradient">
      {/* Top Bar: Coins & Settings */}
      <div className="flex items-center justify-between pt-1">
        {/* Coins Counter */}
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-md">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
            ¢
          </div>
          <span className="font-display font-bold text-amber-400 text-sm tracking-wide">
            {progress.coins.toLocaleString()}
          </span>
        </div>

        {/* Action icons: How to play & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenHowToPlay();
            }}
            className="w-9 h-9 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white border border-slate-700/60 active:scale-95 transition-all"
            title="How to Play"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-full bg-slate-800/80 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white border border-slate-700/60 active:scale-95 transition-all"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Center Branding & Animated Mascot */}
      <div className="my-auto py-4 flex flex-col items-center text-center">
        {/* Animated Cricket Bat & Ball Badge */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-blue-500/20 blur-xl animate-pulse" />
          
          {/* Circular Badge Ring */}
          <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center relative overflow-hidden">
            {/* Field green grass bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-emerald-700/70 border-t border-emerald-500/40" />

            {/* Crossed Bat & Ball SVG */}
            <svg viewBox="0 0 64 64" className="w-14 h-14 relative z-10 drop-shadow-md">
              {/* Willow Bat */}
              <g transform="rotate(-35 32 32)">
                <rect x="29" y="10" width="6" height="16" rx="2" fill="#334155" />
                <rect x="27" y="24" width="10" height="32" rx="3" fill="#f59e0b" />
                <rect x="28" y="27" width="8" height="6" fill="#dc2626" />
              </g>
              {/* Cricket Ball with White Seam */}
              <circle cx="44" cy="22" r="9" fill="#dc2626" />
              <path d="M37 20 Q44 26 51 22" stroke="#ffffff" strokeWidth="1.8" fill="none" />
            </svg>
          </div>
        </div>

        {/* Game Title */}
        <div className="space-y-0.5">
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 drop-shadow-sm uppercase">
            CRICKET
          </h1>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-widest text-white drop-shadow-md uppercase">
            HIT MASTER
          </h2>
        </div>

        {/* Subtitle */}
        <p className="mt-2 text-xs font-semibold text-amber-400/90 tracking-widest uppercase">
          "Time It. Hit It. Master It."
        </p>

        {/* Quick Stats Pill */}
        <div className="mt-5 grid grid-cols-3 gap-2 w-full max-w-xs bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl shadow-lg text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">High Score</span>
            <p className="text-sm font-display font-bold text-amber-400">{progress.highScore}</p>
          </div>
          <div className="border-x border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Runs</span>
            <p className="text-sm font-display font-bold text-white">{progress.totalRuns.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Level</span>
            <p className="text-sm font-display font-bold text-emerald-400">
              {progress.currentLevel} / {GAME_CONFIG.BOWLERS.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Buttons Section */}
      <div className="w-full max-w-sm mx-auto space-y-2.5 pb-2">
        {/* PLAY NOW (Quick Hit Primary CTA) */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onPlayQuickHit(progress.currentLevel);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-display font-black text-lg tracking-wider uppercase shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 group"
        >
          <Play size={22} fill="currentColor" />
          <span>PLAY NOW</span>
          <span className="text-xs font-sans font-bold bg-slate-950/20 px-2 py-0.5 rounded-full ml-1 text-slate-900">
            Lvl {progress.currentLevel}
          </span>
        </button>

        {/* SUPER OVER Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onPlaySuperOver();
          }}
          className="w-full py-3 px-5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white font-display font-bold text-sm tracking-wider uppercase shadow-md active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Flame className="text-orange-400" size={18} />
            <span>SUPER OVER</span>
          </div>
          <span className="text-[11px] font-sans font-semibold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-md border border-orange-700/40">
            6 Balls Frenzy
          </span>
        </button>

        {/* CHALLENGE Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenChallenges();
          }}
          className="w-full py-3 px-5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-white font-display font-bold text-sm tracking-wider uppercase shadow-md active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={18} />
            <span>CHALLENGE MODE</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span>Targets</span>
            <ChevronRight size={16} />
          </div>
        </button>

        {/* Level Selector Scroller (If multiple levels unlocked) */}
        {progress.unlockedLevels > 1 && (
          <div className="pt-1 flex items-center justify-center gap-1.5 overflow-x-auto py-1">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">LEVEL:</span>
            {GAME_CONFIG.BOWLERS.map((bowler) => {
              const isUnlocked = bowler.id <= progress.unlockedLevels;
              const isSelected = bowler.id === progress.currentLevel;

              return (
                <button
                  key={bowler.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    if (isUnlocked) {
                      soundEngine.playClick();
                      onSelectLevel(bowler.id);
                    }
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : isUnlocked
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                  }`}
                  title={`${bowler.name} (${bowler.difficultyLabel})`}
                >
                  {bowler.id}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
