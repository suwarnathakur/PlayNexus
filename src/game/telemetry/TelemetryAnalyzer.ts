import type { MatchMetrics, TelemetryEvent } from './TelemetryTypes';

/**
 * PLAYNEXUS Telemetry Analyzer
 * Evaluates raw telemetry streams to calculate performance statistics
 * and behavioural pillars (Aggression, Defense, Mobility, Predictability).
 */
export class TelemetryAnalyzer {
  /**
   * Calculates comprehensive match metrics from a stream of telemetry events.
   */
  public static calculateMetrics(
    events: TelemetryEvent[],
    durationSeconds: number
  ): MatchMetrics {
    const validDuration = Math.max(1, durationSeconds);

    let totalAttacks = 0;
    let successfulAttacks = 0;
    let missedAttacks = 0;
    let blocks = 0;
    let dodges = 0;
    let dodgeLeftCount = 0;
    let dodgeRightCount = 0;
    let dodgeOtherCount = 0;
    let totalDamageDealt = 0;
    let totalDamageReceived = 0;
    let totalDistanceMoved = 0;
    let maxCombo = 0;
    const comboValues: number[] = [];
    const attackIntervals: number[] = [];

    // Tally events
    for (let i = 0; i < events.length; i++) {
      const e = events[i];

      switch (e.action) {
        case 'attack':
          totalAttacks++;
          if (e.intervalSinceLastAction && e.intervalSinceLastAction > 0) {
            attackIntervals.push(e.intervalSinceLastAction);
          }
          break;

        case 'hit':
          successfulAttacks++;
          if (e.damage) totalDamageDealt += e.damage;
          if (e.combo) {
            comboValues.push(e.combo);
            if (e.combo > maxCombo) maxCombo = e.combo;
          }
          break;

        case 'miss':
          missedAttacks++;
          break;

        case 'block':
          blocks++;
          break;

        case 'dodge':
          dodges++;
          if (e.direction === 'left') {
            dodgeLeftCount++;
          } else if (e.direction === 'right') {
            dodgeRightCount++;
          } else {
            dodgeOtherCount++;
          }
          break;

        case 'damage_dealt':
          if (e.damage) totalDamageDealt += e.damage;
          break;

        case 'damage_received':
          if (e.damage) totalDamageReceived += e.damage;
          break;

        case 'movement':
          if (e.damage) {
            // Note: distance stored in damage or details if needed
            totalDistanceMoved += e.damage;
          }
          break;
      }
    }

    // Accuracy
    const accuracyPercentage =
      totalAttacks > 0
        ? Math.min(100, Math.round((successfulAttacks / totalAttacks) * 100))
        : 0;

    // Dodge Direction Percentages
    const dodgeLeftPercentage =
      dodges > 0 ? Math.round((dodgeLeftCount / dodges) * 100) : 0;
    const dodgeRightPercentage =
      dodges > 0 ? Math.round((dodgeRightCount / dodges) * 100) : 0;
    const dodgeOtherPercentage =
      dodges > 0
        ? Math.max(0, 100 - dodgeLeftPercentage - dodgeRightPercentage)
        : 0;

    // Average Combo Length
    const averageComboLength =
      comboValues.length > 0
        ? Number(
            (
              comboValues.reduce((a, b) => a + b, 0) / comboValues.length
            ).toFixed(1)
          )
        : totalAttacks > 0
        ? 1.0
        : 0.0;

    // 1. Calculate Aggression (0 - 100)
    // High attack rate, low block ratio, high forward pressure
    const attacksPerMinute = (totalAttacks / validDuration) * 60;
    const attackPressureScore = Math.min(100, (attacksPerMinute / 30) * 100);
    const offensiveRatio =
      totalAttacks + blocks > 0
        ? (totalAttacks / (totalAttacks + blocks)) * 100
        : 50;
    const aggression = Math.round(
      Math.min(
        100,
        Math.max(10, attackPressureScore * 0.55 + offensiveRatio * 0.45)
      )
    );

    // 2. Calculate Defense (0 - 100)
    // Good use of blocks & dodges, guarding attacks
    const defensiveActions = blocks + dodges;
    const defensiveRate = (defensiveActions / validDuration) * 60;
    const defensiveActivityScore = Math.min(100, (defensiveRate / 18) * 100);
    const damageMitigationScore =
      totalDamageReceived + totalDamageDealt > 0
        ? Math.min(
            100,
            (totalDamageDealt / (totalDamageDealt + totalDamageReceived)) * 100
          )
        : 50;
    const defense = Math.round(
      Math.min(
        100,
        Math.max(10, defensiveActivityScore * 0.6 + damageMitigationScore * 0.4)
      )
    );

    // 3. Calculate Mobility (0 - 100)
    // Dodges per minute + arena traversal
    const dodgesPerMinute = (dodges / validDuration) * 60;
    const dodgeMobilityScore = Math.min(100, (dodgesPerMinute / 12) * 100);
    const distanceScore = Math.min(
      100,
      (totalDistanceMoved / (validDuration * 2.5)) * 100
    );
    const mobility = Math.round(
      Math.min(100, Math.max(15, dodgeMobilityScore * 0.65 + distanceScore * 0.35))
    );

    // 4. Calculate Predictability (0 - 100)
    // - Directional dodge bias (e.g. always dodging left)
    // - Attack cadence variance (rhythmic spam vs varied bursts)
    // - Repetitive action streaks
    const dodgeBias =
      dodges >= 2
        ? Math.abs(dodgeLeftPercentage - dodgeRightPercentage)
        : 30; // 0 is perfectly balanced, 100 is completely one-sided

    // Attack timing regularity (low variance = highly predictable rhythm)
    let cadencePredictability = 50;
    if (attackIntervals.length >= 3) {
      const meanInterval =
        attackIntervals.reduce((a, b) => a + b, 0) / attackIntervals.length;
      const variance =
        attackIntervals.reduce(
          (acc, val) => acc + Math.pow(val - meanInterval, 2),
          0
        ) / attackIntervals.length;
      const stdDev = Math.sqrt(variance);
      // If stdDev is very small (e.g. < 200ms), user attacks like a metronome (predictable)
      cadencePredictability = Math.max(
        15,
        Math.min(95, Math.round(100 - (stdDev / 800) * 100))
      );
    }

    // Action pattern repetition check (bigram repeats)
    let repetitivePatterns = 0;
    for (let i = 1; i < events.length; i++) {
      if (events[i].action === events[i - 1].action) {
        repetitivePatterns++;
      }
    }
    const repetitionScore =
      events.length > 2
        ? Math.min(100, (repetitivePatterns / events.length) * 140)
        : 45;

    const predictability = Math.round(
      Math.min(
        100,
        Math.max(
          10,
          dodgeBias * 0.35 +
            cadencePredictability * 0.35 +
            repetitionScore * 0.3
        )
      )
    );

    return {
      totalAttacks,
      successfulAttacks,
      missedAttacks,
      accuracyPercentage,
      blocks,
      dodges,
      dodgeLeftCount,
      dodgeRightCount,
      dodgeOtherCount,
      dodgeLeftPercentage,
      dodgeRightPercentage,
      dodgeOtherPercentage,
      averageComboLength,
      maxCombo: Math.max(maxCombo, successfulAttacks > 0 ? 1 : 0),
      totalDamageDealt,
      totalDamageReceived,
      totalDistanceMoved: Math.round(totalDistanceMoved * 10) / 10,
      durationSeconds: Math.round(durationSeconds),
      aggression,
      defense,
      mobility,
      predictability,
    };
  }
}
