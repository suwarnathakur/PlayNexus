import React, { useState } from 'react';
import { DigitalGrid } from '../../components/effects/DigitalGrid';
import { ParticleField } from '../../components/effects/ParticleField';
import { DataStream } from '../../components/effects/DataStream';
import { Scanline } from '../../components/effects/Scanline';
import { FuturisticAICore, type AICoreStatus } from '../../components/effects/FuturisticAICore';
import { LoginForm } from './LoginForm';
import { AuthenticationAnimation } from './AuthenticationAnimation';
import { Logo } from '../../components/common/Logo';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { useAuth } from '../../hooks/useAuth';
import { Dna, ShieldAlert, Zap } from 'lucide-react';
import './login.css';

interface LoginProps {
  onNavigateHome: () => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onNavigateHome,
  onNavigateRegister,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState('CYBER_STRIKER_01');
  const [coreStatus, setCoreStatus] = useState<AICoreStatus>('STANDBY');

  const parallax = useMouseParallax();
  const { login } = useAuth();

  const handleLoginSuccess = (playerId: string) => {
    setActivePlayerId(playerId);
    setCoreStatus('ACCESS_GRANTED');
    setIsAuthenticating(true);
  };

  const handleAuthSequenceComplete = () => {
    login(activePlayerId, true);
    onNavigateHome();
  };

  return (
    <main
      className="login-viewport"
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#05070c',
        color: '#ffffff',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. Full-screen Digital Perspective Grid */}
      <DigitalGrid
        parallaxX={parallax.smoothX}
        parallaxY={parallax.smoothY}
      />

      {/* 2. Floating Cyber Embers & Particles */}
      <ParticleField
        parallaxX={parallax.smoothX}
        parallaxY={parallax.smoothY}
      />

      {/* 3. Floating Telemetry Data Streams */}
      <DataStream />

      {/* 4. CRT Scanline Sweep */}
      <Scanline />

      {/* Top Brand Header Bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <Logo size="md" />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.74rem',
            color: 'var(--status-success, #00ff9d)',
            background: 'rgba(0, 255, 157, 0.08)',
            border: '1px solid rgba(0, 255, 157, 0.25)',
            padding: '6px 14px',
            borderRadius: '20px',
            letterSpacing: '0.12em',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff9d', boxShadow: '0 0 8px #00ff9d' }} />
          <span>AI ADAPTATION ENGINE: ACTIVE</span>
        </div>
      </header>

      {/* Main Content Layout (2-Column on Desktop, Stacked on Mobile) */}
      <div
        className="login-main-container page-entrance"
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 32px 60px',
          maxWidth: '1360px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '48px',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* ================= LEFT COLUMN: HERO BRANDING & AI CORE ================= */}
          <section
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              alignItems: 'flex-start',
            }}
          >
            {/* Tagline Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                color: 'var(--accent-cyan, #00f0ff)',
                background: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                padding: '6px 14px',
                borderRadius: '6px',
                letterSpacing: '0.14em',
              }}
            >
              <Zap size={14} />
              <span>THE AI THAT LEARNS HOW YOU FIGHT</span>
            </div>

            {/* Main Text & Supporting Text */}
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '0.04em',
                  margin: 0,
                  textTransform: 'uppercase',
                  background: 'linear-gradient(135deg, #ffffff 30%, #00f0ff 80%, #9d4edd 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ENTER THE NEXUS.
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  marginTop: '12px',
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                Your fight. Your patterns. Your evolution.
              </p>
            </div>

            {/* Futuristic AI Core Visual with Parallax */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '10px 0',
              }}
            >
              <FuturisticAICore
                status={coreStatus}
                parallaxX={parallax.smoothX}
                parallaxY={parallax.smoothY}
                size={340}
              />
            </div>

            {/* Bottom Fighting DNA Feature Badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
                width: '100%',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(10, 15, 26, 0.6)',
                  border: '1px solid rgba(0, 240, 255, 0.15)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <Dna size={18} color="var(--accent-cyan, #00f0ff)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', color: '#fff', fontWeight: 700 }}>
                    FIGHTING DNA
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    Profiles your aggression & habits
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(10, 15, 26, 0.6)',
                  border: '1px solid rgba(157, 78, 221, 0.2)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <ShieldAlert size={18} color="var(--accent-violet, #9d4edd)" />
                <div>
                  <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', color: '#fff', fontWeight: 700 }}>
                    ADAPTIVE COUNTERS
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                    AI counters repeated attacks
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= RIGHT COLUMN: GLASSMORPHISM LOGIN PANEL ================= */}
          <section
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '480px',
                transform: `translate(${parallax.smoothX * 6}px, ${parallax.smoothY * 6}px)`,
                transition: 'transform 0.2s ease-out',
              }}
            >
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onNavigateRegister={onNavigateRegister}
                onStatusChange={status => setCoreStatus(status)}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Fullscreen Cinematic Authentication Modal Sequence */}
      {isAuthenticating && (
        <AuthenticationAnimation
          playerId={activePlayerId}
          onComplete={handleAuthSequenceComplete}
        />
      )}

      {/* Page Styles for Entrance and Motion */}
      <style>{`
        @keyframes pageFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-entrance {
          animation: pageFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .page-entrance {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
};
