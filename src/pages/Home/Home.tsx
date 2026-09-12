import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
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
  Cpu,
  LogOut,
  ShieldAlert,
  Zap,
  Mic,
  Camera,
  Bot,
  UserCheck,
  ShieldCheck,
  Trophy,
  Settings as SettingsIcon,
  ArrowRight,
  Activity,
} from 'lucide-react';

interface HomeProps {
  onNavigateLogin: () => void;
  onNavigateArena?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateLogin }) => {
  const navigate = useNavigate();
  const { player, logout } = useAuth();
  const { playSound } = useSound();
  const parallax = useMouseParallax();

  const handleLogout = () => {
    playSound('click');
    logout();
    onNavigateLogin();
  };

  const handleStartFight = () => {
    playSound('granted');
    navigate('/character-select');
  };

  const fightingDNA = player?.fightingDNA || {
    aggression: 84,
    counterRate: 91,
    adaptability: 96,
    neuralSync: 99,
    preferredStyle: 'HYBRID STRIKER',
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
        {/* ================= TOP: FUTURISTIC NAVIGATION & SYSTEM STATUS ================= */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            pointerEvents: 'auto',
          }}
        >
          {/* Brand & Active Operative */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Logo size="md" />
            <div style={{ borderLeft: '1px solid rgba(0, 240, 255, 0.25)', paddingLeft: '16px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.7rem',
                  color: 'var(--status-success, #00ff9d)',
                  letterSpacing: '0.14em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff9d', boxShadow: '0 0 8px #00ff9d' }} />
                <span>LINK: STABLE // ASIA-01</span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.84rem',
                  color: '#ffffff',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  marginTop: '2px',
                }}
              >
                OPERATIVE: <span style={{ color: 'var(--accent-cyan, #00f0ff)' }}>{player?.codename || 'CYBER_STRIKER'}</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Bar */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: 'rgba(10, 15, 26, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            }}
          >
            {[
              { label: 'SELECT', path: '/character-select', icon: <UserCheck size={14} /> },
              { label: 'PRE-FIGHT', path: '/pre-fight', icon: <ShieldCheck size={14} /> },
              { label: '3D ARENA', path: '/arena', icon: <Swords size={14} /> },
              { label: 'DNA ANALYSIS', path: '/analysis', icon: <Dna size={14} /> },
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
                  padding: '7px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.72rem',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Header Action: Logout */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <GlowButton variant="secondary" onClick={handleLogout}>
              <LogOut size={15} />
              <span>DISCONNECT</span>
            </GlowButton>
          </div>
        </header>

        {/* ================= CENTER HERO: BRAND TAGLINE & MAIN CTA ================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            margin: '36px 0',
            pointerEvents: 'auto',
          }}
        >
          {/* AI Scanning Status Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              borderRadius: '20px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.74rem',
              color: 'var(--accent-cyan, #00f0ff)',
              letterSpacing: '0.14em',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
            }}
          >
            <Activity size={14} className="animate-pulse" />
            <span>AI COMBAT SCANNER // FIGHTING DNA ACTIVE</span>
          </div>

          {/* Main Title & Tagline */}
          <h1
            style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: 'clamp(2.5rem, 5.5vw, 4.4rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: 0,
              background: 'linear-gradient(135deg, #ffffff 40%, #00f0ff 80%, #9d4edd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 240, 255, 0.25)',
            }}
          >
            PLAYNEXUS
          </h1>

          <div
            style={{
              fontFamily: 'var(--font-heading, sans-serif)',
              fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)',
              color: 'var(--accent-cyan, #00f0ff)',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              textShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
            }}
          >
            THE AI THAT LEARNS HOW YOU FIGHT.
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.92rem',
              color: 'var(--text-secondary, #94a3b8)',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>Fight</span>
            <span style={{ color: '#00f0ff' }}>//</span>
            <span>Learn</span>
            <span style={{ color: '#9d4edd' }}>//</span>
            <span>Adapt</span>
            <span style={{ color: '#ff3366' }}>//</span>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Dominate</span>
          </div>

          {/* Main CTA Button: START FIGHT */}
          <div style={{ marginTop: '12px' }}>
            <button
              type="button"
              id="start-fight-cta"
              onClick={handleStartFight}
              onMouseEnter={() => playSound('hover')}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 44px',
                background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 50%, #7b2cbf 100%)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '14px',
                color: '#ffffff',
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 0 35px rgba(0, 240, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.4)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Swords size={24} />
              <span>START FIGHT</span>
              <ArrowRight size={22} />
            </button>
          </div>
        </div>

        {/* ================= BOTTOM ROW: HUD DASHBOARD CARDS ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
            width: '100%',
            pointerEvents: 'auto',
          }}
        >
          {/* Card 1: Fighting DNA Teaser */}
          <div
            className="cyber-panel"
            style={{
              padding: '22px',
              background: 'rgba(10, 15, 26, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan, #00f0ff)', fontFamily: 'var(--font-hud)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em' }}>
                <Dna size={18} />
                <span>FIGHTING DNA ARCHITECTURE</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00f0ff', background: 'rgba(0, 240, 255, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'AGGRESSION QUOTIENT', val: fightingDNA.aggression, color: '#ff3366' },
                { label: 'COUNTER REACTION SPEED', val: fightingDNA.counterRate, color: '#00f0ff' },
                { label: 'COMBAT ADAPTABILITY', val: fightingDNA.adaptability, color: '#9d4edd' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-hud)', color: 'var(--text-secondary, #94a3b8)', marginBottom: '4px' }}>
                    <span>{stat.label}</span>
                    <span style={{ color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.val}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${stat.val}%`, height: '100%', background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', background: 'rgba(0, 240, 255, 0.05)', padding: '8px 12px', borderRadius: '6px' }}>
              PROFILE: {fightingDNA.preferredStyle} // TIER: TITAN III
            </div>
          </div>

          {/* Card 2: AI Analysis & Scanning HUD */}
          <div
            className="cyber-panel"
            style={{
              padding: '22px',
              background: 'rgba(10, 15, 26, 0.85)',
              border: '1px solid rgba(157, 78, 221, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-violet, #9d4edd)', fontFamily: 'var(--font-hud)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em' }}>
                <Cpu size={18} />
                <span>AI ANALYSIS HUD // OPPONENT</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#9d4edd', background: 'rgba(157, 78, 221, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                MONITORING
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5, margin: 0 }}>
              The PlayNexus neural engine continuously logs your melee habits, feints, and guard timing to generate real-time combat counters.
            </p>

            <div style={{ padding: '12px', background: 'rgba(157, 78, 221, 0.08)', borderRadius: '8px', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontFamily: 'var(--font-hud)', color: '#ffffff', marginBottom: '6px' }}>
                <span>COUNTER ADAPTATION SPEED</span>
                <span style={{ color: '#9d4edd', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>94.7%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '94.7%', height: '100%', background: '#9d4edd', boxShadow: '0 0 10px #9d4edd' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--status-standby, #fbbf24)', fontFamily: 'var(--font-hud)' }}>
              <ShieldAlert size={15} />
              <span>TACTICAL ADVICE: AVOID REPEATING LOW-KICK CHAINS</span>
            </div>
          </div>

          {/* Card 3: Real-World Feature Teasers & System Status */}
          <div
            className="cyber-panel"
            style={{
              padding: '22px',
              background: 'rgba(10, 15, 26, 0.85)',
              border: '1px solid rgba(0, 255, 157, 0.3)',
              borderRadius: '16px',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-success, #00ff9d)', fontFamily: 'var(--font-hud)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.12em' }}>
                <Zap size={18} />
                <span>REAL-WORLD AI & SYSTEM STATUS</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#00ff9d', background: 'rgba(0, 255, 157, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                12 MS
              </span>
            </div>

            {/* Real-World Sensor Teasers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                <Mic size={15} color="#00f0ff" />
                <span style={{ color: '#fff', fontWeight: 600 }}>Web Speech API:</span>
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Voice Attack Triggers</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                <Camera size={15} color="#9d4edd" />
                <span style={{ color: '#fff', fontWeight: 600 }}>MediaPipe Vision:</span>
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Camera Gesture Tracking</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px' }}>
                <Bot size={15} color="#00ff9d" />
                <span style={{ color: '#fff', fontWeight: 600 }}>OpenAI Engine:</span>
                <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.72rem' }}>Fighting DNA Strategy Generation</span>
              </div>
            </div>

            {/* Live System Status Metrics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
              <span>SECTOR: 07 // TOKYO</span>
              <span style={{ color: '#00ff9d' }}>ENCRYPTION: QUANTUM-SHA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
