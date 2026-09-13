import type { FightingDNAProfile } from '../ai/FightingDNA/DNATypes';

export type XpRewardType = 'victory' | 'adaptation' | 'lock-in';

export interface PlayerProfile {
  name: string;
  playerId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  totalDamage: number;
  favoriteStyle: string;
  fightingDNA: FightingDNAProfile;
  adaptationScore: number;
}

export const STORAGE_KEY_PLAYER_PROFILE = 'playnexus_player_profile';

export const DEFAULT_FIGHTING_DNA: FightingDNAProfile = {
  id: 'DNA-OPERATIVE-DEFAULT',
  timestamp: Date.now(),
  archetype: 'BALANCED_STRIKER',
  aggression: 0.76,
  defense: 0.61,
  mobility: 0.72,
  predictabilityIndex: 0.56,
  reactionTime: 0.24,
  preferredDodge: 'left',
  preferredRange: 'mid',
  averageComboLength: 2.4,
  topPatterns: [
    'Methodical Mid-Range Stance',
    'Forward Thrust Initiation',
    'Balanced Dodge Cadence',
  ],
  repeatedCombos: ['LIGHT-LIGHT-HEAVY'],
  strengths: [
    'Solid fundamentals and stable pressure',
    'Reliable timing under hostile AI pressure',
  ],
  weaknesses: [
    'Slight left-dodge bias under close pressure',
    'Recovery timing is readable after heavy combos',
  ],
  totalAttacks: 18,
  accuracyPercentage: 68,
  dodgeLeftPercentage: 58,
  dodgeRightPercentage: 42,
};

export const DEFAULT_PLAYER_PROFILE: PlayerProfile = {
  name: 'CYBER_VIPER',
  playerId: 'NEXUS-VANGUARD-07',
  level: 7,
  xp: 3420,
  xpToNextLevel: 5000,
  totalMatches: 24,
  wins: 16,
  losses: 8,
  winRate: 66.7,
  currentStreak: 3,
  bestStreak: 5,
  totalDamage: 32480,
  favoriteStyle: 'HYBRID STRIKER',
  fightingDNA: DEFAULT_FIGHTING_DNA,
  adaptationScore: 91,
};

export const getWinRate = (wins: number, losses: number): number => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Number(((wins / total) * 100).toFixed(1));
};

export const xpRewardMap: Record<XpRewardType, number> = {
  victory: 100,
  adaptation: 50,
  'lock-in': 75,
};

export const getRequiredXpForLevel = (level: number): number => {
  return Math.max(5000, 5000 + (level - 1) * 750);
};

export const normalizePlayerProfile = (input: Partial<PlayerProfile> | null | undefined): PlayerProfile => {
  const base = DEFAULT_PLAYER_PROFILE;
  const merged = { ...base, ...(input ?? {}) };
  const wins = Number(merged.wins ?? 0);
  const losses = Number(merged.losses ?? 0);
  const totalMatches = Number(merged.totalMatches ?? wins + losses);
  const winRate = getWinRate(wins, losses);
  const nextLevelThreshold = getRequiredXpForLevel(Number(merged.level ?? 1));

  return {
    ...merged,
    totalMatches,
    wins,
    losses,
    winRate,
    xpToNextLevel: Number(merged.xpToNextLevel ?? nextLevelThreshold),
    fightingDNA: merged.fightingDNA ?? DEFAULT_FIGHTING_DNA,
    favoriteStyle: merged.favoriteStyle || 'HYBRID STRIKER',
  };
};

export const awardXp = (profile: PlayerProfile, rewardType: XpRewardType): { profile: PlayerProfile; leveledUp: boolean } => {
  const base = normalizePlayerProfile(profile);
  const reward = xpRewardMap[rewardType];
  let nextProfile = { ...base, xp: base.xp + reward };
  let leveledUp = false;

  while (nextProfile.xp >= nextProfile.xpToNextLevel) {
    nextProfile = {
      ...nextProfile,
      xp: nextProfile.xp - nextProfile.xpToNextLevel,
      level: nextProfile.level + 1,
      xpToNextLevel: getRequiredXpForLevel(nextProfile.level + 1),
    };
    leveledUp = true;
  }

  nextProfile.xpToNextLevel = getRequiredXpForLevel(nextProfile.level);
  return { profile: nextProfile, leveledUp };
};

export const readLocalPlayerProfile = (): PlayerProfile => {
  if (typeof window === 'undefined') return DEFAULT_PLAYER_PROFILE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PLAYER_PROFILE);
    if (!raw) return DEFAULT_PLAYER_PROFILE;
    return normalizePlayerProfile(JSON.parse(raw));
  } catch {
    return DEFAULT_PLAYER_PROFILE;
  }
};

export const saveLocalPlayerProfile = (profile: PlayerProfile): PlayerProfile => {
  const normalized = normalizePlayerProfile(profile);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_PLAYER_PROFILE, JSON.stringify(normalized));
    } catch {
      // Ignore unavailable storage
    }
  }
  return normalized;
};

export const syncPlayerProfileToBackend = async (profile: PlayerProfile): Promise<PlayerProfile> => {
  const payload = normalizePlayerProfile(profile);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/player/${encodeURIComponent(payload.playerId)}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const json = await response.json();
      if (json?.data?.profile) {
        return normalizePlayerProfile(json.data.profile);
      }
    }
  } catch {
    // Backend unavailable; fallback to local storage below.
  }

  return saveLocalPlayerProfile(payload);
};

export const loadPlayerProfile = async (playerId?: string): Promise<PlayerProfile> => {
  const local = readLocalPlayerProfile();

  if (playerId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/player/${encodeURIComponent(playerId)}/profile`);
      if (response.ok) {
        const json = await response.json();
        if (json?.data?.profile) {
          return normalizePlayerProfile(json.data.profile);
        }
      }
    } catch {
      // Backend unavailable, keep local profile.
    }
  }

  return local;
};
