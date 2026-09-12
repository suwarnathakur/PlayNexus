import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useSound } from '../../hooks/useSound';
import { ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

interface AuthenticationAnimationProps {
  onComplete: () => void;
  playerId: string;
}

export const AuthenticationAnimation: React.FC<AuthenticationAnimationProps> = ({
  onComplete,
  playerId,
}) => {
  const [phase, setPhase] = useState<'AUTHENTICATING' | 'ACCESS_GRANTED'>('AUTHENTICATING');
  const [progress, setProgress] = useState(15);
  const [telemetry, setTelemetry] = useState<string[]>(['CONNECTING TO PLAYNEXUS NEURAL MESH...']);
  const { playSound } = useSound();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    playSound('scan');

    const t1 = setTimeout(() => {
      setProgress(48);
      setTelemetry(prev => [...prev, `VERIFYING OPERATOR IDENTITY: [${playerId.toUpperCase()}]`]);
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(78);
      setTelemetry(prev => [...prev, 'FIGHTING DNA ENGINE: SYNCED // PREDICTION ENGINE READY']);
      playSound('pulse');
    }, 900);

    const t3 = setTimeout(() => {
      setProgress(100);
      setPhase('ACCESS_GRANTED');
      setTelemetry(prev => [...prev, 'NEURAL LINK SECURED // AUTHORIZATION 100%']);
      playSound('granted');

      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#00f0ff', '#00ff9d', '#9d4edd', '#ffffff'],
          disableForReducedMotion: true,
        });
      } catch {}
    }, 1500);

    const t4 = setTimeout(() => {
      onCompleteRef.current();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [playerId, playSound]);

  const handleInstantSkip = () => {
    playSound('granted');
    onCompleteRef.current();
  };

  return (
    <div
      role="dialog"
      aria-label="Neural Authentication Sequence"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(3, 5, 8, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '24px',
      }}
    >
      <div
        className="cyber-panel"
        style={{
          position: 'relative',
          maxWidth: '520px',
          width: '100%',
          padding: '40px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          boxShadow: phase === 'ACCESS_GRANTED'
            ? '0 0 50px rgba(0, 255, 157, 0.3), 0 0 100px rgba(0, 240, 255, 0.15)'
            : '0 0 40px rgba(0, 240, 255, 0.2)',
          border: `1.5px solid ${phase === 'ACCESS_GRANTED' ? '#00ff9d' : '#00f0ff'}`,
          borderRadius: '20px',
          transition: 'all 0.4s ease',
        }}
      >
        {/* Animated Cyber Hologram Icon */}
        <div
          style={{
            position: 'relative',
            width: '88px',
            height: '88px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px dashed ${phase === 'ACCESS_GRANTED' ? '#00ff9d' : '#00f0ff'}`,
              animation: 'spinSlow 8s linear infinite',
            }}
          />
          {phase === 'AUTHENTICATING' ? (
            <Cpu size={44} color="#00f0ff" className="animate-pulse" />
          ) : (
            <ShieldCheck size={44} color="#00ff9d" />
          )}
        </div>

        {/* Status Heading */}
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              color: phase === 'ACCESS_GRANTED' ? '#00ff9d' : '#00f0ff',
              textShadow: `0 0 20px ${phase === 'ACCESS_GRANTED' ? '#00ff9d' : '#00f0ff'}`,
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            {phase === 'AUTHENTICATING' ? 'AUTHENTICATING...' : 'ACCESS GRANTED'}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.8rem',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '6px',
              letterSpacing: '0.1em',
            }}
          >
            {phase === 'AUTHENTICATING'
              ? 'SYNCHRONIZING COMBAT NEURAL LINK'
              : 'ENTER THE NEXUS // REDIRECTING...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: phase === 'ACCESS_GRANTED'
                ? 'linear-gradient(90deg, #00f0ff, #00ff9d)'
                : 'linear-gradient(90deg, #9d4edd, #00f0ff)',
              boxShadow: `0 0 12px ${phase === 'ACCESS_GRANTED' ? '#00ff9d' : '#00f0ff'}`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Telemetry Stream Output */}
        <div
          style={{
            width: '100%',
            background: 'rgba(5, 7, 12, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '12px 14px',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            color: 'var(--accent-cyan, #00f0ff)',
            minHeight: '80px',
          }}
        >
          {telemetry.map((line, idx) => (
            <div key={idx} style={{ opacity: idx === telemetry.length - 1 ? 1 : 0.65 }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', marginRight: '6px' }}>&gt;</span>
              {line}
            </div>
          ))}
        </div>

        {/* Skip Button for Instant Testing */}
        <button
          type="button"
          onClick={handleInstantSkip}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '8px 18px',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-hud, monospace)',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
          }}
        >
          <span>PROCEED DIRECTLY</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
