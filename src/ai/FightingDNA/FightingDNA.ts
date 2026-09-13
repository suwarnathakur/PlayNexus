import type { MatchTelemetry } from '../../game/telemetry/TelemetryTypes';
import type { FightingDNAProfile } from './DNATypes';
import { DNAAnalyzer } from './DNAAnalyzer';

/**
 * PLAYNEXUS Fighting DNA Engine
 * Orchestrates DNA profile generation, history tracking, and adaptive signature comparison.
 */
export class FightingDNA {
  private static currentProfile: FightingDNAProfile | null = null;
  private static profileHistory: FightingDNAProfile[] = [];

  /**
   * Generates a new Fighting DNA profile from a match telemetry session.
   */
  public static generate(match: MatchTelemetry): FightingDNAProfile {
    const profile = DNAAnalyzer.analyze(match);
    this.currentProfile = profile;
    this.profileHistory.unshift(profile);

    // Keep bounded history (last 20 profiles)
    if (this.profileHistory.length > 20) {
      this.profileHistory.pop();
    }

    return profile;
  }

  /**
   * Retrieves the latest analyzed Fighting DNA profile or creates a calibrated default.
   */
  public static getCurrentProfile(): FightingDNAProfile {
    if (!this.currentProfile) {
      this.currentProfile = this.getDefaultProfile();
    }
    return this.currentProfile;
  }

  /**
   * Retrieves historical DNA evolutions across multiple combat sessions.
   */
  public static getHistory(): FightingDNAProfile[] {
    return [...this.profileHistory];
  }

  /**
   * Fallback profile used before any match telemetry is recorded.
   */
  public static getDefaultProfile(): FightingDNAProfile {
    return {
      id: `DNA-CALIBRATED-01`,
      timestamp: Date.now(),
      archetype: 'BALANCED_STRIKER',
      aggression: 0.65,
      defense: 0.45,
      mobility: 0.58,
      predictabilityIndex: 0.52,
      reactionTime: 0.28,
      preferredDodge: 'left',
      preferredRange: 'close',
      averageComboLength: 2.1,
      repeatedCombos: ['Standard Strike Sequence (J -> J)', 'Evade & Counter (Space -> J)'],
      topPatterns: [
        'Methodical Mid-Range Stance',
        'Forward Thrust Initiation',
        'Balanced Dodge Cadence',
      ],
      strengths: [
        'Solid fundamental strike timing and reaction readiness',
        'Adaptive evasive movement under pressure',
      ],
      weaknesses: [
        'Slight left-dodge bias under close-quarters strikes',
        'Guard drop following rapid combo completions',
      ],
      totalAttacks: 12,
      attackFrequency: 0.8,
      blockFrequency: 0.3,
      accuracyPercentage: 68,
      dodgeLeftFrequency: 0.6,
      dodgeRightFrequency: 0.4,
      dodgeLeftPercentage: 60,
      dodgeRightPercentage: 40,
    };
  }
}
