/**
 * PLAYNEXUS Dodge Lock Types
 * Data structures for tracking dodge repetition, challenge states, and reward buffs.
 */

import type { DodgeDirection } from '../telemetry/TelemetryTypes';

export type DodgeLockState =
  | 'IDLE'
  | 'PATTERN_DETECTED'
  | 'CHALLENGE_ACTIVE'
  | 'CHALLENGE_SUCCESS'
  | 'CHALLENGE_FAILED';

export interface DodgeRecord {
  direction: DodgeDirection;
  timestamp: number;
}

export interface DodgeLockEvent {
  state: DodgeLockState;
  lockedDirection: DodgeDirection; // e.g. 'left'
  targetDirection: DodgeDirection; // e.g. 'right'
  detectionPercentage: number; // e.g. 83
  timeRemaining: number; // in seconds, e.g. 15.0
  totalTime: number; // 15 seconds
  rightDodgesPerformed: number;
  hasRewardBuff: boolean; // +20% dodge speed
  message?: string;
}
