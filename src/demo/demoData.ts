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
  timestamp: Date.now() - 40000,
  durationSeconds: 34,
  outcome: 'VICTORY',
  events: [
    { type: 'ATTACK', timestamp: 1200, payload: { combo: 1, distanceToEnemy: 1.8 } },
    { type: 'HIT', timestamp: 1400, payload: { damage: 16, combo: 1 } },
    { type: 'DODGE', timestamp: 2800, payload: { direction: 'left' } },
    { type: 'ATTACK', timestamp: 3900, payload: { combo: 1 } },
    { type: 'HIT', timestamp: 4100, payload: { damage: 16, combo: 1 } },
    { type: 'ATTACK', timestamp: 4600, payload: { combo: 2 } },
    { type: 'HIT', timestamp: 4800, payload: { damage: 16, combo: 2 } },
    { type: 'ATTACK', timestamp: 5300, payload: { combo: 3 } },
    { type: 'HIT', timestamp: 5500, payload: { damage: 28, combo: 3, isCrit: true } },
    { type: 'DODGE', timestamp: 6900, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 8400, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 10200, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 11900, payload: { direction: 'left' } },
    { type: 'ATTACK', timestamp: 13200, payload: { combo: 1 } },
    { type: 'HIT', timestamp: 13400, payload: { damage: 16, combo: 1 } },
    { type: 'ATTACK', timestamp: 13900, payload: { combo: 2 } },
    { type: 'HIT', timestamp: 14100, payload: { damage: 16, combo: 2 } },
    { type: 'ATTACK', timestamp: 14600, payload: { combo: 3 } },
    { type: 'HIT', timestamp: 14800, payload: { damage: 28, combo: 3, isCrit: true } },
    { type: 'DODGE', timestamp: 16200, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 17800, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 19500, payload: { direction: 'right' } },
    { type: 'DODGE', timestamp: 21100, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 22800, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 24400, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 26000, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 27500, payload: { direction: 'right' } },
    { type: 'DODGE', timestamp: 29100, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 30800, payload: { direction: 'left' } },
    { type: 'DODGE', timestamp: 32400, payload: { direction: 'left' } },
  ],
  metrics: {
    totalAttacks: 22,
    successfulAttacks: 17,
    missedAttacks: 5,
    accuracyPercentage: 77.3,
    blocks: 4,
    dodges: 18,
    dodgeLeft: 15,
    dodgeRight: 3,
    dodgeLeftPercentage: 83.3,
    dodgeRightPercentage: 16.7,
    averageComboLength: 2.8,
    maxCombo: 3,
    repeatedCombos: ['LIGHT-LIGHT-HEAVY'],
    totalDamageDealt: 100,
    totalDamageReceived: 32,
  },
};

/**
 * Deterministic Fighting DNA generated from Match 1 (Predictability = HIGH)
 */
export const DEMO_FIGHTING_DNA: FightingDNAProfile = {
  aggression: 0.82,
  defense: 0.44,
  mobility: 0.74,
  reactionTimeMs: 210,
  preferredDodge: 'left',
  dodgeLeftFrequency: 0.83,
  dodgeRightFrequency: 0.17,
  preferredRange: 'close',
  averageComboLength: 2.8,
  repeatedCombos: ['LIGHT-LIGHT-HEAVY'],
  predictabilityIndex: 0.84, // High predictability trigger
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
  archetype: 'HYBRID STRIKER',
};

/**
 * Match 2 AI Adaptive Counter-Strategy targeting Left Dodge
 */
export const DEMO_COUNTER_STRATEGY: CounterStrategy = {
  name: 'COUNTER LEFT DODGE & SWEEP FLANK',
  targetWeakness: 'PREFERRED_DODGE_LEFT',
  aggressionAdjustment: 0.15,
  defenseAdjustment: 0.25,
  mobilityAdjustment: 0.2,
  counterLeftDodge: true,
  punishRepeatedCombo: true,
  exploitRange: 'mid',
  tacticalDescription:
    'The AI analyzed your Match 1 telemetry: 83% of your evasive dodges were directed LEFT. The opponent will now anticipate your left slip, sweep the recovery lane, and parry the 3rd strike of your Light-Light-Heavy string.',
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
