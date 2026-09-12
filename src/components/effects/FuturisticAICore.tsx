import React from 'react';

export type AICoreStatus =
  | 'STANDBY'
  | 'SCANNING'
  | 'AUTHENTICATING'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED';

interface FuturisticAICoreProps {
  status?: AICoreStatus;
  parallaxX?: number;
  parallaxY?: number;
  size?: number;
}

export const FuturisticAICore: React.FC<FuturisticAICoreProps> = ({
  status = 'STANDBY',
  parallaxX = 0,
  parallaxY = 0,
  size = 360,
}) => {
  const isDenied = status === 'ACCESS_DENIED';
  const isGranted = status === 'ACCESS_GRANTED';
  const isAuth = status === 'AUTHENTICATING';
  const isScanning = status === 'SCANNING';

  // State-based accent colors
  const primaryColor = isDenied
    ? '#ff3366'
    : isGranted
    ? '#00ff9d'
    : isAuth
    ? '#00f0ff'
    : isScanning
    ? '#38bdf8'
    : '#00f0ff';

  const secondaryColor = isDenied
    ? '#ff0055'
    : isGranted
    ? '#00e5ff'
    : isAuth
    ? '#9d4edd'
    : '#9d4edd';

  return (
    <div
      className={`ai-core-container ${isDenied ? 'ai-denied-shake' : ''}`}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate(${parallaxX * 18}px, ${parallaxY * 18}px)`,
        transition: 'transform 0.15s ease-out',
        userSelect: 'none',
      }}
    >
      {/* Outer Pulse Shockwave Rings */}
      <div
        className="core-shockwave-1"
        style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          border: `1.5px solid ${primaryColor}`,
          opacity: 0.25,
        }}
      />
      <div
        className="core-shockwave-2"
        style={{
          position: 'absolute',
          inset: '-45px',
          borderRadius: '50%',
          border: `1px dashed ${secondaryColor}`,
          opacity: 0.15,
        }}
      />

      {/* Layer 1: Clockwise Outer Notched Ring */}
      <svg
        viewBox="0 0 360 360"
        className="core-ring-cw"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          filter: `drop-shadow(0 0 10px ${primaryColor})`,
          transition: 'all 0.4s ease',
        }}
      >
        <circle
          cx="180"
          cy="180"
          r="165"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeDasharray="16 12 40 8 6 12"
          opacity="0.6"
        />
        {/* Cardinal Markers */}
        <line x1="180" y1="8" x2="180" y2="24" stroke={primaryColor} strokeWidth="3" />
        <line x1="180" y1="336" x2="180" y2="352" stroke={primaryColor} strokeWidth="3" />
        <line x1="8" y1="180" x2="24" y2="180" stroke={primaryColor} strokeWidth="3" />
        <line x1="336" y1="180" x2="352" y2="180" stroke={primaryColor} strokeWidth="3" />

        {/* Diagonal telemetry dots */}
        <circle cx="68" cy="68" r="3" fill={primaryColor} />
        <circle cx="292" cy="68" r="3" fill={primaryColor} />
        <circle cx="68" cy="292" r="3" fill={primaryColor} />
        <circle cx="292" cy="292" r="3" fill={primaryColor} />
      </svg>

      {/* Layer 2: Counter-Clockwise Segmented Telemetry Ring */}
      <svg
        viewBox="0 0 300 300"
        className="core-ring-ccw"
        style={{
          position: 'absolute',
          width: '82%',
          height: '82%',
          transition: 'all 0.4s ease',
        }}
      >
        <circle
          cx="150"
          cy="150"
          r="132"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
          strokeDasharray="4 16 35 12"
          opacity="0.75"
        />
        <circle
          cx="150"
          cy="150"
          r="118"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />
      </svg>

      {/* Layer 3: Concentric Hexagon Geometry */}
      <svg
        viewBox="0 0 240 240"
        className="core-ring-cw-slow"
        style={{
          position: 'absolute',
          width: '64%',
          height: '64%',
        }}
      >
        <polygon
          points="120,18 208,69 208,171 120,222 32,171 32,69"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          opacity="0.45"
        />
        <polygon
          points="120,40 190,120 120,200 50,120"
          fill="rgba(0, 240, 255, 0.04)"
          stroke={secondaryColor}
          strokeWidth="1.2"
          opacity="0.7"
        />
        {/* Node Dots */}
        {[
          [120, 18], [208, 69], [208, 171], [120, 222], [32, 171], [32, 69],
          [120, 40], [190, 120], [120, 200], [50, 120],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill={primaryColor} />
        ))}
      </svg>

      {/* Layer 4: Radar Scan Beam */}
      <div
        className="core-radar-beam"
        style={{
          position: 'absolute',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${primaryColor} 360deg)`,
          opacity: isScanning || isAuth ? 0.45 : 0.18,
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* Center Glowing AI Core Reactor */}
      <div
        className="core-nucleus"
        style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${primaryColor} 40%, ${secondaryColor} 85%, #05070b 100%)`,
          boxShadow: `0 0 ${isAuth ? '65px' : '35px'} ${primaryColor}, inset 0 0 15px #ffffff`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display, sans-serif)',
            fontSize: '0.65rem',
            fontWeight: 900,
            letterSpacing: '0.18em',
            color: '#030508',
            textShadow: '0 0 4px #ffffff',
          }}
        >
          PLAYNEXUS
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.52rem',
            fontWeight: 800,
            letterSpacing: '0.22em',
            color: '#030508',
          }}
        >
          AI // CORE
        </span>

        {/* Orbiting Photon Node */}
        <div
          className="core-photon"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 0 8px #ffffff',
            transformOrigin: '-22px -22px',
          }}
        />
      </div>

      <style>{`
        @keyframes rotateCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rotateCCW {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        @keyframes pulseShockwave {
          0% { transform: scale(0.85); opacity: 0.5; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes nucleusBreathing {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 16px ${primaryColor}); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 35px ${primaryColor}); }
        }
        @keyframes shakeEffect {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }

        .core-ring-cw {
          animation: rotateCW ${isAuth ? '6s' : '26s'} linear infinite;
        }
        .core-ring-ccw {
          animation: rotateCCW ${isAuth ? '5s' : '18s'} linear infinite;
        }
        .core-ring-cw-slow {
          animation: rotateCW 38s linear infinite;
        }
        .core-radar-beam {
          animation: rotateCW 3.5s linear infinite;
        }
        .core-shockwave-1 {
          animation: pulseShockwave 3.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite;
        }
        .core-shockwave-2 {
          animation: pulseShockwave 3.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite 1.6s;
        }
        .core-nucleus {
          animation: nucleusBreathing 2.4s ease-in-out infinite;
        }
        .core-photon {
          animation: rotateCW 1.4s linear infinite;
        }
        .ai-denied-shake {
          animation: shakeEffect 0.4s ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .core-ring-cw,
          .core-ring-ccw,
          .core-ring-cw-slow,
          .core-radar-beam,
          .core-shockwave-1,
          .core-shockwave-2,
          .core-nucleus,
          .core-photon,
          .ai-denied-shake {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
