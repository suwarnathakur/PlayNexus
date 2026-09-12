import type { DodgeDirection } from '../telemetry/TelemetryTypes';
import type { DodgeLockState, DodgeRecord, DodgeLockEvent } from './DodgeLockTypes';

export const CHALLENGE_DURATION_SECONDS = 15;
export const DETECTION_WINDOW_MS = 25000; // 25 seconds window
export const REQUIRED_REPETITIONS = 5;

/**
 * PLAYNEXUS Dodge Lock Manager
 * Detects repetitive dodge habits, activates the Adaptation Lock Challenge,
 * coordinates the 15-second countdown, validates compliance, and awards +20% Dodge Speed.
 */
export class DodgeLockManager {
  private state: DodgeLockState = 'IDLE';
  private recentDodges: DodgeRecord[] = [];

  private lockedDirection: DodgeDirection = 'left';
  private targetDirection: DodgeDirection = 'right';
  private detectionPercentage: number = 83;

  private timeRemaining: number = CHALLENGE_DURATION_SECONDS;
  private rightDodgesPerformed: number = 0;
  private hasRewardBuff: boolean = false;
  private patternIntroTimer: number = 0;
  private outcomeDisplayTimer: number = 0;
  private cooldownTimer: number = 0;

  private listeners: ((event: DodgeLockEvent) => void)[] = [];

  constructor() {
    this.reset();
  }

  public getState(): DodgeLockState {
    return this.state;
  }

  public isChallengeActive(): boolean {
    return this.state === 'CHALLENGE_ACTIVE';
  }

  public getLockedDirection(): DodgeDirection {
    return this.lockedDirection;
  }

  public getTargetDirection(): DodgeDirection {
    return this.targetDirection;
  }

  public hasReward(): boolean {
    return this.hasRewardBuff;
  }

  public getTimeRemaining(): number {
    return Math.max(0, this.timeRemaining);
  }

  public getRightDodgesPerformed(): number {
    return this.rightDodgesPerformed;
  }

  public getDetectionPercentage(): number {
    return this.detectionPercentage;
  }

  public subscribe(listener: (event: DodgeLockEvent) => void): () => void {
    this.listeners.push(listener);
    // Send current status immediately
    listener(this.getEventData());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const data = this.getEventData();
    this.listeners.forEach((l) => {
      try {
        l(data);
      } catch {}
    });
  }

  public getEventData(): DodgeLockEvent {
    let message = '';
    if (this.state === 'PATTERN_DETECTED') {
      message = `PATTERN DETECTED // ${this.detectionPercentage}% OF YOUR DODGES ARE ${this.lockedDirection.toUpperCase()}`;
    } else if (this.state === 'CHALLENGE_ACTIVE') {
      message = `SURVIVE 15 SECONDS DODGING ONLY ${this.targetDirection.toUpperCase()}`;
    } else if (this.state === 'CHALLENGE_SUCCESS') {
      message = `CHALLENGE SUCCESS // REWARD UNLOCKED: +20% DODGE SPEED!`;
    } else if (this.state === 'CHALLENGE_FAILED') {
      message = `LOCK FAILED // REVERTED TO PREDICTABLE ${this.lockedDirection.toUpperCase()} DODGE`;
    }

    return {
      state: this.state,
      lockedDirection: this.lockedDirection,
      targetDirection: this.targetDirection,
      detectionPercentage: this.detectionPercentage,
      timeRemaining: Math.max(0, this.timeRemaining),
      totalTime: CHALLENGE_DURATION_SECONDS,
      rightDodgesPerformed: this.rightDodgesPerformed,
      hasRewardBuff: this.hasRewardBuff,
      message,
    };
  }

  /**
   * Called every frame to tick the challenge countdown and state transitions.
   */
  public update(delta: number): void {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= delta;
    }

    if (this.state === 'PATTERN_DETECTED') {
      this.patternIntroTimer -= delta;
      if (this.patternIntroTimer <= 0) {
        // Transition to challenge active!
        this.state = 'CHALLENGE_ACTIVE';
        this.timeRemaining = CHALLENGE_DURATION_SECONDS;
        this.rightDodgesPerformed = 0;
        this.notify();
      }
      return;
    }

    if (this.state === 'CHALLENGE_ACTIVE') {
      this.timeRemaining -= delta;
      this.notify();

      // Successful completion when timer reaches 0
      if (this.timeRemaining <= 0) {
        this.state = 'CHALLENGE_SUCCESS';
        this.hasRewardBuff = true;
        this.outcomeDisplayTimer = 4.0; // show victory celebration for 4s
        this.cooldownTimer = 25.0; // 25s cooldown before another challenge can trigger
        this.notify();
      }
      return;
    }

    if (this.state === 'CHALLENGE_SUCCESS' || this.state === 'CHALLENGE_FAILED') {
      this.outcomeDisplayTimer -= delta;
      if (this.outcomeDisplayTimer <= 0) {
        this.state = 'IDLE';
        this.recentDodges = [];
        this.notify();
      }
    }
  }

  /**
   * Called whenever the player performs a dodge.
   */
  public recordDodge(direction: DodgeDirection): void {
    const now = Date.now();

    // 1. If challenge is active, test compliance with lock rules
    if (this.state === 'CHALLENGE_ACTIVE') {
      if (direction === this.lockedDirection) {
        // VIOLATION: Player dodged in the prohibited direction!
        this.state = 'CHALLENGE_FAILED';
        this.outcomeDisplayTimer = 3.5;
        this.cooldownTimer = 15.0;
        this.notify();
        return;
      } else if (direction === this.targetDirection) {
        // SUCCESSFUL ADAPTATION DODGE
        this.rightDodgesPerformed++;
        this.notify();
        return;
      }
    }

    // 2. If idle, record dodge to detect repetitive patterns
    if (this.state === 'IDLE' && this.cooldownTimer <= 0) {
      this.recentDodges.push({ direction, timestamp: now });

      // Prune old dodges outside the 25s detection window
      this.recentDodges = this.recentDodges.filter(
        (d) => now - d.timestamp <= DETECTION_WINDOW_MS
      );

      // Check for repetition pattern (e.g. 5 left dodges)
      this.evaluatePattern();
    }
  }

  /**
   * Check if the player has dodged in the same direction at least 5 times.
   */
  private evaluatePattern(): void {
    if (this.recentDodges.length < REQUIRED_REPETITIONS) return;

    let leftCount = 0;
    let rightCount = 0;

    for (const d of this.recentDodges) {
      if (d.direction === 'left') leftCount++;
      else if (d.direction === 'right') rightCount++;
    }

    const total = this.recentDodges.length;

    // Trigger on left dodge repetition (or right if user spammed right)
    if (leftCount >= REQUIRED_REPETITIONS) {
      const percentage = Math.round((leftCount / total) * 100);
      this.triggerPattern('left', 'right', Math.max(83, percentage));
    } else if (rightCount >= REQUIRED_REPETITIONS) {
      const percentage = Math.round((rightCount / total) * 100);
      this.triggerPattern('right', 'left', Math.max(83, percentage));
    }
  }

  /**
   * Initiates the Dodge Direction Lock sequence.
   */
  public triggerPattern(
    locked: DodgeDirection,
    target: DodgeDirection,
    percentage: number
  ): void {
    this.lockedDirection = locked;
    this.targetDirection = target;
    this.detectionPercentage = percentage;
    this.state = 'PATTERN_DETECTED';
    this.patternIntroTimer = 2.4; // 2.4 seconds announcement banner
    this.notify();
  }

  /**
   * Resets the manager for a new match.
   */
  public reset(): void {
    this.state = 'IDLE';
    this.recentDodges = [];
    this.lockedDirection = 'left';
    this.targetDirection = 'right';
    this.detectionPercentage = 83;
    this.timeRemaining = CHALLENGE_DURATION_SECONDS;
    this.rightDodgesPerformed = 0;
    this.patternIntroTimer = 0;
    this.outcomeDisplayTimer = 0;
    this.cooldownTimer = 0;
    this.notify();
  }
}
