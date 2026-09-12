import React from 'react';
import { useTheme } from '../../store/themeStore';

interface GridBackgroundProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
  const { isDark } = useTheme();

  return (
    <div 
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Background Realm Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '20%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, rgba(56, 189, 248, 0.06) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(34, 197, 94, 0.16) 0%, rgba(251, 191, 36, 0.1) 45%, transparent 70%)',
          filter: 'blur(50px)',
          transform: `translate(${parallaxX * 25}px, ${parallaxY * 25}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      />

      {/* Subtle Mystical Hills Horizon Silhouette */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '240px',
          opacity: isDark ? 0.35 : 0.2,
          transform: `translate(${parallaxX * 12}px, ${parallaxY * 6}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <path
          fill={isDark ? '#061009' : '#d4ebd9'}
          d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,138.7C672,139,768,181,864,197.3C960,213,1056,203,1152,181.3C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      {/* Floating Ambient Ground Mist */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: isDark
            ? 'linear-gradient(to top, rgba(9, 16, 12, 0.95) 0%, transparent 100%)'
            : 'linear-gradient(to top, rgba(237, 246, 240, 0.95) 0%, transparent 100%)',
        }}
      />
    </div>
  );
};
