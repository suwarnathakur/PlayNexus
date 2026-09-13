import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  transcribeAudioWithGroq,
  hasGroqApiKey,
  getGroqApiKey,
} from '../services/groqWhisperService';
import { useSound } from './useSound';
import { useCommandStore, type CombatActionHandlers } from '../store/commandStore';

export interface UseVoiceCommandsResult {
  isSupported: boolean;
  isListening: boolean;
  isTranscribing: boolean;
  engine: 'groq' | 'webspeech';
  lastCommand: string | null;
  recognizedText: string | null;
  lastResponse: string | null;
  error: string | null;
  hasGroqKey: boolean;
  audioLevel: number;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  processTranscript: (text: string) => string | null;
}

export function useVoiceCommands(handlers?: CombatActionHandlers): UseVoiceCommandsResult {
  const navigate = useNavigate();
  const { playSound, toggleMute } = useSound();
  const commandStore = useCommandStore();

  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [engine, setEngine] = useState<'groq' | 'webspeech'>('groq');

  // Audio / MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Analysis & Silence Detection
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRecordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSpokenRef = useRef<boolean>(false);

  // Web Speech Fallback
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // If combat handlers are provided (e.g. from CombatArena), register proxy in the store
  const handlersRef = useRef<CombatActionHandlers | undefined>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
    if (handlers) {
      commandStore.registerCombatHandlers({
        onAttack: () => handlersRef.current?.onAttack?.(),
        onBlock: () => handlersRef.current?.onBlock?.(),
        onDodge: () => handlersRef.current?.onDodge?.(),
        onSpecial: () => handlersRef.current?.onSpecial?.(),
        onRestart: () => handlersRef.current?.onRestart?.(),
      });
      return () => {
        commandStore.registerCombatHandlers(null);
      };
    }
  }, [handlers, commandStore]);

  useEffect(() => {
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    const hasSpeech =
      typeof window !== 'undefined' &&
      (!!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition);
    setIsSupported(hasMedia || hasSpeech);
    setEngine(hasGroqApiKey() ? 'groq' : 'webspeech');
  }, []);

  /**
   * Cleanup audio analysis nodes and tracks
   */
  const cleanupAudioStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxRecordingTimerRef.current) {
      clearTimeout(maxRecordingTimerRef.current);
      maxRecordingTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {
        // Ignored
      }
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    commandStore.setAudioLevel(0);
    hasSpokenRef.current = false;
  }, [commandStore]);

  /**
   * Process raw text from Groq Whisper or Web Speech
   */
  const processTranscript = useCallback(
    (rawTranscript: string): string | null => {
      const res = commandStore.executeCommand(rawTranscript, navigate, toggleMute, playSound);
      return res.command;
    },
    [commandStore, navigate, toggleMute, playSound]
  );

  /**
   * Stop listening and record / transcribe
   */
  const stopListening = useCallback(() => {
    if (!isListeningRef.current && !commandStore.isListening) return;

    isListeningRef.current = false;
    commandStore.setIsListening(false);
    playSound('voice_stop');

    // Stop Groq MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignored
      }
    }

    // Stop Web Speech if running
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }

    cleanupAudioStream();
  }, [commandStore, cleanupAudioStream, playSound]);

  /**
   * Start listening with Groq Whisper & Real-time Silence Detector
   */
  const startListening = useCallback(async () => {
    commandStore.setError(null);
    const key = getGroqApiKey();

    // Strategy A: Groq Whisper with VAD / Silence Detection
    if (key && key.length >= 10 && navigator.mediaDevices?.getUserMedia) {
      try {
        setEngine('groq');
        playSound('voice_start');
        audioChunksRef.current = [];
        hasSpokenRef.current = false;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        streamRef.current = stream;

        // Set up Web Audio Analyser for live visualizer & silence detection
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtxClass();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudioLevels = () => {
          if (!analyserRef.current || !isListeningRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const level = Math.min(100, Math.round((avg / 128) * 100));
          commandStore.setAudioLevel(level);

          // Speech vs Silence Logic
          if (level > 12) {
            // Speaking detected
            hasSpokenRef.current = true;
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            }
          } else if (hasSpokenRef.current) {
            // User spoke and is now silent: auto-stop after 1.1s of quiet
            if (!silenceTimerRef.current) {
              silenceTimerRef.current = setTimeout(() => {
                stopListening();
              }, 1100);
            }
          }

          animFrameRef.current = requestAnimationFrame(checkAudioLevels);
        };

        // Safety cap: max 7 seconds recording
        maxRecordingTimerRef.current = setTimeout(() => {
          stopListening();
        }, 7000);

        // MediaRecorder setup
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
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
          commandStore.setIsListening(true);
          commandStore.setError(null);
          animFrameRef.current = requestAnimationFrame(checkAudioLevels);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mediaRecorder.mimeType || 'audio/webm',
          });
          audioChunksRef.current = [];

          if (audioBlob.size > 200) {
            commandStore.setIsTranscribing(true);
            try {
              const result = await transcribeAudioWithGroq(audioBlob);
              if (result.error) {
                commandStore.setError(result.error);
                playSound('voice_error');
              } else if (result.text) {
                processTranscript(result.text);
              }
            } catch (err: any) {
              commandStore.setError(err?.message || 'Whisper transcription failed.');
              playSound('voice_error');
            } finally {
              commandStore.setIsTranscribing(false);
            }
          }
        };

        mediaRecorder.start(250);
        return;
      } catch (micErr: any) {
        console.warn('[VOICE] Mic error, falling back to Web Speech:', micErr);
      }
    }

    // Strategy B: Fallback to Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      commandStore.setError('Please configure Groq API Key or use Chrome/Edge for voice.');
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
        commandStore.setIsListening(true);
        commandStore.setError(null);
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0]?.transcript || '';
        if (transcript) {
          processTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          commandStore.setError(`Speech: ${event.error}`);
          playSound('voice_error');
        }
        commandStore.setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        commandStore.setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.start();
    } catch (e: any) {
      commandStore.setError(e?.message || 'Failed to start speech recognition.');
      playSound('voice_error');
    }
  }, [commandStore, playSound, processTranscript, stopListening]);

  const toggleListening = useCallback(() => {
    if (commandStore.isListening || isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [commandStore.isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening: commandStore.isListening,
    isTranscribing: commandStore.isTranscribing,
    engine,
    lastCommand: commandStore.lastCommand,
    recognizedText: commandStore.recognizedText,
    lastResponse: commandStore.lastResponse,
    error: commandStore.error,
    hasGroqKey: hasGroqApiKey(),
    audioLevel: commandStore.audioLevel,
    startListening,
    stopListening,
    toggleListening,
    processTranscript,
  };
}
