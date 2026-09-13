import type { BehaviorStats, DetectedPattern } from './BehaviorTypes';

/**
 * PLAYNEXUS Pattern Detector
 * Identifies combat behavioral patterns with rigorous confidence scores and human-readable evidence.
 */
export class PatternDetector {
  /**
   * Detect patterns from analyzed BehaviorStats
   */
  public static detectPatterns(stats: BehaviorStats): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // PATTERN 1: DODGE DIRECTION (Left > 70% or Right > 70%)
    if (stats.totalDodges >= 3) {
      if (stats.dodgeLeftPercentage >= 70) {
        const leftCount = Math.round((stats.dodgeLeftPercentage / 100) * stats.totalDodges);
        const confidence = Number(Math.min(0.98, stats.dodgeLeftPercentage / 100 + (stats.totalDodges >= 8 ? 0.05 : 0)).toFixed(2));
        patterns.push({
          type: 'PREFERRED_DODGE_LEFT',
          confidence,
          evidence: `${leftCount} of ${stats.totalDodges} dodges were directed left (${stats.dodgeLeftPercentage}%)`,
        });
      } else if (stats.dodgeRightPercentage >= 70) {
        const rightCount = Math.round((stats.dodgeRightPercentage / 100) * stats.totalDodges);
        const confidence = Number(Math.min(0.98, stats.dodgeRightPercentage / 100 + (stats.totalDodges >= 8 ? 0.05 : 0)).toFixed(2));
        patterns.push({
          type: 'PREFERRED_DODGE_RIGHT',
          confidence,
          evidence: `${rightCount} of ${stats.totalDodges} dodges were directed right (${stats.dodgeRightPercentage}%)`,
        });
      }
    }

    // PATTERN 2: REPEATED COMBO
    if (stats.comboPreference.frequency >= 0.60 && stats.comboPreference.allSequences.length > 0) {
      const confidence = Number(Math.min(0.95, stats.comboPreference.frequency * 1.05).toFixed(2));
      patterns.push({
        type: 'REPEATED_COMBO',
        confidence,
        evidence: `Signature sequence "${stats.comboPreference.favoriteCombo.toUpperCase()}" utilized in ${Math.round(stats.comboPreference.frequency * 100)}% of attack chains`,
      });
    }

    // PATTERN 3: HIGH AGGRESSION (Attack Spam)
    if (stats.aggression >= 0.75) {
      const confidence = Number(Math.min(0.96, stats.aggression * 1.02).toFixed(2));
      patterns.push({
        type: 'HIGH_AGGRESSION',
        confidence,
        evidence: `Hyper-aggressive pacing (${Math.round(stats.aggression * 100)}% rating) with ${stats.attackFrequency} attacks/sec and rapid forward rush`,
      });
    }

    // PATTERN 4: DEFENSIVE PLAYER (Guard Stance)
    if (stats.defense >= 0.70) {
      const confidence = Number(Math.min(0.94, stats.defense * 1.05).toFixed(2));
      patterns.push({
        type: 'DEFENSIVE_STYLE',
        confidence,
        evidence: `Defensive priority (${Math.round(stats.defense * 100)}% rating) relying on turtled guard blocks and spacing retreats`,
      });
    }

    // PATTERN 5: RANGE PREFERENCE (Long-range / Standoff)
    if (stats.preferredRange === 'long') {
      patterns.push({
        type: 'LONG_RANGE_PLAYER',
        confidence: 0.88,
        evidence: `Sustains combat perimeter at average distance of ${stats.averageDistance}m with ranged kiting`,
      });
    }

    // PATTERN 6: PREDICTABLE TIMING
    if (stats.attackIntervalStdDevMs < 140 && stats.meanAttackIntervalMs > 0) {
      patterns.push({
        type: 'PREDICTABLE_ATTACK_TIMING',
        confidence: 0.82,
        evidence: `Strikes initiated with metronomic rhythm (~${stats.meanAttackIntervalMs}ms ±${stats.attackIntervalStdDevMs}ms)`,
      });
    }

    return patterns;
  }

  /**
   * Filter patterns meeting high confidence threshold (e.g. >= 0.70)
   */
  public static getActionablePatterns(patterns: DetectedPattern[], minConfidence = 0.70): DetectedPattern[] {
    return patterns.filter((p) => p.confidence >= minConfidence);
  }
}
