import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, Sparkles, Key, CheckCircle2, AlertCircle, X, Radio } from 'lucide-react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useCostumeStore, type FoxCostume, type CombatStyle } from '../../store/costumeStore';
import { useSound } from '../../hooks/useSound';
import {
  getGroqApiKey,
  setGroqApiKey,
  testGroqConnection,
  getGroqWhisperModel,
  setGroqWhisperModel,
  type GroqWhisperModel,
} from '../../services/groqWhisperService';

export const GlobalVoiceControl: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playSound, toggleMute } = useSound();
  const { setCostume, setStyle } = useCostumeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGroqApiKey());
  const [selectedModel, setSelectedModelState] = useState<GroqWhisperModel>(getGroqWhisperModel());
  const [testStatus, setTestStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({
    testing: false,
  });

  const voice = useVoiceCommands({
    onNavigate: (path) => {
      if (location.pathname !== path) {
        navigate(path);
      }
    },
    onMuteToggle: () => {
      toggleMute();
    },
    onStyleSelect: (style: CombatStyle) => {
      setStyle(style);
    },
    onCostumeSelect: (costume: string) => {
      setCostume(costume as FoxCostume);
    },
  });

  // Global hotkey: Press 'V' (when not focused on input/textarea) to toggle voice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'v' || e.key === 'V') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          voice.toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voice]);

  const handleOpenKeyModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setApiKeyInput(getGroqApiKey());
    setTestStatus({ testing: false });
    setIsModalOpen(true);
  };

  const handleSaveApiKey = async () => {
    playSound('click');
    setTestStatus({ testing: true });

    if (!apiKeyInput.trim()) {
      setGroqApiKey('');
      setTestStatus({ testing: false, success: true, message: 'API key cleared. Using Web Speech API fallback.' });
      playSound('granted');
      setTimeout(() => setIsModalOpen(false), 1200);
      return;
    }

    const test = await testGroqConnection(apiKeyInput.trim());
    setTestStatus({ testing: false, success: test.success, message: test.message });

    if (test.success) {
      setGroqApiKey(apiKeyInput.trim());
      setGroqWhisperModel(selectedModel);
      playSound('granted');
      setTimeout(() => setIsModalOpen(false), 1400);
    } else {
      playSound('denied');
    }
  };

  const hasKey = !!getGroqApiKey();

  return (
    <>
      {/* Floating Cyber Voice Controller */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '18px',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Main Mic Activation Pill */}
        <button
          type="button"
          onClick={() => {
            if (!hasKey && !voice.isListening) {
              // Open modal if user hasn't configured key yet and wants Groq Whisper
              setIsModalOpen(true);
              playSound('click');
            } else {
              voice.toggleListening();
            }
          }}
          title={
            voice.isListening
              ? 'Click to stop listening (or press V)'
              : 'Groq Whisper Voice Command (Click or press V)'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: voice.isListening
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(220, 38, 38, 0.4) 100%)'
              : voice.isTranscribing
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.4) 100%)'
              : 'linear-gradient(135deg, rgba(10, 15, 26, 0.88) 0%, rgba(15, 23, 42, 0.92) 100%)',
            border: voice.isListening
              ? '1px solid #ef4444'
              : voice.isTranscribing
              ? '1px solid #f59e0b'
              : hasKey
              ? '1px solid rgba(0, 240, 255, 0.4)'
              : '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '24px',
            color: voice.isListening
              ? '#fca5a5'
              : voice.isTranscribing
              ? '#fde68a'
              : 'var(--color-cyan, #00f0ff)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            backdropFilter: 'blur(14px)',
            boxShadow: voice.isListening
              ? '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)'
              : '0 0 16px rgba(0, 240, 255, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: voice.isListening ? 'scale(1.03)' : 'scale(1)',
          }}
        >
          {voice.isListening ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 8px #ef4444',
                  animation: 'pulse 1s infinite',
                }}
              />
              <Mic size={15} color="#ef4444" />
            </div>
          ) : voice.isTranscribing ? (
            <Sparkles size={15} color="#f59e0b" className="animate-spin" />
          ) : (
            <Mic size={15} />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
            <span>
              {voice.isListening
                ? 'RECORDING (V)...'
                : voice.isTranscribing
                ? 'GROQ WHISPERING...'
                : hasKey
                ? 'GROQ VOICE'
                : 'VOICE COMMANDS'}
            </span>
            <span
              style={{
                fontSize: '0.58rem',
                opacity: 0.75,
                color: hasKey ? '#38bdf8' : '#94a3b8',
                fontWeight: 600,
              }}
            >
              {hasKey ? 'WHISPER-TURBO' : 'CLICK TO CONFIGURE'}
            </span>
          </div>

          {/* Shortcut badge */}
          <span
            style={{
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '0.56rem',
              color: '#94a3b8',
              marginLeft: '2px',
            }}
          >
            [V]
          </span>
        </button>

        {/* Quick Key Config Mini Button */}
        <button
          type="button"
          onClick={handleOpenKeyModal}
          title="Configure Groq Whisper API Key"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: hasKey ? 'rgba(0, 240, 255, 0.1)' : 'rgba(245, 158, 11, 0.15)',
            border: hasKey ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid rgba(245, 158, 11, 0.5)',
            color: hasKey ? '#00f0ff' : '#fbbf24',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <Key size={13} />
        </button>
      </div>

      {/* Floating HUD Pill for Live Recognition Feedback */}
      {(voice.recognizedText || voice.lastCommand || voice.error) && (
        <div
          style={{
            position: 'fixed',
            bottom: '64px',
            left: '18px',
            zIndex: 91,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            background: voice.error
              ? 'rgba(220, 38, 38, 0.85)'
              : 'rgba(8, 13, 26, 0.92)',
            border: voice.error
              ? '1px solid #ef4444'
              : '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '16px',
            color: '#ffffff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {voice.error ? (
            <>
              <AlertCircle size={14} color="#fca5a5" />
              <span style={{ color: '#fca5a5' }}>{voice.error}</span>
            </>
          ) : (
            <>
              <Radio size={14} color="#00f0ff" />
              <span>
                HEARD: <strong style={{ color: '#38bdf8' }}>"{voice.recognizedText}"</strong>
              </span>
              {voice.lastCommand && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'rgba(0, 240, 255, 0.2)',
                    border: '1px solid rgba(0, 240, 255, 0.5)',
                    color: '#00f0ff',
                    fontWeight: 700,
                  }}
                >
                  ⚡ {voice.lastCommand}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Groq Whisper Setup Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 4, 12, 0.8)',
            backdropFilter: 'blur(8px)',
            padding: '16px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '480px',
              background: 'linear-gradient(180deg, #0d1527 0%, #080d19 100%)',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.25)',
              fontFamily: 'var(--font-mono, monospace)',
              color: '#e2e8f0',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#00f0ff" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '0.08em', color: '#00f0ff' }}>
                  GROQ WHISPER VOICE ENGINE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  setIsModalOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              PLAYNEXUS uses Groq's high-speed LPU inference engine with <strong>Whisper Large v3</strong> for
              near-instantaneous voice transcription in combat and navigation.
            </p>

            {/* API Key Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#38bdf8', marginBottom: '6px', fontWeight: 700 }}>
                GROQ API KEY
              </label>
              <input
                type="password"
                placeholder="gsk_..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#64748b' }}>
                Don't have a key? Get one free at{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#00f0ff', textDecoration: 'underline' }}
                >
                  console.groq.com/keys
                </a>
              </div>
            </div>

            {/* Model Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#38bdf8', marginBottom: '6px', fontWeight: 700 }}>
                WHISPER MODEL
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModelState('whisper-large-v3-turbo');
                    playSound('click');
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: selectedModel === 'whisper-large-v3-turbo' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    border: selectedModel === 'whisper-large-v3-turbo' ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
                    color: selectedModel === 'whisper-large-v3-turbo' ? '#00f0ff' : '#94a3b8',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  whisper-large-v3-turbo
                  <div style={{ fontSize: '0.58rem', opacity: 0.7 }}>Ultra-Fast (Gaming)</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedModelState('whisper-large-v3');
                    playSound('click');
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: selectedModel === 'whisper-large-v3' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    border: selectedModel === 'whisper-large-v3' ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
                    color: selectedModel === 'whisper-large-v3' ? '#00f0ff' : '#94a3b8',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  whisper-large-v3
                  <div style={{ fontSize: '0.58rem', opacity: 0.7 }}>Maximum Accuracy</div>
                </button>
              </div>
            </div>

            {/* Test Status Banner */}
            {testStatus.message && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  background: testStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: testStatus.success ? '1px solid #10b981' : '1px solid #ef4444',
                  color: testStatus.success ? '#6ee7b7' : '#fca5a5',
                  fontSize: '0.72rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {testStatus.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <span>{testStatus.message}</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#94a3b8',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
              <button
                type="button"
                disabled={testStatus.testing}
                onClick={handleSaveApiKey}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                  border: 'none',
                  color: '#05070c',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                }}
              >
                {testStatus.testing ? 'VERIFYING...' : 'SAVE & CONNECT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
