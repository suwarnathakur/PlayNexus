/**
 * PLAYNEXUS Backend Strategy Engine Service
 * Generates rule-based counter-strategies from Fighting DNA.
 */

export class StrategyEngineService {
  /**
   * Generates concrete counter strategy from player Fighting DNA.
   * @param {Object} dna - Fighting DNA profile
   */
  static generateStrategy(dna = {}) {
    const activeTactics = [];

    // 1. Counter Dodge
    let counterDodge = 'NEUTRAL';
    const dodgeLeftFrequency = (dna.dodgeLeftPercentage || 50) / 100;
    if (dna.preferredDodge === 'left' || dodgeLeftFrequency >= 0.55) {
      counterDodge = 'COUNTER_LEFT';
      activeTactics.push(`COUNTER LEFT DODGE // INTERCEPT FLANK (${Math.round(dodgeLeftFrequency * 100)}%)`);
    } else if (dna.preferredDodge === 'right' || (dna.dodgeRightPercentage || 0) >= 55) {
      counterDodge = 'COUNTER_RIGHT';
      activeTactics.push(`COUNTER RIGHT DODGE // OFF-AXIS ANGLE`);
    }

    // 2. Anti-Combo Adaptation
    const isComboHeavy = (dna.averageComboLength || 1.0) >= 1.8;
    const targetComboPattern = isComboHeavy ? 'LIGHT-LIGHT-HEAVY' : 'SINGLE-JAB';
    const blockProbability = isComboHeavy ? 0.85 : 0.45;
    const counterAttackProbability = isComboHeavy ? 0.80 : 0.35;
    if (isComboHeavy) {
      activeTactics.push(`AUTO-BLOCK COMBO & PARRY PUNISH (${targetComboPattern})`);
    }

    // 3. Defense Mode (High guard against aggressive attackers)
    let defenseMode = 'NORMAL';
    if ((dna.aggression || 0.5) >= 0.65) {
      defenseMode = 'HIGH_GUARD';
      activeTactics.push('PATIENT HIGH-GUARD // PUNISH OVEREXTENSION');
    }

    // 4. Pressure Mode (Relentless rushdown when player turtles or retreats)
    let pressureMode = 'METHODICAL';
    let approachSpeedMultiplier = 1.0;
    if (dna.preferredRange === 'far' || (dna.aggression || 0.5) <= 0.42) {
      pressureMode = 'RELENTLESS_CHASE';
      approachSpeedMultiplier = 1.45;
      activeTactics.push('RELENTLESS RUSHDOWN // SPRINT CLOSURE');
    }

    const predictabilityLevel =
      (dna.predictabilityIndex || 0.5) >= 0.65
        ? 'HIGH'
        : (dna.predictabilityIndex || 0.5) >= 0.42
        ? 'MODERATE'
        : 'LOW';

    return {
      id: `STRAT-BE-${Date.now().toString(36).toUpperCase()}`,
      counterDodge,
      defenseMode,
      pressureMode,
      targetComboPattern,
      blockProbabilityOnPlayerAttack: blockProbability,
      counterAttackAfterBlockProbability: counterAttackProbability,
      approachSpeedMultiplier,
      dodgeLeftFrequency,
      comboPatternName: targetComboPattern,
      predictabilityLevel,
      tacticalDescription:
        counterDodge !== 'NEUTRAL'
          ? `${counterDodge.replace('_', ' ')} // ${targetComboPattern} PARRY ACTIVE`
          : `ADAPTIVE COUNTER: ${defenseMode} + ${pressureMode}`,
      activeTactics,
      adaptationConfidence: Number(
        Math.min(0.98, Math.max(0.6, (dna.predictabilityIndex || 0.5) * 0.6 + 0.4)).toFixed(2)
      ),
    };
  }
}
