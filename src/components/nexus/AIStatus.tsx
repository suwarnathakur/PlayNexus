import React from 'react';
import type { AICoreStatus } from './AICore';

interface AIStatusProps {
  status: AICoreStatus;
}

export const AIStatus: React.FC<AIStatusProps> = ({ status }) => {
  const getStatusLabel = () => {
    switch (status) {
      case 'SCANNING_PLAYER':
        return 'SCANNING PLAYER...';
      case 'VERIFYING_ACCESS':
        return 'VERIFYING ACCESS...';
      case 'ACCESS_READY':
        return 'NEXUS ACCESS READY';
      case 'AUTHENTICATING':
        return 'AUTHENTICATING...';
      case 'ACCESS_GRANTED':
        return 'WELCOME, PLAYER.';
      case 'ACCESS_DENIED':
        return 'ACCESS DENIED';
      case 'STANDBY':
      default:
        return 'NEXUS CONNECTION: STANDBY';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'ACCESS_DENIED':
        return 'var(--status-warning)';
      case 'ACCESS_GRANTED':
        return 'var(--status-success)';
      case 'AUTHENTICATING':
      case 'ACCESS_READY':
        return 'var(--accent-cyan)';
      case 'SCANNING_PLAYER':
      case 'VERIFYING_ACCESS':
        return '#38bdf8';
      default:
        return 'var(--text-secondary)';
    }
  };

  const color = getStatusColor();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        background: 'rgba(6, 11, 20, 0.7)',
        border: `1px solid ${color}`,
        borderRadius: '20px',
        boxShadow: `0 0 12px ${color}33`,
        transition: 'all 0.25s ease',
      }}
    >
      {/* Pulsing Dot */}
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
          animation: 'pulseDot 1.4s ease-in-out infinite',
        }}
      />

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: color,
          textTransform: 'uppercase',
        }}
      >
        {getStatusLabel()}
      </span>

      <style>{`
        @keyframes pulseDot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.35;
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};
