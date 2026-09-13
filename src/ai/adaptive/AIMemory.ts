import type { FightingDNA, FightingDNAProfile } from '../FightingDNA/DNATypes';
import type { AIStrategy } from './StrategyTypes';
import { StrategyEngine } from './StrategyEngine';

export interface PlayerEvolutionRecord {
  matchNumber: number;
  predictabilityBefore: number;
  predictabilityAfter: number;
  adaptationScoreBefore: number;
  adaptationScoreAfter: number;
  playerAdapted: boolean;
  summary: string;
}

export interface AIMemory {
  playerId: string;
  matchesObserved: number;
  previousDNA: FightingDNA[];
  successfulCounters: string[];
  failedCounters: string[];
  currentStrategy: AIStrategy;
  evolutionHistory: PlayerEvolutionRecord[];
}

const STORAGE_KEY_AI_MEMORY = 'playnexus_ai_memory';

/**
 * PLAYNEXUS AI Memory Manager
 * Stores and persists AI learning across matches, tracking player counter-adaptation
 * and evolution of fighting habits.
 */
export class AIMemoryManager {
  private static memory: AIMemory | null = null;

  /**
   * Load AI Memory from localStorage or initialize new instance
   */
  public static loadMemory(playerId = 'CYBER_OPERATIVE'): AIMemory {
    if (this.memory) return this.memory;

    try {
      const stored = localStorage.getItem(STORAGE_KEY_AI_MEMORY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.previousDNA)) {
          this.memory = parsed;
          return parsed;
        }
      }
    } catch {
      // Storage unavailable or corrupted
    }

    const initialStrategy = StrategyEngine.getBaselineStrategy().aiStrategy;
    const fresh: AIMemory = {
      playerId,
      matchesObserved: 0,
      previousDNA: [],
      successfulCounters: [],
      failedCounters: [],
      currentStrategy: initialStrategy,
      evolutionHistory: [],
    };
    this.memory = fresh;
    this.saveMemory(fresh);
    return fresh;
  }

  /**
   * Persist AI memory to localStorage
   */
  public static saveMemory(memory: AIMemory): void {
    this.memory = memory;
    try {
      localStorage.setItem(STORAGE_KEY_AI_MEMORY, JSON.stringify(memory));
    } catch {
      // Ignore quota issues
    }
  }

  /**
   * Records completed match telemetry and evaluates Player Evolution
   */
  public static recordMatch(
    newDNA: FightingDNAProfile,
    newStrategy: AIStrategy,
    outcome: 'VICTORY' | 'DEFEAT'
  ): { memory: AIMemory; evolution: PlayerEvolutionRecord | null } {
    const mem = this.loadMemory(newDNA.id || 'CYBER_OPERATIVE');
    const prevDNA = mem.previousDNA[mem.previousDNA.length - 1];

    let evolution: PlayerEvolutionRecord | null = null;

    if (prevDNA) {
      const predBefore = Math.round(prevDNA.predictabilityIndex * 100);
      const predAfter = Math.round(newDNA.predictabilityIndex * 100);
      const adaptBefore = Math.round(mem.currentStrategy.confidenceScore * 100);

      // Did player counter-adapt? (e.g. Changed dodge direction, broke combo habit, reduced predictability)
      const changedDodge = prevDNA.preferredDodge !== newDNA.preferredDodge && newDNA.preferredDodge !== 'mixed';
      const droppedPredictability = predAfter < predBefore - 10;
      const playerAdapted = changedDodge || droppedPredictability;

      // If player changed tactics, AI confidence drops; otherwise AI becomes more confident
      const adaptAfter = playerAdapted
        ? Math.max(35, Math.round(adaptBefore * 0.65))
        : Math.min(98, Math.round(adaptBefore * 1.15));

      const summary = playerAdapted
        ? `PLAYER EVOLUTION: Habit altered (${prevDNA.preferredDodge.toUpperCase()} → ${newDNA.preferredDodge.toUpperCase()}). AI confidence decreased ${adaptBefore}% → ${adaptAfter}%.`
        : `AI REINFORCEMENT: Player retained signature patterns. AI counter confidence at ${adaptAfter}%.`;

      evolution = {
        matchNumber: mem.matchesObserved + 1,
        predictabilityBefore: predBefore,
        predictabilityAfter: predAfter,
        adaptationScoreBefore: adaptBefore,
        adaptationScoreAfter: adaptAfter,
        playerAdapted,
        summary,
      };

      mem.evolutionHistory.push(evolution);
    }

    if (outcome === 'DEFEAT') {
      // AI defeated player -> counter was successful
      mem.successfulCounters.push(newStrategy.targetPatternDescription || 'TACTICAL_PRESSURE');
    } else {
      // Player defeated AI -> counter needs refinement
      mem.failedCounters.push(newStrategy.targetPatternDescription || 'TACTICAL_PRESSURE');
    }

    mem.matchesObserved += 1;
    mem.previousDNA.push({
      aggression: newDNA.aggression,
      defense: newDNA.defense,
      mobility: newDNA.mobility,
      preferredDodge: newDNA.preferredDodge as any,
      dodgeLeftFrequency: newDNA.dodgeLeftFrequency,
      dodgeRightFrequency: newDNA.dodgeRightFrequency,
      preferredRange: newDNA.preferredRange as any,
      averageComboLength: newDNA.averageComboLength,
      repeatedCombos: [...newDNA.repeatedCombos],
      attackFrequency: newDNA.attackFrequency,
      blockFrequency: newDNA.blockFrequency,
      strengths: [...newDNA.strengths],
      weaknesses: [...newDNA.weaknesses],
      predictabilityIndex: newDNA.predictabilityIndex,
    });

    // Keep bounded history
    if (mem.previousDNA.length > 15) mem.previousDNA.shift();
    if (mem.evolutionHistory.length > 10) mem.evolutionHistory.shift();

    mem.currentStrategy = newStrategy;
    this.saveMemory(mem);

    return { memory: mem, evolution };
  }

  /**
   * Reset memory (for fresh demo or testing)
   */
  public static clearMemory(): void {
    this.memory = null;
    try {
      localStorage.removeItem(STORAGE_KEY_AI_MEMORY);
    } catch {}
  }
}
