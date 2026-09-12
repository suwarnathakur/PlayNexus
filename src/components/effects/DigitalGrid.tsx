import React from 'react';

interface DigitalGridProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const DigitalGrid: React.FC<DigitalGridProps> = ({
  parallaxX = 0,
  parallaxY = 0,
}) => {
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
      {/* Deep Cyber Horizon Glow */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: `translate(-50%, -50%) translate(${parallaxX * 20}px, ${parallaxY * 15}px)`,
          width: '70vw',
          height: '450px',
          background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.18) 0%, rgba(157, 78, 221, 0.12) 40%, transparent 75%)',
          filter: 'blur(60px)',
          transition: 'transform 0.2s ease-out',
        }}
      />

      {/* 3D Perspective Grid Floor */}
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-20%',
          right: '-20%',
          height: '60%',
          perspective: '600px',
          overflow: 'hidden',
        }}
      >
        <div
          className="cyber-grid-plane"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(0, 240, 255, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 240, 255, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `rotateX(72deg) translateY(${parallaxY * 15}px)`,
            transformOrigin: '50% 100%',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 15%, transparent 95%)',
          }}
        />
      </div>

      {/* Cyber Horizon Line */}
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.7) 35%, rgba(157, 78, 221, 0.9) 50%, rgba(0, 240, 255, 0.7) 65%, transparent 100%)',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.6), 0 0 30px rgba(157, 78, 221, 0.4)',
        }}
      />

      <style>{`
        @keyframes gridTravel {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 50px;
          }
        }
        .cyber-grid-plane {
          animation: gridTravel 2.5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .cyber-grid-plane {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
