import React from 'react';

interface HealthBarProps {
  label: string;
  currentHp: number;
  maxHp: number;
  colorGradient: string;
  glowColor: string;
  statusBadge?: string;
  isReversed?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  label,
  currentHp,
  maxHp,
  colorGradient,
  glowColor,
  statusBadge,
  isReversed = false,
}) => {
  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

  return (
    <div
      style={{
        background: 'rgba(10, 15, 26, 0.88)',
        border: `1.5px solid ${glowColor}55`,
        borderRadius: '12px',
        padding: '12px 18px',
        boxShadow: `0 0 20px ${glowColor}18`,
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
      }}
    >
      {/* Top Details Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: isReversed ? 'row-reverse' : 'row',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              color: '#ffffff',
            }}
          >
            {label}
          </span>
          {statusBadge && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.65rem',
                fontWeight: 700,
                color: glowColor,
                background: `${glowColor}18`,
                border: `1px solid ${glowColor}44`,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.08em',
              }}
            >
              {statusBadge}
            </span>
          )}
        </div>

        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.85rem',
            fontWeight: 800,
            color: glowColor,
          }}
        >
          {Math.round(currentHp)} / {maxHp} HP
        </span>
      </div>

      {/* Outer Health Gauge Container */}
      <div
        style={{
          width: '100%',
          height: '12px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '5px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: isReversed ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Animated Fill Bar */}
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            background: colorGradient,
            boxShadow: `0 0 12px ${glowColor}`,
            transition: 'width 0.25s ease-out',
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
};
