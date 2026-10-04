/**
 * Cricket Hit Master - Core Game Types and Configuration
 */

export type TimingRating = 'PERFECT' | 'EXCELLENT' | 'GOOD' | 'EARLY' | 'LATE' | 'MISS';

export type ShotOutcome = 'SIX' | 'FOUR' | 'TWO' | 'ONE' | 'DOT' | 'WICKET';

export type GameMode = 'QUICK_HIT' | 'SUPER_OVER' | 'CHALLENGE';

export type GameState =
  | 'HOME'
  | 'MODE_SELECTION'
  | 'READY'
  | 'BOWLING'
  | 'PLAYING'
  | 'HIT_ANIMATION'
  | 'OVER_SUMMARY'
  | 'RESULT'
  | 'PAUSED'
  | 'SETTINGS'
  | 'HOW_TO_PLAY';

export interface PowerUp {
  id: 'six_boost' | 'perfect_timing' | 'extra_life';
  name: string;
  shortDesc: string;
  cost: number;
  icon: string;
  active: boolean;
  count: number;
}

export interface BowlerProfile {
  id: number;
  name: string;
  type: string;
  country: string;
  speedKmh: number;
  difficultyLabel: string;
  deliveryDurationMs: number; // Duration of ball from release to hitting crease
  swingAmount: number; // Horizontal drift in air (-1 to 1)
  spinAmount: number; // Turn off pitch (-1 to 1)
  bounceHeight: number; // Normalised bounce
  releaseVariation: number; // Small variance in release position
}

export interface ChallengeTarget {
  id: string;
  title: string;
  description: string;
  balls: number;
  targetRuns?: number;
  targetSixes?: number;
  targetFours?: number;
  maxWickets?: number;
  rewardCoins: number;
}

export interface ShotResult {
  timing: TimingRating;
  outcome: ShotOutcome;
  runs: number;
  timingDeltaMs: number; // negative = early, positive = late
  message: string;
  isBoundary: boolean;
  isSix: boolean;
  isWicket: boolean;
  comboCount: number;
  comboMultiplier: number;
  coinsEarned: number;
}

export interface MatchStats {
  score: number;
  ballsFaced: number;
  maxBalls: number;
  wickets: number;
  maxWickets: number;
  sixes: number;
  fours: number;
  dotBalls: number;
  singles: number;
  doubles: number;
  bestTiming: TimingRating | 'NONE';
  highestCombo: number;
  currentCombo: number;
  coinsEarned: number;
  shotHistory: ShotResult[];
  level: number;
  mode: GameMode;
  challengeId?: string;
  challengeCompleted?: boolean;
}

export interface PlayerProgress {
  coins: number;
  highScore: number;
  highestCombo: number;
  totalRuns: number;
  totalSixes: number;
  totalFours: number;
  totalMatches: number;
  currentLevel: number;
  unlockedLevels: number;
  completedChallenges: string[];
  powerUps: {
    six_boost: number;
    perfect_timing: number;
    extra_life: number;
  };
  settings: {
    sound: boolean;
    crowd: boolean;
    vibration: boolean;
  };
}

// Configurable Probabilities and Game Balance
export const GAME_CONFIG = {
  // Timing windows in milliseconds from ideal impact time
  TIMING_WINDOWS: {
    PERFECT: 45, // +/- 45ms
    EXCELLENT: 90, // +/- 90ms
    GOOD: 165, // +/- 165ms
    EARLY_MAX: 280, // 165 to 280ms before
    LATE_MAX: 260, // 165 to 260ms after
  },

  // Outcome probabilities as per specification
  OUTCOME_PROBABILITIES: {
    PERFECT: {
      SIX: 0.60,
      FOUR: 0.40,
    },
    EXCELLENT: {
      FOUR: 0.60,
      SIX: 0.40,
    },
    GOOD: {
      ONE: 0.50,
      TWO: 0.30,
      FOUR: 0.20,
    },
    EARLY: {
      DOT: 0.70,
      ONE: 0.30,
    },
    LATE: {
      DOT: 0.60,
      WICKET: 0.40,
    },
    MISS: {
      WICKET: 0.70,
      DOT: 0.30,
    },
  },

  // Coin rewards
  COIN_REWARDS: {
    RUN: 1,
    FOUR: 5,
    SIX: 10,
    PERFECT_BONUS: 5,
    COMBO_BONUS: 10,
  },

  // Bowlers by level (Fictional names only)
  BOWLERS: [
    {
      id: 1,
      name: 'Rookie Rex',
      type: 'Beginner Seamer',
      country: 'Club XI',
      speedKmh: 110,
      difficultyLabel: 'Easy',
      deliveryDurationMs: 1400,
      swingAmount: 0,
      spinAmount: 0,
      bounceHeight: 0.9,
      releaseVariation: 10,
    },
    {
      id: 2,
      name: 'Marcus Pace',
      type: 'Medium Pacer',
      country: 'City Titans',
      speedKmh: 125,
      difficultyLabel: 'Normal',
      deliveryDurationMs: 1200,
      swingAmount: 0.08,
      spinAmount: 0,
      bounceHeight: 1.0,
      releaseVariation: 20,
    },
    {
      id: 3,
      name: 'Lightning Leo',
      type: 'Fast Bowler',
      country: 'Metro Express',
      speedKmh: 142,
      difficultyLabel: 'Hard',
      deliveryDurationMs: 1020,
      swingAmount: 0.12,
      spinAmount: 0,
      bounceHeight: 1.15,
      releaseVariation: 30,
    },
    {
      id: 4,
      name: 'Sultan Swing',
      type: 'Swing Specialist',
      country: 'Coast Stars',
      speedKmh: 132,
      difficultyLabel: 'Tricky',
      deliveryDurationMs: 1120,
      swingAmount: 0.32, // Noticeable banana swing
      spinAmount: 0.05,
      bounceHeight: 1.0,
      releaseVariation: 25,
    },
    {
      id: 5,
      name: 'Spin Wizard Ravi',
      type: 'Mystery Leg-Spinner',
      country: 'Royal Dynamos',
      speedKmh: 95,
      difficultyLabel: 'Deceptive',
      deliveryDurationMs: 1350,
      swingAmount: -0.15, // Drift in air
      spinAmount: 0.40, // Sharp break off pitch
      bounceHeight: 0.85,
      releaseVariation: 35,
    },
    {
      id: 6,
      name: 'Viktor Venom',
      type: 'Death Overs Master',
      country: 'Galaxy Champions',
      speedKmh: 148,
      difficultyLabel: 'Extreme',
      deliveryDurationMs: 950,
      swingAmount: 0.25,
      spinAmount: 0.20,
      bounceHeight: 1.2,
      releaseVariation: 40,
    },
  ] as BowlerProfile[],

  CHALLENGES: [
    {
      id: 'c1',
      title: 'Quick 20',
      description: 'Score 20 runs in 10 balls.',
      balls: 10,
      targetRuns: 20,
      maxWickets: 3,
      rewardCoins: 50,
    },
    {
      id: 'c2',
      title: 'Power Hitter',
      description: 'Smash at least 2 massive SIXES in 10 balls.',
      balls: 10,
      targetSixes: 2,
      maxWickets: 3,
      rewardCoins: 75,
    },
    {
      id: 'c3',
      title: 'Boundary Bonanza',
      description: 'Hit 3 boundaries (4s or 6s) in 10 balls.',
      balls: 10,
      targetFours: 3,
      maxWickets: 3,
      rewardCoins: 80,
    },
    {
      id: 'c4',
      title: 'Iron Bat',
      description: 'Score 30 runs in 10 balls without losing a single wicket!',
      balls: 10,
      targetRuns: 30,
      maxWickets: 1,
      rewardCoins: 120,
    },
  ] as ChallengeTarget[],
};
