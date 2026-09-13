import type { FightingDNAProfile } from '../FightingDNA/DNATypes';
import type { CounterStrategy, CounterDodgeTactic, DefenseMode, PressureMode } from './CounterStrategy';
import type { AIStrategy, AdaptationLevel, TargetDodgeDirection, RangePreference } from './StrategyTypes';
import type { DetectedPattern } from '../behavior/BehaviorTypes';

/**
 * PLAYNEXUS Strategy Engine
 * Evaluates the player's Fighting DNA and detected behavioral patterns
 * to generate an adaptive counter-strategy for the AI opponent.
 */
export class StrategyEngine {
  /**
   * Generates a concrete counter-strategy tailored to exploit the player's Fighting DNA.
   */
  public static generateStrategy(
    dna: FightingDNAProfile,
    patterns: DetectedPattern[] = []
  ): CounterStrategy {
    const activeTactics: string[] = [];

    // --- RULE 1: PLAYER DODGES LEFT (> 70%) ---
    let counterDodge: CounterDodgeTactic = 'NEUTRAL';
    let interceptDodgeBias: 'left' | 'right' | null = null;
    let targetDodgeDirection: TargetDodgeDirection = 'none';
    const dodgeLeftFrequency = dna.dodgeLeftFrequency || (dna.dodgeLeftPercentage || 50) / 100;
    const dodgeRightFrequency = dna.dodgeRightFrequency || (dna.dodgeRightPercentage || 50) / 100;

    const hasLeftDodgePattern = patterns.some((p) => p.type === 'PREFERRED_DODGE_LEFT') || dodgeLeftFrequency >= 0.70;
    const hasRightDodgePattern = patterns.some((p) => p.type === 'PREFERRED_DODGE_RIGHT') || dodgeRightFrequency >= 0.70;

    if (hasLeftDodgePattern || dna.preferredDodge === 'left') {
      counterDodge = 'COUNTER_LEFT';
      interceptDodgeBias = 'left';
      targetDodgeDirection = 'left';
      activeTactics.push(`COUNTER LEFT DODGE // FLANK INTERCEPT (${Math.round(dodgeLeftFrequency * 100)}% BIAS)`);
    } else if (hasRightDodgePattern || dna.preferredDodge === 'right') {
      counterDodge = 'COUNTER_RIGHT';
      interceptDodgeBias = 'right';
      targetDodgeDirection = 'right';
      activeTactics.push(`COUNTER RIGHT DODGE // OFF-AXIS ANGLE (${Math.round(dodgeRightFrequency * 100)}% BIAS)`);
    }

    // --- RULE 2: REPEATED COMBO (e.g. LIGHT-LIGHT-HEAVY) ---
    const hasRepeatedComboPattern = patterns.some((p) => p.type === 'REPEATED_COMBO');
    const hasRepeatedCombo = hasRepeatedComboPattern || (dna.repeatedCombos && dna.repeatedCombos.length > 0);
    const isHighCombo = dna.averageComboLength >= 2.0;
    const counterCombo = hasRepeatedCombo || isHighCombo;
    const comboPatternName = hasRepeatedCombo && dna.repeatedCombos.length > 0
      ? dna.repeatedCombos[0].includes('Triple')
        ? 'LIGHT-LIGHT-HEAVY'
        : dna.repeatedCombos[0]
      : isHighCombo
      ? 'LIGHT-LIGHT-HEAVY'
      : 'SINGLE-JAB-POKE';

    let blockProbabilityOnPlayerAttack = 0.45;
    let counterAttackAfterBlockProbability = 0.35;

    if (counterCombo) {
      blockProbabilityOnPlayerAttack = 0.88; // 88% chance to block 2nd strike
      counterAttackAfterBlockProbability = 0.85; // 85% counter on heavy finisher
      activeTactics.push(`ANTI-COMBO ADAPTATION // AUTO-BLOCK & PARRY (${comboPatternName})`);
    }

    // --- RULE 3: HIGH AGGRESSION (> 0.75) ---
    const isHighAggression = patterns.some((p) => p.type === 'HIGH_AGGRESSION') || dna.aggression >= 0.75;
    let defenseMode: DefenseMode = 'NORMAL';
    let defensiveLevel = 0.45;
    let aggressionLevel = 0.55;

    if (isHighAggression) {
      defenseMode = 'HIGH_GUARD';
      defensiveLevel = 0.85;
      aggressionLevel = 0.40; // Patient baiting
      blockProbabilityOnPlayerAttack = Math.max(blockProbabilityOnPlayerAttack, 0.82);
      counterAttackAfterBlockProbability = Math.max(counterAttackAfterBlockProbability, 0.88);
      activeTactics.push('HIGH-GUARD COUNTER-STRIKER // BAIT RUSH & PUNISH WHIFFS');
    }

    // --- RULE 4: DEFENSIVE PLAYER (> 0.70) ---
    const isDefensivePlayer = patterns.some((p) => p.type === 'DEFENSIVE_STYLE') || dna.defense >= 0.70;
    let pressureMode: PressureMode = 'METHODICAL';
    let pressureLevel = 0.50;
    let useFeints = false;

    if (isDefensivePlayer) {
      pressureMode = 'RELENTLESS_CHASE';
      pressureLevel = 0.85;
      useFeints = true; // Use feints & delayed strikes to crack guard
      activeTactics.push('GUARD CRACKER // FEINTS, DELAYED TIMING & SHIELD PRESSURE');
    }

    // --- RULE 5: LONG-RANGE PLAYER ---
    const isLongRange = patterns.some((p) => p.type === 'LONG_RANGE_PLAYER') || dna.preferredRange === 'long';
    let approachSpeedMultiplier = 1.0;
    const preferredRange: RangePreference = isLongRange ? 'long' : dna.preferredRange === 'close' ? 'close' : 'medium';

    if (isLongRange) {
      pressureMode = 'RELENTLESS_CHASE';
      approachSpeedMultiplier = 1.45; // 45% faster sprint to eliminate standoff distance
      pressureLevel = Math.max(pressureLevel, 0.90);
      activeTactics.push('CORNER PIN RUSHDOWN // SPRINT CLOSURE & BOUNDARY TRAP');
    }

    // --- RULE 6: PREDICTABLE TIMING ---
    const isPredictableTiming = patterns.some((p) => p.type === 'PREDICTABLE_ATTACK_TIMING') || dna.predictabilityIndex >= 0.70;
    if (isPredictableTiming) {
      useFeints = true;
      activeTactics.push('DYNAMIC TEMPO VARIATION // DISRUPT PREDICTABLE RHYTHM');
    }

    // --- PREDICTABILITY LEVEL & CONFIDENCE ---
    const predictabilityLevel =
      dna.predictabilityIndex >= 0.68
        ? 'HIGH'
        : dna.predictabilityIndex >= 0.44
        ? 'MODERATE'
        : 'LOW';

    const adaptationConfidence = Number(
      Math.min(0.98, Math.max(0.40, dna.predictabilityIndex * 0.65 + (activeTactics.length >= 3 ? 0.25 : 0.15))).toFixed(2)
    );

    // --- ADAPTATION LEVEL CALCULATION (0 to 4) ---
    let adaptationLevel: AdaptationLevel = 0;
    if (dna.totalAttacks <= 2) {
      adaptationLevel = 0; // BASELINE
    } else if (dna.totalAttacks <= 6 && adaptationConfidence < 0.65) {
      adaptationLevel = 1; // OBSERVING
    } else if (activeTactics.length >= 1 && adaptationConfidence >= 0.65 && adaptationConfidence < 0.78) {
      adaptationLevel = 2; // PATTERN FOUND
    } else if (activeTactics.length >= 1 && adaptationConfidence >= 0.78 && activeTactics.length < 3) {
      adaptationLevel = 3; // COUNTER ACTIVE
    } else if (adaptationConfidence >= 0.85 && activeTactics.length >= 2) {
      adaptationLevel = 4; // HIGH ADAPTATION
    } else {
      adaptationLevel = 2;
    }

    // Build unified AIStrategy object
    const aiStrategy: AIStrategy = {
      aggressionLevel,
      preferredRange,
      targetDodgeDirection,
      counterCombo,
      pressureLevel,
      defensiveLevel,
      useFeints,
      retreatWhenLowHealth: true,
      adaptationLevel,
      confidenceScore: adaptationConfidence,
      targetPatternDescription: activeTactics[0] || 'BASELINE PATROL',
    };

    const tacticalDescription =
      targetDodgeDirection !== 'none'
        ? `COUNTER ${targetDodgeDirection.toUpperCase()} DODGE // ${comboPatternName} PARRY`
        : `ADAPTIVE COUNTER: ${defenseMode} + ${pressureMode}`;

    return {
      id: `STRAT-${Date.now().toString(36).toUpperCase()}`,
      name: `ADAPTIVE AI [LVL ${adaptationLevel}]`,
      tacticalDescription,
      activeTactics,
      counterDodge,
      interceptDodgeBias,
      defenseMode,
      antiComboTactics: counterCombo,
      targetComboPattern: comboPatternName,
      blockProbabilityOnPlayerAttack,
      counterAttackAfterBlockProbability,
      pressureMode,
      approachSpeedMultiplier,
      attackRangeMultiplier: pressureMode === 'RELENTLESS_CHASE' ? 1.18 : 1.0,
      dodgeLeftFrequency,
      comboPatternName,
      predictabilityLevel,
      adaptationConfidence,
      adaptationLevel,
      aiStrategy,
    };
  }

  /**
   * Generates a neutral default strategy when no previous match DNA is available.
   */
  public static getBaselineStrategy(): CounterStrategy {
    const aiStrategy: AIStrategy = {
      aggressionLevel: 0.50,
      preferredRange: 'medium',
      targetDodgeDirection: 'none',
      counterCombo: false,
      pressureLevel: 0.50,
      defensiveLevel: 0.40,
      useFeints: false,
      retreatWhenLowHealth: true,
      adaptationLevel: 0,
      confidenceScore: 0.40,
      targetPatternDescription: 'CALIBRATING OBSERVATIONAL SENSORS',
    };

    return {
      id: 'STRAT-BASELINE',
      name: 'BASELINE COMBAT PROTOCOL',
      tacticalDescription: 'STANDARD ENGAGEMENT CADENCE // OBSERVING',
      activeTactics: ['STANDARD PATROL', 'BALANCED GUARD PROBABILITY'],
      counterDodge: 'NEUTRAL',
      interceptDodgeBias: null,
      defenseMode: 'NORMAL',
      antiComboTactics: false,
      targetComboPattern: null,
      blockProbabilityOnPlayerAttack: 0.45,
      counterAttackAfterBlockProbability: 0.35,
      pressureMode: 'METHODICAL',
      approachSpeedMultiplier: 1.0,
      attackRangeMultiplier: 1.0,
      dodgeLeftFrequency: 0.5,
      comboPatternName: 'LIGHT-LIGHT-HEAVY',
      predictabilityLevel: 'MODERATE',
      adaptationConfidence: 0.45,
      adaptationLevel: 0,
      aiStrategy,
    };
  }
}
