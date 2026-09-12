import type { FightingDNAProfile } from '../FightingDNA/DNATypes';
import type { CounterStrategy, CounterDodgeTactic, DefenseMode, PressureMode } from './CounterStrategy';

/**
 * PLAYNEXUS Strategy Engine
 * Evaluates the player's Fighting DNA from previous matches to generate
 * an adaptive counter-strategy for the AI opponent.
 */
export class StrategyEngine {
  /**
   * Generates a concrete counter-strategy tailored to exploit the player's Fighting DNA.
   */
  public static generateStrategy(dna: FightingDNAProfile): CounterStrategy {
    const activeTactics: string[] = [];

    // 1. Counter Dodge Logic
    // If player has a preferred dodge direction, intercept that side
    let counterDodge: CounterDodgeTactic = 'NEUTRAL';
    let interceptDodgeBias: 'left' | 'right' | null = null;
    const dodgeLeftFrequency = (dna.dodgeLeftPercentage || 50) / 100;

    if (dna.preferredDodge === 'left' || dodgeLeftFrequency >= 0.55) {
      counterDodge = 'COUNTER_LEFT';
      interceptDodgeBias = 'left';
      activeTactics.push(`COUNTER LEFT DODGE // INTERCEPT FLANK (${Math.round(dodgeLeftFrequency * 100)}% BIAS)`);
    } else if (dna.preferredDodge === 'right' || dna.dodgeRightPercentage >= 55) {
      counterDodge = 'COUNTER_RIGHT';
      interceptDodgeBias = 'right';
      activeTactics.push(`COUNTER RIGHT DODGE // INTERCEPT OFF-AXIS (${dna.dodgeRightPercentage}% BIAS)`);
    }

    // 2. Anti-Combo & Repeated Pattern Logic
    // If player repeatedly chains multi-hit combos or strike spams
    const hasRepeatedCombo = dna.repeatedCombos && dna.repeatedCombos.length > 0;
    const isHighCombo = dna.averageComboLength >= 1.8;
    const antiComboTactics = hasRepeatedCombo || isHighCombo;
    const comboPatternName = hasRepeatedCombo
      ? dna.repeatedCombos[0].includes('Triple')
        ? 'LIGHT-LIGHT-HEAVY'
        : dna.repeatedCombos[0]
      : isHighCombo
      ? 'LIGHT-LIGHT-HEAVY'
      : 'SINGLE-JAB-POKE';

    let blockProbabilityOnPlayerAttack = 0.45; // baseline
    let counterAttackAfterBlockProbability = 0.35; // baseline

    if (antiComboTactics) {
      blockProbabilityOnPlayerAttack = 0.85; // 85% chance to raise guard against signature combo
      counterAttackAfterBlockProbability = 0.80; // 80% chance to immediately strike back
      activeTactics.push(`ANTI-COMBO ADAPTATION // AUTO-BLOCK & PARRY (${comboPatternName})`);
    }

    // 3. Aggression Adaptation (Player constantly attacks -> AI becomes defensive)
    let defenseMode: DefenseMode = 'NORMAL';
    if (dna.aggression >= 0.65) {
      defenseMode = 'HIGH_GUARD';
      blockProbabilityOnPlayerAttack = Math.max(blockProbabilityOnPlayerAttack, 0.80);
      counterAttackAfterBlockProbability = Math.max(counterAttackAfterBlockProbability, 0.85);
      activeTactics.push('PATIENT HIGH-GUARD // ABSORB RUSH AND PUNISH RECOVERY');
    }

    // 4. Distance / Retreating Adaptation (Player backs away -> AI increases pressure)
    let pressureMode: PressureMode = 'METHODICAL';
    let approachSpeedMultiplier = 1.0;

    if (dna.preferredRange === 'far' || dna.aggression <= 0.42 || dna.mobility <= 0.38) {
      pressureMode = 'RELENTLESS_CHASE';
      approachSpeedMultiplier = 1.45; // 45% faster sprint to hunt down retreating player
      activeTactics.push('RELENTLESS RUSHDOWN // SPRINT CLOSURE & BOUNDARY PIN');
    } else if (dna.aggression >= 0.75) {
      pressureMode = 'PUNISH_WHIFF';
      approachSpeedMultiplier = 0.9; // bait the aggressive player into swinging first
      activeTactics.push('BAIT & SPACING CADENCE // PUNISH OVEREXTENSION');
    }

    // 5. Predictability Level
    const predictabilityLevel =
      dna.predictabilityIndex >= 0.65
        ? 'HIGH'
        : dna.predictabilityIndex >= 0.42
        ? 'MODERATE'
        : 'LOW';

    // Build tactical summary
    const tacticalDescription =
      counterDodge !== 'NEUTRAL'
        ? `${counterDodge.replace('_', ' ')} // ${comboPatternName} PARRY ACTIVE`
        : `ADAPTIVE COUNTER: ${defenseMode} + ${pressureMode}`;

    const adaptationConfidence = Number(
      Math.min(0.98, Math.max(0.55, dna.predictabilityIndex * 0.6 + 0.4)).toFixed(2)
    );

    return {
      id: `STRAT-${Date.now().toString(36).toUpperCase()}`,
      name: `NEURAL COUNTER v2 [${dna.archetype}]`,
      tacticalDescription,
      activeTactics,
      counterDodge,
      interceptDodgeBias,
      defenseMode,
      antiComboTactics,
      targetComboPattern: comboPatternName,
      blockProbabilityOnPlayerAttack,
      counterAttackAfterBlockProbability,
      pressureMode,
      approachSpeedMultiplier,
      attackRangeMultiplier: pressureMode === 'RELENTLESS_CHASE' ? 1.15 : 1.0,
      dodgeLeftFrequency,
      comboPatternName,
      predictabilityLevel,
      adaptationConfidence,
    };
  }

  /**
   * Generates a neutral default strategy when no previous match DNA is available.
   */
  public static getBaselineStrategy(): CounterStrategy {
    return {
      id: 'STRAT-BASELINE',
      name: 'BASELINE COMBAT PROTOCOL',
      tacticalDescription: 'STANDARD ENGAGEMENT CADENCE // CALIBRATING',
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
      adaptationConfidence: 0.5,
    };
  }
}
