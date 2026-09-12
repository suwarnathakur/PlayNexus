/**
 * PLAYNEXUS Counter Strategy Types
 * Defines the concrete tactical adaptations and behavioral modifiers
 * computed by the Strategy Engine from the player's Fighting DNA.
 */

export type CounterDodgeTactic = 'COUNTER_LEFT' | 'COUNTER_RIGHT' | 'NEUTRAL';
export type DefenseMode = 'HIGH_GUARD' | 'NORMAL' | 'COUNTER_RUSH';
export type PressureMode = 'RELENTLESS_CHASE' | 'METHODICAL' | 'PUNISH_WHIFF';

export interface CounterStrategy {
  id: string;
  name: string;
  tacticalDescription: string;
  activeTactics: string[];

  // Tactical Directional Interceptions
  counterDodge: CounterDodgeTactic;
  interceptDodgeBias: 'left' | 'right' | null;

  // Defensive & Guarding Adaptations
  defenseMode: DefenseMode;
  antiComboTactics: boolean;
  targetComboPattern: string | null;
  blockProbabilityOnPlayerAttack: number; // 0.0 to 1.0 (e.g. 0.85 when player combo spam is detected)
  counterAttackAfterBlockProbability: number; // 0.0 to 1.0 (chance to instantly strike back after absorbing a hit)

  // Locomotion & Spatial Pressure
  pressureMode: PressureMode;
  approachSpeedMultiplier: number; // e.g. 1.4x for relentless chase when player backs away
  attackRangeMultiplier: number; // adjust attack engagement threshold

  // Telemetry Feedback Flags
  dodgeLeftFrequency: number;
  comboPatternName: string;
  predictabilityLevel: 'HIGH' | 'MODERATE' | 'LOW';
  adaptationConfidence: number; // 0.00 to 1.00
}
