import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Radio,
  Terminal,
  Volume2,
  VolumeX,
  Send,
} from 'lucide-react';
import { useVoiceCommands } from '../../hooks/useVoiceCommands';
import { useCommandStore } from '../../store/commandStore';
import { useSound } from '../../hooks/useSound';
import {
  getGroqApiKey,
  setGroqApiKey,
  testGroqConnection,
  getGroqWhisperModel,
  setGroqWhisperModel,
  type GroqWhisperModel,
} from '../../services/groqWhisperService';

const SUGGESTED_COMMANDS = [
  { label: 'Attack', cmd: 'attack', icon: '⚔️' },
  { label: 'Block', cmd: 'block', icon: '🛡️' },
  { label: 'Dodge', cmd: 'dodge', icon: '💨' },
  { label: 'Special', cmd: 'special', icon: '⚡' },
  { label: 'Arena', cmd: 'arena', icon: '🏟️' },
  { label: 'Fighter', cmd: 'characters', icon: '🦊' },
  { label: 'Profile', cmd: 'profile', icon: '📊' },
  { label: 'Leaderboard', cmd: 'leaderboard', icon: '🏆' },
  { label: 'Settings', cmd: 'settings', icon: '⚙️' },
  { label: 'Archery', cmd: 'archery', icon: '🏹' },
  { label: 'Melee', cmd: 'melee', icon: '🥊' },
  { label: 'Mute', cmd: 'mute', icon: '🔇' },
];

export const GlobalVoiceControl: React.FC = () => {
  const navigate = useNavigate();
  const { playSound, toggleMute } = useSound();
  const commandStore = useCommandStore();
  const voice = useVoiceCommands();

  // Modals & Terminal state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGroqApiKey());
  const [selectedModel, setSelectedModelState] = useState<GroqWhisperModel>(getGroqWhisperModel());
  const [testStatus, setTestStatus] = useState<{ testing: boolean; success?: boolean; message?: string }>({
    testing: false,
  });

  const [textCommand, setTextCommand] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Focus input when terminal opens
  useEffect(() => {
    if (commandStore.isTerminalOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 80);
    }
  }, [commandStore.isTerminalOpen]);

  // Global hotkeys:
  // - 'V' outside inputs to toggle voice
  // - '/' or 'Ctrl+K' to toggle command terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      // Toggle terminal with '/' or 'Ctrl+K'
      if ((e.key === '/' && !isInputActive) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        commandStore.toggleTerminal();
        playSound('click');
        return;
      }

      // Close terminal on Escape
      if (e.key === 'Escape' && commandStore.isTerminalOpen) {
        commandStore.setTerminalOpen(false);
        return;
      }

      // Toggle Voice with 'V'
      if ((e.key === 'v' || e.key === 'V') && !isInputActive) {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          voice.toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [voice, commandStore, playSound]);

  const handleOpenKeyModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('click');
    setApiKeyInput(getGroqApiKey());
    setTestStatus({ testing: false });
    setIsKeyModalOpen(true);
  };

  const handleSaveApiKey = async () => {
    playSound('click');
    setTestStatus({ testing: true });

    if (!apiKeyInput.trim()) {
      setGroqApiKey('');
      setTestStatus({ testing: false, success: true, message: 'API key cleared. Using Web Speech API fallback.' });
      playSound('granted');
      setTimeout(() => setIsKeyModalOpen(false), 1200);
      return;
    }

    const test = await testGroqConnection(apiKeyInput.trim());
    setTestStatus({ testing: false, success: test.success, message: test.message });

    if (test.success) {
      setGroqApiKey(apiKeyInput.trim());
      setGroqWhisperModel(selectedModel);
      playSound('granted');
      setTimeout(() => setIsKeyModalOpen(false), 1400);
    } else {
      playSound('denied');
    }
  };

  const handleExecuteTextCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textCommand.trim()) return;

    const cmd = textCommand.trim();
    setTextCommand('');
    commandStore.executeCommand(cmd, navigate, toggleMute, playSound);
  };

  const hasKey = !!getGroqApiKey();

  return (
    <>
      {/* Floating Cyber Command HUD (Bottom Left) */}
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
              setIsKeyModalOpen(true);
              playSound('click');
            } else {
              voice.toggleListening();
            }
          }}
          title={
            voice.isListening
              ? 'Listening... Speaks & auto-stops when quiet (or press V)'
              : 'Groq Whisper Voice Command (Click or press V)'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            background: voice.isListening
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.45) 100%)'
              : voice.isTranscribing
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.45) 100%)'
              : 'linear-gradient(135deg, rgba(10, 15, 26, 0.9) 0%, rgba(15, 23, 42, 0.94) 100%)',
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
              ? '0 0 24px rgba(239, 68, 68, 0.5), inset 0 0 12px rgba(239, 68, 68, 0.25)'
              : '0 0 16px rgba(0, 240, 255, 0.15)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: voice.isListening ? 'scale(1.03)' : 'scale(1)',
          }}
        >
          {voice.isListening ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {/* Dynamic waveform bars reacting to real mic audioLevel */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
                {[0.4, 0.8, 1.0, 0.7, 0.5].map((scale, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      width: '2.5px',
                      height: `${Math.max(4, Math.min(14, (voice.audioLevel || 20) * scale * 0.18))}px`,
                      background: '#ef4444',
                      borderRadius: '2px',
                      transition: 'height 0.08s ease',
                    }}
                  />
                ))}
              </div>
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
                ? 'LISTENING (AUTO-SEND)...'
                : voice.isTranscribing
                ? 'GROQ WHISPERING...'
                : hasKey
                ? 'GROQ VOICE'
                : 'VOICE COMMAND'}
            </span>
            <span
              style={{
                fontSize: '0.58rem',
                opacity: 0.75,
                color: hasKey ? '#38bdf8' : '#94a3b8',
                fontWeight: 600,
              }}
            >
              {voice.isListening ? 'SPEAK NOW' : hasKey ? 'WHISPER-TURBO' : 'CLICK TO CONFIGURE'}
            </span>
          </div>

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

        {/* Text Command Terminal Toggle Button */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            commandStore.toggleTerminal();
          }}
          title="Open Text Command Terminal (Press / or Ctrl+K)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '8px 12px',
            borderRadius: '20px',
            background: commandStore.isTerminalOpen
              ? 'rgba(0, 240, 255, 0.25)'
              : 'rgba(10, 15, 26, 0.9)',
            border: commandStore.isTerminalOpen
              ? '1px solid #00f0ff'
              : '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00f0ff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.2s ease',
          }}
        >
          <Terminal size={14} />
          <span>CMD</span>
          <span style={{ fontSize: '0.56rem', opacity: 0.7, padding: '1px 4px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>
            [/]
          </span>
        </button>

        {/* Voice-to-Voice Audio Feedback Toggle */}
        <button
          type="button"
          onClick={() => {
            playSound('click');
            commandStore.setVoiceToVoice(!commandStore.voiceToVoice);
          }}
          title={commandStore.voiceToVoice ? 'AI Spoken Feedback: ON' : 'AI Spoken Feedback: MUTED'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: commandStore.voiceToVoice ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 255, 255, 0.06)',
            border: commandStore.voiceToVoice ? '1px solid rgba(0, 255, 157, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
            color: commandStore.voiceToVoice ? '#00ff9d' : '#64748b',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          {commandStore.voiceToVoice ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        {/* API Key Config Button */}
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

      {/* Floating HUD Feedback Toast (What was heard/typed + Spoken tactical reply) */}
      {(commandStore.recognizedText || commandStore.lastCommand || commandStore.error) && (
        <div
          style={{
            position: 'fixed',
            bottom: '68px',
            left: '18px',
            zIndex: 91,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '8px 14px',
            background: commandStore.error
              ? 'rgba(220, 38, 38, 0.9)'
              : 'rgba(8, 13, 26, 0.94)',
            border: commandStore.error
              ? '1px solid #ef4444'
              : '1px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '14px',
            color: '#ffffff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            animation: 'fadeIn 0.2s ease',
            maxWidth: '420px',
          }}
        >
          {commandStore.error ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={14} color="#fca5a5" />
              <span style={{ color: '#fca5a5' }}>{commandStore.error}</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Radio size={13} color="#00f0ff" />
                <span>
                  INPUT: <strong style={{ color: '#38bdf8' }}>"{commandStore.recognizedText}"</strong>
                </span>
                {commandStore.lastCommand && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '5px',
                      background: 'rgba(0, 240, 255, 0.2)',
                      border: '1px solid rgba(0, 240, 255, 0.5)',
                      color: '#00f0ff',
                      fontWeight: 700,
                      fontSize: '0.64rem',
                    }}
                  >
                    ⚡ {commandStore.lastCommand}
                  </span>
                )}
              </div>
              {commandStore.lastResponse && (
                <div style={{ fontSize: '0.66rem', color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Volume2 size={12} color="#00ff9d" />
                  <span>AI: {commandStore.lastResponse}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Cyber Text Command Terminal Overlay */}
      {commandStore.isTerminalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '90px',
            backgroundColor: 'rgba(2, 6, 16, 0.75)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => commandStore.setTerminalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
              background: 'linear-gradient(180deg, #0b1326 0%, #060a14 100%)',
              border: '1px solid rgba(0, 240, 255, 0.5)',
              borderRadius: '16px',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.25), 0 20px 40px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {/* Terminal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(0, 240, 255, 0.08)',
                borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={16} color="#00f0ff" />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.1em' }}>
                  TACTICAL COMMAND CONSOLE // TEXT & VOICE-TO-VOICE
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>ESC to close</span>
                <button
                  type="button"
                  onClick={() => commandStore.setTerminalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleExecuteTextCommand} style={{ padding: '16px', display: 'flex', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  borderRadius: '10px',
                  padding: '4px 12px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                }}
              >
                <span style={{ color: '#00f0ff', fontWeight: 800, marginRight: '8px', fontSize: '0.9rem' }}>&gt;</span>
                <input
                  ref={commandInputRef}
                  type="text"
                  placeholder="Type any command (e.g. attack, arena, profile, mute, archery)..."
                  value={textCommand}
                  onChange={(e) => setTextCommand(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.85rem',
                    padding: '8px 0',
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #0284c7 100%)',
                  border: 'none',
                  color: '#05070c',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                }}
              >
                <Send size={14} />
                <span>EXECUTE</span>
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            <div style={{ padding: '0 16px 14px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SUGGESTED_COMMANDS.map((item) => (
                <button
                  key={item.cmd}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    commandStore.executeCommand(item.cmd, navigate, toggleMute, playSound);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(0, 240, 255, 0.08)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    color: '#cbd5e1',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Command History / Spoken Feedback Bar */}
            {commandStore.lastResponse && (
              <div
                style={{
                  padding: '10px 16px',
                  background: 'rgba(0, 255, 157, 0.08)',
                  borderTop: '1px solid rgba(0, 255, 157, 0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.72rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ff9d' }}>
                  <Volume2 size={14} />
                  <span>AI FEEDBACK: {commandStore.lastResponse}</span>
                </div>
                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>VOICE-TO-VOICE ACTIVE</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groq Whisper Setup Modal */}
      {isKeyModalOpen && (
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
          onClick={() => setIsKeyModalOpen(false)}
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
                  setIsKeyModalOpen(false);
                }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Configured with Groq LPU inference using <strong>Whisper Large v3 Turbo</strong> for sub-second game voice commands and automatic silence detection.
            </p>

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
            </div>

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
                  <div style={{ fontSize: '0.58rem', opacity: 0.7 }}>⚡ Sub-second (Gaming)</div>
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
                  <div style={{ fontSize: '0.58rem', opacity: 0.7 }}>🎯 Max Accuracy</div>
                </button>
              </div>
            </div>

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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
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
