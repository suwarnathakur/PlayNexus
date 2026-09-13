/**
 * PLAYNEXUS Telemetry Types
 * Data structures for capturing real-time player telemetry and computing fighting patterns.
 */

export type TelemetryActionType =
  | 'attack'
  | 'block'
  | 'dodge'
  | 'movement'
  | 'hit'
  | 'miss'
  | 'damage_dealt'
  | 'damage_received';

export type DodgeDirection = 'left' | 'right' | 'forward' | 'backward' | 'neutral';

export interface PlayerAction {
  type: 'attack' | 'block' | 'dodge' | 'move' | 'special';
  timestamp: number;
  direction?: 'left' | 'right' | 'forward' | 'backward';
  attackType?: 'light' | 'heavy';
  successful?: boolean;
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface TelemetryEvent {
  id: string;
  action: TelemetryActionType;
  direction?: DodgeDirection;
  attackType?: 'light' | 'heavy';
  successful?: boolean;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number; // Unix timestamp in ms
  intervalSinceLastAction?: number; // ms since previous action
  combo?: number;
  damage?: number;
  distanceToEnemy?: number;
  playerHealth?: number;
  enemyHealth?: number;
  details?: string;
}

export interface MatchMetrics {
  totalAttacks: number;
  successfulAttacks: number;
  missedAttacks: number;
  accuracyPercentage: number;
  blocks: number;
  dodges: number;
  dodgeLeftCount: number;
  dodgeRightCount: number;
  dodgeOtherCount: number;
  dodgeLeftPercentage: number;
  dodgeRightPercentage: number;
  dodgeOtherPercentage: number;
  averageComboLength: number;
  maxCombo: number;
  totalDamageDealt: number;
  totalDamageReceived: number;
  totalDistanceMoved: number;
  durationSeconds: number;

  // AI Adaptation Core Pillars (Normalized 0 - 100)
  aggression: number;
  defense: number;
  mobility: number;
  predictability: number;
}

export type MatchOutcome = 'VICTORY' | 'DEFEAT' | 'IN_PROGRESS' | 'ABANDONED';

export interface MatchTelemetry {
  matchId: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  outcome: MatchOutcome;
  playerFinalHp: number;
  enemyFinalHp: number;
  events: TelemetryEvent[];
  metrics: MatchMetrics;
}
