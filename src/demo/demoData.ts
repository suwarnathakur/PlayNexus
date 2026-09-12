// PLAYNEXUS HACKATHON DEMO DATA
// Realistic pre-generated telemetry, Fighting DNA, and Counter-Strategies
// Completely isolated from production server APIs

import type { FightingDNAProfile } from '../ai/FightingDNA/DNATypes';
import type { CounterStrategy } from '../ai/adaptive/CounterStrategy';
import type { MatchTelemetry } from '../game/telemetry/TelemetryTypes';

/**
 * Realistic Match 1 Telemetry Data (Player repeatedly dodges LEFT)
 */
export const DEMO_MATCH_1_TELEMETRY: MatchTelemetry = {
  matchId: 'DEMO-MATCH-01-TELEMETRY',
  startTime: Date.now() - 40000,
  endTime: Date.now() - 6000,
  durationSeconds: 34,
  outcome: 'VICTORY',
  playerFinalHp: 68,
  enemyFinalHp: 0,
  events: [
    { id: 'ev-1', action: 'attack', timestamp: 1200, combo: 1, distanceToEnemy: 1.8 },
    { id: 'ev-2', action: 'hit', timestamp: 1400, damage: 16, combo: 1 },
    { id: 'ev-3', action: 'dodge', direction: 'left', timestamp: 2800 },
    { id: 'ev-4', action: 'attack', timestamp: 3900, combo: 1 },
    { id: 'ev-5', action: 'hit', timestamp: 4100, damage: 16, combo: 1 },
    { id: 'ev-6', action: 'attack', timestamp: 4600, combo: 2 },
    { id: 'ev-7', action: 'hit', timestamp: 4800, damage: 16, combo: 2 },
    { id: 'ev-8', action: 'attack', timestamp: 5300, combo: 3 },
    { id: 'ev-9', action: 'hit', timestamp: 5500, damage: 28, combo: 3 },
    { id: 'ev-10', action: 'dodge', direction: 'left', timestamp: 6900 },
    { id: 'ev-11', action: 'dodge', direction: 'left', timestamp: 8400 },
    { id: 'ev-12', action: 'dodge', direction: 'left', timestamp: 10200 },
    { id: 'ev-13', action: 'dodge', direction: 'left', timestamp: 11900 },
    { id: 'ev-14', action: 'attack', timestamp: 13200, combo: 1 },
    { id: 'ev-15', action: 'hit', timestamp: 13400, damage: 16, combo: 1 },
    { id: 'ev-16', action: 'attack', timestamp: 13900, combo: 2 },
    { id: 'ev-17', action: 'hit', timestamp: 14100, damage: 16, combo: 2 },
    { id: 'ev-18', action: 'attack', timestamp: 14600, combo: 3 },
    { id: 'ev-19', action: 'hit', timestamp: 14800, damage: 28, combo: 3 },
    { id: 'ev-20', action: 'dodge', direction: 'left', timestamp: 16200 },
    { id: 'ev-21', action: 'dodge', direction: 'left', timestamp: 17800 },
    { id: 'ev-22', action: 'dodge', direction: 'right', timestamp: 19500 },
    { id: 'ev-23', action: 'dodge', direction: 'left', timestamp: 21100 },
    { id: 'ev-24', action: 'dodge', direction: 'left', timestamp: 22800 },
    { id: 'ev-25', action: 'dodge', direction: 'left', timestamp: 24400 },
    { id: 'ev-26', action: 'dodge', direction: 'left', timestamp: 26000 },
    { id: 'ev-27', action: 'dodge', direction: 'right', timestamp: 27500 },
    { id: 'ev-28', action: 'dodge', direction: 'left', timestamp: 29100 },
    { id: 'ev-29', action: 'dodge', direction: 'left', timestamp: 30800 },
    { id: 'ev-30', action: 'dodge', direction: 'left', timestamp: 32400 },
  ],
  metrics: {
    totalAttacks: 22,
    successfulAttacks: 17,
    missedAttacks: 5,
    accuracyPercentage: 77.3,
    blocks: 4,
    dodges: 18,
    dodgeLeftCount: 15,
    dodgeRightCount: 3,
    dodgeOtherCount: 0,
    dodgeLeftPercentage: 83.3,
    dodgeRightPercentage: 16.7,
    dodgeOtherPercentage: 0,
    averageComboLength: 2.8,
    maxCombo: 3,
    totalDamageDealt: 100,
    totalDamageReceived: 32,
    totalDistanceMoved: 45.2,
    durationSeconds: 34,
    aggression: 82,
    defense: 44,
    mobility: 74,
    predictability: 84,
  },
};

/**
 * Deterministic Fighting DNA generated from Match 1 (Predictability = HIGH)
 */
export const DEMO_FIGHTING_DNA: FightingDNAProfile = {
  id: 'dna-demo-match-1',
  timestamp: Date.now(),
  aggression: 0.82,
  defense: 0.44,
  mobility: 0.74,
  reactionTime: 0.21,
  preferredDodge: 'left',
  preferredRange: 'close',
  averageComboLength: 2.8,
  predictabilityIndex: 0.84, // High predictability trigger
  topPatterns: ['DODGE_LEFT_BIAS', 'COMBO_3_COMMIT'],
  repeatedCombos: ['LIGHT-LIGHT-HEAVY'],
  strengths: [
    'Explosive offensive pressure and forward momentum',
    'Consistent Light-Light-Heavy finisher execution',
    'High hit confirmation accuracy (77.3%)',
  ],
  weaknesses: [
    'Severe left-side dodge bias (83% of all defensive evasions are LEFT)',
    'Over-commits to complete 3-hit string even when opponent guards',
    'Vulnerable to flank counter-strikes on left recovery frames',
  ],
  archetype: 'BALANCED_STRIKER',
  totalAttacks: 22,
  accuracyPercentage: 77.3,
  dodgeLeftPercentage: 83.3,
  dodgeRightPercentage: 16.7,
};

/**
 * Match 2 AI Adaptive Counter-Strategy targeting Left Dodge
 */
export const DEMO_COUNTER_STRATEGY: CounterStrategy = {
  id: 'strategy-demo-counter-left',
  name: 'COUNTER LEFT DODGE & SWEEP FLANK',
  tacticalDescription:
    'The AI analyzed your Match 1 telemetry: 83% of your evasive dodges were directed LEFT. The opponent will now anticipate your left slip, sweep the recovery lane, and parry the 3rd strike of your Light-Light-Heavy string.',
  counterDodge: 'COUNTER_LEFT',
  interceptDodgeBias: 'left',
  defenseMode: 'COUNTER_RUSH',
  antiComboTactics: true,
  targetComboPattern: 'LIGHT-LIGHT-HEAVY',
  blockProbabilityOnPlayerAttack: 0.85,
  counterAttackAfterBlockProbability: 0.75,
  pressureMode: 'RELENTLESS_CHASE',
  approachSpeedMultiplier: 1.35,
  attackRangeMultiplier: 1.1,
  dodgeLeftFrequency: 0.833,
  comboPatternName: 'LIGHT-LIGHT-HEAVY',
  predictabilityLevel: 'HIGH',
  adaptationConfidence: 0.92,
  activeTactics: [
    'COUNTER LEFT DODGE // INTERCEPT FLANK (83% BIAS)',
    'ANTI-COMBO ADAPTATION // AUTO-BLOCK & PARRY (LIGHT-LIGHT-HEAVY)',
    'RELENTLESS RUSHDOWN // SPRINT CLOSURE & BOUNDARY PIN',
  ],
};

/**
 * Dodge Lock Challenge Configuration
 */
export const DEMO_LOCK_IN_CHALLENGE = {
  patternDetectedText: 'PATTERN DETECTED: 83% OF YOUR DODGES ARE LEFT',
  challengeTitle: 'ADAPTATION LOCK ACTIVATED',
  challengeText: 'SURVIVE 15 SECONDS DODGING ONLY RIGHT',
  durationSeconds: 15,
  rewardText: '+20% DODGE SPEED & LATERAL DRIFT',
};

/**
 * Post-Match 2 Victory & Adaptation Evolution Stats
 */
export const DEMO_POST_ADAPTATION_METRICS = {
  adaptationScoreInitial: 72,
  adaptationScoreFinal: 94,
  adaptationGain: 22,
  status: 'NEURAL ADAPTATION CONFIRMED',
  evaluationSummary:
    'Operative successfully broke left-dodge habit under lock-in pressure. AI flank sweeps neutralized. Adaptation quotient raised to Tier S.',
};
