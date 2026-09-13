/**
 * PLAYNEXUS Behavior Analysis Types
 * Mathematical and statistical representations of observed player combat behavior.
 */

export type RangeCategory = 'close' | 'medium' | 'long';
export type PreferredDodge = 'left' | 'right' | 'mixed';

export type PatternType =
  | 'PREFERRED_DODGE_LEFT'
  | 'PREFERRED_DODGE_RIGHT'
  | 'REPEATED_COMBO'
  | 'HIGH_AGGRESSION'
  | 'DEFENSIVE_STYLE'
  | 'LONG_RANGE_PLAYER'
  | 'PREDICTABLE_ATTACK_TIMING';

export interface DetectedPattern {
  type: PatternType | string;
  confidence: number; // 0.00 to 1.00
  evidence: string;
}

export interface ComboPreference {
  favoriteCombo: string;
  frequency: number; // 0.00 to 1.00
  allSequences: { sequence: string; count: number; percentage: number }[];
}

export interface BehaviorStats {
  aggression: number; // 0.00 to 1.00
  defense: number;    // 0.00 to 1.00
  mobility: number;   // 0.00 to 1.00

  // Dodge
  preferredDodge: PreferredDodge;
  dodgeLeftPercentage: number;
  dodgeRightPercentage: number;
  totalDodges: number;

  // Combo
  comboPreference: ComboPreference;
  averageComboLength: number;

  // Range
  preferredRange: RangeCategory;
  averageDistance: number;

  // Attack & Block Frequencies
  attackFrequency: number; // attacks per second or normalized ratio
  blockFrequency: number;  // blocks per second or normalized ratio
  attackAccuracy: number;

  // Predictability
  predictabilityIndex: number; // 0.00 (unpredictable) to 1.00 (extremely predictable)

  // Timing
  meanAttackIntervalMs: number;
  attackIntervalStdDevMs: number;
}
