import React from 'react';
import { useTheme } from '../../store/themeStore';

interface CityHeroTitleProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const CityHeroTitle: React.FC<CityHeroTitleProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '560px',
        transform: `translate(${parallaxX * 10}px, ${parallaxY * 8}px)`,
        transition: 'transform 0.2s ease-out',
      }}
    >
      {/* Live Season Tag */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          background: isDark ? 'rgba(0, 240, 255, 0.12)' : 'rgba(0, 102, 255, 0.12)',
          border: `1px solid ${isDark ? 'rgba(0, 240, 255, 0.35)' : 'rgba(0, 102, 255, 0.3)'}`,
          width: 'fit-content',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--neon-pink)',
            boxShadow: '0 0 10px var(--neon-pink)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: isDark ? 'var(--neon-cyan)' : 'var(--neon-pink)',
            textTransform: 'uppercase',
          }}
        >
          SEASON 04 // PROTOCOL ACTIVATION
        </span>
      </div>

      {/* Clean, Cinematic Game Heading */}
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '4.2rem',
          fontWeight: 900,
          lineHeight: 1.05,
          letterSpacing: '0.02em',
          color: isDark ? '#ffffff' : '#0a1020',
          textTransform: 'uppercase',
        }}
      >
        ENTER<br />
        <span
          style={{
            color: isDark ? 'var(--neon-cyan)' : 'var(--neon-pink)',
            textShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.8), 0 0 60px rgba(255, 0, 127, 0.5)' : 'none',
            display: 'inline-block',
          }}
        >
          THE NEXUS.
        </span>
      </h1>

      {/* Clean Tagline */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '1.2rem',
          fontWeight: 600,
          color: isDark ? '#e2e8f0' : '#1e293b',
          letterSpacing: '0.04em',
          textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.8)' : 'none',
          lineHeight: 1.4,
        }}
      >
        Your fight. Your patterns. Your evolution.
      </p>

      {/* Live Gaming Platform Metrics */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          marginTop: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: isDark ? 'rgba(7, 12, 24, 0.75)' : 'rgba(255, 255, 255, 0.85)',
            border: isDark ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid rgba(0, 102, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0a1020' }}>
              128,450
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Players in Arena
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: isDark ? 'rgba(7, 12, 24, 0.75)' : 'rgba(255, 255, 255, 0.85)',
            border: isDark ? '1px solid rgba(255, 0, 127, 0.25)' : '1px solid rgba(225, 29, 72, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{ fontSize: '1rem' }}>🏆</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 800, color: isDark ? '#ffffff' : '#0a1020' }}>
              $500,000
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              World Championship
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
