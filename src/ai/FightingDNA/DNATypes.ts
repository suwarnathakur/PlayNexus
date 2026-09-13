/**
 * PLAYNEXUS Fighting DNA Types
 * Data structures for behavioral DNA profiling, biometric combat patterns,
 * and adaptive battle intelligence.
 */

export type PreferredDodgeDirection = 'left' | 'right' | 'mixed' | 'backward' | 'forward' | 'balanced';
export type PreferredCombatRange = 'close' | 'medium' | 'long' | 'mid' | 'far';
export type FighterArchetype =
  | 'BERSERKER'
  | 'TURTLE'
  | 'PHANTOM'
  | 'TACTICIAN'
  | 'BALANCED_STRIKER';

/**
 * Exact FightingDNA contract requested by PLAYNEXUS specification
 */
export interface FightingDNA {
  aggression: number;
  defense: number;
  mobility: number;

  preferredDodge: 'left' | 'right' | 'mixed';
  dodgeLeftFrequency: number;
  dodgeRightFrequency: number;

  preferredRange: 'close' | 'medium' | 'long';
  averageComboLength: number;
  repeatedCombos: string[];

  attackFrequency: number;
  blockFrequency: number;

  strengths: string[];
  weaknesses: string[];

  predictabilityIndex: number;
}

/**
 * Extended FightingDNAProfile preserving compatibility with historical telemetry views
 */
export interface FightingDNAProfile extends FightingDNA {
  id: string;
  timestamp: number;
  archetype: FighterArchetype;

  // Additional Biometric & Tactical Profiling
  reactionTime: number; // in seconds (e.g. 0.28)
  topPatterns: string[];

  // Statistical Context
  totalAttacks: number;
  accuracyPercentage: number;
  dodgeLeftPercentage: number;
  dodgeRightPercentage: number;
}
