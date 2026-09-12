import React from 'react';
import { useTheme } from '../../store/themeStore';
import nightCityImg from '../../assets/images/cyberpunk_city_night.jpg';
import dayCityImg from '../../assets/images/cyberpunk_city_day.jpg';

interface CyberCityBackgroundProps {
  parallaxX?: number;
  parallaxY?: number;
}

export const CyberCityBackground: React.FC<CyberCityBackgroundProps> = ({
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
      {/* Background Image Layer with Ken-Burns and Mouse Parallax (mirrored so adventurer is on the left) */}
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `url(${isDark ? nightCityImg : dayCityImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          transform: `scaleX(-1) scale(1.05) translate(${parallaxX * 18}px, ${parallaxY * -12}px)`,
          transition: 'transform 0.25s ease-out, filter 0.5s ease',
          animation: 'cityBreathing 14s ease-in-out infinite',
        }}
      />

      {/* Dynamic Theme Gradient Overlay for Contrast and Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'radial-gradient(ellipse at 75% 50%, rgba(5, 8, 17, 0.4) 0%, rgba(5, 8, 17, 0.82) 70%, #050811 100%)'
            : 'radial-gradient(ellipse at 75% 50%, rgba(240, 246, 255, 0.35) 0%, rgba(240, 246, 255, 0.78) 70%, #f0f6ff 100%)',
          transition: 'background 0.5s ease',
        }}
      />

      {/* Animated Flying Sky-Car 1 (Cyan light beam streak) */}
      {isDark && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '26%',
              left: '-10%',
              width: '120px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #00f0ff, #ffffff)',
              boxShadow: '0 0 14px #00f0ff, 0 0 28px #00f0ff',
              borderRadius: '2px',
              animation: 'skyCar1 7s cubic-bezier(0.25, 1, 0.5, 1) infinite',
            }}
          />

          {/* Flying Sky-Car 2 (Magenta light beam streak) */}
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '-15%',
              width: '90px',
              height: '2.5px',
              background: 'linear-gradient(90deg, transparent, #ff007f, #ffffff)',
              boxShadow: '0 0 14px #ff007f, 0 0 24px #ff007f',
              borderRadius: '2px',
              animation: 'skyCar2 10s cubic-bezier(0.25, 1, 0.5, 1) infinite 3.5s',
            }}
          />

          {/* Flying Sky-Car 3 (High Altitude) */}
          <div
            style={{
              position: 'absolute',
              top: '18%',
              right: '-10%',
              width: '70px',
              height: '2px',
              background: 'linear-gradient(270deg, transparent, #fbbf24, #ffffff)',
              boxShadow: '0 0 10px #fbbf24',
              borderRadius: '2px',
              animation: 'skyCar3 9s ease-in-out infinite 5s',
            }}
          />

          {/* Searchlight Beam 1 */}
          <div
            style={{
              position: 'absolute',
              bottom: '30%',
              left: '28%',
              width: '80px',
              height: '80vh',
              background: 'linear-gradient(to top, rgba(0, 240, 255, 0.16), transparent)',
              transformOrigin: 'bottom center',
              animation: 'searchlightSweep1 8s ease-in-out infinite alternate',
              filter: 'blur(10px)',
              pointerEvents: 'none',
            }}
          />

          {/* Searchlight Beam 2 */}
          <div
            style={{
              position: 'absolute',
              bottom: '35%',
              left: '42%',
              width: '60px',
              height: '75vh',
              background: 'linear-gradient(to top, rgba(255, 0, 127, 0.14), transparent)',
              transformOrigin: 'bottom center',
              animation: 'searchlightSweep2 11s ease-in-out infinite alternate 2s',
              filter: 'blur(12px)',
              pointerEvents: 'none',
            }}
          />

          {/* Neon Hotspot Billboard Pulse (Left Tower) */}
          <div
            style={{
              position: 'absolute',
              top: '40%',
              left: '12%',
              width: '65px',
              height: '110px',
              background: 'radial-gradient(circle, rgba(255, 0, 127, 0.35) 0%, transparent 70%)',
              animation: 'neonHotspot 2.5s ease-in-out infinite alternate',
              filter: 'blur(8px)',
            }}
          />

          {/* Neon Hotspot Billboard Pulse (Center Tower) */}
          <div
            style={{
              position: 'absolute',
              top: '48%',
              left: '32%',
              width: '80px',
              height: '90px',
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, transparent 70%)',
              animation: 'neonHotspot 3.2s ease-in-out infinite alternate 1.2s',
              filter: 'blur(8px)',
            }}
          />
        </>
      )}

      {/* Sunbeam Flares in Lite Mode */}
      {!isDark && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '35%',
            width: '40vw',
            height: '80vh',
            background: 'radial-gradient(ellipse at top center, rgba(251, 191, 36, 0.22) 0%, rgba(255, 255, 255, 0) 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />
      )}

      <style>{`
        @keyframes cityBreathing {
          0%, 100% {
            transform: scaleX(-1) scale(1.04) translate(${parallaxX * 18}px, ${parallaxY * -12}px);
          }
          50% {
            transform: scaleX(-1) scale(1.07) translate(${parallaxX * 18}px, ${parallaxY * -12 - 6}px);
          }
        }
        @keyframes skyCar1 {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(125vw) translateY(-40px);
            opacity: 0;
          }
        }
        @keyframes skyCar2 {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(120vw) translateY(30px);
            opacity: 0;
          }
        }
        @keyframes skyCar3 {
          0% {
            transform: translateX(0) translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            transform: translateX(-110vw) translateY(-25px);
            opacity: 0;
          }
        }
        @keyframes searchlightSweep1 {
          0% {
            transform: rotate(-24deg);
          }
          100% {
            transform: rotate(20deg);
          }
        }
        @keyframes searchlightSweep2 {
          0% {
            transform: rotate(22deg);
          }
          100% {
            transform: rotate(-18deg);
          }
        }
        @keyframes neonHotspot {
          0% {
            opacity: 0.4;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.95;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};
