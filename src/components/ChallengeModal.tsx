/**
 * Cricket Hit Master - Challenge Mode Selector Modal
 */

import React from 'react';
import { X, Trophy, CheckCircle2, Lock, Flame, Shield, Target } from 'lucide-react';
import { ChallengeTarget } from '../types/game';
import { GAME_CONFIG } from '../types/game';
import { soundEngine } from '../utils/audio';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChallenge: (challenge: ChallengeTarget) => void;
  completedChallenges: string[];
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  onSelectChallenge,
  completedChallenges,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[88vh] animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="font-display text-xl font-black tracking-wide text-white flex items-center gap-2">
              <Target className="text-amber-400" size={22} />
              <span>CHALLENGE MODE</span>
            </h2>
            <p className="text-xs text-slate-400">Complete objectives to earn massive coin bounties</p>
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

        {/* Challenge Cards List */}
        <div className="py-4 space-y-3 overflow-y-auto pr-1">
          {GAME_CONFIG.CHALLENGES.map((challenge, idx) => {
            const isCompleted = completedChallenges.includes(challenge.id);

            return (
              <div
                key={challenge.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-800/50 border-slate-700/60 hover:border-amber-500/50 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {idx === 0 && <Target size={18} />}
                      {idx === 1 && <Flame size={18} />}
                      {idx === 2 && <Trophy size={18} />}
                      {idx === 3 && <Shield size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {challenge.title}
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 size={12} /> COMPLETED
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{challenge.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-400 font-medium">
                    <span>{challenge.balls} Balls</span>
                    <span>·</span>
                    <span className="text-amber-400 font-semibold">+{challenge.rewardCoins} Coins</span>
                  </div>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectChallenge(challenge);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      isCompleted
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                    }`}
                  >
                    {isCompleted ? 'Replay' : 'Play Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
