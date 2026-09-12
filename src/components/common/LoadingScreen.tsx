import React from 'react';

interface LoadingScreenProps {
  statusText?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  statusText = 'SYNCHRONIZING WITH PLAYNEXUS NETWORK...',
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'var(--bg-void)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        zIndex: 999,
      }}
    >
      {/* Concentric Gyro Rings Loader */}
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid transparent',
            borderTopColor: 'var(--accent-cyan)',
            borderRightColor: 'var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'rotateClockwise 1s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '10px',
            border: '2px solid transparent',
            borderBottomColor: 'var(--accent-violet)',
            borderLeftColor: 'var(--accent-violet)',
            borderRadius: '50%',
            animation: 'rotateCounter 1.4s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '26px',
            background: 'radial-gradient(circle, var(--accent-cyan), transparent)',
            borderRadius: '50%',
            animation: 'pulseGlow 1.2s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'var(--font-hud)',
          fontSize: '0.9rem',
          letterSpacing: '0.24em',
          color: 'var(--accent-cyan)',
          textTransform: 'uppercase',
          textAlign: 'center',
          maxWidth: '80%',
        }}
      >
        {statusText}
      </div>
    </div>
  );
};
