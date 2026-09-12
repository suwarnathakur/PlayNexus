import { useState, useEffect, useRef, useCallback } from 'react';

export interface VoiceCommandHandlers {
  onAttack?: () => void;
  onBlock?: () => void;
  onDodge?: () => void;
  onSpecial?: () => void;
}

export interface UseVoiceCommandsResult {
  isSupported: boolean;
  isListening: boolean;
  lastCommand: string | null;
  recognizedText: string | null;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

export function useVoiceCommands(handlers: VoiceCommandHandlers): UseVoiceCommandsResult {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const clearCommandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlersRef = useRef<VoiceCommandHandlers>(handlers);

  // Keep latest handlers ref without re-attaching listeners
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const processTranscript = useCallback((rawTranscript: string) => {
    const text = rawTranscript.trim().toLowerCase();
    setRecognizedText(text);

    let detected: string | null = null;

    if (text.includes('attack') || text.includes('strike') || text.includes('punch') || text.includes('hit')) {
      detected = 'ATTACK';
      handlersRef.current.onAttack?.();
    } else if (text.includes('block') || text.includes('guard') || text.includes('shield') || text.includes('defend')) {
      detected = 'BLOCK';
      handlersRef.current.onBlock?.();
    } else if (text.includes('dodge') || text.includes('dash') || text.includes('evade') || text.includes('roll')) {
      detected = 'DODGE';
      handlersRef.current.onDodge?.();
    } else if (text.includes('special') || text.includes('ultimate') || text.includes('ability') || text.includes('super') || text.includes('power')) {
      detected = 'SPECIAL';
      handlersRef.current.onSpecial?.();
    }

    if (detected) {
      setLastCommand(detected);
      if (clearCommandTimerRef.current) clearTimeout(clearCommandTimerRef.current);
      clearCommandTimerRef.current = setTimeout(() => {
        setLastCommand(null);
      }, 2500);
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
  }, []);

  const startListening = useCallback(() => {
    setError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API is not supported in this browser.');
      return;
    }

    if (recognitionRef.current && isListeningRef.current) {
      return;
    }

    try {
      if (!recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

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
          console.warn('[VOICE_COMMANDS] Speech recognition event:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setError('Microphone access denied. Please grant permission to use voice commands.');
            isListeningRef.current = false;
            setIsListening(false);
          } else if (event.error === 'no-speech') {
            // No speech detected, stay listening
          } else {
            setError(`Speech recognition: ${event.error}`);
          }
        };

        recognition.onend = () => {
          // If still marked as listening, automatically restart recognition (continuous gaming loop)
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {
              // Browser may require small delay before restart
              setTimeout(() => {
                if (isListeningRef.current) {
                  try {
                    recognition.start();
                  } catch {
                    // Ignored
                  }
                }
              }, 250);
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      }

      isListeningRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn('[VOICE_COMMANDS] Failed to start speech recognition:', err);
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied.');
      } else {
        setError(err.message || 'Failed to activate microphone.');
      }
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [processTranscript]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // Check support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Web Speech API is not supported in this browser. Use keyboard controls [J, K, SPACE].');
    }

    return () => {
      isListeningRef.current = false;
      if (clearCommandTimerRef.current) clearTimeout(clearCommandTimerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          recognitionRef.current.abort();
        } catch {
          // Ignored
        }
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    lastCommand,
    recognizedText,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
