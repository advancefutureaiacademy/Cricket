/**
 * Cricket Hit Master - How To Play Guide Modal
 */

import React from 'react';
import { X, PlayCircle, Flame, ShieldAlert, Award, Zap } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose, onStartGame }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="font-display text-xl font-black tracking-wide text-white flex items-center gap-2">
              HOW TO PLAY
            </h2>
            <p className="text-xs text-amber-400 font-medium">Simple to learn, thrilling to master</p>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1">
          {/* Animated Demonstration Graphic */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-950 border border-slate-700/60">
            <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2">The Sweet Spot</p>
            <div className="w-full h-8 bg-slate-900 rounded-lg border border-slate-700 flex items-center px-1 overflow-hidden relative">
              <div className="flex-1 h-full bg-amber-900/30 flex items-center justify-center text-[9px] text-amber-300 font-semibold">
                EARLY
              </div>
              <div className="w-[18%] h-full bg-emerald-950/60 flex items-center justify-center text-[9px] text-emerald-300 font-bold">
                GOOD
              </div>
              <div className="w-[20%] h-full bg-amber-400 flex items-center justify-center text-[10px] text-slate-950 font-black shadow-lg">
                HIT!
              </div>
              <div className="w-[18%] h-full bg-emerald-950/60 flex items-center justify-center text-[9px] text-emerald-300 font-bold">
                GOOD
              </div>
              <div className="flex-1 h-full bg-rose-950/50 flex items-center justify-center text-[9px] text-rose-300 font-semibold">
                LATE
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mt-2 text-center">
              Tap when the ball reaches the batsman crease or the needle hits the golden <span className="text-amber-400 font-bold">HIT!</span> zone.
            </p>
          </div>

          {/* Core Rules List */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Watch the Delivery</h4>
                <p className="text-[11px] text-slate-400">
                  The bowler winds up and delivers the ball down the 22-yard pitch. Watch the bounce!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Timing Dictates Shot Quality</h4>
                <p className="text-[11px] text-slate-400">
                  <span className="text-amber-400 font-semibold">PERFECT</span> gives 60% SIX / 40% FOUR. Late or Missed taps can cause a <span className="text-rose-400 font-semibold">WICKET</span>!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 font-bold text-xs">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Build Up Fire Combos</h4>
                <p className="text-[11px] text-slate-400">
                  Score multiple consecutive hits to trigger <span className="text-orange-400 font-semibold">COMBO x2, x3, x4</span> for massive score boosts and bonus coins!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                4
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Use Power-Ups Smartly</h4>
                <p className="text-[11px] text-slate-400">
                  Activate <span className="text-amber-400 font-semibold">Six Boost</span> for an instant maximum, <span className="text-yellow-400 font-semibold">Perfect Timing</span> to widen the sweet spot, or <span className="text-emerald-400 font-semibold">Extra Life</span> to survive a wicket.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 font-bold text-xs">
                5
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Multiple Input Methods</h4>
                <p className="text-[11px] text-slate-400">
                  Tap anywhere on the field, press the big <span className="text-white font-semibold">TAP TO HIT</span> button, click your mouse, or press <span className="text-amber-400 font-mono">SPACEBAR</span>!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-800 shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
              if (onStartGame) onStartGame();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <PlayCircle size={18} />
            <span>Got It, Let's Play!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
