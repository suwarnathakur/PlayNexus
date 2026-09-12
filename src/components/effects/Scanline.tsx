import React from 'react';

export const Scanline: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 99,
        overflow: 'hidden',
      }}
    >
      {/* Subtle CRT horizontal scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.45,
        }}
      />

      {/* Moving slow vertical scanner bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0, 240, 255, 0.03) 50%, transparent 100%)',
          animation: 'scanlineRoll 9s linear infinite',
        }}
      />

      {/* Soft Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(3, 5, 8, 0.8) 100%)',
        }}
      />

      <style>{`
        @keyframes scanlineRoll {
          0% {
            transform: translateY(-150px);
          }
          100% {
            transform: translateY(105vh);
          }
        }
      `}</style>
    </div>
  );
};
