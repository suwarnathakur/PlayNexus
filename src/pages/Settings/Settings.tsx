import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Volume2,
  VolumeX,
  Mic,
  Camera,
  Cpu,
  Eye,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Logo } from '../../components/common/Logo';
import { Scanline } from '../../components/effects/Scanline';
import { useSound } from '../../hooks/useSound';
import { useDemoStore } from '../../demo/demoStore';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { playSound, isMuted, toggleMute } = useSound();
  const { isDemoMode, toggleDemoMode } = useDemoStore();

  // Settings State
  const [sfxVolume, setSfxVolume] = useState<number>(85);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [cameraEnabled, setCameraEnabled] = useState<boolean>(true);
  const [graphicsQuality, setGraphicsQuality] = useState<'ULTRA' | 'BALANCED' | 'BATTERY_SAVER'>('BALANCED');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Load saved preferences on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('playnexus_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sfxVolume !== undefined) setSfxVolume(parsed.sfxVolume);
        if (parsed.voiceEnabled !== undefined) setVoiceEnabled(parsed.voiceEnabled);
        if (parsed.cameraEnabled !== undefined) setCameraEnabled(parsed.cameraEnabled);
        if (parsed.graphicsQuality) setGraphicsQuality(parsed.graphicsQuality);
        if (parsed.reducedMotion !== undefined) setReducedMotion(parsed.reducedMotion);
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleSave = () => {
    playSound('granted');
    const settingsPayload = {
      sfxVolume,
      voiceEnabled,
      cameraEnabled,
      graphicsQuality,
      reducedMotion,
    };
    try {
      localStorage.setItem('playnexus_settings', JSON.stringify(settingsPayload));
    } catch {
      // Ignored
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleResetDefaults = () => {
    playSound('click');
    setSfxVolume(85);
    setVoiceEnabled(true);
    setCameraEnabled(true);
    setGraphicsQuality('BALANCED');
    setReducedMotion(false);
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#05070c',
        color: '#ffffff',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 32px 32px',
      }}
    >
      <Scanline />

      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <Logo size="sm" />
        <GlowButton variant="secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>BACK TO DASHBOARD</span>
        </GlowButton>
      </header>

      {/* Main Settings Console */}
      <main
        style={{
          maxWidth: '960px',
          width: '100%',
          margin: '32px auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="cyber-panel-holo"
          style={{
            padding: '36px',
            borderRadius: '20px',
          }}
        >
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '20px',
                color: '#00f0ff',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.74rem',
                letterSpacing: '0.12em',
                marginBottom: '10px',
              }}
            >
              <SettingsIcon size={14} />
              <span>SYSTEM CONFIGURATION CONSOLE // FIRMWARE v2.4</span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                margin: 0,
                background: 'linear-gradient(135deg, #ffffff 40%, #00f0ff 80%, #9d4edd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              OPERATIVE PREFERENCES
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.8rem',
                color: '#94a3b8',
                marginTop: '6px',
              }}
            >
              Configure procedural neural sound, camera room scanner, Web Speech AI, and 3D graphics fidelity.
            </p>
          </div>

          {/* Settings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {/* Setting Card 1: Audio & Sound FX */}
            <div
              style={{
                padding: '22px',
                background: 'rgba(12, 18, 34, 0.7)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f0ff', fontFamily: 'var(--font-hud)', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Volume2 size={18} />
                  <span>NEURAL AUDIO SYNTHESIS</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleMute();
                    playSound('click');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: isMuted ? 'rgba(255, 0, 85, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                    border: isMuted ? '1px solid #ff0055' : '1px solid #00f0ff',
                    color: isMuted ? '#ff0055' : '#00f0ff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isMuted ? 'MUTED' : 'ACTIVE'}
                </button>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <span>SYNTHESIZER VOLUME</span>
                  <span style={{ color: '#00f0ff', fontWeight: 700 }}>{isMuted ? '0%' : `${sfxVolume}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume}
                  disabled={isMuted}
                  onChange={(e) => setSfxVolume(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: '#00f0ff',
                    cursor: isMuted ? 'not-allowed' : 'pointer',
                  }}
                />
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748b' }}>
                Procedural Web Audio synthesizer generates cyber whooshes, weapon strikes, and telemetry pulses dynamically with zero asset lag.
              </div>
            </div>

            {/* Setting Card 2: Voice Commands (Web Speech API) */}
            <div
              style={{
                padding: '22px',
                background: 'rgba(12, 18, 34, 0.7)',
                border: '1px solid rgba(157, 78, 221, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9d4edd', fontFamily: 'var(--font-hud)', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Mic size={18} />
                  <span>VOICE COMBAT TRIGGERS</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setVoiceEnabled(!voiceEnabled);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: voiceEnabled ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    border: voiceEnabled ? '1px solid #00ff9d' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: voiceEnabled ? '#00ff9d' : '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {voiceEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                Commands supported: <span style={{ color: '#00f0ff' }}>"Attack"</span>, <span style={{ color: '#9d4edd' }}>"Block"</span>, <span style={{ color: '#ff0055' }}>"Dodge"</span>, <span style={{ color: '#00ff9d' }}>"Special"</span>.
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748b' }}>
                Uses browser Web Speech API for hands-free or dual-input combat execution alongside standard keyboard controls.
              </div>
            </div>

            {/* Setting Card 3: Camera Weapon Scanner */}
            <div
              style={{
                padding: '22px',
                background: 'rgba(12, 18, 34, 0.7)',
                border: '1px solid rgba(0, 255, 157, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff9d', fontFamily: 'var(--font-hud)', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Camera size={18} />
                  <span>CAMERA WEAPON SCANNER</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setCameraEnabled(!cameraEnabled);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: cameraEnabled ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                    border: cameraEnabled ? '1px solid #00ff9d' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: cameraEnabled ? '#00ff9d' : '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {cameraEnabled ? 'READY' : 'OFFLINE'}
                </button>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#cbd5e1' }}>
                Active Synthesis Target: <span style={{ color: '#00ff9d' }}>TOME OF WISDOM (+15% Ability Power)</span>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748b' }}>
                Real-world camera scanner dynamically crafts mythical weapon loadouts before matches.
              </div>
            </div>

            {/* Setting Card 4: 3D Graphics & Reduced Motion */}
            <div
              style={{
                padding: '22px',
                background: 'rgba(12, 18, 34, 0.7)',
                border: '1px solid rgba(251, 191, 36, 0.2)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontFamily: 'var(--font-hud)', fontSize: '0.86rem', fontWeight: 700 }}>
                  <Cpu size={18} />
                  <span>THREE.JS RENDERING TIER</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['BALANCED', 'ULTRA', 'BATTERY_SAVER'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => {
                        playSound('click');
                        setGraphicsQuality(tier);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: graphicsQuality === tier ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: graphicsQuality === tier ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: graphicsQuality === tier ? '#fbbf24' : '#94a3b8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {tier === 'BATTERY_SAVER' ? 'SAVER' : tier}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#cbd5e1' }}>
                  REDUCED MOTION MODE
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setReducedMotion(!reducedMotion);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    background: reducedMotion ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    border: reducedMotion ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: reducedMotion ? '#00f0ff' : '#94a3b8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  {reducedMotion ? 'ENABLED' : 'OFF'}
                </button>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#64748b' }}>
                Limits particle counts, disables camera shake, and stops high-frequency HUD sweeps.
              </div>
            </div>

            {/* Setting Card 5: PLAYNEXUS HACKATHON DEMO MODE */}
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '22px',
                background: isDemoMode ? 'rgba(0, 240, 255, 0.08)' : 'rgba(12, 18, 34, 0.7)',
                border: isDemoMode ? '1.5px solid #00f0ff' : '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: '14px',
                boxShadow: isDemoMode ? '0 0 25px rgba(0, 240, 255, 0.2)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={20} color={isDemoMode ? '#00f0ff' : '#94a3b8'} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em' }}>
                      HACKATHON DEMO SHOWCASE MODE
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#00f0ff' }}>
                      DETERMINISTIC EVALUATION SEQUENCE // 100% OFFLINE RESILIENT
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="demo-mode-toggle-btn"
                  onClick={() => {
                    playSound('granted');
                    toggleDemoMode();
                  }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: isDemoMode
                      ? 'linear-gradient(135deg, #00f0ff, #0077ff)'
                      : 'rgba(255, 255, 255, 0.08)',
                    border: isDemoMode ? '1px solid rgba(255,255,255,0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
                    color: isDemoMode ? '#05070c' : '#cbd5e1',
                    fontFamily: 'var(--font-hud)',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: isDemoMode ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isDemoMode ? 'DEMO ACTIVE ●' : 'ACTIVATE DEMO'}
                </button>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                Enables deterministic hackathon presentation flow: Pre-loads Match 1 left-dodge bias (83%), generates high-predictability Fighting DNA (0.84), activates AI counter-strategy in Match 2, guarantees the Dodge Direction Lock challenge, and demonstrates post-adaptation victory evolution without external API lag.
              </div>

              {/* Status Chips */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontFamily: 'var(--font-mono)', fontSize: '0.68rem' }}>
                <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 255, 157, 0.1)', color: '#00ff9d', border: '1px solid rgba(0, 255, 157, 0.3)' }}>
                  ✓ OPENAI FALLBACK ACTIVE
                </span>
                <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 255, 157, 0.1)', color: '#00ff9d', border: '1px solid rgba(0, 255, 157, 0.3)' }}>
                  ✓ LOCAL TELEMETRY SYNTHESIS
                </span>
                <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 255, 157, 0.1)', color: '#00ff9d', border: '1px solid rgba(0, 255, 157, 0.3)' }}>
                  ✓ GUARANTEED LOCK-IN TRIGGER
                </span>
              </div>
            </div>
          </div>

          {/* Save Status Feedback */}
          {savedNotice && (
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#00ff9d',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
              }}
            >
              <CheckCircle2 size={16} />
              <span>CONFIGURATION COMMITTED TO LOCAL NEURAL MEMORY</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px' }}>
            <button
              type="button"
              onClick={handleResetDefaults}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '10px',
                color: '#cbd5e1',
                fontFamily: 'var(--font-hud, monospace)',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
              <span>RESTORE DEFAULTS</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="cyber-btn-cyan"
            >
              <Save size={16} />
              <span>SAVE & APPLY</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                navigate('/');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                background: 'linear-gradient(135deg, #ff0055 0%, #9d4edd 100%)',
                border: 'none',
                borderRadius: '10px',
                color: '#ffffff',
                fontFamily: 'var(--font-hud, monospace)',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <span>EXIT TO HOME</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', color: '#64748b' }}>
        PLAYNEXUS // HARDWARE CONTROL LAYER // LOCALSTORAGE KEY: playnexus_settings
      </footer>
    </div>
  );
};
