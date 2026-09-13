import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomeArena3D } from '../../components/game/HomeArena3D';
import { Scanline } from '../../components/effects/Scanline';
import { GlowButton } from '../../components/common/GlowButton';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { TacticalHUDOverlay } from '../../components/ui/TacticalHUDOverlay';
import {
  Swords,
  Dna,
  LogOut,
  UserCheck,
  ShieldCheck,
  Trophy,
  Settings as SettingsIcon,
} from 'lucide-react';

interface HomeProps {
  onNavigateLogin: () => void;
  onNavigateArena?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateLogin }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { playSound } = useSound();
  const parallax = useMouseParallax();

  const handleLogout = () => {
    playSound('click');
    logout();
    onNavigateLogin();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#05070c',
        color: '#ffffff',
        overflowX: 'hidden',
        overflowY: 'auto',
      }}
    >
      {/* 1. Full-Screen 3D Arena Background (React Three Fiber) */}
      <HomeArena3D
        parallaxX={parallax.smoothX}
        parallaxY={parallax.smoothY}
      />

      {/* 2. CRT Scanline Overlay */}
      <Scanline />

      <TacticalHUDOverlay />

      {/* 3. Foreground HUD & Interface Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 32px 36px',
          pointerEvents: 'none',
        }}
      >
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: '18px',
            pointerEvents: 'auto',
            minHeight: '90px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display, sans-serif)',
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontSize: 'clamp(1.2rem, 2vw, 2rem)',
                background: 'linear-gradient(135deg, #ffffff 30%, #00f0ff 80%, #9d4edd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PlayNexus
            </div>
          </div>

          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              background: 'rgba(10, 15, 26, 0.82)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
              width: 'fit-content',
              justifySelf: 'center',
            }}
          >
            {[
              { label: 'SELECT', path: '/character-select', icon: <UserCheck size={14} /> },
              { label: 'PRE-FIGHT', path: '/pre-fight', icon: <ShieldCheck size={14} /> },
              { label: '3D ARENA', path: '/arena', icon: <Swords size={14} /> },
              { label: 'DNA ANALYSIS', path: '/analysis', icon: <Dna size={14} /> },
              { label: 'PROFILE', path: '/profile', icon: <UserCheck size={14} /> },
              { label: 'LEADERBOARD', path: '/leaderboard', icon: <Trophy size={14} /> },
              { label: 'SETTINGS', path: '/settings', icon: <SettingsIcon size={14} /> },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  playSound('click');
                  navigate(item.path);
                }}
                onMouseEnter={() => playSound('hover')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#dbeafe',
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <GlowButton variant="secondary" onClick={handleLogout}>
              <LogOut size={15} />
              <span>DISCONNECT</span>
            </GlowButton>
          </div>
        </header>
      </div>
    </div>
  );
};
