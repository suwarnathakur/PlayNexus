/**
 * PLAYNEXUS Costume & Stage Store
 * Persists Fox palette selection and arena stage theme.
 */
import { create } from 'zustand';

// Fox McCloud Melee-authentic costume palettes
export type FoxCostume =
  | 'classic'   // ⚪ Default White Flight Jacket
  | 'red'       // 🔴 Crimson Squadron
  | 'blue'      // 🔵 Sector Z Marine
  | 'green'     // 🟢 Corneria Recon
  | 'dark';     // ⚫ Shadow Matrix

export type StageTheme = 'colosseum' | 'space' | 'jungle' | 'shipyard';

export interface CostumeInfo {
  id: FoxCostume;
  label: string;
  subtitle: string;
  swatchColor: string;
  jacketColor: string;
  scarfColor: string;
  pantsColor: string;
}

export const FOX_COSTUMES: CostumeInfo[] = [
  {
    id: 'classic',
    label: 'CLASSIC WHITE',
    subtitle: 'Default Melee Flight Jacket',
    swatchColor: '#f8fafc',
    jacketColor: '#f8fafc',
    scarfColor: '#dc2626',
    pantsColor: '#166534',
  },
  {
    id: 'red',
    label: 'CRIMSON SQUADRON',
    subtitle: 'Red Fox Combat Variant',
    swatchColor: '#dc2626',
    jacketColor: '#dc2626',
    scarfColor: '#fbbf24',
    pantsColor: '#1e293b',
  },
  {
    id: 'blue',
    label: 'SECTOR Z MARINE',
    subtitle: 'Deep Navy Flight Jacket',
    swatchColor: '#1d4ed8',
    jacketColor: '#1d4ed8',
    scarfColor: '#22d3ee',
    pantsColor: '#1e3a5f',
  },
  {
    id: 'green',
    label: 'CORNERIA RECON',
    subtitle: 'Olive Field Operative',
    swatchColor: '#15803d',
    jacketColor: '#166534',
    scarfColor: '#f97316',
    pantsColor: '#713f12',
  },
  {
    id: 'dark',
    label: 'SHADOW MATRIX',
    subtitle: 'Stealth Carbon-Black Jacket',
    swatchColor: '#0f172a',
    jacketColor: '#0f172a',
    scarfColor: '#dc2626',
    pantsColor: '#1e293b',
  },
];

export type CombatStyle = 'melee' | 'archery' | 'wrestling' | 'defense' | 'sword';

interface CostumeState {
  selectedCostume: FoxCostume;
  stageTheme: StageTheme;
  selectedStyle: CombatStyle;
  setCostume: (c: FoxCostume) => void;
  setStageTheme: (s: StageTheme) => void;
  setStyle: (s: CombatStyle) => void;
}

const load = <T>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key: string, value: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

export const useCostumeStore = create<CostumeState>((set) => ({
  selectedCostume: load<FoxCostume>('playnexus_costume', 'classic'),
  stageTheme: load<StageTheme>('playnexus_stage', 'colosseum'),
  selectedStyle: load<CombatStyle>('playnexus_selected_style', 'melee'),

  setCostume: (c) => {
    save('playnexus_costume', c);
    set({ selectedCostume: c });
  },
  setStageTheme: (s) => {
    save('playnexus_stage', s);
    set({ stageTheme: s });
  },
  setStyle: (s) => {
    save('playnexus_selected_style', s);
    set({ selectedStyle: s });
  },
}));
