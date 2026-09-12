import * as THREE from 'three';
import type { AIStateType, AICombatContext } from '../../game/AI/AIState';
import { AI_ATTACK_RANGE, AI_RETREAT_HP_THRESHOLD } from '../../game/AI/AIStrategy';
import type { CounterStrategy } from './CounterStrategy';
import { StrategyEngine } from './StrategyEngine';

export interface AdaptiveTacticalEvent {
  text: string;
  type: 'INTERCEPT_DODGE' | 'COMBO_PARRY' | 'RUSHDOWN' | 'HIGH_GUARD';
  timestamp: number;
}

/**
 * PLAYNEXUS Adaptive AI Controller
 * Injects counter-strategy modifications directly into the finite state machine,
 * altering state transitions, movement velocities, and counter-attack timing.
 */
export class AdaptiveAI {
  private strategy: CounterStrategy;
  private lastCounterEvent: AdaptiveTacticalEvent | null = null;
  private onTacticalTrigger?: (event: AdaptiveTacticalEvent) => void;

  constructor(strategy?: CounterStrategy, onTacticalTrigger?: (event: AdaptiveTacticalEvent) => void) {
    this.strategy = strategy || StrategyEngine.getBaselineStrategy();
    this.onTacticalTrigger = onTacticalTrigger;
  }

  public setStrategy(strategy: CounterStrategy): void {
    this.strategy = strategy;
  }

  public getStrategy(): CounterStrategy {
    return this.strategy;
  }

  public getLastTacticalEvent(): AdaptiveTacticalEvent | null {
    return this.lastCounterEvent;
  }

  private triggerTacticalNotice(text: string, type: AdaptiveTacticalEvent['type']): void {
    const event: AdaptiveTacticalEvent = { text, type, timestamp: Date.now() };
    this.lastCounterEvent = event;
    this.onTacticalTrigger?.(event);
  }

  /**
   * Adaptive Decision Function
   * Overrides base FSM transitions with counter-strategy heuristics.
   */
  public decideNextState(
    ctx: AICombatContext,
    _currentState?: AIStateType,
    extra?: { isPlayerDodging?: boolean; playerComboCount?: number }
  ): AIStateType {
    const isLowHealth = ctx.enemyHp <= AI_RETREAT_HP_THRESHOLD;
    const effectiveAttackRange = AI_ATTACK_RANGE * this.strategy.attackRangeMultiplier;
    const isWithinRange = ctx.distanceToPlayer <= effectiveAttackRange;
    const roll = Math.random();

    // 1. ADAPTATION: Anti-Combo / High-Guard Defense against Incoming Attacks
    if (ctx.isPlayerAttacking) {
      const isComboStreak = (extra?.playerComboCount || 0) >= 2;
      const blockChance = isComboStreak && this.strategy.antiComboTactics
        ? 0.92 // 92% auto-guard on signature combo streak
        : this.strategy.blockProbabilityOnPlayerAttack;

      if (roll < blockChance) {
        this.triggerTacticalNotice(
          `COUNTER ACTIVE: ${this.strategy.targetComboPattern || 'COMBO'} PARRIED!`,
          'COMBO_PARRY'
        );
        return 'BLOCK';
      }

      // If not blocking, try an evasive dodge 50% of remainder
      if (roll < blockChance + 0.35) {
        return 'DODGE';
      }
    }

    // 2. ADAPTATION: Intercepting Player Dodges
    if (extra?.isPlayerDodging && isWithinRange) {
      if (this.strategy.counterDodge === 'COUNTER_LEFT') {
        this.triggerTacticalNotice('COUNTER ACTIVE: INTERCEPTING LEFT DODGE!', 'INTERCEPT_DODGE');
        return 'ATTACK'; // strike into the roll!
      } else if (this.strategy.counterDodge === 'COUNTER_RIGHT') {
        this.triggerTacticalNotice('COUNTER ACTIVE: INTERCEPTING RIGHT DODGE!', 'INTERCEPT_DODGE');
        return 'ATTACK';
      }
    }

    // 3. Low Health Rules
    if (isLowHealth) {
      if (isWithinRange) {
        if (roll < 0.40) return 'RETREAT';
        if (roll < 0.80) return 'BLOCK';
        return 'ATTACK';
      } else {
        if (roll < 0.65) return 'RETREAT';
        return 'IDLE';
      }
    }

    // 4. ADAPTATION: Relentless Pressure when Player Retreats / Backs Away
    if (!isWithinRange) {
      if (this.strategy.pressureMode === 'RELENTLESS_CHASE') {
        // Zero idle time; 98% chase sprint
        return 'APPROACH';
      } else if (this.strategy.defenseMode === 'HIGH_GUARD') {
        // More patient approach, 70% approach, 30% stand ground
        return roll < 0.70 ? 'APPROACH' : 'IDLE';
      } else {
        return roll < 0.85 ? 'APPROACH' : 'IDLE';
      }
    }

    // 5. In Melee Range Neutral Decisions
    // If AI is in High Guard mode, favor defensive block and counter-punish
    if (this.strategy.defenseMode === 'HIGH_GUARD') {
      if (roll < 0.45) return 'BLOCK';
      if (roll < 0.80) return 'ATTACK';
      if (roll < 0.95) return 'DODGE';
      return 'IDLE';
    }

    // Standard in-range options
    if (roll < 0.52) return 'ATTACK';
    if (roll < 0.76) return 'BLOCK';
    if (roll < 0.90) return 'DODGE';
    return 'IDLE';
  }

  /**
   * Applies the approach speed multiplier from the strategy.
   */
  public getApproachSpeed(baseSpeed: number): number {
    return baseSpeed * this.strategy.approachSpeedMultiplier;
  }

  /**
   * Determines if the AI should immediately counter-attack following a successful guard block.
   */
  public shouldCounterAfterBlock(): boolean {
    return Math.random() < this.strategy.counterAttackAfterBlockProbability;
  }

  /**
   * Calculates movement intercept bias when moving toward player.
   * If countering left dodge, angles vector toward player's left flank.
   */
  public calculateInterceptVector(
    enemyPos: THREE.Vector3,
    playerPos: THREE.Vector3
  ): THREE.Vector3 {
    const dir = new THREE.Vector3().subVectors(playerPos, enemyPos);
    dir.y = 0;

    if (dir.length() < 0.01) return dir;
    dir.normalize();

    // If intercepting left dodge, apply perpendicular bias toward player's left
    if (this.strategy.interceptDodgeBias === 'left') {
      const flank = new THREE.Vector3(dir.z, 0, -dir.x).multiplyScalar(0.35);
      return dir.add(flank).normalize();
    } else if (this.strategy.interceptDodgeBias === 'right') {
      const flank = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.35);
      return dir.add(flank).normalize();
    }

    return dir;
  }
}
