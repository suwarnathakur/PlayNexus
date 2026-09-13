import type { AIStateType, AICombatContext } from './AIState';

export const AI_ATTACK_RANGE = 2.2;
export const AI_RETREAT_HP_THRESHOLD = 30; // Health below 30 triggers defensive retreat

/**
 * AI Decision Strategy Engine
 * Evaluates distances, health levels, and randomized tactical chances to decide next state.
 */
export class AIStrategy {
  /**
   * Determine next state based on combat context
   */
  public static decideNextState(ctx: AICombatContext, _currentState?: AIStateType): AIStateType {
    const isLowHealth = ctx.enemyHp <= AI_RETREAT_HP_THRESHOLD;
    const effectiveAttackRange = ctx.combatStyle === 'archery' ? 8.5 : AI_ATTACK_RANGE;
    const isWithinRange = ctx.distanceToPlayer <= effectiveAttackRange;
    const roll = Math.random(); // 0.0 to 1.0 for randomized organic behavior

    // Scenario A: Low Health Defense Priority
    if (isLowHealth) {
      if (isWithinRange) {
        // If backed into corner or within range while low health:
        // 45% Retreat to escape, 35% Block to survive, 20% Desperate Strike
        if (roll < 0.45) return 'RETREAT';
        if (roll < 0.80) return 'BLOCK';
        return 'ATTACK';
      } else {
        // When far away and low health:
        // 60% Keep retreating / spacing, 25% Idle hesitate, 15% Cautious Approach
        if (roll < 0.60) return 'RETREAT';
        if (roll < 0.85) return 'IDLE';
        return 'APPROACH';
      }
    }

    // Scenario B: Healthy / Normal Combat
    if (!isWithinRange) {
      // Outside attack range:
      // 85% Approach player aggressively, 15% Idle tactical pacing
      if (roll < 0.85) {
        return 'APPROACH';
      }
      return 'IDLE';
    }

    // Scenario C: Within Melee Attack Range
    // If player is attacking, 40% chance to react with a Block or Dodge
    if (ctx.isPlayerAttacking) {
      if (roll < 0.45) return 'BLOCK';
      if (roll < 0.70) return 'DODGE';
    }

    // Standard in-range options:
    // 50% Attack strike
    // 25% Defensive Block
    // 15% Tactical Dodge roll
    // 10% Brief Idle hesitation
    if (roll < 0.50) return 'ATTACK';
    if (roll < 0.75) return 'BLOCK';
    if (roll < 0.90) return 'DODGE';
    return 'IDLE';
  }
}
