/**
 * Cricket Hit Master - Match Result Screen
 */

import React, { useEffect, useState } from 'react';
import { Trophy, Coins, RotateCcw, Home, ArrowRight, Flame, Target, CheckCircle2 } from 'lucide-react';
import { MatchStats, PlayerProgress } from '../types/game';
import { soundEngine } from '../utils/audio';

interface ResultScreenProps {
  stats: MatchStats;
  progress: PlayerProgress;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onNextLevel: () => void;
  onHome: () => void;
  hasNextLevel: boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  stats,
  progress,
  isNewHighScore,
  onPlayAgain,
  onNextLevel,
  onHome,
  hasNextLevel,
}) => {
  const [animatedCoins, setAnimatedCoins] = useState(0);

  // Play coin tally effect
  useEffect(() => {
    let current = 0;
    const target = stats.coinsEarned;
    if (target === 0) return;

    const step = Math.max(1, Math.floor(target / 15));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setAnimatedCoins(target);
        clearInterval(timer);
      } else {
        setAnimatedCoins(current);
        soundEngine.playCoin();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [stats.coinsEarned]);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-5 text-slate-100 overflow-y-auto animate-fadeIn">
      {/* Top Banner */}
      <div className="text-center pt-2">
        {isNewHighScore && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black tracking-wider uppercase mb-2 animate-bounce">
            <Trophy size={14} />
            <span>🏆 NEW HIGH SCORE!</span>
          </div>
        )}

        <h1 className="font-display text-3xl font-black tracking-wider text-white">
          MATCH COMPLETE
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">
          {stats.mode === 'SUPER_OVER'
            ? 'Super Over Finale'
            : stats.mode === 'CHALLENGE'
            ? 'Challenge Target Summary'
            : `Level ${stats.level} Quick Hit`}
        </p>

        {stats.mode === 'CHALLENGE' && stats.challengeCompleted && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold">
            <CheckCircle2 size={14} />
            <span>CHALLENGE ACCOMPLISHED!</span>
          </div>
        )}
      </div>

      {/* Main Score Card */}
      <div className="w-full max-w-sm mx-auto my-3 p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
        {/* Score & Run Rate */}
        <div className="text-center py-2 border-b border-slate-800">
          <div className="font-display text-6xl font-black text-amber-400 tracking-tight drop-shadow-lg">
            {stats.score}
            <span className="text-lg text-slate-400 font-sans font-normal ml-1">Runs</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.ballsFaced} Balls Faced · {stats.wickets} Wickets Lost
          </p>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Sixes</span>
            <p className="text-xl font-display font-bold text-amber-400">{stats.sixes}</p>
          </div>
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Fours</span>
            <p className="text-xl font-display font-bold text-emerald-400">{stats.fours}</p>
          </div>
          <div className="p-2 rounded-2xl bg-slate-800/60 border border-slate-700/40">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Best Timing</span>
            <p className="text-xs font-display font-bold text-sky-400 mt-1 truncate">
              {stats.bestTiming === 'NONE' ? '-' : stats.bestTiming}
            </p>
          </div>
        </div>

        {/* Best Combo & High Score */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs px-2 text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Flame size={14} className="text-orange-400" />
              Highest Combo
            </span>
            <span className="font-bold text-orange-400">
              {stats.highestCombo > 1 ? `x${stats.highestCombo}` : 'None'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs px-2 text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Trophy size={14} className="text-yellow-400" />
              All-Time High Score
            </span>
            <span className="font-bold text-yellow-400">{progress.highScore} Runs</span>
          </div>

          {/* Coins Earned Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Coins size={16} />
              </div>
              <span className="text-xs font-bold text-slate-200">Coins Earned</span>
            </div>
            <span className="font-display font-black text-lg text-amber-400">
              +{animatedCoins}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm mx-auto space-y-2.5 pt-2 pb-1">
        {hasNextLevel && stats.mode === 'QUICK_HIT' && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onNextLevel();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <span>Play Next Level ({stats.level + 1})</span>
            <ArrowRight size={18} />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-black text-xs tracking-wider uppercase shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={16} />
            <span>Play Again</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onHome();
            }}
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs tracking-wider uppercase active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
          >
            <Home size={16} />
            <span>Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
