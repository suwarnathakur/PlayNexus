// Game Engine Types & Constants
export interface FighterState {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  position: [number, number, number];
  isAttacking: boolean;
  isBlocking: boolean;
}

export type CombatActionType = 'LIGHT_PUNCH' | 'HEAVY_STRIKE' | 'KICK' | 'PARRY' | 'DODGE';
