/**
 * PLAYNEXUS Backend Behavioral Analysis Service
 * Implements rule-based algorithms to evaluate telemetry streams and synthesize Fighting DNA.
 */

export class BehaviorAnalysisService {
  /**
   * Analyzes raw telemetry events and computes Fighting DNA.
   * @param {Array} events - Stream of recorded player telemetry events
   * @param {number} durationSeconds - Match duration
   */
  static analyzeBehavior(events = [], durationSeconds = 30) {
    const validDuration = Math.max(1, durationSeconds || 1);

    let attackCount = 0;
    let hitCount = 0;
    let blockCount = 0;
    let dodgeCount = 0;
    let dodgeLeftCount = 0;
    let dodgeRightCount = 0;
    let totalAttackDistance = 0;
    let attackDistanceSamples = 0;

    const comboLengths = [];
    const attackIntervals = [];

    events.forEach((e) => {
      if (e.action === 'attack') {
        attackCount++;
        if (e.distanceToEnemy && e.distanceToEnemy > 0) {
          totalAttackDistance += e.distanceToEnemy;
          attackDistanceSamples++;
        }
        if (e.intervalSinceLastAction && e.intervalSinceLastAction > 0) {
          attackIntervals.push(e.intervalSinceLastAction);
        }
      } else if (e.action === 'hit') {
        hitCount++;
        if (e.combo) comboLengths.push(e.combo);
      } else if (e.action === 'block') {
        blockCount++;
      } else if (e.action === 'dodge') {
        dodgeCount++;
        if (e.direction === 'left') dodgeLeftCount++;
        else if (e.direction === 'right') dodgeRightCount++;
      }
    });

    // 1. Aggression (0.10 to 1.00)
    const attacksPerMin = (attackCount / validDuration) * 60;
    const offensiveRatio =
      attackCount + blockCount > 0 ? attackCount / (attackCount + blockCount) : 0.6;
    const aggression = Number(
      Math.min(1.0, Math.max(0.12, (attacksPerMin / 30) * 0.6 + offensiveRatio * 0.4)).toFixed(2)
    );

    // 2. Defense (0.10 to 1.00)
    const defensePace = Math.min(1.0, ((blockCount + dodgeCount) / validDuration) * 60 / 18);
    const defense = Number(
      Math.min(1.0, Math.max(0.1, defensePace * 0.7 + (blockCount > 0 ? 0.3 : 0.05))).toFixed(2)
    );

    // 3. Mobility (0.15 to 1.00)
    const dodgesPerMin = (dodgeCount / validDuration) * 60;
    const mobility = Number(
      Math.min(1.0, Math.max(0.15, (dodgesPerMin / 12) * 0.75 + (attackCount > 0 ? 0.25 : 0.1))).toFixed(2)
    );

    // 4. Preferred Dodge Direction
    const dodgeLeftPercentage = dodgeCount > 0 ? Math.round((dodgeLeftCount / dodgeCount) * 100) : 50;
    const dodgeRightPercentage = dodgeCount > 0 ? Math.round((dodgeRightCount / dodgeCount) * 100) : 50;
    let preferredDodge = 'balanced';
    if (dodgeLeftPercentage >= 55) preferredDodge = 'left';
    else if (dodgeRightPercentage >= 55) preferredDodge = 'right';

    // 5. Preferred Range
    const avgDist = attackDistanceSamples > 0 ? totalAttackDistance / attackDistanceSamples : 1.8;
    const preferredRange = avgDist <= 1.5 ? 'close' : avgDist <= 2.2 ? 'mid' : 'far';

    // 6. Average Combo Length
    const averageComboLength =
      comboLengths.length > 0
        ? Number((comboLengths.reduce((a, b) => a + b, 0) / comboLengths.length).toFixed(1))
        : attackCount > 0 ? 1.2 : 1.0;

    // 7. Predictability Index (0.15 to 0.95)
    const dodgeBias = dodgeCount >= 2 ? Math.abs(dodgeLeftPercentage - dodgeRightPercentage) / 100 : 0.3;
    let cadencePredictability = 0.5;
    if (attackIntervals.length >= 3) {
      const mean = attackIntervals.reduce((a, b) => a + b, 0) / attackIntervals.length;
      const variance =
        attackIntervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / attackIntervals.length;
      const stdDev = Math.sqrt(variance);
      cadencePredictability = Math.max(0.15, Math.min(0.9, 1.0 - stdDev / 900));
    }
    const predictabilityIndex = Number(
      Math.min(0.95, Math.max(0.15, dodgeBias * 0.5 + cadencePredictability * 0.5)).toFixed(2)
    );

    // 8. Archetype
    let archetype = 'BALANCED_STRIKER';
    if (aggression >= 0.72 && mobility >= 0.5) archetype = 'BERSERKER';
    else if (defense >= 0.6) archetype = 'TURTLE';
    else if (mobility >= 0.68) archetype = 'PHANTOM';
    else if (predictabilityIndex <= 0.38) archetype = 'TACTICIAN';

    // Strengths & Weaknesses
    const strengths = [];
    if (aggression >= 0.65) strengths.push('High offensive pace disrupts enemy FSM states');
    if (defense >= 0.5) strengths.push('Solid guard mitigation and damage containment');
    if (mobility >= 0.55) strengths.push('Rapid repositioning out of melee threat range');

    const weaknesses = [];
    if (preferredDodge === 'left') weaknesses.push(`High left dodge bias (${dodgeLeftPercentage}%); vulnerable to sweeping strikes`);
    else if (preferredDodge === 'right') weaknesses.push(`High right dodge bias (${dodgeRightPercentage}%); vulnerable to off-axis counters`);
    if (predictabilityIndex >= 0.65) weaknesses.push('Rhythmic attack intervals permit automated parry buffers');

    return {
      aggression,
      defense,
      mobility,
      reactionTime: 0.28,
      preferredDodge,
      preferredRange,
      averageComboLength,
      repeatedCombos: averageComboLength >= 1.8 ? ['LIGHT-LIGHT-HEAVY'] : ['SINGLE-JAB'],
      strengths: strengths.length ? strengths : ['Stable baseline fundamentals'],
      weaknesses: weaknesses.length ? weaknesses : ['Recovery lag after multi-hit chains'],
      predictabilityIndex,
      archetype,
      totalAttacks: attackCount,
      accuracyPercentage: attackCount > 0 ? Math.round((hitCount / attackCount) * 100) : 0,
      dodgeLeftPercentage,
      dodgeRightPercentage,
    };
  }
}
