import type { MatchTelemetry } from '../../game/telemetry/TelemetryTypes';
import type {
  FightingDNAProfile,
  PreferredDodgeDirection,
  PreferredCombatRange,
  FighterArchetype,
} from './DNATypes';

/**
 * PLAYNEXUS DNA Analyzer
 * Rule-based heuristic engine analyzing telemetry event streams to synthesize
 * the player's Fighting DNA profile without requiring an external LLM.
 */
export class DNAAnalyzer {
  public static analyze(match: MatchTelemetry): FightingDNAProfile {
    const { events, durationSeconds } = match;
    const validDuration = Math.max(1, durationSeconds || 1);

    // 1. Action tallies and distributions
    let attackCount = 0;
    let hitCount = 0;
    let blockCount = 0;
    let dodgeCount = 0;
    let dodgeLeftCount = 0;
    let dodgeRightCount = 0;
    let dodgeBackwardCount = 0;
    let dodgeForwardCount = 0;

    let totalAttackDistance = 0;
    let attackDistanceSamples = 0;

    const comboLengths: number[] = [];
    const attackIntervals: number[] = [];
    const reactionTimeSamples: number[] = [];

    // Analyze individual events
    for (let i = 0; i < events.length; i++) {
      const e = events[i];

      if (e.action === 'attack') {
        attackCount++;
        if (e.distanceToEnemy !== undefined && e.distanceToEnemy > 0) {
          totalAttackDistance += e.distanceToEnemy;
          attackDistanceSamples++;
        }
        if (e.intervalSinceLastAction && e.intervalSinceLastAction > 0) {
          attackIntervals.push(e.intervalSinceLastAction);
        }
      } else if (e.action === 'hit') {
        hitCount++;
        if (e.combo) {
          comboLengths.push(e.combo);
        }
      } else if (e.action === 'block') {
        blockCount++;
        // Reaction sample: if preceded by an attack within 450ms
        if (e.intervalSinceLastAction && e.intervalSinceLastAction <= 800) {
          reactionTimeSamples.push(e.intervalSinceLastAction / 1000);
        }
      } else if (e.action === 'dodge') {
        dodgeCount++;
        if (e.direction === 'left') dodgeLeftCount++;
        else if (e.direction === 'right') dodgeRightCount++;
        else if (e.direction === 'backward') dodgeBackwardCount++;
        else if (e.direction === 'forward') dodgeForwardCount++;

        if (e.intervalSinceLastAction && e.intervalSinceLastAction <= 800) {
          reactionTimeSamples.push(e.intervalSinceLastAction / 1000);
        }
      }
    }

    // 2. Pillar Calculations (0.00 to 1.00)
    // Aggression: Attack frequency, damage output, and forward initiative
    const attacksPerMinute = (attackCount / validDuration) * 60;
    const attackPace = Math.min(1.0, attacksPerMinute / 32);
    const offensiveRatio =
      attackCount + blockCount > 0 ? attackCount / (attackCount + blockCount) : 0.6;
    const aggression = Number(
      Math.min(1.0, Math.max(0.12, attackPace * 0.6 + offensiveRatio * 0.4)).toFixed(2)
    );

    // Defense: Shield usage, reaction guarding, and damage avoidance
    const defensivePace = Math.min(1.0, ((blockCount + dodgeCount) / validDuration) * 60 / 18);
    const defense = Number(
      Math.min(1.0, Math.max(0.1, defensivePace * 0.7 + (blockCount > 0 ? 0.3 : 0.05))).toFixed(2)
    );

    // Mobility: Dodging rate and spatial traversal
    const dodgesPerMinute = (dodgeCount / validDuration) * 60;
    const mobility = Number(
      Math.min(1.0, Math.max(0.15, (dodgesPerMinute / 12) * 0.75 + (attackCount > 0 ? 0.25 : 0.1))).toFixed(2)
    );

    // 3. Preferred Dodge Direction
    let preferredDodge: PreferredDodgeDirection = 'balanced';
    const dodgeLeftPct = dodgeCount > 0 ? Math.round((dodgeLeftCount / dodgeCount) * 100) : 50;
    const dodgeRightPct = dodgeCount > 0 ? Math.round((dodgeRightCount / dodgeCount) * 100) : 50;

    if (dodgeLeftPct >= 55) {
      preferredDodge = 'left';
    } else if (dodgeRightPct >= 55) {
      preferredDodge = 'right';
    } else if (dodgeBackwardCount >= Math.max(dodgeLeftCount, dodgeRightCount) && dodgeCount >= 2) {
      preferredDodge = 'backward';
    } else if (dodgeForwardCount >= Math.max(dodgeLeftCount, dodgeRightCount) && dodgeCount >= 2) {
      preferredDodge = 'forward';
    } else {
      preferredDodge = 'balanced';
    }

    // 4. Preferred Combat Range
    let preferredRange: PreferredCombatRange = 'close';
    const avgAttackDist =
      attackDistanceSamples > 0 ? totalAttackDistance / attackDistanceSamples : 1.8;

    if (avgAttackDist <= 1.5) {
      preferredRange = 'close';
    } else if (avgAttackDist <= 2.2) {
      preferredRange = 'mid';
    } else {
      preferredRange = 'far';
    }

    // 5. Average Combo Length
    const averageComboLength =
      comboLengths.length > 0
        ? Number((comboLengths.reduce((a, b) => a + b, 0) / comboLengths.length).toFixed(1))
        : attackCount > 0
        ? 1.2
        : 1.0;

    // 6. Reaction Time (estimated in seconds)
    const reactionTime =
      reactionTimeSamples.length > 0
        ? Number(
            (
              reactionTimeSamples.reduce((a, b) => a + b, 0) / reactionTimeSamples.length
            ).toFixed(2)
          )
        : Number((0.24 + Math.random() * 0.08).toFixed(2)); // baseline human reflex ~260ms

    // 7. Predictability Index (0.00 to 1.00)
    // Factored by:
    // - Directional dodge bias (e.g. 80% left)
    // - Cadence rhythm consistency (low variance in attack intervals = robotic metronome)
    // - Pattern repetition bigrams
    let cadencePredictability = 0.5;
    if (attackIntervals.length >= 3) {
      const mean = attackIntervals.reduce((a, b) => a + b, 0) / attackIntervals.length;
      const variance =
        attackIntervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        attackIntervals.length;
      const stdDev = Math.sqrt(variance);
      cadencePredictability = Math.max(0.15, Math.min(0.9, 1.0 - stdDev / 900));
    }

    const dodgeBias =
      dodgeCount >= 2
        ? Math.abs(dodgeLeftPct - dodgeRightPct) / 100
        : 0.3;

    // Bigram repeats (e.g. attack -> attack)
    let repeats = 0;
    for (let i = 1; i < events.length; i++) {
      if (events[i].action === events[i - 1].action) {
        repeats++;
      }
    }
    const repetitionRatio = events.length > 2 ? Math.min(1.0, repeats / events.length) : 0.4;

    const predictabilityIndex = Number(
      Math.min(
        0.95,
        Math.max(0.15, dodgeBias * 0.4 + cadencePredictability * 0.35 + repetitionRatio * 0.25)
      ).toFixed(2)
    );

    // 8. Detected Patterns & Repeated Combos
    const repeatedCombos: string[] = [];
    const topPatterns: string[] = [];

    if (averageComboLength >= 2.0) {
      repeatedCombos.push('Triple Strike Rapid Combo (J -> J -> J)');
    } else if (attackCount >= 3) {
      repeatedCombos.push('Single Jab Spacing Poke (J -> Wait)');
    }

    if (preferredDodge === 'left') {
      topPatterns.push('Heavy Left-Flank Evade Sequence (Dodge Left -> Strike)');
      repeatedCombos.push('Lateral Sidestep Strike (A + Space -> J)');
    } else if (preferredDodge === 'right') {
      topPatterns.push('Right-Wing Drift Maneuver (Dodge Right -> Strike)');
      repeatedCombos.push('Off-Axis Counter-Punch (D + Space -> J)');
    }

    if (blockCount >= 2) {
      topPatterns.push('Turtle Parry Anchor (Block on Impact -> Immediate Return)');
    }

    if (aggression >= 0.7) {
      topPatterns.push('Hyper-Aggressive Forward Rushdown (Zero Neutral Footwork)');
    } else if (mobility >= 0.6) {
      topPatterns.push('High-Velocity Hit-and-Run Spacing Loop');
    } else {
      topPatterns.push('Standard Methodical Engagement Cadence');
    }

    // 9. Strengths Synthesis
    const strengths: string[] = [];
    if (aggression >= 0.65) {
      strengths.push('Relentless offensive pressure disrupts AI state calculation');
    }
    if (defense >= 0.5) {
      strengths.push('Disciplined guard mitigation neutralizes unblocked critical strikes');
    }
    if (mobility >= 0.55) {
      strengths.push('Nimble evasive maneuvers evade incoming melee damage cones');
    }
    if (averageComboLength >= 1.8) {
      strengths.push('High combo chain execution yields sustained burst damage');
    }
    if (predictabilityIndex <= 0.4) {
      strengths.push('Irregular attack tempo prevents AI from timing pre-emptive counters');
    }
    if (strengths.length === 0) {
      strengths.push('Balanced fundamentals across standard combat distance');
    }

    // 10. Weaknesses Synthesis
    const weaknesses: string[] = [];
    if (preferredDodge === 'left' && dodgeLeftPct >= 65) {
      weaknesses.push(`Severe left dodge bias (${dodgeLeftPct}%); vulnerable to AI right sweep`);
    } else if (preferredDodge === 'right' && dodgeRightPct >= 65) {
      weaknesses.push(`Severe right dodge bias (${dodgeRightPct}%); vulnerable to AI left sweep`);
    }

    if (predictabilityIndex >= 0.65) {
      weaknesses.push('Predictable strike rhythm allows opponent to pre-buffer parries');
    }
    if (defense <= 0.3) {
      weaknesses.push('Neglects defensive blocking; takes full unmitigated incoming damage');
    }
    if (hitCount / Math.max(1, attackCount) < 0.55 && attackCount >= 3) {
      weaknesses.push('High whiff rate on out-of-range swings, exposing vulnerable recovery frames');
    }
    if (mobility <= 0.3) {
      weaknesses.push('Static footwork leaves fighter trapped against arena boundary pylons');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Predictable recovery timing following finished combo chains');
    }

    // 11. Archetype Classification
    let archetype: FighterArchetype = 'BALANCED_STRIKER';
    if (aggression >= 0.72 && mobility >= 0.5) {
      archetype = 'BERSERKER';
    } else if (defense >= 0.6) {
      archetype = 'TURTLE';
    } else if (mobility >= 0.68) {
      archetype = 'PHANTOM';
    } else if (predictabilityIndex <= 0.38) {
      archetype = 'TACTICIAN';
    } else {
      archetype = 'BALANCED_STRIKER';
    }

    return {
      id: `DNA-${Date.now().toString(36).toUpperCase()}`,
      timestamp: Date.now(),
      archetype,
      aggression,
      defense,
      mobility,
      predictabilityIndex,
      reactionTime,
      preferredDodge,
      preferredRange,
      averageComboLength,
      repeatedCombos,
      topPatterns,
      strengths,
      weaknesses,
      totalAttacks: attackCount,
      accuracyPercentage:
        attackCount > 0 ? Math.round((hitCount / attackCount) * 100) : 0,
      dodgeLeftPercentage: dodgeLeftPct,
      dodgeRightPercentage: dodgeRightPct,
    };
  }
}
