/**
 * PLAYNEXUS Unified Command Store
 * Synchronizes voice commands, text commands, and voice-to-voice responses across the entire application.
 */

import { create } from 'zustand';
import { speakTacticalResponse, isVoiceToVoiceEnabled, setVoiceToVoiceEnabled } from '../services/textToSpeechService';
import { useCostumeStore } from './costumeStore';

export interface CombatActionHandlers {
  onAttack?: () => void;
  onBlock?: () => void;
  onDodge?: () => void;
  onSpecial?: () => void;
  onRestart?: () => void;
}

export interface CommandResult {
  command: string;
  category: 'combat' | 'navigation' | 'audio' | 'customization' | 'unknown';
  spokenResponse: string;
  targetPath?: string;
  rawInput: string;
}

interface CommandState {
  // Voice listening state
  isListening: boolean;
  isTranscribing: boolean;
  audioLevel: number; // 0 to 100 for live visual waveform meter
  recognizedText: string | null;
  lastCommand: string | null;
  lastResponse: string | null;
  error: string | null;

  // Terminal state
  isTerminalOpen: boolean;
  commandHistory: string[];

  // Voice-to-Voice state
  voiceToVoice: boolean;

  // Combat handlers registry (registered when CombatArena is active)
  combatHandlers: CombatActionHandlers | null;

  // Actions
  setIsListening: (val: boolean) => void;
  setIsTranscribing: (val: boolean) => void;
  setAudioLevel: (val: number) => void;
  setError: (err: string | null) => void;
  setTerminalOpen: (open: boolean) => void;
  toggleTerminal: () => void;
  setVoiceToVoice: (enabled: boolean) => void;
  registerCombatHandlers: (handlers: CombatActionHandlers | null) => void;

  // Central command processor (used by both Groq Whisper Voice & Text Terminal)
  executeCommand: (
    input: string,
    navigate?: (path: string) => void,
    toggleMute?: () => void,
    playSound?: (sound: any) => void
  ) => CommandResult;
}

export const useCommandStore = create<CommandState>((set, get) => ({
  isListening: false,
  isTranscribing: false,
  audioLevel: 0,
  recognizedText: null,
  lastCommand: null,
  lastResponse: null,
  error: null,
  isTerminalOpen: false,
  commandHistory: [],
  voiceToVoice: isVoiceToVoiceEnabled(),
  combatHandlers: null,

  setIsListening: (val) => set({ isListening: val }),
  setIsTranscribing: (val) => set({ isTranscribing: val }),
  setAudioLevel: (val) => set({ audioLevel: val }),
  setError: (err) => set({ error: err }),
  setTerminalOpen: (open) => set({ isTerminalOpen: open }),
  toggleTerminal: () => set((s) => ({ isTerminalOpen: !s.isTerminalOpen })),
  setVoiceToVoice: (enabled) => {
    setVoiceToVoiceEnabled(enabled);
    set({ voiceToVoice: enabled });
  },
  registerCombatHandlers: (handlers) => set({ combatHandlers: handlers }),

  executeCommand: (input: string, navigate, toggleMute, playSound) => {
    const raw = input.trim();
    const text = raw.toLowerCase();
    const { combatHandlers, voiceToVoice } = get();

    let result: CommandResult = {
      command: 'UNKNOWN',
      category: 'unknown',
      spokenResponse: `Command not recognized: "${raw}". Say help or type help.`,
      rawInput: raw,
    };

    // Helper for successful execution
    const execute = (cmd: string, cat: CommandResult['category'], spoken: string, path?: string) => {
      result = {
        command: cmd,
        category: cat,
        spokenResponse: spoken,
        targetPath: path,
        rawInput: raw,
      };
    };

    // 1. COMBAT ACTIONS
    if (/\b(attack|strike|punch|hit|shoot|fire|jab|slash)\b/.test(text)) {
      execute('ATTACK', 'combat', 'Strike executed.');
      if (combatHandlers?.onAttack) {
        combatHandlers.onAttack();
      } else if (navigate) {
        // If not in arena, prompt or auto-navigate
        navigate('/arena');
        execute('NAVIGATE_ARENA', 'navigation', 'Entering Combat Arena for attack strike.', '/arena');
      }
    } else if (/\b(block|guard|shield|defend|reflector|shine|parry)\b/.test(text)) {
      execute('BLOCK', 'combat', 'Energy shield engaged.');
      combatHandlers?.onBlock?.();
    } else if (/\b(dodge|evade|dash|roll|slide|slip|escape)\b/.test(text)) {
      execute('DODGE', 'combat', 'Evasive maneuver.');
      combatHandlers?.onDodge?.();
    } else if (/\b(special|ultimate|laser|blaster|volley|super|power)\b/.test(text)) {
      execute('SPECIAL', 'combat', 'Deploying special ability.');
      combatHandlers?.onSpecial?.();
    } else if (/\b(restart|rematch|retry|reset|again|replay)\b/.test(text)) {
      execute('RESTART_MATCH', 'combat', 'Match reset. Commencing combat.');
      combatHandlers?.onRestart?.();
    }

    // 2. NAVIGATION COMMANDS
    else if (/\b(arena|battle|fight|combat|start fight|play)\b/.test(text)) {
      execute('NAVIGATE_ARENA', 'navigation', 'Deploying to Combat Arena.', '/arena');
      navigate?.('/arena');
    } else if (/\b(character|characters|fighter|fighters|select character|choose character|roster)\b/.test(text)) {
      execute('NAVIGATE_CHARACTER_SELECT', 'navigation', 'Opening Operative Selection.', '/character-select');
      navigate?.('/character-select');
    } else if (/\b(pre-fight|prefight|lobby|staging)\b/.test(text)) {
      execute('NAVIGATE_PREFIGHT', 'navigation', 'Entering Pre-Fight Tactical Room.', '/pre-fight');
      navigate?.('/pre-fight');
    } else if (/\b(leaderboard|rankings|ranking|scores|top players|ladder)\b/.test(text)) {
      execute('NAVIGATE_LEADERBOARD', 'navigation', 'Accessing Sector Leaderboard.', '/leaderboard');
      navigate?.('/leaderboard');
    } else if (/\b(profile|account|stats|operative|xp|level)\b/.test(text)) {
      execute('NAVIGATE_PROFILE', 'navigation', 'Opening Operative Profile.', '/profile');
      navigate?.('/profile');
    } else if (/\b(setting|settings|config|configuration|options)\b/.test(text)) {
      execute('NAVIGATE_SETTINGS', 'navigation', 'Opening System Settings.', '/settings');
      navigate?.('/settings');
    } else if (/\b(home|menu|main menu|dashboard)\b/.test(text)) {
      execute('NAVIGATE_HOME', 'navigation', 'Returning to Command Dashboard.', '/');
      navigate?.('/');
    } else if (/\b(login|sign in|authenticate)\b/.test(text)) {
      execute('NAVIGATE_LOGIN', 'navigation', 'Accessing Operative Login.', '/login');
      navigate?.('/login');
    } else if (/\b(register|sign up|new operative)\b/.test(text)) {
      execute('NAVIGATE_REGISTER', 'navigation', 'Opening Registration Protocol.', '/register');
      navigate?.('/register');
    } else if (/\b(analysis|telemetry|metrics|dna)\b/.test(text)) {
      execute('NAVIGATE_ANALYSIS', 'navigation', 'Analyzing Combat Telemetry.', '/analysis');
      navigate?.('/analysis');
    }

    // 3. AUDIO CONTROLS
    else if (/\b(unmute|sound on|audio on)\b/.test(text)) {
      execute('UNMUTE_AUDIO', 'audio', 'Synthesizer online.');
      toggleMute?.();
    } else if (/\b(mute|silence|sound off|audio off|quiet)\b/.test(text)) {
      execute('MUTE_AUDIO', 'audio', 'Synthesizer muted.');
      toggleMute?.();
    }

    // 4. COMBAT STYLE & COSTUME
    else if (/\b(archery|archer|bow|sniper)\b/.test(text)) {
      execute('STYLE_ARCHERY', 'customization', 'Combat style set to Archery Plasma Sniper.');
      useCostumeStore.getState().setStyle('archery');
    } else if (/\b(melee|striker|fox)\b/.test(text)) {
      execute('STYLE_MELEE', 'customization', 'Combat style set to Fox McCloud Melee.');
      useCostumeStore.getState().setStyle('melee');
    } else if (/\b(classic|white fox)\b/.test(text)) {
      execute('COSTUME_CLASSIC', 'customization', 'Classic White Flight Jacket equipped.');
      useCostumeStore.getState().setCostume('classic');
    } else if (/\b(crimson|red fox|red)\b/.test(text)) {
      execute('COSTUME_RED', 'customization', 'Crimson Squadron combat suit equipped.');
      useCostumeStore.getState().setCostume('red');
    } else if (/\b(sector z|blue fox|marine|blue)\b/.test(text)) {
      execute('COSTUME_BLUE', 'customization', 'Sector Z Marine suit equipped.');
      useCostumeStore.getState().setCostume('blue');
    } else if (/\b(recon|green fox|corneria|green)\b/.test(text)) {
      execute('COSTUME_GREEN', 'customization', 'Corneria Recon field suit equipped.');
      useCostumeStore.getState().setCostume('green');
    } else if (/\b(shadow|dark fox|dark)\b/.test(text)) {
      execute('COSTUME_DARK', 'customization', 'Shadow Matrix stealth suit equipped.');
      useCostumeStore.getState().setCostume('dark');
    }

    // 5. HELP
    else if (/\b(help|commands|what can i say)\b/.test(text)) {
      execute(
        'HELP',
        'unknown',
        'Available commands: Attack, Block, Dodge, Special, Arena, Character Select, Profile, Leaderboard, Settings, Mute, Archery, or Melee.'
      );
    }

    // Update store state
    set((state) => ({
      recognizedText: raw,
      lastCommand: result.command,
      lastResponse: result.spokenResponse,
      commandHistory: [raw, ...state.commandHistory.slice(0, 19)],
    }));

    // Trigger sound effect
    if (result.category !== 'unknown') {
      playSound?.('voice_success');
    } else {
      playSound?.('voice_error');
    }

    // Broadcast event across windows
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('playnexus_voice_command', {
          detail: result,
        })
      );
    }

    // Voice-to-Voice: Spoken tactical response
    if (voiceToVoice) {
      speakTacticalResponse(result.spokenResponse);
    }

    return result;
  },
}));
