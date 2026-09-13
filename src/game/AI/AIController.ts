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
  private lastShotAt: number = 0;

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
        const dir = this.adaptiveAI
          ? this.adaptiveAI.calculateInterceptVector(enemyPos, playerPos)
          : new THREE.Vector3().subVectors(playerPos, enemyPos).setY(0);

        const currentDist = enemyPos.distanceTo(playerPos);
        const style = fullCtx.combatStyle || 'melee';
        const isArcheryStyle = style === 'archery';
        const isWrestlingStyle = style === 'wrestling';
        const MIN_COMBAT_DISTANCE = isArcheryStyle ? 4.2 : isWrestlingStyle ? 1.3 : 1.85;
        const idealMaxRange = isArcheryStyle ? 5.1 : isWrestlingStyle ? 1.8 : 2.3;

        if (dir.length() > 0.05) {
          dir.normalize();
          const effectiveSpeed = this.adaptiveAI
            ? this.adaptiveAI.getApproachSpeed(this.approachSpeed)
            : this.approachSpeed;

          if (isArcheryStyle) {
            if (currentDist > idealMaxRange) {
              enemyPos.x += dir.x * effectiveSpeed * delta;
              enemyPos.z += dir.z * effectiveSpeed * delta;
            } else if (currentDist < MIN_COMBAT_DISTANCE) {
              const backAway = new THREE.Vector3().subVectors(enemyPos, playerPos).setY(0);
              if (backAway.length() > 0.01) {
                backAway.normalize();
                enemyPos.x += backAway.x * (this.retreatSpeed * 0.9) * delta;
                enemyPos.z += backAway.z * (this.retreatSpeed * 0.9) * delta;
              }
            } else {
              const strafe = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
              const strafeSign = Math.sin(enemyPos.x * 2.2 + enemyPos.z * 1.5) >= 0 ? 1 : -1;
              enemyPos.x += strafe.x * (effectiveSpeed * 0.7) * delta * strafeSign;
              enemyPos.z += strafe.z * (effectiveSpeed * 0.7) * delta * strafeSign;
            }
          } else if (isWrestlingStyle) {
            if (currentDist > idealMaxRange) {
              enemyPos.x += dir.x * (effectiveSpeed * 1.35) * delta;
              enemyPos.z += dir.z * (effectiveSpeed * 1.35) * delta;
            } else if (currentDist < 1.15) {
              const pushAway = new THREE.Vector3().subVectors(enemyPos, playerPos).setY(0);
              if (pushAway.length() > 0.01) {
                pushAway.normalize();
                enemyPos.x += pushAway.x * 1.8 * delta;
                enemyPos.z += pushAway.z * 1.8 * delta;
              }
            } else {
              const sidestep = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
              const jitter = Math.sin((enemyPos.x + enemyPos.z) * 4.0 + this.stateTimeRemaining * 10) >= 0 ? 1 : -1;
              enemyPos.x += sidestep.x * effectiveSpeed * delta * 0.65 * jitter;
              enemyPos.z += sidestep.z * effectiveSpeed * delta * 0.65 * jitter;
            }
          } else {
            if (currentDist > MIN_COMBAT_DISTANCE) {
              enemyPos.x += dir.x * effectiveSpeed * delta;
              enemyPos.z += dir.z * effectiveSpeed * delta;
            } else if (currentDist < 1.45) {
              const pushAway = new THREE.Vector3().subVectors(enemyPos, playerPos).setY(0);
              if (pushAway.length() > 0.01) {
                pushAway.normalize();
                enemyPos.x += pushAway.x * 2.2 * delta;
                enemyPos.z += pushAway.z * 2.2 * delta;
              }
            }
          }
        }
        break;
      }

      case 'RETREAT': {
        const dir = new THREE.Vector3().subVectors(enemyPos, playerPos);
        dir.y = 0;
        if (dir.length() > 0.1) {
          dir.normalize();
          if (fullCtx.combatStyle === 'archery') {
            const lateral = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
            const strafeBias = Math.sin(enemyPos.x * 2.5 + enemyPos.z * 2.0) >= 0 ? 1 : -1;
            enemyPos.x += dir.x * this.retreatSpeed * delta * 0.85;
            enemyPos.z += dir.z * this.retreatSpeed * delta * 0.85;
            enemyPos.x += lateral.x * this.dodgeSpeed * delta * 0.45 * strafeBias;
            enemyPos.z += lateral.z * this.dodgeSpeed * delta * 0.45 * strafeBias;
          } else {
            enemyPos.x += dir.x * this.retreatSpeed * delta;
            enemyPos.z += dir.z * this.retreatSpeed * delta;
          }
        }
        break;
      }

      case 'DODGE': {
        const dir = new THREE.Vector3().subVectors(enemyPos, playerPos);
        dir.y = 0;
        const sidestep = new THREE.Vector3(-dir.z, 0, dir.x).normalize();

        if (fullCtx.combatStyle === 'archery') {
          const strafeBias = Math.sin(enemyPos.x * 3 + enemyPos.z * 2.5) >= 0 ? 1 : -1;
          enemyPos.x += sidestep.x * this.dodgeSpeed * delta * 0.9 * strafeBias;
          enemyPos.z += sidestep.z * this.dodgeSpeed * delta * 0.9 * strafeBias;
        } else {
          enemyPos.x += sidestep.x * this.dodgeSpeed * delta;
          enemyPos.z += sidestep.z * this.dodgeSpeed * delta;
        }
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

    // Reactive defense: if player is attacking near the enemy, block immediately.
    const style = fullCtx.combatStyle || 'melee';
    const isDefenseStyle = style === 'defense';
    const isSwordStyle = style === 'sword';
    const playerThreatRange = style === 'archery' ? 6.5 : style === 'wrestling' ? 2.5 : 2.6;
    const attackDistance = style === 'archery' ? 5.8 : style === 'wrestling' ? 1.75 : isDefenseStyle || isSwordStyle ? 2.7 : 2.2;
    const sightRange = style === 'archery' ? 8.5 : style === 'wrestling' ? 3.0 : isDefenseStyle ? 4.6 : isSwordStyle ? 3.8 : 3.5;
    const angleToPlayer = Math.atan2(playerPos.x - enemyPos.x, playerPos.z - enemyPos.z);
    const facingAngle = Math.atan2(playerPos.x - enemyPos.x, playerPos.z - enemyPos.z);
    const angleDelta = Math.abs(Math.atan2(Math.sin(facingAngle - angleToPlayer), Math.cos(facingAngle - angleToPlayer)));
    const isInSight = angleDelta < 1.3;

    if (ctx.isPlayerAttacking && distanceToPlayer <= playerThreatRange && this.currentState !== 'BLOCK' && this.currentState !== 'DODGE') {
      this.transitionTo('BLOCK');
      return;
    }

    // Reactive offense: if player is visible and within attack range, keep pressing the attack.
    if (distanceToPlayer <= sightRange && isInSight && this.currentState !== 'ATTACK' && this.currentState !== 'BLOCK') {
      this.transitionTo('ATTACK');
      return;
    }

    // Defense-style pressure keeps attacking once the player is seen, even before the player starts an offense sequence.
    if ((isDefenseStyle || isSwordStyle) && distanceToPlayer <= attackDistance && isInSight) {
      this.transitionTo('ATTACK');
      return;
    }

    // Extra trigger for ranged archery and close-range wrestling pressure
    if (style === 'archery' && distanceToPlayer <= attackDistance + 2.8 && isInSight) {
      const now = Date.now();
      if (now - this.lastShotAt > 850) {
        this.lastShotAt = now;
        this.transitionTo('ATTACK');
        this.callbacks.onAttackTrigger();
        return;
      }
    }

    if (style === 'wrestling' && distanceToPlayer <= attackDistance + 0.8 && isInSight) {
      this.transitionTo('ATTACK');
      return;
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
