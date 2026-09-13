import { useState, useEffect, useRef, useCallback } from 'react';
import {
  transcribeAudioWithGroq,
  hasGroqApiKey,
  getGroqApiKey,
} from '../services/groqWhisperService';
import { useSound } from './useSound';

export interface VoiceCommandHandlers {
  onAttack?: () => void;
  onBlock?: () => void;
  onDodge?: () => void;
  onSpecial?: () => void;
  onRestart?: () => void;
  onNavigate?: (path: string) => void;
  onMuteToggle?: () => void;
  onStyleSelect?: (style: 'melee' | 'archery') => void;
  onCostumeSelect?: (costume: string) => void;
}

export interface UseVoiceCommandsResult {
  isSupported: boolean;
  isListening: boolean;
  isTranscribing: boolean;
  engine: 'groq' | 'webspeech';
  lastCommand: string | null;
  recognizedText: string | null;
  error: string | null;
  hasGroqKey: boolean;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  processTranscript: (text: string) => string | null;
}

export function useVoiceCommands(handlers: VoiceCommandHandlers = {}): UseVoiceCommandsResult {
  const { playSound } = useSound();
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [engine, setEngine] = useState<'groq' | 'webspeech'>('groq');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Groq MediaRecorder state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Web Speech Fallback state
  const recognitionRef = useRef<any>(null);

  const isListeningRef = useRef<boolean>(false);
  const clearCommandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlersRef = useRef<VoiceCommandHandlers>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const hasKey = hasGroqApiKey();

  // Check hardware / browser support
  useEffect(() => {
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    const hasSpeech =
      typeof window !== 'undefined' &&
      (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
    setIsSupported(hasMedia || hasSpeech);
    setEngine(hasGroqApiKey() ? 'groq' : 'webspeech');
  }, []);

  /**
   * Process raw text from either Groq Whisper or Web Speech
   */
  const processTranscript = useCallback((rawTranscript: string): string | null => {
    const text = rawTranscript.trim().toLowerCase();
    if (!text) return null;

    setRecognizedText(text);

    let detected: string | null = null;
    let targetPath: string | null = null;

    // 1. Combat Commands
    if (text.includes('attack') || text.includes('strike') || text.includes('punch') || text.includes('hit') || text.includes('shoot')) {
      detected = 'ATTACK';
      handlersRef.current.onAttack?.();
    } else if (text.includes('block') || text.includes('guard') || text.includes('shield') || text.includes('defend') || text.includes('reflector') || text.includes('shine')) {
      detected = 'BLOCK';
      handlersRef.current.onBlock?.();
    } else if (text.includes('dodge') || text.includes('dash') || text.includes('evade') || text.includes('roll') || text.includes('slide')) {
      detected = 'DODGE';
      handlersRef.current.onDodge?.();
    } else if (text.includes('special') || text.includes('ultimate') || text.includes('blaster') || text.includes('laser') || text.includes('volley') || text.includes('super')) {
      detected = 'SPECIAL';
      handlersRef.current.onSpecial?.();
    } else if (text.includes('restart') || text.includes('rematch') || text.includes('retry') || text.includes('reset')) {
      detected = 'RESTART_MATCH';
      handlersRef.current.onRestart?.();
    }

    // 2. Global Navigation Commands
    else if (text.includes('character') || text.includes('fighter') || text.includes('select character')) {
      detected = 'NAVIGATE_CHARACTER_SELECT';
      targetPath = '/character-select';
    } else if (text.includes('arena') || text.includes('battle') || text.includes('combat') || text.includes('start fight') || text.includes('play')) {
      detected = 'NAVIGATE_ARENA';
      targetPath = '/arena';
    } else if (text.includes('pre-fight') || text.includes('prefight') || text.includes('lobby')) {
      detected = 'NAVIGATE_PREFIGHT';
      targetPath = '/pre-fight';
    } else if (text.includes('leaderboard') || text.includes('ranking') || text.includes('top players')) {
      detected = 'NAVIGATE_LEADERBOARD';
      targetPath = '/leaderboard';
    } else if (text.includes('analysis') || text.includes('telemetry') || text.includes('stats') || text.includes('metrics')) {
      detected = 'NAVIGATE_ANALYSIS';
      targetPath = '/analysis';
    } else if (text.includes('setting') || text.includes('config') || text.includes('option')) {
      detected = 'NAVIGATE_SETTINGS';
      targetPath = '/settings';
    } else if (text.includes('home') || text.includes('menu') || text.includes('main menu')) {
      detected = 'NAVIGATE_HOME';
      targetPath = '/';
    } else if (text.includes('login') || text.includes('sign in')) {
      detected = 'NAVIGATE_LOGIN';
      targetPath = '/login';
    } else if (text.includes('register') || text.includes('sign up')) {
      detected = 'NAVIGATE_REGISTER';
      targetPath = '/register';
    }

    // 3. Audio Commands
    else if (text.includes('unmute') || text.includes('sound on') || text.includes('audio on')) {
      detected = 'UNMUTE_AUDIO';
      handlersRef.current.onMuteToggle?.();
    } else if (text.includes('mute') || text.includes('silence') || text.includes('sound off') || text.includes('audio off')) {
      detected = 'MUTE_AUDIO';
      handlersRef.current.onMuteToggle?.();
    }

    // 4. Combat Style & Costume Selection
    else if (text.includes('archery') || text.includes('archer') || text.includes('bow')) {
      detected = 'STYLE_ARCHERY';
      handlersRef.current.onStyleSelect?.('archery');
    } else if (text.includes('melee') || text.includes('striker') || text.includes('fox')) {
      detected = 'STYLE_MELEE';
      handlersRef.current.onStyleSelect?.('melee');
    } else if (text.includes('classic') || text.includes('white fox')) {
      detected = 'COSTUME_CLASSIC';
      handlersRef.current.onCostumeSelect?.('classic');
    } else if (text.includes('crimson') || text.includes('red fox')) {
      detected = 'COSTUME_RED';
      handlersRef.current.onCostumeSelect?.('red');
    } else if (text.includes('sector z') || text.includes('blue fox')) {
      detected = 'COSTUME_BLUE';
      handlersRef.current.onCostumeSelect?.('blue');
    } else if (text.includes('recon') || text.includes('green fox')) {
      detected = 'COSTUME_GREEN';
      handlersRef.current.onCostumeSelect?.('green');
    } else if (text.includes('shadow') || text.includes('dark fox')) {
      detected = 'COSTUME_DARK';
      handlersRef.current.onCostumeSelect?.('dark');
    }

    if (detected) {
      playSound('voice_success');
      setLastCommand(detected);

      if (targetPath) {
        handlersRef.current.onNavigate?.(targetPath);
      }

      // Broadcast globally so any mounted page/component can listen
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('playnexus_voice_command', {
            detail: {
              command: detected,
              targetPath,
              rawTranscript,
            },
          })
        );
      }

      if (clearCommandTimerRef.current) clearTimeout(clearCommandTimerRef.current);
      clearCommandTimerRef.current = setTimeout(() => {
        setLastCommand(null);
      }, 3000);
    }

    return detected;
  }, [playSound]);

  /**
   * Stop listening / recording
   */
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    playSound('voice_stop');

    // Stop Groq MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignored
      }
    }

    // Stop MediaStream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Stop Web Speech if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
  }, [playSound]);

  /**
   * Start listening / recording with Groq Whisper (or fallback to Web Speech)
   */
  const startListening = useCallback(async () => {
    setError(null);
    const key = getGroqApiKey();

    // Strategy A: If Groq API Key exists, use high-fidelity Groq Whisper
    if (key && key.length >= 10 && navigator.mediaDevices?.getUserMedia) {
      try {
        setEngine('groq');
        playSound('voice_start');
        audioChunksRef.current = [];

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        streamRef.current = stream;

        // Choose best supported mime type
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
          ? 'audio/ogg;codecs=opus'
          : '';

        const mediaRecorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstart = () => {
          isListeningRef.current = true;
          setIsListening(true);
          setError(null);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/webm',
          });
          audioChunksRef.current = [];

          if (audioBlob.size > 200) {
            setIsTranscribing(true);
            try {
              const result = await transcribeAudioWithGroq(audioBlob);
              if (result.error) {
                setError(result.error);
                playSound('voice_error');
              } else if (result.text) {
                processTranscript(result.text);
              }
            } catch (err: any) {
              setError(err?.message || 'Whisper transcription failed.');
              playSound('voice_error');
            } finally {
              setIsTranscribing(false);
            }
          }
        };

        mediaRecorder.start();
        return;
      } catch (micErr: any) {
        console.warn('[VOICE] Groq Mic access error, trying fallback:', micErr);
        // Fall back to Web Speech
      }
    }

    // Strategy B: Fallback to Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Please add a Groq API Key or use a browser supporting Web Speech API.');
      playSound('voice_error');
      return;
    }

    try {
      setEngine('webspeech');
      playSound('voice_start');
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0]?.transcript || '';
        if (transcript) {
          processTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[VOICE] Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError(`Speech: ${event.error}`);
          playSound('voice_error');
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.start();
    } catch (e: any) {
      setError(e?.message || 'Failed to start speech recognition.');
      playSound('voice_error');
    }
  }, [playSound, processTranscript]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    isTranscribing,
    engine,
    lastCommand,
    recognizedText,
    error,
    hasGroqKey: hasKey,
    startListening,
    stopListening,
    toggleListening,
    processTranscript,
  };
}
