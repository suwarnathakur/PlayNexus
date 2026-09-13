import { create } from 'zustand';
import type { MatchTelemetry, TelemetryEvent, MatchMetrics } from '../game/telemetry/TelemetryTypes';
import type { FightingDNAProfile } from '../ai/FightingDNA/DNATypes';
import type { DetectedPattern } from '../ai/behavior/BehaviorTypes';
import type { AIStrategy, AdaptationLevel } from '../ai/adaptive/StrategyTypes';
import type { CounterStrategy } from '../ai/adaptive/CounterStrategy';
import type { AIMemory, PlayerEvolutionRecord } from '../ai/adaptive/AIMemory';
import { DNAAnalyzer } from '../ai/FightingDNA/DNAAnalyzer';
import { FightingDNA } from '../ai/FightingDNA/FightingDNA';
import { BehaviorAnalyzer } from '../ai/behavior/BehaviorAnalyzer';
import { PatternDetector } from '../ai/behavior/PatternDetector';
import { StrategyEngine } from '../ai/adaptive/StrategyEngine';
import { AIMemoryManager } from '../ai/adaptive/AIMemory';

interface TelemetryStoreState {
  latestMatch: MatchTelemetry | null;
  matchHistory: MatchTelemetry[];
  fightingDNA: FightingDNAProfile | null;
  liveEvents: TelemetryEvent[];
  liveMetrics: MatchMetrics | null;
  detectedPatterns: DetectedPattern[];
  counterStrategy: CounterStrategy;
  aiStrategy: AIStrategy;
  aiMemory: AIMemory;
  adaptationLevel: AdaptationLevel;
  aiConfidence: number;
  playerEvolution: PlayerEvolutionRecord | null;
  isDebugPanelVisible: boolean;

  setLatestMatch: (match: MatchTelemetry) => void;
  setFightingDNA: (dna: FightingDNAProfile) => void;
  updateLiveState: (events: TelemetryEvent[], metrics: MatchMetrics) => void;
  midMatchAdapt: (events: TelemetryEvent[]) => CounterStrategy;
  toggleDebugPanel: () => void;
  setDebugPanelVisible: (visible: boolean) => void;
  clearTelemetry: () => void;
}

const initialMemory = AIMemoryManager.loadMemory();
const baselineStrategy = StrategyEngine.getBaselineStrategy();

export const useTelemetryStore = create<TelemetryStoreState>((set, get) => ({
  latestMatch: null,
  matchHistory: [],
  fightingDNA: FightingDNA.getDefaultProfile(),
  liveEvents: [],
  liveMetrics: null,
  detectedPatterns: [],
  counterStrategy: baselineStrategy,
  aiStrategy: baselineStrategy.aiStrategy,
  aiMemory: initialMemory,
  adaptationLevel: 0,
  aiConfidence: 0.45,
  playerEvolution: null,
  isDebugPanelVisible: true, // Visible for developer inspection

  setLatestMatch: (match) => {
    const dna = DNAAnalyzer.analyze(match);
    FightingDNA.generate(match);

    const stats = BehaviorAnalyzer.analyzeMatch(match);
    const patterns = PatternDetector.detectPatterns(stats);
    const newStrategy = StrategyEngine.generateStrategy(dna, patterns);

    const { memory, evolution } = AIMemoryManager.recordMatch(
      dna,
      newStrategy.aiStrategy,
      match.outcome === 'VICTORY' ? 'VICTORY' : 'DEFEAT'
    );

    set((state) => ({
      latestMatch: match,
      fightingDNA: dna,
      detectedPatterns: patterns,
      counterStrategy: newStrategy,
      aiStrategy: newStrategy.aiStrategy,
      adaptationLevel: newStrategy.adaptationLevel,
      aiConfidence: newStrategy.adaptationConfidence,
      aiMemory: memory,
      playerEvolution: evolution,
      matchHistory: [match, ...state.matchHistory.slice(0, 9)],
    }));
  },

  setFightingDNA: (dna) => set({ fightingDNA: dna }),

  updateLiveState: (events, metrics) =>
    set({
      liveEvents: events,
      liveMetrics: metrics,
    }),

  /**
   * Mid-match dynamic adaptation:
   * Called every 10–15 player actions to re-evaluate statistics and patterns.
   */
  midMatchAdapt: (events: TelemetryEvent[]): CounterStrategy => {
    if (!events || events.length < 5) {
      return get().counterStrategy;
    }

    const stats = BehaviorAnalyzer.analyzeEvents(events, 30);
    const patterns = PatternDetector.detectPatterns(stats);

    const currentDNA = get().fightingDNA || FightingDNA.getDefaultProfile();
    const liveDNA: FightingDNAProfile = {
      ...currentDNA,
      aggression: stats.aggression,
      defense: stats.defense,
      mobility: stats.mobility,
      predictabilityIndex: stats.predictabilityIndex,
      preferredDodge: stats.preferredDodge,
      dodgeLeftFrequency: stats.dodgeLeftPercentage / 100,
      dodgeRightFrequency: stats.dodgeRightPercentage / 100,
      dodgeLeftPercentage: stats.dodgeLeftPercentage,
      dodgeRightPercentage: stats.dodgeRightPercentage,
      preferredRange: stats.preferredRange,
      averageComboLength: stats.averageComboLength,
      totalAttacks: events.filter((e) => e.action === 'attack').length,
    };

    const newStrategy = StrategyEngine.generateStrategy(liveDNA, patterns);

    set({
      detectedPatterns: patterns,
      counterStrategy: newStrategy,
      aiStrategy: newStrategy.aiStrategy,
      adaptationLevel: newStrategy.adaptationLevel,
      aiConfidence: newStrategy.adaptationConfidence,
    });

    return newStrategy;
  },

  toggleDebugPanel: () =>
    set((state) => ({ isDebugPanelVisible: !state.isDebugPanelVisible })),

  setDebugPanelVisible: (visible) =>
    set({ isDebugPanelVisible: visible }),

  clearTelemetry: () =>
    set({
      liveEvents: [],
      liveMetrics: null,
      detectedPatterns: [],
      adaptationLevel: 0,
    }),
}));
