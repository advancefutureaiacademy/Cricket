/**
 * Cricket Hit Master - Pause Modal
 */

import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onHome,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col items-center animate-scaleIn">
        <h2 className="font-display text-2xl font-black tracking-wider text-white mb-1">
          MATCH PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">Take a breath, champion</p>

        <div className="w-full space-y-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-display font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <Play size={18} fill="currentColor" />
            <span>Resume Match</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            <span>Restart Match</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onHome();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-sm tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Home size={18} />
            <span>Quit to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
