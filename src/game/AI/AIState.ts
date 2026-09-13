/**
 * AI State Machine Definitions for PLAYNEXUS
 * Finite State Machine (FSM) States
 */

export type AIStateType =
  | 'IDLE'
  | 'APPROACH'
  | 'ATTACK'
  | 'BLOCK'
  | 'DODGE'
  | 'RETREAT';

export interface AICombatContext {
  distanceToPlayer: number;
  playerPos: [number, number, number];
  enemyPos: [number, number, number];
  enemyHp: number;
  enemyMaxHp: number;
  playerHp: number;
  isPlayerAttacking: boolean;
  isPlayerBlocking: boolean;
  arenaRadius: number;
  combatStyle?: 'melee' | 'archery';
}
