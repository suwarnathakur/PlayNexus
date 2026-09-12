// PLAYNEXUS DEMO MODE STORE
// Orchestrates deterministic demo sequence for hackathon presentations

import { create } from 'zustand';
import type { DemoStage } from './demoTypes';
import {
  DEMO_MATCH_1_TELEMETRY,
  DEMO_FIGHTING_DNA,
  DEMO_POST_ADAPTATION_METRICS,
} from './demoData';
import { useTelemetryStore } from '../store/telemetryStore';

interface DemoStoreState {
  isDemoMode: boolean;
  demoStage: DemoStage;
  adaptationScore: number;
  adaptationGain: number;
  isLockChallengeActive: boolean;
  lockChallengeCountdown: number;

  enableDemoMode: () => void;
  disableDemoMode: () => void;
  toggleDemoMode: () => void;
  setDemoStage: (stage: DemoStage) => void;

  // Actions for the guided sequence
  startDemoMatch1: () => void;
  injectMatch1Results: () => void;
  startDemoMatch2: () => void;
  triggerDemoLockIn: () => void;
  resolveChallengeSuccess: () => void;
  completeDemoVictory: () => void;
  resetDemo: () => void;
}

const getInitialDemoMode = (): boolean => {
  try {
    return localStorage.getItem('playnexus_demo_mode') === 'true';
  } catch {
    return false;
  }
};

export const useDemoStore = create<DemoStoreState>((set, get) => ({
  isDemoMode: getInitialDemoMode(),
  demoStage: 'IDLE',
  adaptationScore: DEMO_POST_ADAPTATION_METRICS.adaptationScoreInitial,
  adaptationGain: 0,
  isLockChallengeActive: false,
  lockChallengeCountdown: 15,

  enableDemoMode: () => {
    try {
      localStorage.setItem('playnexus_demo_mode', 'true');
    } catch {
      // Ignored
    }
    set({ isDemoMode: true, demoStage: 'MATCH_1' });
  },

  disableDemoMode: () => {
    try {
      localStorage.setItem('playnexus_demo_mode', 'false');
    } catch {
      // Ignored
    }
    set({
      isDemoMode: false,
      demoStage: 'IDLE',
      isLockChallengeActive: false,
    });
  },

  toggleDemoMode: () => {
    const next = !get().isDemoMode;
    if (next) {
      get().enableDemoMode();
    } else {
      get().disableDemoMode();
    }
  },

  setDemoStage: (stage) => set({ demoStage: stage }),

  // 1. MATCH 1: Reset telemetry and set stage
  startDemoMatch1: () => {
    set({
      demoStage: 'MATCH_1',
      isLockChallengeActive: false,
      adaptationScore: DEMO_POST_ADAPTATION_METRICS.adaptationScoreInitial,
      adaptationGain: 0,
    });
  },

  // 2. MATCH 1 -> BATTLE INTEL: Injects realistic left-dodge telemetry & High Predictability DNA
  injectMatch1Results: () => {
    const telemetryStore = useTelemetryStore.getState();
    telemetryStore.setLatestMatch(DEMO_MATCH_1_TELEMETRY);
    telemetryStore.setFightingDNA(DEMO_FIGHTING_DNA);
    set({
      demoStage: 'BATTLE_INTEL',
      isLockChallengeActive: false,
    });
  },

  // 3. BATTLE INTEL -> MATCH 2: AI Counter-Strategy active
  startDemoMatch2: () => {
    set({
      demoStage: 'MATCH_2',
      isLockChallengeActive: false,
    });
  },

  // 4. LOCK-IN CHALLENGE: Triggers "SURVIVE 15s DODGING ONLY RIGHT"
  triggerDemoLockIn: () => {
    set({
      demoStage: 'LOCK_IN_CHALLENGE',
      isLockChallengeActive: true,
      lockChallengeCountdown: 15,
    });
  },

  // 5. Challenge Success (+20% Dodge Speed)
  resolveChallengeSuccess: () => {
    set({
      isLockChallengeActive: false,
      adaptationScore: DEMO_POST_ADAPTATION_METRICS.adaptationScoreFinal,
      adaptationGain: DEMO_POST_ADAPTATION_METRICS.adaptationGain,
      demoStage: 'DEMO_VICTORY',
    });
  },

  // 6. Complete Demo Match 2 Victory
  completeDemoVictory: () => {
    set({
      demoStage: 'COMPLETED',
      isLockChallengeActive: false,
      adaptationScore: DEMO_POST_ADAPTATION_METRICS.adaptationScoreFinal,
      adaptationGain: DEMO_POST_ADAPTATION_METRICS.adaptationGain,
    });
  },

  // Reset to initial state
  resetDemo: () => {
    set({
      demoStage: 'MATCH_1',
      adaptationScore: DEMO_POST_ADAPTATION_METRICS.adaptationScoreInitial,
      adaptationGain: 0,
      isLockChallengeActive: false,
    });
  },
}));
