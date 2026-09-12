// AI Opponent & Neural Telemetry Components
export interface FightingDNAProfile {
  aggression: number;
  counterRate: number;
  adaptability: number;
  neuralSync: number;
  preferredStyle: string;
}

export interface CombatPatternObservation {
  timestamp: number;
  detectedHabit: string;
  counterStrategy: string;
  confidenceScore: number;
}
