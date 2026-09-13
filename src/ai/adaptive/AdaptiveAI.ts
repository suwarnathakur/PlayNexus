import * as THREE from 'three';
import type { AIStateType, AICombatContext } from '../../game/AI/AIState';
import { AI_ATTACK_RANGE, AI_RETREAT_HP_THRESHOLD } from '../../game/AI/AIStrategy';
import type { CounterStrategy } from './CounterStrategy';
import { StrategyEngine } from './StrategyEngine';

export interface AdaptiveTacticalEvent {
  text: string;
  type: 'INTERCEPT_DODGE' | 'COMBO_PARRY' | 'RUSHDOWN' | 'HIGH_GUARD' | 'FEINT_STRIKE';
  timestamp: number;
}

/**
 * PLAYNEXUS Adaptive AI Controller
 * Injects counter-strategy modifications directly into the finite state machine,
 * strictly abiding by the 5-tier Decision Priority hierarchy and fair reaction delays.
 */
export class AdaptiveAI {
  private strategy: CounterStrategy;
  private lastCounterEvent: AdaptiveTacticalEvent | null = null;
  private onTacticalTrigger?: (event: AdaptiveTacticalEvent) => void;

  // Configurable Human-Like Reaction Delay (in ms) - Prevents frame-0 psychic cheats
  private reactionDelayMs: number = 280;

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

  public getReactionDelay(): number {
    return this.reactionDelayMs;
  }

  public setReactionDelay(ms: number): void {
    this.reactionDelayMs = Math.max(100, Math.min(600, ms));
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
   *
   * DECISION PRIORITY HIERARCHY:
   * 1. SURVIVAL (Low Health -> Disengage / Guard)
   * 2. IMMEDIATE COMBAT SITUATION (Incoming Attack Defense)
   * 3. PLAYER PATTERN (Dodge Intercept / Combo Prediction)
   * 4. COUNTER-STRATEGY (Rushdown / High Guard / Feints)
   * 5. GENERAL AI BEHAVIOR (Standard Range / Neutral FSM)
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

    // ==========================================
    // PRIORITY 1: SURVIVAL
    // If AI is about to die, survival strictly takes precedence over offensive counters.
    // ==========================================
    if (isLowHealth) {
      if (isWithinRange) {
        // High survival instinct: 55% retreat, 35% guard, 10% desperate swipe
        if (roll < 0.55) return 'RETREAT';
        if (roll < 0.90) return 'BLOCK';
        return 'ATTACK';
      } else {
        if (roll < 0.75) return 'RETREAT';
        return 'IDLE';
      }
    }

    // ==========================================
    // PRIORITY 2: IMMEDIATE COMBAT SITUATION
    // Player is currently swinging at the AI: evaluate guard or emergency evasion.
    // ==========================================
    if (ctx.isPlayerAttacking) {
      const isComboStreak = (extra?.playerComboCount || 0) >= 2;
      const blockChance = isComboStreak && this.strategy.antiComboTactics
        ? 0.92 // 92% auto-guard on signature combo streak
        : this.strategy.blockProbabilityOnPlayerAttack;

      if (roll < blockChance) {
        if (isComboStreak && this.strategy.antiComboTactics) {
          this.triggerTacticalNotice(
            `COUNTER ACTIVE: ${this.strategy.targetComboPattern || 'COMBO'} PARRIED!`,
            'COMBO_PARRY'
          );
        }
        return 'BLOCK';
      }

      // Evasive dodge fallback (30% of remaining chance)
      if (roll < blockChance + 0.30) {
        return 'DODGE';
      }
    }

    // ==========================================
    // PRIORITY 3: PLAYER PATTERN
    // Exploit learned habits: directional dodge intercept or combo cadence.
    // ==========================================
    if (extra?.isPlayerDodging && isWithinRange) {
      if (this.strategy.counterDodge === 'COUNTER_LEFT') {
        this.triggerTacticalNotice('COUNTER ACTIVE: INTERCEPTING LEFT ESCAPE PATH!', 'INTERCEPT_DODGE');
        return 'ATTACK'; // Strike into the predicted escape path!
      } else if (this.strategy.counterDodge === 'COUNTER_RIGHT') {
        this.triggerTacticalNotice('COUNTER ACTIVE: INTERCEPTING RIGHT ESCAPE PATH!', 'INTERCEPT_DODGE');
        return 'ATTACK';
      }
    }

    // ==========================================
    // PRIORITY 4: COUNTER-STRATEGY
    // Apply strategic modifications based on player style (Rushdown, High Guard, Feints).
    // ==========================================

    // A. Long-Range Opponent: Relentless sprint to corner and eliminate distance
    if (!isWithinRange) {
      if (this.strategy.pressureMode === 'RELENTLESS_CHASE') {
        this.triggerTacticalNotice('RUSHDOWN ACTIVE: ELIMINATING STANDOFF DISTANCE', 'RUSHDOWN');
        return 'APPROACH';
      } else if (this.strategy.defenseMode === 'HIGH_GUARD') {
        // Patient spacing: 65% approach, 35% hold ground
        return roll < 0.65 ? 'APPROACH' : 'IDLE';
      } else {
        return roll < 0.85 ? 'APPROACH' : 'IDLE';
      }
    }

    // B. Feint tactic against turtle/defensive players
    if (this.strategy.aiStrategy?.useFeints && isWithinRange) {
      if (roll < 0.35) {
        this.triggerTacticalNotice('FEINT STRIKE: DISRUPTING GUARD TIMING', 'FEINT_STRIKE');
        return 'DODGE'; // Feint reposition before strike
      }
    }

    // C. High-Guard Stance against hyper-aggressive players (bait whiff)
    if (this.strategy.defenseMode === 'HIGH_GUARD') {
      this.triggerTacticalNotice('HIGH GUARD: ABSORBING RUSH TO PUNISH RECOVERY', 'HIGH_GUARD');
      if (roll < 0.50) return 'BLOCK';
      if (roll < 0.82) return 'ATTACK';
      if (roll < 0.94) return 'DODGE';
      return 'IDLE';
    }

    // ==========================================
    // PRIORITY 5: GENERAL AI BEHAVIOR
    // Neutral in-range combat options.
    // ==========================================
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
      const flank = new THREE.Vector3(dir.z, 0, -dir.x).multiplyScalar(0.40);
      return dir.add(flank).normalize();
    } else if (this.strategy.interceptDodgeBias === 'right') {
      const flank = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.40);
      return dir.add(flank).normalize();
    }

    return dir;
  }
}
