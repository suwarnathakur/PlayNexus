/**
 * PLAYNEXUS Strategy Types
 * Core contracts for AI behavioral adaptation and counter-strategy decisions.
 */

export type RangePreference = 'close' | 'medium' | 'long';
export type TargetDodgeDirection = 'left' | 'right' | 'none';

/**
 * 0 = BASELINE, 1 = OBSERVING, 2 = PATTERN FOUND, 3 = COUNTER ACTIVE, 4 = HIGH ADAPTATION
 */
export type AdaptationLevel = 0 | 1 | 2 | 3 | 4;

export const ADAPTATION_LEVEL_LABELS: Record<AdaptationLevel, string> = {
  0: 'BASELINE',
  1: 'OBSERVING',
  2: 'PATTERN FOUND',
  3: 'COUNTER ACTIVE',
  4: 'HIGH ADAPTATION',
};

/**
 * Core AI Strategy Interface requested by PLAYNEXUS AI specification
 */
export interface AIStrategy {
  aggressionLevel: number; // 0.0 to 1.0
  preferredRange: RangePreference;
  targetDodgeDirection: TargetDodgeDirection;
  counterCombo: boolean;
  pressureLevel: number;  // 0.0 to 1.0
  defensiveLevel: number; // 0.0 to 1.0
  useFeints: boolean;
  retreatWhenLowHealth: boolean;
  adaptationLevel: AdaptationLevel;
  confidenceScore: number; // 0.0 to 1.0
  targetPatternDescription: string;
}
