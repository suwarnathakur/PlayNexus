import type { TelemetryEvent, MatchTelemetry } from '../../game/telemetry/TelemetryTypes';
import type { BehaviorStats, ComboPreference, PreferredDodge, RangeCategory } from './BehaviorTypes';

/**
 * PLAYNEXUS Behavior Analyzer
 * Performs statistical analysis over raw telemetry events to compute
 * behavioral pillars (Aggression, Defense, Mobility, Predictability) and combat preferences.
 */
export class BehaviorAnalyzer {
  /**
   * Analyze an array of TelemetryEvent objects (either live mid-match or post-match)
   */
  public static analyzeEvents(events: TelemetryEvent[], durationSeconds = 30): BehaviorStats {
    if (!events || events.length === 0) {
      return this.getDefaultStats();
    }

    const duration = Math.max(durationSeconds, 1);

    // Filter event subsets
    const attackEvents = events.filter((e) => e.action === 'attack');
    const blockEvents = events.filter((e) => e.action === 'block');
    const dodgeEvents = events.filter((e) => e.action === 'dodge');
    const movementEvents = events.filter((e) => e.action === 'movement');
    const hitEvents = events.filter((e) => e.action === 'hit');
    const damageDealtEvents = events.filter((e) => e.action === 'damage_dealt');

    // 1. DODGE ANALYSIS
    const leftDodges = dodgeEvents.filter((e) => e.direction === 'left').length;
    const rightDodges = dodgeEvents.filter((e) => e.direction === 'right').length;
    const totalDodges = dodgeEvents.length;

    let dodgeLeftPercentage = 50;
    let dodgeRightPercentage = 50;
    let preferredDodge: PreferredDodge = 'mixed';

    if (totalDodges > 0) {
      dodgeLeftPercentage = Math.round((leftDodges / totalDodges) * 100);
      dodgeRightPercentage = Math.round((rightDodges / totalDodges) * 100);

      if (dodgeLeftPercentage >= 65) {
        preferredDodge = 'left';
      } else if (dodgeRightPercentage >= 65) {
        preferredDodge = 'right';
      } else {
        preferredDodge = 'mixed';
      }
    }

    // 2. COMBO ANALYSIS
    const comboPref = this.extractComboPreference(events);
    const avgComboLength = Number((1 + (comboPref.favoriteCombo.split('-').length - 1) * 0.7).toFixed(1));

    // 3. RANGE ANALYSIS
    const distances = events
      .filter((e) => typeof e.distanceToEnemy === 'number' && e.distanceToEnemy > 0)
      .map((e) => e.distanceToEnemy as number);

    const avgDistance = distances.length > 0
      ? distances.reduce((a, b) => a + b, 0) / distances.length
      : 2.5;

    let preferredRange: RangeCategory = 'medium';
    if (avgDistance < 2.3) {
      preferredRange = 'close';
    } else if (avgDistance > 4.2) {
      preferredRange = 'long';
    }

    // 4. ATTACK ACCURACY & TIMING
    const successfulAttacks = hitEvents.length + damageDealtEvents.length;
    const totalAttacks = attackEvents.length;
    const attackAccuracy = totalAttacks > 0
      ? Math.min(1.0, successfulAttacks / totalAttacks)
      : 0.5;

    // Attack timing intervals
    const attackIntervals: number[] = [];
    let lastAttackTs = 0;
    for (const evt of attackEvents) {
      if (lastAttackTs > 0) {
        attackIntervals.push(evt.timestamp - lastAttackTs);
      }
      lastAttackTs = evt.timestamp;
    }

    let meanAttackIntervalMs = 800;
    let attackIntervalStdDevMs = 300;
    if (attackIntervals.length > 1) {
      meanAttackIntervalMs = attackIntervals.reduce((a, b) => a + b, 0) / attackIntervals.length;
      const variance =
        attackIntervals.reduce((sum, val) => sum + Math.pow(val - meanAttackIntervalMs, 2), 0) /
        attackIntervals.length;
      attackIntervalStdDevMs = Math.sqrt(variance);
    }

    // 5. AGGRESSION CALCULATION (0.0 to 1.0)
    // Based on attack frequency, attack success, forward movement
    const attacksPerSec = totalAttacks / duration;
    const normalizedAttackRate = Math.min(1.0, attacksPerSec / 1.2); // 1.2 attacks/sec is high
    const forwardMoveCount = movementEvents.filter((e) => e.direction === 'forward').length;
    const forwardRatio = movementEvents.length > 0 ? forwardMoveCount / movementEvents.length : 0.4;

    const aggression = Number(
      Math.min(
        1.0,
        Math.max(
          0.1,
          normalizedAttackRate * 0.55 + attackAccuracy * 0.25 + forwardRatio * 0.2
        )
      ).toFixed(2)
    );

    // 6. DEFENSE CALCULATION (0.0 to 1.0)
    // Based on block frequency, successful blocks, retreat frequency
    const blocksPerSec = blockEvents.length / duration;
    const normalizedBlockRate = Math.min(1.0, blocksPerSec / 0.8);
    const retreatMoveCount = movementEvents.filter((e) => e.direction === 'backward').length;
    const retreatRatio = movementEvents.length > 0 ? retreatMoveCount / movementEvents.length : 0.3;

    const defense = Number(
      Math.min(
        1.0,
        Math.max(
          0.1,
          normalizedBlockRate * 0.55 + retreatRatio * 0.3 + (blockEvents.length > 3 ? 0.15 : 0)
        )
      ).toFixed(2)
    );

    // 7. MOBILITY CALCULATION (0.0 to 1.0)
    // Based on movement frequency, dodge frequency
    const dodgesPerSec = totalDodges / duration;
    const movesPerSec = movementEvents.length / duration;
    const mobility = Number(
      Math.min(
        1.0,
        Math.max(0.1, Math.min(1.0, (dodgesPerSec * 1.5 + movesPerSec * 0.8) / 1.5))
      ).toFixed(2)
    );

    // 8. PREDICTABILITY INDEX (0.0 = unpredictable, 1.0 = highly predictable)
    // Derived from directional dodge bias, combo repetition, and attack interval regularity
    let directionalPredictability = 0.5;
    if (totalDodges >= 3) {
      // If one direction is heavily favored, predictability rises
      const dominantDodgeRatio = Math.max(dodgeLeftPercentage, dodgeRightPercentage) / 100;
      directionalPredictability = dominantDodgeRatio >= 0.7 ? 0.88 : dominantDodgeRatio >= 0.6 ? 0.65 : 0.35;
    }

    const comboPredictability = comboPref.frequency >= 0.6 ? 0.85 : comboPref.frequency >= 0.4 ? 0.6 : 0.4;
    const timingPredictability = attackIntervalStdDevMs < 160 && attackIntervals.length >= 3 ? 0.8 : 0.45;

    const predictabilityIndex = Number(
      Math.min(
        0.98,
        Math.max(
          0.2,
          directionalPredictability * 0.5 + comboPredictability * 0.3 + timingPredictability * 0.2
        )
      ).toFixed(2)
    );

    return {
      aggression,
      defense,
      mobility,
      preferredDodge,
      dodgeLeftPercentage,
      dodgeRightPercentage,
      totalDodges,
      comboPreference: comboPref,
      averageComboLength: avgComboLength,
      preferredRange,
      averageDistance: Number(avgDistance.toFixed(1)),
      attackFrequency: Number((totalAttacks / duration).toFixed(2)),
      blockFrequency: Number((blockEvents.length / duration).toFixed(2)),
      attackAccuracy: Number(attackAccuracy.toFixed(2)),
      predictabilityIndex,
      meanAttackIntervalMs: Math.round(meanAttackIntervalMs),
      attackIntervalStdDevMs: Math.round(attackIntervalStdDevMs),
    };
  }

  /**
   * Helper to detect repeated attack sequences (e.g. light-light-heavy)
   */
  private static extractComboPreference(events: TelemetryEvent[]): ComboPreference {
    const attackSequences: string[] = [];
    let currentComboChain: string[] = [];
    let lastAttackTime = 0;

    for (const evt of events) {
      if (evt.action === 'attack') {
        const timeSince = lastAttackTime > 0 ? evt.timestamp - lastAttackTime : 0;
        lastAttackTime = evt.timestamp;

        const strikeType = evt.attackType || ((evt.combo || 1) >= 3 ? 'heavy' : 'light');

        if (timeSince < 1200 && currentComboChain.length > 0) {
          currentComboChain.push(strikeType);
        } else {
          if (currentComboChain.length >= 2) {
            attackSequences.push(currentComboChain.join('-'));
          }
          currentComboChain = [strikeType];
        }
      }
    }

    if (currentComboChain.length >= 2) {
      attackSequences.push(currentComboChain.join('-'));
    }

    if (attackSequences.length === 0) {
      return {
        favoriteCombo: 'light-light-heavy',
        frequency: 0.5,
        allSequences: [{ sequence: 'light-light-heavy', count: 1, percentage: 50 }],
      };
    }

    const counts: Record<string, number> = {};
    for (const seq of attackSequences) {
      counts[seq] = (counts[seq] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const topSeq = sorted[0];
    const favoriteCombo = topSeq[0];
    const frequency = Number((topSeq[1] / attackSequences.length).toFixed(2));

    const allSequences = sorted.map(([seq, count]) => ({
      sequence: seq,
      count,
      percentage: Math.round((count / attackSequences.length) * 100),
    }));

    return {
      favoriteCombo,
      frequency,
      allSequences,
    };
  }

  /**
   * Analyze from a full MatchTelemetry object
   */
  public static analyzeMatch(match: MatchTelemetry): BehaviorStats {
    return this.analyzeEvents(match.events || [], match.durationSeconds || 30);
  }

  /**
   * Default stats when no data has been collected yet
   */
  public static getDefaultStats(): BehaviorStats {
    return {
      aggression: 0.65,
      defense: 0.45,
      mobility: 0.55,
      preferredDodge: 'left',
      dodgeLeftPercentage: 60,
      dodgeRightPercentage: 40,
      totalDodges: 6,
      comboPreference: {
        favoriteCombo: 'light-light-heavy',
        frequency: 0.65,
        allSequences: [{ sequence: 'light-light-heavy', count: 4, percentage: 65 }],
      },
      averageComboLength: 2.4,
      preferredRange: 'close',
      averageDistance: 2.1,
      attackFrequency: 0.8,
      blockFrequency: 0.3,
      attackAccuracy: 0.72,
      predictabilityIndex: 0.58,
      meanAttackIntervalMs: 820,
      attackIntervalStdDevMs: 220,
    };
  }
}
