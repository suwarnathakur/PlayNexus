// PLAYNEXUS HACKATHON DEMO MODE TYPES
// Strictly isolated from production API definitions

export type DemoStage =
  | 'IDLE'                  // Demo mode active, ready to start
  | 'MATCH_1'               // Match 1: Player repeatedly dodges LEFT
  | 'BATTLE_INTEL'          // Post-Match 1: Predictability = HIGH (0.84)
  | 'MATCH_2'               // Match 2: AI Counter-Strategy active
  | 'LOCK_IN_CHALLENGE'     // Dodge Lock Challenge: 15s Dodging Right
  | 'DEMO_VICTORY'          // Challenge passed, AI overridden, Adaptation score +22%
  | 'COMPLETED';

export interface DemoStepInfo {
  stage: DemoStage;
  label: string;
  shortCode: string;
  description: string;
  prompt: string;
  nextStage: DemoStage;
}
