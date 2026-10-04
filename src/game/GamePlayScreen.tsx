/**
 * Cricket Hit Master - Main Gameplay Screen
 * Integrates Top HUD, Cricket Pitch Canvas, Power-Up Bar, Timing Meter, and Thumb-Friendly Hit CTA.
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Pause, Flame, Zap, Shield, Sparkles, Coins, RefreshCw } from 'lucide-react';
import { CricketCanvas } from './CricketCanvas';
import { TimingMeter } from '../components/TimingMeter';
import { FloatingAnnouncement } from '../components/FloatingAnnouncement';
import { PauseModal } from '../components/PauseModal';
import {
  BowlerProfile,
  ChallengeTarget,
  GameMode,
  MatchStats,
  PlayerProgress,
  PowerUp,
  ShotOutcome,
  ShotResult,
  TimingRating,
  GAME_CONFIG,
} from '../types/game';
import { soundEngine } from '../utils/audio';
import { triggerHaptic } from '../utils/storage';

interface GamePlayScreenProps {
  mode: GameMode;
  level: number;
  challenge?: ChallengeTarget;
  progress: PlayerProgress;
  onMatchComplete: (stats: MatchStats, coinsEarned: number) => void;
  onHome: () => void;
  onUpdateCoins: (newCoins: number) => void;
  onUsePowerUp: (powerUpId: 'six_boost' | 'perfect_timing' | 'extra_life') => void;
  onBuyPowerUp: (powerUpId: 'six_boost' | 'perfect_timing' | 'extra_life', cost: number) => boolean;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  mode,
  level,
  challenge,
  progress,
  onMatchComplete,
  onHome,
  onUpdateCoins,
  onUsePowerUp,
  onBuyPowerUp,
}) => {
  // Find current bowler
  const bowler: BowlerProfile =
    GAME_CONFIG.BOWLERS.find((b) => b.id === level) || GAME_CONFIG.BOWLERS[0];

  const maxBalls = mode === 'SUPER_OVER' ? 6 : challenge ? challenge.balls : 10;
  const maxWickets = challenge?.maxWickets || 10;

  // Match State
  const [matchStats, setMatchStats] = useState<MatchStats>({
    score: 0,
    ballsFaced: 0,
    maxBalls,
    wickets: 0,
    maxWickets,
    sixes: 0,
    fours: 0,
    dotBalls: 0,
    singles: 0,
    doubles: 0,
    bestTiming: 'NONE',
    highestCombo: 0,
    currentCombo: 0,
    coinsEarned: 0,
    shotHistory: [],
    level,
    mode,
    challengeId: challenge?.id,
  });

  // Active power-up buffs for next delivery
  const [activeSixBoost, setActiveSixBoost] = useState(false);
  const [activePerfectTiming, setActivePerfectTiming] = useState(false);
  const [activeExtraLife, setActiveExtraLife] = useState(false);

  // Delivery Loop State
  const [isPaused, setIsPaused] = useState(false);
  const [isBowling, setIsBowling] = useState(false);
  const [ballProgress, setBallProgress] = useState(0); // 0 to 1
  const [deliveryPhase, setDeliveryPhase] = useState<'READY' | 'RUN_UP' | 'IN_AIR' | 'RESOLVED'>(
    'READY'
  );

  // Hit & Timing Evaluation State
  const [lastHitResult, setLastHitResult] = useState<ShotResult | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [isOutEffect, setIsOutEffect] = useState(false);

  // Timing references for precision calculation
  const deliveryStartTimeRef = useRef<number>(0);
  const deliveryIdealHitTimeRef = useRef<number>(0);
  const hasHitThisBallRef = useRef<boolean>(false);
  const animFrameRef = useRef<number>(0);

  // Safe PowerUp Counts from props
  const powerUpInventory = progress.powerUps;

  // Start next ball delivery
  const startNewDelivery = useCallback(() => {
    if (isPaused) return;

    hasHitThisBallRef.current = false;
    setShowAnnouncement(false);
    setIsOutEffect(false);
    setShakeScreen(false);
    setBallProgress(0);
    setDeliveryPhase('RUN_UP');
    setIsBowling(true);

    const now = performance.now();
    deliveryStartTimeRef.current = now;
    // The ideal moment to hit is at ~94% of the delivery duration
    const duration = bowler.deliveryDurationMs;
    deliveryIdealHitTimeRef.current = now + duration * 0.94;

    const runDeliveryFrame = (timestamp: number) => {
      const elapsed = timestamp - deliveryStartTimeRef.current;
      const progressRatio = Math.min(1.0, elapsed / duration);
      setBallProgress(progressRatio);

      if (progressRatio >= 0.15 && deliveryPhase !== 'IN_AIR') {
        setDeliveryPhase('IN_AIR');
      }

      // Ball reached batsman without tap -> MISS / VERY LATE
      if (progressRatio >= 1.0 && !hasHitThisBallRef.current) {
        handleBallPassed();
        return;
      }

      if (!hasHitThisBallRef.current && progressRatio < 1.0) {
        animFrameRef.current = requestAnimationFrame(runDeliveryFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(runDeliveryFrame);
  }, [bowler.deliveryDurationMs, isPaused, deliveryPhase]);

  // Handle when ball passes batsman untouched
  const handleBallPassed = () => {
    if (hasHitThisBallRef.current) return;
    hasHitThisBallRef.current = true;
    setIsBowling(false);
    evaluateShot('MISS', 350);
  };

  // Evaluate Timing & Shot Outcome
  const evaluateShot = (forcedTiming?: TimingRating, deltaOverride?: number) => {
    const now = performance.now();
    const deltaMs = deltaOverride !== undefined ? deltaOverride : now - deliveryIdealHitTimeRef.current;
    // deltaMs < 0 = early, deltaMs > 0 = late

    let timingRating: TimingRating = forcedTiming || 'MISS';

    if (!forcedTiming) {
      const windows = GAME_CONFIG.TIMING_WINDOWS;
      const perfectLimit = activePerfectTiming ? windows.PERFECT * 1.8 : windows.PERFECT;
      const excellentLimit = activePerfectTiming ? windows.EXCELLENT * 1.4 : windows.EXCELLENT;
      const absDelta = Math.abs(deltaMs);

      if (absDelta <= perfectLimit) {
        timingRating = 'PERFECT';
      } else if (absDelta <= excellentLimit) {
        timingRating = 'EXCELLENT';
      } else if (absDelta <= windows.GOOD) {
        timingRating = 'GOOD';
      } else if (deltaMs < -windows.GOOD && deltaMs >= -windows.EARLY_MAX) {
        timingRating = 'EARLY';
      } else if (deltaMs > windows.GOOD && deltaMs <= windows.LATE_MAX) {
        timingRating = 'LATE';
      } else {
        timingRating = 'MISS';
      }
    }

    // Determine shot outcome
    let outcome: ShotOutcome = 'DOT';
    const rand = Math.random();

    if (activeSixBoost && (timingRating === 'PERFECT' || timingRating === 'EXCELLENT' || timingRating === 'GOOD')) {
      outcome = 'SIX';
    } else {
      switch (timingRating) {
        case 'PERFECT':
          outcome = rand < GAME_CONFIG.OUTCOME_PROBABILITIES.PERFECT.SIX ? 'SIX' : 'FOUR';
          break;
        case 'EXCELLENT':
          outcome = rand < GAME_CONFIG.OUTCOME_PROBABILITIES.EXCELLENT.FOUR ? 'FOUR' : 'SIX';
          break;
        case 'GOOD':
          if (rand < GAME_CONFIG.OUTCOME_PROBABILITIES.GOOD.ONE) outcome = 'ONE';
          else if (rand < GAME_CONFIG.OUTCOME_PROBABILITIES.GOOD.ONE + GAME_CONFIG.OUTCOME_PROBABILITIES.GOOD.TWO)
            outcome = 'TWO';
          else outcome = 'FOUR';
          break;
        case 'EARLY':
          outcome = rand < GAME_CONFIG.OUTCOME_PROBABILITIES.EARLY.DOT ? 'DOT' : 'ONE';
          break;
        case 'LATE':
          outcome = rand < GAME_CONFIG.OUTCOME_PROBABILITIES.LATE.DOT ? 'DOT' : 'WICKET';
          break;
        case 'MISS':
          outcome = rand < GAME_CONFIG.OUTCOME_PROBABILITIES.MISS.WICKET ? 'WICKET' : 'DOT';
          break;
      }
    }

    // Check Extra Life shield
    let isWicket = outcome === 'WICKET';
    if (isWicket && activeExtraLife) {
      outcome = 'DOT';
      isWicket = false;
      setActiveExtraLife(false);
      soundEngine.playDot();
    }

    // Reset single-use powerups
    if (activeSixBoost) setActiveSixBoost(false);
    if (activePerfectTiming) setActivePerfectTiming(false);

    // Calculate runs & combo
    let runs = 0;
    if (outcome === 'SIX') runs = 6;
    else if (outcome === 'FOUR') runs = 4;
    else if (outcome === 'TWO') runs = 2;
    else if (outcome === 'ONE') runs = 1;

    // Combo system
    let nextCombo = matchStats.currentCombo;
    let comboMultiplier = 1;
    if (runs > 0) {
      nextCombo += 1;
      if (nextCombo >= 7) comboMultiplier = 4;
      else if (nextCombo >= 5) comboMultiplier = 3;
      else if (nextCombo >= 3) comboMultiplier = 2;
    } else {
      nextCombo = 0;
    }

    // Coins calculation
    let coinsEarned = runs * GAME_CONFIG.COIN_REWARDS.RUN;
    if (outcome === 'FOUR') coinsEarned += GAME_CONFIG.COIN_REWARDS.FOUR;
    if (outcome === 'SIX') coinsEarned += GAME_CONFIG.COIN_REWARDS.SIX;
    if (timingRating === 'PERFECT') coinsEarned += GAME_CONFIG.COIN_REWARDS.PERFECT_BONUS;
    if (comboMultiplier > 1) coinsEarned += GAME_CONFIG.COIN_REWARDS.COMBO_BONUS;

    // Audio & Haptics Feedback
    if (outcome === 'SIX') {
      soundEngine.playBatHit('PERFECT');
      soundEngine.playSix();
      setShakeScreen(true);
      triggerHaptic('heavy', progress.settings.vibration);
    } else if (outcome === 'FOUR') {
      soundEngine.playBatHit(timingRating as any);
      soundEngine.playFour();
      triggerHaptic('medium', progress.settings.vibration);
    } else if (runs > 0) {
      soundEngine.playBatHit(timingRating as any);
      triggerHaptic('light', progress.settings.vibration);
    } else if (isWicket) {
      soundEngine.playWicket();
      setIsOutEffect(true);
      setShakeScreen(true);
      triggerHaptic('heavy', progress.settings.vibration);
    } else {
      soundEngine.playDot();
      triggerHaptic('light', progress.settings.vibration);
    }

    if (comboMultiplier > 1 && (nextCombo === 3 || nextCombo === 5 || nextCombo === 7)) {
      setTimeout(() => soundEngine.playCombo(comboMultiplier), 300);
    }

    const shotResult: ShotResult = {
      timing: timingRating,
      outcome,
      runs,
      timingDeltaMs: deltaMs,
      message: outcome,
      isBoundary: outcome === 'FOUR' || outcome === 'SIX',
      isSix: outcome === 'SIX',
      isWicket,
      comboCount: nextCombo,
      comboMultiplier,
      coinsEarned,
    };

    setLastHitResult(shotResult);
    setShowAnnouncement(true);

    // Update match stats
    setMatchStats((prev) => {
      const nextBalls = prev.ballsFaced + 1;
      const nextWickets = prev.wickets + (isWicket ? 1 : 0);
      const nextScore = prev.score + runs;
      const nextCoins = prev.coinsEarned + coinsEarned;
      const nextSixes = prev.sixes + (outcome === 'SIX' ? 1 : 0);
      const nextFours = prev.fours + (outcome === 'FOUR' ? 1 : 0);
      const nextHighestCombo = Math.max(prev.highestCombo, nextCombo);

      // Best timing evaluation
      let bestTiming = prev.bestTiming;
      const rankOrder = ['PERFECT', 'EXCELLENT', 'GOOD', 'EARLY', 'LATE', 'MISS', 'NONE'];
      if (rankOrder.indexOf(timingRating) < rankOrder.indexOf(bestTiming)) {
        bestTiming = timingRating;
      }

      return {
        ...prev,
        score: nextScore,
        ballsFaced: nextBalls,
        wickets: nextWickets,
        sixes: nextSixes,
        fours: nextFours,
        dotBalls: prev.dotBalls + (runs === 0 && !isWicket ? 1 : 0),
        singles: prev.singles + (runs === 1 ? 1 : 0),
        doubles: prev.doubles + (runs === 2 ? 1 : 0),
        bestTiming,
        highestCombo: nextHighestCombo,
        currentCombo: nextCombo,
        coinsEarned: nextCoins,
        shotHistory: [...prev.shotHistory, shotResult],
      };
    });

    // Schedule next delivery or match end
    setDeliveryPhase('RESOLVED');
    setTimeout(() => {
      checkMatchStatus();
    }, 1400);
  };

  // Check if match should continue or complete
  const checkMatchStatus = useCallback(() => {
    setMatchStats((currentStats) => {
      const isBallsFinished = currentStats.ballsFaced >= maxBalls;
      const isAllOut = currentStats.wickets >= maxWickets;

      // Challenge criteria check
      let challengeSuccess = false;
      if (challenge) {
        const metRuns = !challenge.targetRuns || currentStats.score >= challenge.targetRuns;
        const metSixes = !challenge.targetSixes || currentStats.sixes >= challenge.targetSixes;
        const metFours = !challenge.targetFours || currentStats.fours >= challenge.targetFours;
        const safeWickets = !challenge.maxWickets || currentStats.wickets <= challenge.maxWickets;
        challengeSuccess = metRuns && metSixes && metFours && safeWickets;
      }

      if (isBallsFinished || isAllOut || (challenge && challengeSuccess)) {
        const finalCoins = currentStats.coinsEarned + (challenge && challengeSuccess ? challenge.rewardCoins : 0);
        onUpdateCoins(progress.coins + finalCoins);
        onMatchComplete(
          {
            ...currentStats,
            challengeCompleted: challengeSuccess,
          },
          finalCoins
        );
        return currentStats;
      }

      // Next ball
      startNewDelivery();
      return currentStats;
    });
  }, [maxBalls, maxWickets, challenge, onUpdateCoins, progress.coins, onMatchComplete, startNewDelivery]);

  // User Tap / Hit Handler
  const handleUserTap = useCallback(() => {
    if (isPaused) return;

    // If waiting between balls, can tap to skip delay
    if (!isBowling) {
      if (deliveryPhase === 'READY') {
        startNewDelivery();
      }
      return;
    }

    if (hasHitThisBallRef.current) return;
    hasHitThisBallRef.current = true;
    cancelAnimationFrame(animFrameRef.current);
    setIsBowling(false);

    evaluateShot();
  }, [isPaused, isBowling, deliveryPhase, startNewDelivery]);

  // Support Keyboard SPACEBAR as requested in spec
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleUserTap();
      } else if (e.code === 'Escape') {
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUserTap]);

  // Auto-start first ball
  useEffect(() => {
    const timer = setTimeout(() => {
      startNewDelivery();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // PowerUp Handlers
  const handleActivatePowerUp = (type: 'six_boost' | 'perfect_timing' | 'extra_life') => {
    if (isPaused) return;

    const count = powerUpInventory[type];
    if (count > 0) {
      onUsePowerUp(type);
      soundEngine.playPowerUp();
      if (type === 'six_boost') setActiveSixBoost(true);
      if (type === 'perfect_timing') setActivePerfectTiming(true);
      if (type === 'extra_life') setActiveExtraLife(true);
    } else {
      // Prompt to buy with coins
      const costs = { six_boost: 40, perfect_timing: 30, extra_life: 50 };
      const cost = costs[type];
      if (progress.coins >= cost) {
        const success = onBuyPowerUp(type, cost);
        if (success) {
          soundEngine.playPowerUp();
          if (type === 'six_boost') setActiveSixBoost(true);
          if (type === 'perfect_timing') setActivePerfectTiming(true);
          if (type === 'extra_life') setActiveExtraLife(true);
        }
      } else {
        soundEngine.playClick();
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
      {/* 1. TOP HUD (Scoreboard & Status) */}
      <div className="relative z-20 w-full pt-3 px-4 pb-2 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between">
          {/* Runs & Wickets */}
          <div className="flex items-baseline gap-2">
            <span className="font-display font-black text-3xl sm:text-4xl text-amber-400 tracking-tight drop-shadow-md">
              {matchStats.score}
            </span>
            <span className="text-xs text-slate-400 font-semibold uppercase">
              / {matchStats.wickets} Wkts
            </span>
          </div>

          {/* Balls Counter (e.g. 4/10) */}
          <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 px-3.5 py-1 rounded-2xl shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">BALLS</span>
            <span className="font-display font-black text-lg text-white">
              {matchStats.ballsFaced} <span className="text-xs text-slate-400 font-sans">/ {maxBalls}</span>
            </span>
          </div>

          {/* Coins & Pause Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-amber-500/30">
              <span className="text-amber-400 font-bold text-xs">¢</span>
              <span className="text-xs font-display font-bold text-amber-300">
                {matchStats.coinsEarned}
              </span>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsPaused(true);
              }}
              className="w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all shadow-md"
              title="Pause Match"
            >
              <Pause size={14} />
            </button>
          </div>
        </div>

        {/* Bowler & Target Banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">{bowler.name}</span>
            <span className="text-slate-400">· {bowler.speedKmh} km/h ({bowler.type})</span>
          </div>

          {/* Combo Flame Indicator */}
          {matchStats.currentCombo > 1 && (
            <div className="flex items-center gap-1 text-orange-400 font-extrabold animate-bounce">
              <Flame size={14} />
              <span>COMBO x{matchStats.currentCombo >= 7 ? 4 : matchStats.currentCombo >= 5 ? 3 : 2}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. CRICKET CANVAS VIEW (3D Pitch & Characters) */}
      <div className="relative flex-1 w-full min-h-0">
        <CricketCanvas
          isBowling={isBowling}
          bowler={bowler}
          ballProgress={ballProgress}
          onHitAttempt={handleUserTap}
          lastHitResult={lastHitResult}
          isHitActive={showAnnouncement && !isOutEffect}
          isOut={isOutEffect}
          shakeScreen={shakeScreen}
        />

        {/* Floating Shot Outcome Announcer */}
        {showAnnouncement && lastHitResult && (
          <FloatingAnnouncement
            outcome={lastHitResult.outcome}
            runs={lastHitResult.runs}
            timing={lastHitResult.timing}
            comboCount={lastHitResult.comboCount}
            comboMultiplier={lastHitResult.comboMultiplier}
          />
        )}
      </div>

      {/* 3. BOTTOM CONTROLS & TIMING METER */}
      <div className="relative z-20 w-full bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pb-4 pt-1 px-4 flex flex-col items-center gap-2 shrink-0">
        {/* Power-Ups Bar */}
        <div className="w-full max-w-sm flex items-center justify-between gap-2 px-1">
          {/* Six Boost */}
          <button
            onClick={() => handleActivatePowerUp('six_boost')}
            className={`flex-1 py-1 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              activeSixBoost
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/30'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-amber-500/40'
            }`}
          >
            <Zap size={14} className={activeSixBoost ? 'text-slate-950' : 'text-amber-400'} />
            <div className="text-left leading-tight">
              <p className="text-[10px] font-bold">Six Boost</p>
              <span className="text-[9px] opacity-80">
                {powerUpInventory.six_boost > 0 ? `x${powerUpInventory.six_boost}` : '40¢'}
              </span>
            </div>
          </button>

          {/* Perfect Timing */}
          <button
            onClick={() => handleActivatePowerUp('perfect_timing')}
            className={`flex-1 py-1 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              activePerfectTiming
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md shadow-emerald-500/30'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-emerald-500/40'
            }`}
          >
            <Sparkles size={14} className={activePerfectTiming ? 'text-slate-950' : 'text-emerald-400'} />
            <div className="text-left leading-tight">
              <p className="text-[10px] font-bold">Sweet Spot</p>
              <span className="text-[9px] opacity-80">
                {powerUpInventory.perfect_timing > 0 ? `x${powerUpInventory.perfect_timing}` : '30¢'}
              </span>
            </div>
          </button>

          {/* Extra Life */}
          <button
            onClick={() => handleActivatePowerUp('extra_life')}
            className={`flex-1 py-1 px-2 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              activeExtraLife
                ? 'bg-blue-500 text-slate-950 border-blue-300 shadow-md shadow-blue-500/30'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:border-blue-500/40'
            }`}
          >
            <Shield size={14} className={activeExtraLife ? 'text-slate-950' : 'text-blue-400'} />
            <div className="text-left leading-tight">
              <p className="text-[10px] font-bold">Extra Life</p>
              <span className="text-[9px] opacity-80">
                {powerUpInventory.extra_life > 0 ? `x${powerUpInventory.extra_life}` : '50¢'}
              </span>
            </div>
          </button>
        </div>

        {/* Visual Timing Meter */}
        <TimingMeter
          progress={ballProgress}
          isBowling={isBowling}
          lastRating={lastHitResult?.timing || null}
          lastDeltaMs={lastHitResult?.timingDeltaMs !== undefined ? lastHitResult.timingDeltaMs : null}
          isPerfectTimingBoosted={activePerfectTiming}
        />

        {/* Large Thumb-Friendly TAP TO HIT Button */}
        <button
          onClick={handleUserTap}
          className="w-full max-w-sm h-14 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-display font-black text-lg tracking-wider uppercase shadow-xl shadow-amber-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-2 border-t border-amber-300"
        >
          <span>TAP TO HIT</span>
          <span className="text-[11px] font-sans font-bold bg-slate-950/20 px-2 py-0.5 rounded-full text-slate-900 hidden sm:inline-block">
            SPACE
          </span>
        </button>
      </div>

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestart={() => {
          setIsPaused(false);
          setMatchStats({
            score: 0,
            ballsFaced: 0,
            maxBalls,
            wickets: 0,
            maxWickets,
            sixes: 0,
            fours: 0,
            dotBalls: 0,
            singles: 0,
            doubles: 0,
            bestTiming: 'NONE',
            highestCombo: 0,
            currentCombo: 0,
            coinsEarned: 0,
            shotHistory: [],
            level,
            mode,
            challengeId: challenge?.id,
          });
          startNewDelivery();
        }}
        onHome={onHome}
      />
    </div>
  );
};
