import type {
  TelemetryEvent,
  TelemetryActionType,
  DodgeDirection,
  MatchTelemetry,
  MatchMetrics,
  MatchOutcome,
} from './TelemetryTypes';
import { TelemetryAnalyzer } from './TelemetryAnalyzer';

/**
 * PLAYNEXUS Telemetry Collector
 * Collects real-time fighting inputs, movements, combat outcomes, and metrics during gameplay.
 */
export class TelemetryCollector {
  private matchId: string = '';
  private startTime: number = Date.now();
  private endTime: number | null = null;
  private outcome: MatchOutcome = 'IN_PROGRESS';
  private events: TelemetryEvent[] = [];
  private lastActionTime: number = Date.now();
  private lastAttackTime: number = 0;
  private eventListeners: ((event: TelemetryEvent, metrics: MatchMetrics) => void)[] = [];

  constructor() {
    this.startMatch();
  }

  /**
   * Initializes a fresh combat telemetry recording session.
   */
  public startMatch(matchId?: string): void {
    this.matchId = matchId || `MATCH-${Date.now().toString(36).toUpperCase()}`;
    this.startTime = Date.now();
    this.endTime = null;
    this.outcome = 'IN_PROGRESS';
    this.events = [];
    this.lastActionTime = Date.now();
    this.lastAttackTime = 0;
  }

  /**
   * Internal logger for uniform event structure.
   */
  private logEvent(
    action: TelemetryActionType,
    options: Partial<Omit<TelemetryEvent, 'id' | 'action' | 'timestamp'>> = {}
  ): TelemetryEvent {
    const now = Date.now();
    const intervalSinceLastAction = now - this.lastActionTime;
    this.lastActionTime = now;

    const event: TelemetryEvent = {
      id: `evt-${this.events.length + 1}-${now}`,
      action,
      timestamp: now,
      intervalSinceLastAction,
      ...options,
    };

    this.events.push(event);

    // Keep array bounded in extreme cases (e.g. 1000 max events per round)
    if (this.events.length > 1000) {
      this.events.shift();
    }

    // Notify listeners
    if (this.eventListeners.length > 0) {
      const liveMetrics = this.getLiveMetrics();
      this.eventListeners.forEach(listener => {
        try {
          listener(event, liveMetrics);
        } catch {}
      });
    }

    return event;
  }

  /**
   * Record a player attack input.
   */
  public recordAttack(params: {
    combo?: number;
    distanceToEnemy?: number;
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    const now = Date.now();
    const intervalSinceLastAttack = this.lastAttackTime > 0 ? now - this.lastAttackTime : 0;
    this.lastAttackTime = now;

    return this.logEvent('attack', {
      combo: params.combo ?? 1,
      distanceToEnemy: params.distanceToEnemy,
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      intervalSinceLastAction: intervalSinceLastAttack,
      details: `Attack swing (Combo ${params.combo || 1})`,
    });
  }

  /**
   * Record an attack connecting with the enemy.
   */
  public recordHit(params: {
    damage: number;
    combo: number;
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    return this.logEvent('hit', {
      damage: params.damage,
      combo: params.combo,
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      details: `Hit confirmed: -${params.damage} HP (Combo x${params.combo})`,
    });
  }

  /**
   * Record an attack missing (out of range or avoided).
   */
  public recordMiss(params: {
    distanceToEnemy?: number;
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    return this.logEvent('miss', {
      distanceToEnemy: params.distanceToEnemy,
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      details: `Attack missed (Distance: ${params.distanceToEnemy?.toFixed(1) || '?'}m)`,
    });
  }

  /**
   * Record a defensive block action.
   */
  public recordBlock(params: {
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    return this.logEvent('block', {
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      details: 'Defensive shield raised',
    });
  }

  /**
   * Record a dodge maneuver with direction.
   */
  public recordDodge(params: {
    direction: DodgeDirection;
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    return this.logEvent('dodge', {
      direction: params.direction,
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      details: `Dodge maneuver: ${params.direction}`,
    });
  }

  /**
   * Record player positional locomotion.
   */
  public recordMovement(params: {
    distance: number;
    direction?: DodgeDirection;
    playerHp?: number;
  }): TelemetryEvent {
    return this.logEvent('movement', {
      damage: params.distance, // Stored in numerical payload for metrics aggregation
      direction: params.direction,
      playerHealth: params.playerHp,
    });
  }

  /**
   * Record damage dealt to the enemy.
   */
  public recordDamageDealt(params: {
    damage: number;
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    return this.logEvent('damage_dealt', {
      damage: params.damage,
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      details: `Inflicted ${params.damage} damage`,
    });
  }

  /**
   * Record damage received from an enemy strike.
   */
  public recordDamageReceived(params: {
    damage: number;
    wasBlocked: boolean;
    playerHp?: number;
    enemyHp?: number;
  }): TelemetryEvent {
    return this.logEvent('damage_received', {
      damage: params.damage,
      playerHealth: params.playerHp,
      enemyHealth: params.enemyHp,
      details: params.wasBlocked
        ? `Absorbed ${params.damage} chip damage (Guard held)`
        : `Suffered ${params.damage} direct damage`,
    });
  }

  /**
   * Concludes the match, computes final analytics, and returns the match telemetry object.
   */
  public endMatch(
    outcome: MatchOutcome,
    playerFinalHp: number = 0,
    enemyFinalHp: number = 0
  ): MatchTelemetry {
    this.endTime = Date.now();
    this.outcome = outcome;
    const durationSeconds = Math.max(1, (this.endTime - this.startTime) / 1000);
    const metrics = TelemetryAnalyzer.calculateMetrics(this.events, durationSeconds);

    return {
      matchId: this.matchId,
      startTime: this.startTime,
      endTime: this.endTime,
      durationSeconds,
      outcome,
      playerFinalHp,
      enemyFinalHp,
      events: [...this.events],
      metrics,
    };
  }

  /**
   * Computes metrics up to the current second.
   */
  public getLiveMetrics(): MatchMetrics {
    const elapsed = Math.max(1, (Date.now() - this.startTime) / 1000);
    return TelemetryAnalyzer.calculateMetrics(this.events, elapsed);
  }

  /**
   * Returns a copy of the current state of the match telemetry.
   */
  public getCurrentMatch(playerHp: number = 100, enemyHp: number = 100): MatchTelemetry {
    const elapsed = Math.max(1, (Date.now() - this.startTime) / 1000);
    const metrics = TelemetryAnalyzer.calculateMetrics(this.events, elapsed);

    return {
      matchId: this.matchId,
      startTime: this.startTime,
      endTime: this.endTime ?? undefined,
      durationSeconds: elapsed,
      outcome: this.outcome,
      playerFinalHp: playerHp,
      enemyFinalHp: enemyHp,
      events: [...this.events],
      metrics,
    };
  }

  /**
   * Returns the most recent N events.
   */
  public getRecentEvents(limit: number = 15): TelemetryEvent[] {
    return this.events.slice(-limit).reverse();
  }

  /**
   * Subscribe to real-time telemetry events.
   */
  public subscribe(
    listener: (event: TelemetryEvent, metrics: MatchMetrics) => void
  ): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }
}
