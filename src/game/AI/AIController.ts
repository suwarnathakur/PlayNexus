import * as THREE from 'three';
import type { AIStateType, AICombatContext } from './AIState';
import { AIStrategy } from './AIStrategy';

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

  constructor(callbacks: AIControllerCallbacks) {
    this.callbacks = callbacks;
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
    ctx: Omit<AICombatContext, 'distanceToPlayer' | 'playerPos' | 'enemyPos'>
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

    // Handle Active State Behaviors
    switch (this.currentState) {
      case 'APPROACH': {
        // Move towards player
        const dir = new THREE.Vector3().subVectors(playerPos, enemyPos);
        dir.y = 0;
        if (dir.length() > 0.1) {
          dir.normalize();
          enemyPos.x += dir.x * this.approachSpeed * delta;
          enemyPos.z += dir.z * this.approachSpeed * delta;
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

      case 'BLOCK':
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

    // State Transition Check: When timer expires, evaluate next state via AIStrategy
    if (this.stateTimeRemaining <= 0) {
      const nextState = AIStrategy.decideNextState(fullCtx, this.currentState);
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
