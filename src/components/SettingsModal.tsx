/**
 * Cricket Hit Master - Settings Modal
 */

import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Smartphone, RotateCcw, X, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    sound: boolean;
    crowd: boolean;
    vibration: boolean;
  };
  onUpdateSettings: (newSettings: { sound: boolean; crowd: boolean; vibration: boolean }) => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const toggleSound = () => {
    const next = !settings.sound;
    soundEngine.setSoundEnabled(next);
    if (next) soundEngine.playClick();
    onUpdateSettings({ ...settings, sound: next });
  };

  const toggleCrowd = () => {
    const next = !settings.crowd;
    soundEngine.setCrowdEnabled(next);
    soundEngine.playClick();
    onUpdateSettings({ ...settings, crowd: next });
  };

  const toggleVibration = () => {
    soundEngine.playClick();
    onUpdateSettings({ ...settings, vibration: !settings.vibration });
  };

  const handleReset = () => {
    onResetProgress();
    setShowConfirmReset(false);
    soundEngine.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="font-display text-xl font-bold tracking-wide text-white flex items-center gap-2">
            SETTINGS
          </h2>
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

        {/* Options */}
        <div className="py-4 space-y-3.5">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                {settings.sound ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-100">Sound Effects</p>
                <p className="text-xs text-slate-400">Bat hits, wickets, cheers</p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-13 h-7 rounded-full p-1 transition-colors flex items-center ${
                settings.sound ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Crowd Ambience */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Radio size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-100">Crowd Atmosphere</p>
                <p className="text-xs text-slate-400">Stadium roar on boundaries</p>
              </div>
            </div>
            <button
              onClick={toggleCrowd}
              className={`w-13 h-7 rounded-full p-1 transition-colors flex items-center ${
                settings.crowd ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Vibration / Haptic */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-100">Vibration Feedback</p>
                <p className="text-xs text-slate-400">Haptics on hit and wickets</p>
              </div>
            </div>
            <button
              onClick={toggleVibration}
              className={`w-13 h-7 rounded-full p-1 transition-colors flex items-center ${
                settings.vibration ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Reset Progress Section */}
          <div className="pt-2">
            {!showConfirmReset ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowConfirmReset(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-900/60 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset Game Progress</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-center space-y-2.5">
                <p className="text-xs text-rose-200">
                  Are you sure? This will reset all high scores, coins, and unlocked levels!
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500">Cricket Hit Master · v1.0.0 Mobile Edition</p>
        </div>
      </div>
    </div>
  );
};
