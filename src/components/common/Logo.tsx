import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isSm ? '8px' : '14px' }}>
        {/* Animated Cyber Nexus Hex Prism Icon */}
        <div
          style={{
            position: 'relative',
            width: isSm ? '26px' : isLg ? '44px' : '34px',
            height: isSm ? '26px' : isLg ? '44px' : '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer rotating diamond */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1.5px solid var(--accent-cyan)',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 12px var(--accent-cyan-dim)',
              animation: 'rotateClockwise 16s linear infinite',
            }}
          />
          {/* Inner pulsating node */}
          <div
            style={{
              position: 'absolute',
              width: '40%',
              height: '40%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 8px var(--accent-cyan)',
            }}
          />
        </div>

        {/* Brand Text */}
        <div style={{ display: 'flex', alignItems: 'baseline', letterSpacing: '0.12em' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: isSm ? '1.1rem' : isLg ? '2.4rem' : '1.7rem',
              color: '#ffffff',
              textShadow: '0 0 18px rgba(0, 240, 255, 0.45)',
            }}
          >
            PLAY
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: isSm ? '1.1rem' : isLg ? '2.4rem' : '1.7rem',
              background: 'linear-gradient(90deg, #00f0ff 0%, #9d4edd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 25px rgba(157, 78, 221, 0.5)',
            }}
          >
            NEXUS
          </span>
        </div>
      </div>

      {showSubtitle && (
        <div
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: isSm ? '0.62rem' : isLg ? '0.85rem' : '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.28em',
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
            opacity: 0.9,
            paddingLeft: isSm ? '34px' : isLg ? '58px' : '48px',
          }}
        >
          ADAPTIVE COMBAT NETWORK
        </div>
      )}
    </div>
  );
};
