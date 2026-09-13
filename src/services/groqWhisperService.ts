/**
 * PLAYNEXUS Groq Whisper Voice Service
 * High-speed, low-latency audio transcription powered by Groq's LPU inference engine.
 */

const STORAGE_KEY_API_KEY = 'playnexus_groq_api_key';
const STORAGE_KEY_MODEL = 'playnexus_groq_whisper_model';
const DEFAULT_MODEL = 'whisper-large-v3-turbo';

export type GroqWhisperModel = 'whisper-large-v3-turbo' | 'whisper-large-v3';

/**
 * Retrieve the active Groq API Key from localStorage or Vite environment
 */
export function getGroqApiKey(): string {
  if (typeof window === 'undefined') return '';
  try {
    const local = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (local && local.trim().length > 0) return local.trim();
  } catch {
    // Ignore storage issues
  }
  const envKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
  return typeof envKey === 'string' ? envKey.trim() : '';
}

/**
 * Persist the user's Groq API Key in localStorage
 */
export function setGroqApiKey(key: string): void {
  try {
    if (!key || key.trim() === '') {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
    }
  } catch {
    // Ignore storage issues
  }
}

/**
 * Check if a valid-looking Groq API Key is configured
 */
export function hasGroqApiKey(): boolean {
  const key = getGroqApiKey();
  return key.length >= 10;
}

/**
 * Get the selected Groq Whisper Model
 */
export function getGroqWhisperModel(): GroqWhisperModel {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MODEL);
    if (stored === 'whisper-large-v3' || stored === 'whisper-large-v3-turbo') {
      return stored;
    }
  } catch {
    // Fall back to default
  }
  return DEFAULT_MODEL;
}

/**
 * Set the selected Groq Whisper Model
 */
export function setGroqWhisperModel(model: GroqWhisperModel): void {
  try {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
  } catch {
    // Ignore
  }
}

/**
 * Transcribe an audio Blob using Groq Whisper API
 */
export async function transcribeAudioWithGroq(
  audioBlob: Blob,
  customApiKey?: string,
  model?: GroqWhisperModel
): Promise<{ text: string; error?: string }> {
  const apiKey = customApiKey || getGroqApiKey();

  if (!apiKey) {
    return {
      text: '',
      error: 'NO_API_KEY: Please configure your Groq API key in Settings or click the Voice HUD.',
    };
  }

  try {
    const activeModel = model || getGroqWhisperModel();
    const formData = new FormData();
    
    // Choose appropriate file name based on mime type
    const mime = audioBlob.type || 'audio/webm';
    const extension = mime.includes('wav') ? 'wav' : mime.includes('ogg') ? 'ogg' : 'webm';
    formData.append('file', audioBlob, `recording.${extension}`);
    formData.append('model', activeModel);
    formData.append('temperature', '0');
    formData.append('language', 'en');
    formData.append(
      'prompt',
      'PlayNexus game commands: attack, strike, block, guard, dodge, dash, evade, special, ultimate, blaster, laser, archery, melee, home, arena, pre-fight, character select, leaderboard, settings, analysis, login, register, classic fox, red fox, blue fox, green fox, dark fox, mute, unmute, restart, rematch'
    );
    formData.append('response_format', 'json');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const message = errData?.error?.message || `Groq API returned status ${response.status}`;
      return {
        text: '',
        error: message,
      };
    }

    const data = await response.json();
    const text = (data.text || '').trim();
    return { text };
  } catch (err: any) {
    return {
      text: '',
      error: err?.message || 'Network error communicating with Groq Whisper API.',
    };
  }
}

/**
 * Test a Groq API Key by making a models request
 */
export async function testGroqConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { success: false, message: 'Please enter a valid Groq API Key.' };
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (res.ok) {
      return { success: true, message: 'Groq API connection verified! Whisper models available.' };
    } else {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        message: err?.error?.message || `Invalid API Key (HTTP ${res.status})`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect to Groq API servers.',
    };
  }
}
