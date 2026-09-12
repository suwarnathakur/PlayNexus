/**
 * PLAYNEXUS Backend Lock-In Service
 * Processes dodge repetition telemetry to trigger Adaptation Locks and challenges.
 */

export class LockInService {
  /**
   * Evaluates dodge telemetry to trigger Adaptation Locks.
   * @param {Object} params
   * @param {Array} params.recentDodges - list of recent dodge directions
   * @param {string} params.playerId - player ID
   */
  static evaluateDodgeLock({ recentDodges = [], playerId }) {
    let leftCount = 0;
    let rightCount = 0;

    recentDodges.forEach((d) => {
      const dir = typeof d === 'string' ? d : d.direction;
      if (dir === 'left') leftCount++;
      else if (dir === 'right') rightCount++;
    });

    const total = recentDodges.length;
    const isLeftRepetitive = leftCount >= 5;
    const isRightRepetitive = rightCount >= 5;

    if (!isLeftRepetitive && !isRightRepetitive) {
      return {
        triggered: false,
        message: 'NO CRITICAL PATTERN DETECTED',
        totalDodges: total,
      };
    }

    const lockedDirection = isLeftRepetitive ? 'left' : 'right';
    const targetDirection = isLeftRepetitive ? 'right' : 'left';
    const repCount = isLeftRepetitive ? leftCount : rightCount;
    const percentage = total > 0 ? Math.round((repCount / total) * 100) : 83;

    return {
      triggered: true,
      playerId,
      pattern: {
        announcement: 'PATTERN DETECTED',
        detectionText: `You've been dodging ${lockedDirection.toUpperCase()}.`,
        percentageText: `${percentage}% of your dodges are ${lockedDirection.toUpperCase()}.`,
        percentage,
        lockedDirection,
      },
      challenge: {
        title: 'ADAPTATION LOCK ACTIVATED',
        directive: `SURVIVE 15 SECONDS DODGING ONLY ${targetDirection.toUpperCase()}.`,
        targetDirection,
        durationSeconds: 15,
        prohibitedDirection: lockedDirection,
        reward: '+20% DODGE SPEED',
      },
    };
  }
}
