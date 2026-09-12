/**
 * PLAYNEXUS Fighting DNA Types
 * Data structures for behavioral DNA profiling, biometric combat patterns,
 * and adaptive battle intelligence.
 */

export type PreferredDodgeDirection = 'left' | 'right' | 'backward' | 'forward' | 'balanced';
export type PreferredCombatRange = 'close' | 'mid' | 'far';
export type FighterArchetype =
  | 'BERSERKER'
  | 'TURTLE'
  | 'PHANTOM'
  | 'TACTICIAN'
  | 'BALANCED_STRIKER';

export interface FightingDNAProfile {
  id: string;
  timestamp: number;
  archetype: FighterArchetype;

  // Normalized Pillars (0.00 to 1.00)
  aggression: number;
  defense: number;
  mobility: number;
  predictabilityIndex: number;

  // Biometric & Tactical Profiling
  reactionTime: number; // in seconds (e.g. 0.28)
  preferredDodge: PreferredDodgeDirection;
  preferredRange: PreferredCombatRange;
  averageComboLength: number;

  // Tactical Breakdown
  topPatterns: string[];
  repeatedCombos: string[];
  strengths: string[];
  weaknesses: string[];

  // Statistical Context
  totalAttacks: number;
  accuracyPercentage: number;
  dodgeLeftPercentage: number;
  dodgeRightPercentage: number;
}
