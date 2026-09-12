import React, { useState } from 'react';
import { Volume2, VolumeX, Sun, Moon, Gamepad2, Minus, Square, X, Wifi } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useTheme } from '../../store/themeStore';

interface NexusHUDProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const NexusHUD: React.FC<NexusHUDProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const { isMuted, toggleMute, playSound } = useSound();
  const { toggleTheme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('GAMES');

  const handleAudioToggle = () => {
    toggleMute();
    if (isMuted) {
      setTimeout(() => playSound('click'), 50);
    }
  };

  const handleThemeToggle = () => {
    playSound('granted');
    toggleTheme();
  };

  const tabs = [
    { id: 'GAMES', label: 'GAMES' },
    { id: 'ARENA', label: 'ARENA' },
    { id: 'BATTLE PASS', label: 'BATTLE PASS' },
    { id: 'ESPORTS', label: 'ESPORTS' },
    { id: 'COMMUNITY', label: 'COMMUNITY' },
  ];

  return (
    <div
      aria-label="Game Platform Launcher Navigation"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        padding: '16px 28px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 30,
        transform: `translate(${parallaxX * 4}px, ${parallaxY * 4}px)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* ================= AAA GAME LAUNCHER CLIENT BAR ================= */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: isDark
            ? 'linear-gradient(180deg, rgba(14, 22, 40, 0.92) 0%, rgba(7, 12, 24, 0.88) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 246, 255, 0.92) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: isDark ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(0, 102, 255, 0.22)',
          borderRadius: '14px',
          padding: '8px 18px',
          boxShadow: isDark
            ? '0 10px 35px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 8px 30px rgba(0, 50, 150, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
      >
        {/* Brand & Platform Emblem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #ff007f 0%, #00f0ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px var(--neon-cyan)',
              transform: 'rotate(-4deg)',
            }}
          >
            <Gamepad2 size={18} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: isDark ? '#ffffff' : '#0a1020',
                  lineHeight: 1.1,
                }}
              >
                PLAY<span style={{ color: 'var(--neon-cyan)' }}>NEXUS</span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  background: isDark ? 'rgba(0, 240, 255, 0.15)' : 'rgba(0, 102, 255, 0.12)',
                  color: 'var(--neon-cyan)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                }}
              >
                LAUNCHER v3.4
              </span>
            </div>
          </div>
        </div>

        {/* Center Platform Navigation Tabs (AAA Game Client) */}
        <nav
          className="hud-hide-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'auto',
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                playSound('click');
              }}
              onMouseEnter={() => playSound('hover')}
              className={`launcher-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {activeTab === tab.id && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--neon-cyan)',
                    boxShadow: '0 0 8px var(--neon-cyan)',
                  }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Right Section: Server Status, Theme, SFX & Desktop Window Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto',
          }}
        >
          {/* Server Latency Chip */}
          <div
            className="hud-hide-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: isDark ? '#a0aec0' : '#4a5568',
              background: isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.05)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Wifi size={12} color="#10b981" />
            <span>ASIA-01</span>
            <span style={{ color: '#10b981' }}>18ms</span>
          </div>

          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={handleThemeToggle}
            title={isDark ? 'Switch to Sunrise Megapolis (Lite)' : 'Switch to Neon Night (Dark)'}
            onMouseEnter={() => playSound('hover')}
            className="launcher-tab"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              background: isDark ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0, 102, 255, 0.1)',
              border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 102, 255, 0.35)'}`,
              color: isDark ? 'var(--neon-cyan)' : 'var(--neon-pink)',
              borderRadius: '6px',
            }}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
            <span>{isDark ? 'SUNRISE' : 'NEON NIGHT'}</span>
          </button>

          {/* Audio SFX Toggle */}
          <button
            type="button"
            onClick={handleAudioToggle}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            onMouseEnter={() => playSound('hover')}
            className="win-btn"
            style={{
              color: isMuted ? 'var(--text-muted)' : 'var(--neon-cyan)',
            }}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Desktop Launcher Window Controls (Minimize / Maximize / Close) */}
          <div
            className="hud-hide-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '4px',
              paddingLeft: '8px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <button
              type="button"
              className="win-btn"
              title="Minimize"
              onClick={() => playSound('click')}
            >
              <Minus size={13} />
            </button>
            <button
              type="button"
              className="win-btn"
              title="Maximize"
              onClick={() => playSound('click')}
            >
              <Square size={11} />
            </button>
            <button
              type="button"
              className="win-btn close"
              title="Close Launcher"
              onClick={() => playSound('denied')}
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </header>

      <style>{`
        @media (max-width: 960px) {
          .hud-hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
