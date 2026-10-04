/**
 * Cricket Hit Master - Floating Shot Announcement & Visual Juice
 */

import React from 'react';
import { ShotOutcome, TimingRating } from '../types/game';

interface FloatingAnnouncementProps {
  outcome: ShotOutcome;
  runs: number;
  timing: TimingRating;
  comboCount: number;
  comboMultiplier: number;
}

export const FloatingAnnouncement: React.FC<FloatingAnnouncementProps> = ({
  outcome,
  runs,
  timing,
  comboCount,
  comboMultiplier,
}) => {
  const getBanner = () => {
    switch (outcome) {
      case 'SIX':
        return {
          title: 'SIX!',
          subtitle: 'MAXIMUM RUNS',
          textColor: 'text-amber-300',
          gradient: 'from-amber-500/90 to-yellow-600/90',
          border: 'border-amber-400',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.6)]',
        };
      case 'FOUR':
        return {
          title: 'FOUR!',
          subtitle: 'CRACKING BOUNDARY',
          textColor: 'text-emerald-300',
          gradient: 'from-emerald-600/90 to-teal-700/90',
          border: 'border-emerald-400',
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]',
        };
      case 'TWO':
        return {
          title: '+2 RUNS',
          subtitle: 'QUICK RUNNING',
          textColor: 'text-sky-300',
          gradient: 'from-sky-600/80 to-blue-700/80',
          border: 'border-sky-400',
          glow: 'shadow-[0_0_15px_rgba(14,165,233,0.4)]',
        };
      case 'ONE':
        return {
          title: '+1 RUN',
          subtitle: 'SINGLE TAKEN',
          textColor: 'text-slate-200',
          gradient: 'from-slate-700/80 to-slate-800/80',
          border: 'border-slate-500',
          glow: '',
        };
      case 'WICKET':
        return {
          title: 'OUT!',
          subtitle: 'TIMBER CLATTERED',
          textColor: 'text-rose-400',
          gradient: 'from-red-600/95 to-rose-800/95',
          border: 'border-red-500',
          glow: 'shadow-[0_0_35px_rgba(239,68,68,0.7)]',
        };
      case 'DOT':
        return {
          title: 'DOT BALL',
          subtitle: 'NO RUN',
          textColor: 'text-slate-400',
          gradient: 'from-slate-800/85 to-slate-900/85',
          border: 'border-slate-600',
          glow: '',
        };
    }
  };

  const banner = getBanner();

  return (
    <div className="absolute top-[32%] left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center animate-float-up">
      {/* Combo badge if active */}
      {comboMultiplier > 1 && outcome !== 'WICKET' && (
        <div className="mb-2 px-3 py-1 rounded-full bg-orange-600 text-white font-extrabold text-xs tracking-wider uppercase flex items-center gap-1 shadow-lg animate-pulse border border-orange-400">
          <span>🔥</span>
          <span>COMBO x{comboMultiplier}</span>
        </div>
      )}

      {/* Main Shot Result Pill */}
      <div
        className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${banner.gradient} border-2 ${banner.border} ${banner.glow} flex flex-col items-center backdrop-blur-md`}
      >
        <span className={`font-display text-3xl font-black tracking-wider ${banner.textColor} drop-shadow-md`}>
          {banner.title}
        </span>
        <span className="text-[10px] text-white/90 font-bold tracking-widest uppercase mt-0.5">
          {banner.subtitle}
        </span>
      </div>

      {/* Timing Tag */}
      <span className="mt-1.5 px-2.5 py-0.5 rounded-md bg-black/70 text-slate-300 font-mono text-[11px] font-semibold border border-white/20">
        {timing} TIMING
      </span>
    </div>
  );
};
