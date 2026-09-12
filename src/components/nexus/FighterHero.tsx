import React, { useState } from 'react';
import { Shield, Zap, Flame, Award, Crosshair } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useTheme } from '../../store/themeStore';
import darkFighterImg from '../../assets/images/dark_fighter.jpg';
import liteFighterImg from '../../assets/images/lite_fighter.jpg';

export interface FighterInfo {
  id: string;
  name: string;
  title: string;
  archetype: string;
  powerRating: number;
  winRate: number;
  stats: {
    attack: number;
    speed: number;
    defense: number;
    adaptiveIQ: number;
  };
  signatureMove: string;
  badge: string;
  badgeColor: string;
}

const FIGHTERS: FighterInfo[] = [
  {
    id: 'ronin',
    name: 'CYBER-RONIN',
    title: 'THE SHADOW MATRIX',
    archetype: 'DUAL VOID BLADES',
    powerRating: 9840,
    winRate: 91.4,
    stats: {
      attack: 98,
      speed: 95,
      defense: 82,
      adaptiveIQ: 96,
    },
    signatureMove: 'CHRONO VOID SLASH',
    badge: 'S-TIER // APEX',
    badgeColor: '#00f0ff',
  },
  {
    id: 'kaito',
    name: 'KAITO APEX',
    title: 'SOLAR TOKYO CHAMPION',
    archetype: 'PRECISION MECHA STRIKER',
    powerRating: 9620,
    winRate: 88.7,
    stats: {
      attack: 94,
      speed: 92,
      defense: 89,
      adaptiveIQ: 94,
    },
    signatureMove: 'HYPER PHOTON BURST',
    badge: 'SEASON 01 CHAMP',
    badgeColor: '#fbbf24',
  },
  {
    id: 'valkyrie',
    name: 'VALKYRIE-09',
    title: 'NEURAL HEAVY BULWARK',
    archetype: 'PLASMA COUNTER MATRIX',
    powerRating: 9450,
    winRate: 87.2,
    stats: {
      attack: 91,
      speed: 84,
      defense: 98,
      adaptiveIQ: 97,
    },
    signatureMove: 'AEGIS FORTRESS SMASH',
    badge: 'INVINCIBLE TIER',
    badgeColor: '#ff0077',
  },
];

interface FighterHeroProps {
  parallaxX?: number;
  parallaxY?: number;
  onFighterChange?: (fighter: FighterInfo) => void;
}

export const FighterHero: React.FC<FighterHeroProps> = ({
  parallaxX = 0,
  parallaxY = 0,
  onFighterChange,
}) => {
  const { isDark } = useTheme();
  const [selectedFighter, setSelectedFighter] = useState<FighterInfo>(FIGHTERS[0]);
  const [slashTrigger, setSlashTrigger] = useState(false);
  const { playSound } = useSound();

  const handleSelectFighter = (fighter: FighterInfo) => {
    if (fighter.id === selectedFighter.id) return;
    playSound('click');
    playSound('scan');
    setSelectedFighter(fighter);
    setSlashTrigger(true);
    setTimeout(() => setSlashTrigger(false), 500);
    if (onFighterChange) onFighterChange(fighter);
  };

  // Image displayed based on fighter and theme
  const heroImage = selectedFighter.id === 'kaito' || !isDark ? liteFighterImg : darkFighterImg;

  return (
    <div
      className="fighter-hero-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '620px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        transform: `translate(${parallaxX * 14}px, ${parallaxY * 14}px)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {/* ================= FIGHTER HERO STAGE / ARTWORK CARD ================= */}
      <div
        className="game-panel"
        style={{
          position: 'relative',
          height: '390px',
          borderRadius: 'var(--border-radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          border: `1.5px solid ${selectedFighter.badgeColor}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${selectedFighter.badgeColor}33`,
          animation: 'heroBreathing 6s ease-in-out infinite',
        }}
      >
        {/* Background Artwork */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%',
            filter: isDark ? 'brightness(0.92) contrast(1.1)' : 'brightness(1.02) contrast(1.05)',
            transform: `scale(1.04) translate(${parallaxX * -10}px, ${parallaxY * -10}px)`,
            transition: 'transform 0.4s ease, filter 0.4s ease',
          }}
        />

        {/* Dynamic Dark / Light Gradient Overlays for Readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(to top, rgba(3, 5, 9, 0.95) 15%, rgba(3, 5, 9, 0.35) 60%, rgba(3, 5, 9, 0.6) 100%)'
              : 'linear-gradient(to top, rgba(255, 255, 255, 0.95) 15%, rgba(255, 255, 255, 0.35) 60%, rgba(255, 255, 255, 0.6) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Blade Slash Energy Effect when switching fighters */}
        {slashTrigger && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(90deg, transparent, ${selectedFighter.badgeColor}, #ffffff, transparent)`,
              animation: 'bladeSlash 0.45s ease-out forwards',
              zIndex: 8,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Top Floating Badges */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: isDark ? 'rgba(7, 12, 22, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${selectedFighter.badgeColor}`,
              borderRadius: '20px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: selectedFighter.badgeColor,
              boxShadow: `0 0 16px ${selectedFighter.badgeColor}44`,
            }}
          >
            <Award size={14} />
            <span>{selectedFighter.badge}</span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '4px 10px',
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '6px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Flame size={14} color="#ff3366" />
            <span>WIN RATE: {selectedFighter.winRate}%</span>
          </div>
        </div>

        {/* Bottom Fighter Name & Power Rating Banner */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '0.24em',
                color: selectedFighter.badgeColor,
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {selectedFighter.title}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.3rem',
                fontWeight: 900,
                letterSpacing: '0.06em',
                color: isDark ? '#ffffff' : '#070b13',
                lineHeight: 1,
                textShadow: isDark
                  ? `0 0 25px ${selectedFighter.badgeColor}66`
                  : 'none',
              }}
            >
              {selectedFighter.name}
            </h3>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: isDark ? 'var(--text-sub)' : '#334155',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>COMBAT STYLE:</span>
              <span style={{ color: selectedFighter.badgeColor, fontWeight: 700 }}>
                {selectedFighter.archetype}
              </span>
            </div>
          </div>

          {/* Power Level Hologram Box */}
          <div
            style={{
              padding: '10px 16px',
              background: isDark ? 'rgba(5, 9, 18, 0.85)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${selectedFighter.badgeColor}`,
              borderRadius: 'var(--border-radius-sm)',
              textAlign: 'right',
              boxShadow: `0 0 20px ${selectedFighter.badgeColor}33`,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: isDark ? 'var(--text-muted)' : '#64748b',
              }}
            >
              POWER LEVEL
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.45rem',
                fontWeight: 900,
                color: selectedFighter.badgeColor,
              }}
            >
              {selectedFighter.powerRating.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FIGHTER SELECTOR TABS & COMBAT METERS ================= */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Fighter Switcher Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
          }}
        >
          {FIGHTERS.map(f => {
            const isSelected = f.id === selectedFighter.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleSelectFighter(f)}
                onMouseEnter={() => playSound('hover')}
                style={{
                  padding: '12px 8px',
                  background: isSelected
                    ? isDark
                      ? 'rgba(0, 240, 255, 0.16)'
                      : 'rgba(0, 102, 255, 0.15)'
                    : isDark
                    ? 'rgba(9, 14, 25, 0.65)'
                    : 'rgba(255, 255, 255, 0.75)',
                  border: `1.5px solid ${
                    isSelected ? f.badgeColor : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }`,
                  borderRadius: 'var(--border-radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  outline: 'none',
                  boxShadow: isSelected ? `0 0 20px ${f.badgeColor}44` : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: isSelected ? f.badgeColor : isDark ? '#ffffff' : '#0f172a',
                  }}
                >
                  {f.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-hud)',
                    fontSize: '0.65rem',
                    color: isDark ? 'var(--text-muted)' : '#64748b',
                    letterSpacing: '0.1em',
                  }}
                >
                  {f.signatureMove}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Combat Power Stat Bars */}
        <div
          className="game-panel"
          style={{
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            background: isDark ? 'rgba(7, 12, 22, 0.75)' : 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {[
            { label: 'ATK', val: selectedFighter.stats.attack, icon: <Flame size={13} />, color: '#ff2a5f' },
            { label: 'SPD', val: selectedFighter.stats.speed, icon: <Zap size={13} />, color: '#00f0ff' },
            { label: 'DEF', val: selectedFighter.stats.defense, icon: <Shield size={13} />, color: '#fbbf24' },
            { label: 'AI IQ', val: selectedFighter.stats.adaptiveIQ, icon: <Crosshair size={13} />, color: '#9d4edd' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-hud)',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: isDark ? 'var(--text-sub)' : '#475569',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: stat.color }}>
                  {stat.icon}
                  {stat.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: isDark ? '#ffffff' : '#0f172a' }}>
                  {stat.val}
                </span>
              </div>
              <div
                style={{
                  height: '5px',
                  background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${stat.val}%`,
                    height: '100%',
                    background: stat.color,
                    boxShadow: `0 0 10px ${stat.color}`,
                    borderRadius: '3px',
                    transition: 'width 0.4s ease-out',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
