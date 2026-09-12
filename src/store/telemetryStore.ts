import { create } from 'zustand';
import type { MatchTelemetry, TelemetryEvent, MatchMetrics } from '../game/telemetry/TelemetryTypes';
import type { FightingDNAProfile } from '../ai/FightingDNA/DNATypes';
import { DNAAnalyzer } from '../ai/FightingDNA/DNAAnalyzer';
import { FightingDNA } from '../ai/FightingDNA/FightingDNA';

interface TelemetryStoreState {
  latestMatch: MatchTelemetry | null;
  matchHistory: MatchTelemetry[];
  fightingDNA: FightingDNAProfile | null;
  liveEvents: TelemetryEvent[];
  liveMetrics: MatchMetrics | null;
  isDebugPanelVisible: boolean;
  setLatestMatch: (match: MatchTelemetry) => void;
  setFightingDNA: (dna: FightingDNAProfile) => void;
  updateLiveState: (events: TelemetryEvent[], metrics: MatchMetrics) => void;
  toggleDebugPanel: () => void;
  setDebugPanelVisible: (visible: boolean) => void;
  clearTelemetry: () => void;
}

export const useTelemetryStore = create<TelemetryStoreState>((set) => ({
  latestMatch: null,
  matchHistory: [],
  fightingDNA: FightingDNA.getDefaultProfile(),
  liveEvents: [],
  liveMetrics: null,
  isDebugPanelVisible: true, // Visible by default for development

  setLatestMatch: (match) => {
    const dna = DNAAnalyzer.analyze(match);
    FightingDNA.generate(match);
    set((state) => ({
      latestMatch: match,
      fightingDNA: dna,
      matchHistory: [match, ...state.matchHistory.slice(0, 9)], // Keep last 10 matches
    }));
  },

  setFightingDNA: (dna) => set({ fightingDNA: dna }),

  updateLiveState: (events, metrics) =>
    set({
      liveEvents: events,
      liveMetrics: metrics,
    }),

  toggleDebugPanel: () =>
    set((state) => ({ isDebugPanelVisible: !state.isDebugPanelVisible })),

  setDebugPanelVisible: (visible) =>
    set({ isDebugPanelVisible: visible }),

  clearTelemetry: () =>
    set({
      liveEvents: [],
      liveMetrics: null,
    }),
}));
