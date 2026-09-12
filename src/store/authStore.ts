import { useState, useEffect } from 'react';

export interface CombatProfile {
  playerId: string;
  codename: string;
  fightingDNA: {
    aggression: number; // 0-100
    counterRate: number; // 0-100
    adaptability: number; // 0-100
    neuralSync: number; // 0-100
    preferredStyle: string;
  };
  tier: string;
  rankPoints: number;
  aiOpponentEvolution: number; // 0-100%
}

export interface AuthState {
  isAuthenticated: boolean;
  player: CombatProfile | null;
  rememberMe: boolean;
  savedPlayerId: string;
}

const STORAGE_KEY_AUTH = 'playnexus_auth_profile';
const STORAGE_KEY_REMEMBER = 'playnexus_remember_player';

const defaultProfile: CombatProfile = {
  playerId: 'NEXUS-VANGUARD-07',
  codename: 'CYBER_VIPER',
  fightingDNA: {
    aggression: 84,
    counterRate: 91,
    adaptability: 96,
    neuralSync: 99,
    preferredStyle: 'HYBRID STRIKER',
  },
  tier: 'TITAN // DIAMOND III',
  rankPoints: 2480,
  aiOpponentEvolution: 87,
};

let listeners: Array<() => void> = [];
let state: AuthState = {
  isAuthenticated: false,
  player: null,
  rememberMe: true,
  savedPlayerId: 'VANGUARD_07',
};

// Initialize from local storage if present
if (typeof window !== 'undefined') {
  try {
    const savedRemember = localStorage.getItem(STORAGE_KEY_REMEMBER);
    if (savedRemember) {
      state.savedPlayerId = savedRemember;
      state.rememberMe = true;
    }
    const savedAuth = localStorage.getItem(STORAGE_KEY_AUTH);
    if (savedAuth) {
      state.player = JSON.parse(savedAuth);
      state.isAuthenticated = true;
    }
  } catch {
    // Storage access fallback
  }
}

const emitChange = () => {
  listeners.forEach(listener => listener());
};

export const authStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  },
  login: (playerIdOrEmail: string, remember: boolean) => {
    const name = playerIdOrEmail.includes('@') 
      ? playerIdOrEmail.split('@')[0].toUpperCase() 
      : playerIdOrEmail.toUpperCase();

    const profile: CombatProfile = {
      ...defaultProfile,
      playerId: playerIdOrEmail,
      codename: name || 'OPERATIVE',
    };

    state = {
      ...state,
      isAuthenticated: true,
      player: profile,
      rememberMe: remember,
      savedPlayerId: remember ? playerIdOrEmail : '',
    };

    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(profile));
      if (remember) {
        localStorage.setItem(STORAGE_KEY_REMEMBER, playerIdOrEmail);
      } else {
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
      }
    } catch {}

    emitChange();
    return profile;
  },
  logout: () => {
    state = {
      ...state,
      isAuthenticated: false,
      player: null,
    };
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {}
    emitChange();
  },
  setRememberMe: (remember: boolean) => {
    state = { ...state, rememberMe: remember };
    emitChange();
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    const unsubscribe = authStore.subscribe(() => {
      setAuthState(authStore.getState());
    });
    return () => unsubscribe();
  }, []);

  return {
    ...authState,
    login: authStore.login,
    logout: authStore.logout,
    setRememberMe: authStore.setRememberMe,
  };
};
