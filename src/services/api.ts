// PLAYNEXUS Neural API Client
// Connects frontend telemetry and game loop to Express + MongoDB backend

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Health check verification
 */
export const fetchSystemHealth = async () => {
  try {
    const res = await fetch('http://localhost:5000/health');
    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status,
        ping: 8,
        nodesActive: 512,
        aiModel: 'NEURAL-ADAPT-ENGINE-V2',
        version: data.version || '1.0.0',
        dbStatus: data.database,
      };
    }
  } catch {
    // Fallback if backend is offline
  }

  return {
    status: 'OPTIMAL (LOCAL)',
    ping: 12,
    nodesActive: 384,
    aiModel: 'RULE-BASED-LOCAL-FALLBACK',
    version: '2.4.19-STANDALONE',
    dbStatus: 'OFFLINE_CACHE',
  };
};

/**
 * POST /api/analyze-behavior
 */
export const analyzeBehaviorApi = async (events: any[], durationSeconds: number, playerId = 'CYBER_OPERATIVE') => {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze-behavior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, durationSeconds, playerId }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Behavior analysis fallback to local mode:', err);
  }
  return null;
};

/**
 * POST /api/generate-strategy
 */
export const generateStrategyApi = async (fightingDNA: any) => {
  try {
    const res = await fetch(`${API_BASE_URL}/generate-strategy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fightingDNA }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data.counterStrategy;
    }
  } catch (err) {
    console.warn('[API] Strategy generation fallback to local mode:', err);
  }
  return null;
};

/**
 * GET /api/player/:playerId/dna
 */
export const getPlayerDnaApi = async (playerId = 'CYBER_STRIKER') => {
  try {
    const res = await fetch(`${API_BASE_URL}/player/${playerId}/dna`);
    if (res.ok) {
      const json = await res.json();
      return json.data.fightingDNA;
    }
  } catch (err) {
    console.warn('[API] Player DNA fetch fallback:', err);
  }
  return null;
};

/**
 * POST /api/match/complete
 */
export const completeMatchApi = async (matchPayload: {
  matchId?: string;
  playerId?: string;
  outcome: 'VICTORY' | 'DEFEAT';
  durationSeconds: number;
  playerFinalHp: number;
  enemyFinalHp: number;
  events?: any[];
  metrics?: any;
}) => {
  try {
    const res = await fetch(`${API_BASE_URL}/match/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchPayload),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Match record persistence fallback:', err);
  }
  return null;
};

/**
 * POST /api/lock-in/trigger
 */
export const triggerLockInApi = async (recentDodges: string[], playerId = 'CYBER_STRIKER') => {
  try {
    const res = await fetch(`${API_BASE_URL}/lock-in/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recentDodges, playerId }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Dodge lock API fallback:', err);
  }
  return null;
};

/**
 * GET /api/leaderboard
 */
export const getLeaderboardApi = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/leaderboard`);
    if (res.ok) {
      const json = await res.json();
      return json.data.leaderboard;
    }
  } catch (err) {
    console.warn('[API] Leaderboard fetch fallback:', err);
  }
  return [];
};

/**
 * POST /api/scan-weapon
 * Synthesizes room object into mythical weapon
 */
export interface ScannedWeaponResult {
  detectedItem: string;
  weapon: string;
  type: string;
  bonus: string;
  powerBonusPercent: number;
  lore: string;
  rarity: string;
  source?: string;
}

export const scanWeaponApi = async (
  detectedItem = 'Book',
  visualFeatures: Record<string, any> = {}
): Promise<ScannedWeaponResult> => {
  try {
    const res = await fetch(`${API_BASE_URL}/scan-weapon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detectedItem, visualFeatures }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data?.weapon) {
        return json.data.weapon;
      }
    }
  } catch (err) {
    console.warn('[API] Scan weapon API offline, using local forge dictionary:', err);
  }

  // Local Forge Dictionary Fallback
  const catalog: Record<string, ScannedWeaponResult> = {
    book: {
      detectedItem: 'Book',
      weapon: 'Tome of Wisdom',
      type: 'Staff',
      bonus: '+15% Ability Power',
      powerBonusPercent: 15,
      lore: 'Ancient codex inscribed with arcane quantum telemetry, amplifying strike resonance.',
      rarity: 'MYTHICAL',
      source: 'LOCAL_FORGE',
    },
    coffeemug: {
      detectedItem: 'Coffee Mug',
      weapon: 'Thermal Plasma Cannon',
      type: 'Blaster',
      bonus: '+18% Heavy Strike Impact',
      powerBonusPercent: 18,
      lore: 'Pressurized thermal conduit venting superheated energy on kinetic impact.',
      rarity: 'RARE',
      source: 'LOCAL_FORGE',
    },
    pen: {
      detectedItem: 'Pen',
      weapon: 'Needle of Precision',
      type: 'Dagger',
      bonus: '+20% Critical Hit Rate',
      powerBonusPercent: 20,
      lore: 'Needle-point monomolecular blade engineered for high-frequency vital strikes.',
      rarity: 'EPIC',
      source: 'LOCAL_FORGE',
    },
    smartphone: {
      detectedItem: 'Smartphone',
      weapon: 'EMP Neural Disruptor',
      type: 'Tech Gauntlet',
      bonus: '+25% AI Adaptation Jammer',
      powerBonusPercent: 25,
      lore: 'Micro-circuit array emitting electromagnetic pulses that delay enemy counter-strategies.',
      rarity: 'LEGENDARY',
      source: 'LOCAL_FORGE',
    },
    waterbottle: {
      detectedItem: 'Water Bottle',
      weapon: 'Cryo-Kinetic Condenser',
      type: 'Mace',
      bonus: '+15% Stun Duration & Enemy Slow',
      powerBonusPercent: 15,
      lore: 'Sub-zero pressure vessel freezing enemy momentum upon clean hits.',
      rarity: 'RARE',
      source: 'LOCAL_FORGE',
    },
    keyboard: {
      detectedItem: 'Keyboard',
      weapon: 'Cipher Blade',
      type: 'Shortsword',
      bonus: '+16% Attack Speed',
      powerBonusPercent: 16,
      lore: 'Tactile switch-matrix forged into high-frequency vibrating edge.',
      rarity: 'EPIC',
      source: 'LOCAL_FORGE',
    },
  };

  const key = detectedItem.toLowerCase().replace(/[^a-z]/g, '');
  return catalog[key] || catalog.book;
};

