import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { DemoControllerBar } from '../demo/DemoControllerBar';
import { GlobalVoiceControl } from '../components/voice/GlobalVoiceControl';

interface GameLayoutProps {
  children: React.ReactNode;
}

export const GameLayout: React.FC<GameLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { playSound, isMuted, toggleMute } = useSound();
  const [sweepActive, setSweepActive] = useState(false);
  const isFirstMount = useRef(true);

  // Play subtle transition sound and activate sweep on route change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    playSound('transition');
    setSweepActive(true);

    const timer = setTimeout(() => {
      setSweepActive(false);
    }, 650);

    return () => clearTimeout(timer);
  }, [location.pathname, playSound]);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--bg-void, #05070c)',
        overflowX: 'hidden',
      }}
    >
      {/* Hackathon Demo Controller Bar (Active only when Demo Mode is enabled) */}
      <DemoControllerBar />

      {/* Global Groq Whisper Voice Controller (Accessible across all pages) */}
      <GlobalVoiceControl />

      {/* Top Cyber Sweep Beam on Page Transitions */}
      {sweepActive && <div className="cyber-route-sweep" />}

      {/* Global Quick Audio Controls Pill (Discreet, Fixed at bottom right) */}
      <div
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '18px',
          zIndex: 90,
        }}
      >
        <button
          type="button"
          onClick={() => {
            playSound('click');
            toggleMute();
          }}
          title={isMuted ? 'Unmute Game Audio' : 'Mute Game Audio'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            background: isMuted ? 'rgba(255, 0, 85, 0.15)' : 'rgba(10, 15, 26, 0.82)',
            border: isMuted
              ? '1px solid rgba(255, 0, 85, 0.4)'
              : '1px solid rgba(0, 240, 255, 0.25)',
            borderRadius: '20px',
            color: isMuted ? '#ff0055' : 'var(--color-cyan, #00f0ff)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            boxShadow: isMuted
              ? '0 0 12px rgba(255, 0, 85, 0.2)'
              : '0 0 12px rgba(0, 240, 255, 0.15)',
            transition: 'all 0.2s ease',
          }}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isMuted ? 'SFX MUTED' : 'SFX ON'}</span>
        </button>
      </div>

      {/* Location-keyed Page Transition Container */}
      <div key={location.pathname} className="page-transition-enter" style={{ width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
};
