/**
 * Cricket Hit Master - Precision Timing Meter
 * Displays the timing zones: EARLY | GOOD | PERFECT | GOOD | LATE
 * With real-time moving needle and hit evaluation feedback.
 */

import React from 'react';
import { TimingRating } from '../types/game';

interface TimingMeterProps {
  progress: number; // 0 to 1
  isBowling: boolean;
  lastRating: TimingRating | null;
  lastDeltaMs: number | null;
  isPerfectTimingBoosted?: boolean;
}

export const TimingMeter: React.FC<TimingMeterProps> = ({
  progress,
  isBowling,
  lastRating,
  lastDeltaMs,
  isPerfectTimingBoosted = false,
}) => {
  // Needle position across the bar (0% to 100%)
  // Ball delivery hit window is aligned so progress 1.0 (or ~0.95 at crease) maps to 50% (center)
  // When bowling, needle travels from 5% to 95%
  const needlePercent = isBowling
    ? Math.min(100, Math.max(0, (progress - 0.2) * 125))
    : lastDeltaMs !== null
    ? Math.min(95, Math.max(5, 50 + (lastDeltaMs / 250) * 45))
    : 50;

  const getRatingBadge = (rating: TimingRating) => {
    switch (rating) {
      case 'PERFECT':
        return { text: 'PERFECT!', bg: 'bg-amber-500 text-slate-950 font-bold', border: 'border-amber-300' };
      case 'EXCELLENT':
        return { text: 'EXCELLENT!', bg: 'bg-emerald-500 text-slate-950 font-bold', border: 'border-emerald-300' };
      case 'GOOD':
        return { text: 'GOOD', bg: 'bg-sky-500 text-slate-950 font-semibold', border: 'border-sky-300' };
      case 'EARLY':
        return { text: 'EARLY', bg: 'bg-amber-600 text-white font-medium', border: 'border-amber-500' };
      case 'LATE':
        return { text: 'LATE', bg: 'bg-rose-600 text-white font-medium', border: 'border-rose-400' };
      case 'MISS':
        return { text: 'MISSED', bg: 'bg-red-700 text-white font-medium', border: 'border-red-500' };
      default:
        return null;
    }
  };

  const badge = lastRating ? getRatingBadge(lastRating) : null;

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-1.5 flex flex-col items-center">
      {/* Upper readout: Rating & Milliseconds */}
      <div className="flex items-center justify-between w-full h-6 mb-1 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-medium tracking-wider uppercase">Timing Meter</span>
          {isPerfectTimingBoosted && (
            <span className="text-[10px] text-amber-400 font-semibold tracking-wide bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/50">
              ⚡ WIDE SWEET SPOT
            </span>
          )}
        </div>

        {badge && (
          <div className="flex items-center gap-1.5 animate-fadeIn">
            <span className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wide shadow-sm ${badge.bg}`}>
              {badge.text}
            </span>
            {lastDeltaMs !== null && (
              <span className="text-[10px] text-slate-300 font-mono">
                {lastDeltaMs > 0 ? `+${Math.round(lastDeltaMs)}ms` : `${Math.round(lastDeltaMs)}ms`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Meter Bar Container */}
      <div className="relative w-full h-7 bg-slate-900/90 rounded-lg p-0.5 border border-slate-700/80 shadow-inner flex items-center overflow-hidden">
        {/* Early Zone */}
        <div className="flex-1 h-full bg-amber-900/40 border-r border-amber-700/30 flex items-center justify-center">
          <span className="text-[9px] text-amber-300/80 font-bold tracking-widest uppercase">EARLY</span>
        </div>

        {/* Good Zone (Left) */}
        <div className="w-[18%] h-full bg-emerald-950/60 border-r border-emerald-500/40 flex items-center justify-center">
          <span className="text-[9px] text-emerald-300/90 font-bold uppercase">GOOD</span>
        </div>

        {/* PERFECT Sweet Spot (Center) */}
        <div
          className={`h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg relative ${
            isPerfectTimingBoosted ? 'w-[28%]' : 'w-[18%]'
          }`}
        >
          <span className="text-[10px] text-slate-950 font-black tracking-wider uppercase drop-shadow-sm animate-pulse">
            HIT!
          </span>
          <div className="absolute inset-0 bg-white/20 animate-ping opacity-25 pointer-events-none" />
        </div>

        {/* Good Zone (Right) */}
        <div className="w-[18%] h-full bg-emerald-950/60 border-l border-emerald-500/40 flex items-center justify-center">
          <span className="text-[9px] text-emerald-300/90 font-bold uppercase">GOOD</span>
        </div>

        {/* Late Zone */}
        <div className="flex-1 h-full bg-rose-950/50 border-l border-rose-700/30 flex items-center justify-center">
          <span className="text-[9px] text-rose-300/80 font-bold tracking-widest uppercase">LATE</span>
        </div>

        {/* Moving Needle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_#ffffff] transition-all duration-75 ease-linear pointer-events-none z-10 -ml-0.5"
          style={{ left: `${needlePercent}%` }}
        >
          <div className="w-2.5 h-2 bg-yellow-400 absolute -top-1 -left-[3px] rotate-45 border border-slate-950" />
          <div className="w-2.5 h-2 bg-yellow-400 absolute -bottom-1 -left-[3px] rotate-45 border border-slate-950" />
        </div>
      </div>
    </div>
  );
};
