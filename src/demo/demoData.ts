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
  startTime: Date.now() - 34000,
  endTime: Date.now() - 1000,
  durationSeconds: 34,
  outcome: 'VICTORY',
  playerFinalHp: 68,
  enemyFinalHp: 0,
  events: [
    { id: 'evt-01', action: 'attack', timestamp: 1200, intervalSinceLastAction: 0, combo: 1, distanceToEnemy: 1.8 },
    { id: 'evt-02', action: 'hit', timestamp: 1400, intervalSinceLastAction: 200, combo: 1, damage: 16 },
    { id: 'evt-03', action: 'dodge', timestamp: 2800, intervalSinceLastAction: 1400, direction: 'left' },
    { id: 'evt-04', action: 'attack', timestamp: 3900, intervalSinceLastAction: 1100, combo: 1 },
    { id: 'evt-05', action: 'hit', timestamp: 4100, intervalSinceLastAction: 200, combo: 1, damage: 16 },
    { id: 'evt-06', action: 'attack', timestamp: 4600, intervalSinceLastAction: 500, combo: 2 },
    { id: 'evt-07', action: 'hit', timestamp: 4800, intervalSinceLastAction: 200, combo: 2, damage: 16 },
    { id: 'evt-08', action: 'attack', timestamp: 5300, intervalSinceLastAction: 500, combo: 3 },
    { id: 'evt-09', action: 'hit', timestamp: 5500, intervalSinceLastAction: 200, combo: 3, damage: 28 },
    { id: 'evt-10', action: 'dodge', timestamp: 6900, intervalSinceLastAction: 1400, direction: 'left' },
    { id: 'evt-11', action: 'dodge', timestamp: 8400, intervalSinceLastAction: 1500, direction: 'left' },
    { id: 'evt-12', action: 'dodge', timestamp: 10200, intervalSinceLastAction: 1800, direction: 'left' },
    { id: 'evt-13', action: 'dodge', timestamp: 11900, intervalSinceLastAction: 1700, direction: 'left' },
    { id: 'evt-14', action: 'attack', timestamp: 13200, intervalSinceLastAction: 1300, combo: 1 },
    { id: 'evt-15', action: 'hit', timestamp: 13400, intervalSinceLastAction: 200, combo: 1, damage: 16 },
    { id: 'evt-16', action: 'attack', timestamp: 13900, intervalSinceLastAction: 500, combo: 2 },
    { id: 'evt-17', action: 'hit', timestamp: 14100, intervalSinceLastAction: 200, combo: 2, damage: 16 },
    { id: 'evt-18', action: 'attack', timestamp: 14600, intervalSinceLastAction: 500, combo: 3 },
    { id: 'evt-19', action: 'hit', timestamp: 14800, intervalSinceLastAction: 200, combo: 3, damage: 28 },
    { id: 'evt-20', action: 'dodge', timestamp: 16200, intervalSinceLastAction: 1400, direction: 'left' },
    { id: 'evt-21', action: 'dodge', timestamp: 17800, intervalSinceLastAction: 1600, direction: 'left' },
    { id: 'evt-22', action: 'dodge', timestamp: 19500, intervalSinceLastAction: 1700, direction: 'right' },
    { id: 'evt-23', action: 'dodge', timestamp: 21100, intervalSinceLastAction: 1600, direction: 'left' },
    { id: 'evt-24', action: 'dodge', timestamp: 22800, intervalSinceLastAction: 1700, direction: 'left' },
    { id: 'evt-25', action: 'dodge', timestamp: 24400, intervalSinceLastAction: 1600, direction: 'left' },
    { id: 'evt-26', action: 'dodge', timestamp: 26000, intervalSinceLastAction: 1600, direction: 'left' },
    { id: 'evt-27', action: 'dodge', timestamp: 27500, intervalSinceLastAction: 1500, direction: 'right' },
    { id: 'evt-28', action: 'dodge', timestamp: 29100, intervalSinceLastAction: 1600, direction: 'left' },
    { id: 'evt-29', action: 'dodge', timestamp: 30800, intervalSinceLastAction: 1700, direction: 'left' },
    { id: 'evt-30', action: 'dodge', timestamp: 32400, intervalSinceLastAction: 1600, direction: 'left' },
  ],
  metrics: {
    totalAttacks: 22,
    successfulAttacks: 17,
    missedAttacks: 5,
    accuracyPercentage: 77,
    blocks: 4,
    dodges: 18,
    dodgeLeftCount: 15,
    dodgeRightCount: 3,
    dodgeOtherCount: 0,
<<<<<<< HEAD
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
  archetype: 'BALANCED_STRIKER',
  aggression: 0.82,
  defense: 0.44,
  mobility: 0.74,
  predictabilityIndex: 0.84,
  reactionTime: 0.21,
  preferredDodge: 'left',
  preferredRange: 'close',
  averageComboLength: 2.8,
  topPatterns: [
    'Heavy Left-Flank Evade Sequence (Dodge Left -> Strike)',
    'Triple Strike Rapid Combo (J -> J -> J)',
    'Hyper-Aggressive Forward Rushdown (Zero Neutral Footwork)',
  ],
  repeatedCombos: ['LIGHT-LIGHT-HEAVY'],
  strengths: [
    'Explosive offensive pressure and forward momentum',
    'Consistent Light-Light-Heavy finisher execution',
    'High hit confirmation accuracy (77%)',
  ],
  weaknesses: [
    'Severe left-side dodge bias (83% of all defensive evasions are LEFT)',
    'Over-commits to complete 3-hit string even when opponent guards',
    'Vulnerable to flank counter-strikes on left recovery frames',
  ],
  totalAttacks: 22,
  attackFrequency: 0.9,
  blockFrequency: 0.35,
  dodgeLeftFrequency: 0.833,
  dodgeRightFrequency: 0.167,
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
  adaptationLevel: 3,
  aiStrategy: {
    aggressionLevel: 0.75,
    preferredRange: 'close',
    targetDodgeDirection: 'left',
    counterCombo: true,
    pressureLevel: 0.85,
    defensiveLevel: 0.80,
    useFeints: true,
    retreatWhenLowHealth: true,
    adaptationLevel: 3,
    confidenceScore: 0.92,
    targetPatternDescription: 'COUNTER LEFT DODGE // FLANK INTERCEPT (83% BIAS)',
  },
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
