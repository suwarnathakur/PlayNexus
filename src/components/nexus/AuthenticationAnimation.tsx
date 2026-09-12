import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '../../hooks/useSound';

interface AuthenticationAnimationProps {
  onComplete: () => void;
  playerId: string;
}

export const AuthenticationAnimation: React.FC<AuthenticationAnimationProps> = ({
  onComplete,
  playerId,
}) => {
  const [stage, setStage] = useState<number>(1);
  const [telemetryLines, setTelemetryLines] = useState<string[]>([]);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const { playSound } = useSound();

  useEffect(() => {
    // Stage 1: Initializing
    playSound('scan');
    const timer1 = setTimeout(() => {
      setStage(2);
    }, 350);

    // Stage 2 & 3: Authenticating Player
    const timer2 = setTimeout(() => {
      setStage(3);
      playSound('pulse');
    }, 700);

    // Stage 4: Scanning diagnostic lines
    const timer3 = setTimeout(() => {
      setStage(4);
      setTelemetryLines([`PLAYER ID [${playerId.toUpperCase()}] ... VERIFIED`]);
      playSound('scan');
    }, 1100);

    const timer4 = setTimeout(() => {
      setTelemetryLines(prev => [...prev, 'NEURAL LINK .................... STABLE (12ms)']);
      playSound('scan');
    }, 1450);

    const timer5 = setTimeout(() => {
      setTelemetryLines(prev => [...prev, 'COMBAT PROFILE ................. LOADED [TITAN]']);
      playSound('scan');
    }, 1800);

    const timer6 = setTimeout(() => {
      setTelemetryLines(prev => [...prev, 'NEXUS ACCESS .................. GRANTED // 100%']);
      playSound('scan');
    }, 2150);

    // Stage 5: Access Granted Banner & Sound + Particle Surge
    const timer7 = setTimeout(() => {
      setStage(5);
      playSound('granted');

      // Cyan / Emerald cyber particle explosion
      try {
        confetti({
          particleCount: 80,
          spread: 85,
          origin: { y: 0.5 },
          colors: ['#00f0ff', '#00ff9d', '#9d4edd', '#ffffff'],
          disableForReducedMotion: true,
        });
      } catch {}
    }, 2550);

    // Stage 6: Screen Flash and Transition to /
    const timer8 = setTimeout(() => {
      setStage(6);
      setFlashActive(true);
    }, 3200);

    const timer9 = setTimeout(() => {
      onComplete();
    }, 3650);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
      clearTimeout(timer7);
      clearTimeout(timer8);
      clearTimeout(timer9);
    };
  }, [onComplete, playerId, playSound]);

  return (
    <div
      role="dialog"
      aria-label="Neural Authentication Sequence"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 8, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* Screen flash on final stage */}
      <div className={`cinematic-flash ${flashActive ? 'active' : ''}`} />

      <div
        className="cyber-panel"
        style={{
          width: '90%',
          maxWidth: '560px',
          padding: '36px',
          background: 'rgba(9, 14, 24, 0.92)',
          border: '1px solid var(--accent-cyan)',
          boxShadow: '0 0 50px rgba(0, 240, 255, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
        }}
      >
        {/* Animated Cyber Reticle */}
        <div style={{ position: 'relative', width: '70px', height: '70px' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '2px solid transparent',
              borderTopColor: 'var(--accent-cyan)',
              borderBottomColor: 'var(--accent-cyan)',
              borderRadius: '50%',
              animation: 'rotateClockwise 1.2s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '8px',
              border: '1.5px solid transparent',
              borderLeftColor: 'var(--accent-violet)',
              borderRightColor: 'var(--accent-violet)',
              borderRadius: '50%',
              animation: 'rotateCounter 0.9s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '22px',
              background: stage >= 5 ? 'var(--status-success)' : 'var(--accent-cyan)',
              borderRadius: '50%',
              boxShadow: `0 0 20px ${stage >= 5 ? 'var(--status-success)' : 'var(--accent-cyan)'}`,
              transition: 'background-color 0.3s ease',
            }}
          />
        </div>

        {/* Status Header */}
        <div>
          <div
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '0.8rem',
              letterSpacing: '0.28em',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            NEURAL PROTOCOL // AUTHENTICATING
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: stage >= 5 ? 'var(--status-success)' : '#ffffff',
              textShadow: stage >= 5
                ? '0 0 30px rgba(0, 255, 157, 0.8)'
                : '0 0 20px rgba(0, 240, 255, 0.6)',
              transition: 'all 0.3s ease',
            }}
          >
            {stage >= 5 ? 'ACCESS GRANTED' : 'SYNCHRONIZING COMBAT DNA...'}
          </h2>
        </div>

        {/* Telemetry Scanning Output Box */}
        <div
          style={{
            width: '100%',
            background: 'rgba(4, 7, 12, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '16px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            lineHeight: 1.8,
            color: 'var(--accent-cyan)',
            textAlign: 'left',
            minHeight: '125px',
            boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>
            AUTHENTICATION TELEMETRY // SECTOR-07:
          </div>
          {telemetryLines.map((line, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                animation: 'lineFadeIn 0.2s ease-in',
                color: line.includes('GRANTED') ? 'var(--status-success)' : 'var(--text-primary)',
              }}
            >
              <span style={{ color: 'var(--accent-cyan)', marginRight: '8px' }}>&gt;</span>
              <span>{line}</span>
            </div>
          ))}
          {stage < 5 && (
            <div style={{ color: 'var(--accent-cyan)', animation: 'pulseDot 0.6s infinite' }}>
              &gt; PROCESSING_STREAM_PACKET...
            </div>
          )}
        </div>

        {/* Bottom Sub-tag */}
        <div
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '0.85rem',
            letterSpacing: '0.18em',
            color: stage >= 5 ? 'var(--status-success)' : 'var(--text-secondary)',
          }}
        >
          {stage >= 5 ? 'ENTERING THE ARENA WORLD...' : 'CONNECT → AUTHENTICATE → ANALYZE → ENTER'}
        </div>
      </div>

      <style>{`
        @keyframes lineFadeIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
