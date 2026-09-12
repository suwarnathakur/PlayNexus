import React from 'react';

export type AICoreStatus =
  | 'STANDBY'
  | 'SCANNING_PLAYER'
  | 'VERIFYING_ACCESS'
  | 'ACCESS_READY'
  | 'AUTHENTICATING'
  | 'ACCESS_GRANTED'
  | 'ACCESS_DENIED';

interface AICoreProps {
  status: AICoreStatus;
  parallaxX?: number;
  parallaxY?: number;
}

export const AICore: React.FC<AICoreProps> = ({
  status,
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const isDenied = status === 'ACCESS_DENIED';
  const isGranted = status === 'ACCESS_GRANTED';
  const isAuth = status === 'AUTHENTICATING';
  const isHovered = status === 'ACCESS_READY';
  const isScanning = status === 'SCANNING_PLAYER' || status === 'VERIFYING_ACCESS';

  // Dynamic status color
  const coreColor = isDenied
    ? '#ff3366'
    : isGranted
    ? '#00ff9d'
    : isAuth
    ? '#00f0ff'
    : isHovered
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
      className={`ai-core-wrapper ${isDenied ? 'ai-core-denied' : ''}`}
      style={{
        position: 'relative',
        width: '380px',
        height: '380px',
        maxWidth: '100%',
        maxHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate(${parallaxX * 22}px, ${parallaxY * 22}px)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* Outer Pulse Shockwaves (Layer 4) */}
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          border: `1.5px solid ${coreColor}`,
          opacity: 0.25,
          animation: isDenied ? 'none' : 'corePulseOut 3.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '-45px',
          borderRadius: '50%',
          border: `1px dashed ${secondaryColor}`,
          opacity: 0.15,
          animation: isDenied ? 'none' : 'corePulseOut 3.2s cubic-bezier(0.2, 0.8, 0.4, 1) infinite 1.6s',
        }}
      />

      {/* Layer 1: Slow rotating outer ring with notched markings */}
      <svg
        viewBox="0 0 380 380"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          animation: `rotateClockwise ${isAuth ? '7s' : '26s'} linear infinite`,
          filter: `drop-shadow(0 0 10px ${coreColor})`,
          transition: 'all 0.4s ease',
        }}
      >
        <circle
          cx="190"
          cy="190"
          r="176"
          fill="none"
          stroke={coreColor}
          strokeWidth="1.5"
          strokeDasharray="18 12 40 8 6 12"
          opacity="0.65"
        />
        {/* Cardinal North/South/East/West cyber markers */}
        <line x1="190" y1="6" x2="190" y2="20" stroke={coreColor} strokeWidth="3" />
        <line x1="190" y1="360" x2="190" y2="374" stroke={coreColor} strokeWidth="3" />
        <line x1="6" y1="190" x2="20" y2="190" stroke={coreColor} strokeWidth="3" />
        <line x1="360" y1="190" x2="374" y2="190" stroke={coreColor} strokeWidth="3" />

        {/* Small angled node markers */}
        <circle cx="65" cy="65" r="3" fill={coreColor} />
        <circle cx="315" cy="65" r="3" fill={coreColor} />
        <circle cx="65" cy="315" r="3" fill={coreColor} />
        <circle cx="315" cy="315" r="3" fill={coreColor} />
      </svg>

      {/* Layer 2: Counter-rotating segmented telemetry ring */}
      <svg
        viewBox="0 0 320 320"
        style={{
          position: 'absolute',
          width: '84%',
          height: '84%',
          animation: `rotateCounter ${isAuth ? '5s' : '18s'} linear infinite`,
          transition: 'all 0.4s ease',
        }}
      >
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="2"
          strokeDasharray="4 16 35 12"
          opacity="0.8"
        />
        <circle
          cx="160"
          cy="160"
          r="126"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />
      </svg>

      {/* Layer 3: Concentric Hexagon Geometry with Neural Connection Nodes */}
      <svg
        viewBox="0 0 240 240"
        style={{
          position: 'absolute',
          width: '63%',
          height: '63%',
          animation: 'rotateClockwise 38s linear infinite',
        }}
      >
        {/* Outer Hexagon */}
        <polygon
          points="120,18 208,69 208,171 120,222 32,171 32,69"
          fill="none"
          stroke={coreColor}
          strokeWidth="1.5"
          opacity="0.5"
        />
        {/* Inner Diamond / Matrix */}
        <polygon
          points="120,40 190,120 120,200 50,120"
          fill="rgba(0, 240, 255, 0.03)"
          stroke={secondaryColor}
          strokeWidth="1.2"
          opacity="0.75"
        />
        {/* Corner Node Dots */}
        {[
          [120, 18], [208, 69], [208, 171], [120, 222], [32, 171], [32, 69],
          [120, 40], [190, 120], [120, 200], [50, 120]
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.5" fill={coreColor} />
        ))}
      </svg>

      {/* Layer 5: Radar Scan Beam */}
      <div
        style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${coreColor} 360deg)`,
          opacity: isScanning || isAuth ? 0.45 : 0.18,
          animation: 'rotateClockwise 3.6s linear infinite',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* Center AI Nucleus / Combat Intelligence Core */}
      <div
        style={{
          position: 'relative',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${coreColor} 40%, ${secondaryColor} 85%, #05070b 100%)`,
          boxShadow: `0 0 ${isAuth ? '60px' : isHovered ? '45px' : '28px'} ${coreColor}, inset 0 0 15px #ffffff`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isDenied ? 'shakeAlert 0.4s ease-in-out' : 'corePulse 2.4s ease-in-out infinite',
          transition: 'all 0.3s ease',
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.62rem',
            fontWeight: 900,
            letterSpacing: '0.2em',
            color: '#030508',
            textShadow: '0 0 4px #ffffff',
          }}
        >
          AI
        </div>
        <div
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '0.54rem',
            fontWeight: 800,
            letterSpacing: '0.24em',
            color: '#030508',
          }}
        >
          CORE
        </div>

        {/* Orbiting micro photon */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 0 8px #ffffff',
            transformOrigin: '-24px -24px',
            animation: 'rotateClockwise 1.2s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes corePulseOut {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        @keyframes corePulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 16px ${coreColor});
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 35px ${coreColor});
          }
        }
        .ai-core-denied {
          animation: shakeAlert 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
};
