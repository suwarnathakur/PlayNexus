import * as THREE from 'three';
import type { AIStateType, AICombatContext } from './AIState';
import { AIStrategy } from './AIStrategy';
import { AdaptiveAI } from '../../ai/adaptive/AdaptiveAI';

export interface AIControllerCallbacks {
  onAttackTrigger: () => void;
  onStateChange?: (newState: AIStateType) => void;
}

/**
 * AI Controller Finite State Machine
 * Manages states, state timers, movement vectors, and action execution.
 */
export class AIController {
  private currentState: AIStateType = 'IDLE';
  private stateTimeRemaining: number = 0.5; // seconds in current state
  private attackExecutedInState: boolean = false;

  private approachSpeed: number = 2.8;
  private retreatSpeed: number = 3.6;
  private dodgeSpeed: number = 5.0;

  private callbacks: AIControllerCallbacks;
  private adaptiveAI?: AdaptiveAI;

  constructor(callbacks: AIControllerCallbacks, adaptiveAI?: AdaptiveAI) {
    this.callbacks = callbacks;
    this.adaptiveAI = adaptiveAI;
  }

  public setAdaptiveAI(adaptive: AdaptiveAI): void {
    this.adaptiveAI = adaptive;
  }

  public getAdaptiveAI(): AdaptiveAI | undefined {
    return this.adaptiveAI;
  }

  public getState(): AIStateType {
    return this.currentState;
  }

  public isAttacking(): boolean {
    return this.currentState === 'ATTACK';
  }

  public isBlocking(): boolean {
    return this.currentState === 'BLOCK';
  }

  public isDodging(): boolean {
    return this.currentState === 'DODGE';
  }

  public isRetreating(): boolean {
    return this.currentState === 'RETREAT';
  }

  /**
   * Reset FSM to initial state
   */
  public reset(): void {
    this.currentState = 'IDLE';
    this.stateTimeRemaining = 0.6;
    this.attackExecutedInState = false;
  }

  /**
   * Main FSM update loop (called every frame in useFrame with delta time)
   */
  public update(
    delta: number,
    enemyPos: THREE.Vector3,
    playerPos: THREE.Vector3,
    ctx: Omit<AICombatContext, 'distanceToPlayer' | 'playerPos' | 'enemyPos'>,
    extra?: { isPlayerDodging?: boolean; playerComboCount?: number }
  ): void {
    const distanceToPlayer = enemyPos.distanceTo(playerPos);

    const fullCtx: AICombatContext = {
      ...ctx,
      distanceToPlayer,
      playerPos: [playerPos.x, playerPos.y, playerPos.z],
      enemyPos: [enemyPos.x, enemyPos.y, enemyPos.z],
    };

    // Decrement state timer
    this.stateTimeRemaining -= delta;

    // Physical collision separation — prevent fighter models from overlapping/clipping
    if (distanceToPlayer < 1.45 && distanceToPlayer > 0.001) {
      const sepDir = new THREE.Vector3().subVectors(enemyPos, playerPos).setY(0);
      if (sepDir.length() > 0.01) {
        sepDir.normalize();
        const pushDist = (1.45 - distanceToPlayer) * 0.5;
        enemyPos.x += sepDir.x * pushDist;
        enemyPos.z += sepDir.z * pushDist;
      }
    }

    // Handle Active State Behaviors
    switch (this.currentState) {
      case 'APPROACH': {
        // Move towards player (with adaptive intercept bias if countering dodge)
        const dir = this.adaptiveAI
          ? this.adaptiveAI.calculateInterceptVector(enemyPos, playerPos)
          : new THREE.Vector3().subVectors(playerPos, enemyPos).setY(0);

        const currentDist = enemyPos.distanceTo(playerPos);
        const MIN_COMBAT_DISTANCE = 1.85; // Maintain combat spacing — don't walk inside player!

        if (currentDist > MIN_COMBAT_DISTANCE && dir.length() > 0.05) {
          dir.normalize();
          const effectiveSpeed = this.adaptiveAI
            ? this.adaptiveAI.getApproachSpeed(this.approachSpeed)
            : this.approachSpeed;
          enemyPos.x += dir.x * effectiveSpeed * delta;
          enemyPos.z += dir.z * effectiveSpeed * delta;
        } else if (currentDist < 1.45) {
          // Push away slightly to prevent model clipping
          const pushAway = new THREE.Vector3().subVectors(enemyPos, playerPos).setY(0);
          if (pushAway.length() > 0.01) {
            pushAway.normalize();
            enemyPos.x += pushAway.x * 2.2 * delta;
            enemyPos.z += pushAway.z * 2.2 * delta;
          }
        }
        break;
      }

      case 'RETREAT': {
        // Move away from player (escape vector)
        const dir = new THREE.Vector3().subVectors(enemyPos, playerPos);
        dir.y = 0;
        if (dir.length() > 0.1) {
          dir.normalize();
          enemyPos.x += dir.x * this.retreatSpeed * delta;
          enemyPos.z += dir.z * this.retreatSpeed * delta;
        }
        break;
      }

      case 'DODGE': {
        // Quick evasive sidestep
        const dir = new THREE.Vector3().subVectors(enemyPos, playerPos);
        dir.y = 0;
        // Sidestep perpendicularly
        const sidestep = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
        enemyPos.x += sidestep.x * this.dodgeSpeed * delta;
        enemyPos.z += sidestep.z * this.dodgeSpeed * delta;
        break;
      }

      case 'ATTACK': {
        // Slight forward lunge on strike
        if (!this.attackExecutedInState && this.stateTimeRemaining < 0.22) {
          this.attackExecutedInState = true;
          this.callbacks.onAttackTrigger();
        }
        break;
      }

      case 'BLOCK': {
        // Adaptive Counter-Attack after Block:
        // If AI held block and timer is near end, check for immediate parry-strike
        if (
          this.adaptiveAI &&
          this.stateTimeRemaining <= 0.25 &&
          distanceToPlayer <= 2.3 &&
          this.adaptiveAI.shouldCounterAfterBlock()
        ) {
          this.transitionTo('ATTACK');
          return;
        }
        break;
      }

      case 'IDLE':
      default:
        // Hold position / defensive stance
        break;
    }

    // Clamp inside arena boundaries
    const distFromCenter = Math.hypot(enemyPos.x, enemyPos.z);
    if (distFromCenter > ctx.arenaRadius) {
      const angle = Math.atan2(enemyPos.z, enemyPos.x);
      enemyPos.x = Math.cos(angle) * ctx.arenaRadius;
      enemyPos.z = Math.sin(angle) * ctx.arenaRadius;
    }

    // State Transition Check: When timer expires, evaluate next state via AdaptiveAI or base AIStrategy
    if (this.stateTimeRemaining <= 0) {
      const nextState = this.adaptiveAI
        ? this.adaptiveAI.decideNextState(fullCtx, this.currentState, extra)
        : AIStrategy.decideNextState(fullCtx, this.currentState);
      this.transitionTo(nextState);
    }
  }

  private transitionTo(newState: AIStateType): void {
    this.currentState = newState;
    this.attackExecutedInState = false;

    // Set duration for the new state (with small jitter)
    const jitter = (Math.random() - 0.5) * 0.2;
    switch (newState) {
      case 'ATTACK':
        this.stateTimeRemaining = 0.42;
        break;
      case 'BLOCK':
        this.stateTimeRemaining = 0.85 + jitter;
        break;
      case 'DODGE':
        this.stateTimeRemaining = 0.35;
        break;
      case 'RETREAT':
        this.stateTimeRemaining = 0.9 + jitter;
        break;
      case 'APPROACH':
        this.stateTimeRemaining = 1.1 + jitter;
        break;
      case 'IDLE':
      default:
        this.stateTimeRemaining = 0.5 + jitter;
        break;
    }

    this.callbacks.onStateChange?.(newState);
  }
}
