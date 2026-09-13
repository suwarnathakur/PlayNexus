import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { PlayerPreview3D } from '../../components/game/PlayerPreview3D';
import { GlowButton } from '../../components/common/GlowButton';
import { Scanline } from '../../components/effects/Scanline';
import { useSound } from '../../hooks/useSound';
import { useCostumeStore } from '../../store/costumeStore';
import {
  Swords,
  Lock,
  ArrowRight,
  ArrowLeft,
  Zap,
  Crosshair,
  Shield,
  Flame,
  HelpCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface FightingStyle {
  id: string;
  name: string;
  archetype: string;
  difficulty: number | string;
  difficultyLabel: string;
  isPlayable: boolean;
  accentColor: string;
  icon: React.ReactNode;
  tagline: string;
  description: string;
  stats: {
    power: number;
    speed: number;
    defense: number;
    adaptability: number;
  };
}

const FIGHTING_STYLES: FightingStyle[] = [
  {
    id: 'melee',
    name: 'FOX McCLOUD',
    archetype: 'STAR FOX ACE // MELEE',
    difficulty: 3,
    difficultyLabel: 'APEX AGILITY ★★★☆☆',
    isPlayable: true,
    accentColor: '#00f0ff',
    icon: <Zap size={22} />,
    tagline: 'High-speed frame-1 Reflector Shine, illusion dashes, and rapid strikes',
    description:
      'The legendary Star Fox ace fighter pilot from Super Smash Bros. Melee. Equipped with bionic metal combat boots, tactical comms headset, white flight jacket, and the iconic hexagonal Reflector shield.',
    stats: {
      power: 88,
      speed: 98,
      defense: 75,
      adaptability: 96,
    },
  },
  {
    id: 'archery',
    name: 'ARCHERY',
    archetype: 'PLASMA SNIPER',
    difficulty: 4,
    difficultyLabel: 'TACTICAL PRECISION ★★★★☆',
    isPlayable: true,
    accentColor: '#9d4edd',
    icon: <Crosshair size={22} />,
    tagline: 'Precision long-range plasma arrows, energy buckler, and zoning',
    description:
      'High-tech tactical ranger equipped with the Vortex Cyber Plasma Bow, energy quiver, and cybernetic sniper visor. Features high-velocity primary arrows, multi-arrow plasma volleys, and agile combat evasions.',
    stats: {
      power: 92,
      speed: 86,
      defense: 74,
      adaptability: 92,
    },
  },
  {
    id: 'wrestling',
    name: 'WRESTLING',
    archetype: 'TITAN GRAPPLER',
    difficulty: 5,
    difficultyLabel: 'EXPERT ★★★★★',
    isPlayable: false,
    accentColor: '#ff0055',
    icon: <Flame size={22} />,
    tagline: 'Heavy mechanical throws and ground suppression',
    description:
      'Extreme close-range juggernaut with hydraulic submission clamps and ground-pounding kinetic blasts.',
    stats: {
      power: 98,
      speed: 55,
      defense: 95,
      adaptability: 74,
    },
  },
  {
    id: 'sword',
    name: 'SWORD',
    archetype: 'CYBER BLADE',
    difficulty: 4,
    difficultyLabel: 'HARD ★★★★☆',
    isPlayable: false,
    accentColor: '#00ff9d',
    icon: <Swords size={22} />,
    tagline: 'High-frequency particle edge slices and directional parries',
    description:
      'Deadly slashing velocity. Channels vibrational energy into the blade to cut through defensive barriers.',
    stats: {
      power: 88,
      speed: 94,
      defense: 68,
      adaptability: 88,
    },
  },
  {
    id: 'defense',
    name: 'DEFENSE',
    archetype: 'AEGIS FORTRESS',
    difficulty: 3,
    difficultyLabel: 'NORMAL ★★★☆☆',
    isPlayable: false,
    accentColor: '#fbbf24',
    icon: <Shield size={22} />,
    tagline: 'Energy barrier absorption and counter-blast release',
    description:
      'Impenetrable defense matrix that absorbs incoming melee damage and returns it as a kinetic shockwave.',
    stats: {
      power: 70,
      speed: 60,
      defense: 99,
      adaptability: 85,
    },
  },
  {
    id: 'locked',
    name: '??? LOCKED',
    archetype: 'CLASSIFIED // REDACTED',
    difficulty: '?',
    difficultyLabel: 'UNKNOWN ?????',
    isPlayable: false,
    accentColor: '#64748b',
    icon: <HelpCircle size={22} />,
    tagline: 'Autonomous AI synthesis prototype',
    description:
      'A prototype fighting archetype generated dynamically by the PlayNexus neural engine. Requires 50 arena victories to unlock.',
    stats: {
      power: 100,
      speed: 100,
      defense: 100,
      adaptability: 100,
    },
  },
];

export const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  const { playSound } = useSound();
  const storedStyle = useCostumeStore((s) => s.selectedStyle);
  const setStoreStyle = useCostumeStore((s) => s.setStyle);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(storedStyle || 'melee');
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const selectedStyle =
    FIGHTING_STYLES.find((s) => s.id === selectedStyleId) || FIGHTING_STYLES[0];

  const handleSelect = (style: FightingStyle) => {
    if (style.isPlayable) {
      playSound('click');
      setSelectedStyleId(style.id);
      if (style.id === 'melee' || style.id === 'archery') {
        setStoreStyle(style.id);
      }
      setLockedNotice(null);
    } else {
      playSound('denied');
      setSelectedStyleId(style.id);
      setLockedNotice(
        `[ACCESS RESTRICTED] ${style.name} is currently locked for this tournament tier. FOX McCLOUD (MELEE) and ARCHERY (PLASMA SNIPER) are cleared for deployment.`
      );
    }
  };

  const handleContinue = () => {
    if (!selectedStyle.isPlayable) {
      playSound('denied');
      return;
    }
    if (selectedStyle.id === 'melee' || selectedStyle.id === 'archery') {
      setStoreStyle(selectedStyle.id);
    }
    playSound('granted');
    navigate('/pre-fight');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#05070c',
        color: '#ffffff',
        overflowX: 'hidden',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Scanline />

      {/* Futuristic Background Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, rgba(157, 78, 221, 0.05) 50%, transparent 75%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main Page Layout Container */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '24px 32px 48px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: '28px',
        }}
      >
        {/* ================= HEADER & NAVIGATION ================= */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Logo size="md" />
            <div style={{ borderLeft: '1px solid rgba(0, 240, 255, 0.25)', paddingLeft: '16px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.7rem',
                  color: 'var(--accent-cyan, #00f0ff)',
                  letterSpacing: '0.14em',
                }}
              >
                STAGING PROTOCOL // STEP 01
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.84rem',
                  color: '#ffffff',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                }}
              >
                FIGHTING STYLE ARCHITECTURE
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <GlowButton variant="secondary" onClick={() => navigate('/')}>
              <ArrowLeft size={16} />
              <span>RETURN HOME</span>
            </GlowButton>

            <button
              type="button"
              id="continue-button"
              onClick={handleContinue}
              disabled={!selectedStyle.isPlayable}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '11px 28px',
                background: selectedStyle.isPlayable
                  ? 'linear-gradient(135deg, #00f0ff, #0077ff)'
                  : 'rgba(255, 255, 255, 0.06)',
                border: selectedStyle.isPlayable
                  ? '1px solid rgba(255, 255, 255, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: selectedStyle.isPlayable ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '0.9rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                cursor: selectedStyle.isPlayable ? 'pointer' : 'not-allowed',
                boxShadow: selectedStyle.isPlayable
                  ? '0 0 25px rgba(0, 240, 255, 0.4)'
                  : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span>CONTINUE</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </header>

        {/* ================= PAGE TITLE BANNER ================= */}
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
              borderRadius: '20px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.72rem',
              color: 'var(--accent-cyan, #00f0ff)',
              letterSpacing: '0.12em',
              marginBottom: '8px',
            }}
          >
            <Activity size={13} />
            <span>NEURAL REPERTOIRE CALIBRATION</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            CHOOSE YOUR FIGHTING STYLE
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.95rem',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '6px',
            }}
          >
            Select your combat archetype. The AI opponent observes this profile to formulate real-time counter strategies.
          </p>
        </div>

        {/* Locked Notice Banner */}
        {lockedNotice && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              background: 'rgba(255, 51, 102, 0.12)',
              border: '1px solid rgba(255, 51, 102, 0.4)',
              borderRadius: '10px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.78rem',
              color: '#ff3366',
              animation: 'shakeAlert 0.35s ease-in-out',
            }}
          >
            <AlertTriangle size={18} />
            <span>{lockedNotice}</span>
          </div>
        )}

        {/* ================= MAIN SPLIT VIEWPORT ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* LEFT: 6 FIGHTING STYLE CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {FIGHTING_STYLES.map((style) => {
              const isSelected = style.id === selectedStyleId;

              return (
                <div
                  key={style.id}
                  onClick={() => handleSelect(style)}
                  onMouseEnter={() => playSound('hover')}
                  style={{
                    position: 'relative',
                    padding: '20px',
                    borderRadius: '16px',
                    background: isSelected
                      ? 'rgba(15, 23, 42, 0.95)'
                      : 'rgba(10, 15, 26, 0.75)',
                    backdropFilter: 'blur(16px)',
                    border: isSelected
                      ? `2px solid ${style.accentColor}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isSelected
                      ? `0 0 25px ${style.accentColor}35, inset 0 0 15px ${style.accentColor}15`
                      : '0 8px 24px rgba(0,0,0,0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    opacity: style.isPlayable ? 1 : 0.72,
                  }}
                >
                  {/* Status Tag (PLAYABLE vs LOCKED) */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: style.accentColor,
                      }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: `${style.accentColor}18`,
                          border: `1px solid ${style.accentColor}40`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {style.icon}
                      </div>
                      <div>
                        <h3
                          style={{
                            fontFamily: 'var(--font-display, sans-serif)',
                            fontSize: '1.15rem',
                            fontWeight: 900,
                            letterSpacing: '0.08em',
                            margin: 0,
                            color: isSelected ? '#ffffff' : '#e2e8f0',
                          }}
                        >
                          {style.name}
                        </h3>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '0.68rem',
                            color: style.accentColor,
                          }}
                        >
                          {style.archetype}
                        </div>
                      </div>
                    </div>

                    {style.isPlayable ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(0, 255, 157, 0.12)',
                          border: '1px solid rgba(0, 255, 157, 0.4)',
                          color: '#00ff9d',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        READY
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 51, 102, 0.12)',
                          border: '1px solid rgba(255, 51, 102, 0.3)',
                          color: '#ff3366',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: '0.64rem',
                          fontWeight: 700,
                        }}
                      >
                        <Lock size={12} />
                        LOCKED
                      </span>
                    )}
                  </div>

                  {/* Difficulty Meter */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontFamily: 'var(--font-hud, monospace)',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary, #94a3b8)',
                      marginBottom: '8px',
                    }}
                  >
                    <span>DIFFICULTY:</span>
                    <span style={{ color: style.accentColor, fontFamily: 'var(--font-mono)' }}>
                      {style.difficultyLabel}
                    </span>
                  </div>

                  {/* Tagline / Brief Description */}
                  <p
                    style={{
                      fontFamily: 'var(--font-body, sans-serif)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary, #94a3b8)',
                      lineHeight: 1.45,
                      margin: 0,
                    }}
                  >
                    {style.tagline}
                  </p>

                  {/* Selected Indicator Bottom Bar */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '20%',
                        right: '20%',
                        height: '3px',
                        background: style.accentColor,
                        boxShadow: `0 0 10px ${style.accentColor}`,
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: 3D PLAYER PREVIEW & INTEL PANEL */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* 3D Model Viewport Card */}
            <div
              className="cyber-panel"
              style={{
                position: 'relative',
                height: '420px',
                borderRadius: '20px',
                background: 'rgba(10, 15, 26, 0.85)',
                border: `1px solid ${selectedStyle.accentColor}50`,
                boxShadow: `0 0 35px ${selectedStyle.accentColor}20`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayerPreview3D
                glowColor={selectedStyle.accentColor}
                isMelee={selectedStyle.id === 'melee'}
                selectedStyle={selectedStyle.id as 'melee' | 'archery'}
              />
            </div>

            {/* Selected Style Detailed Intel Card */}
            <div
              className="cyber-panel"
              style={{
                padding: '24px',
                borderRadius: '20px',
                background: 'rgba(10, 15, 26, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: selectedStyle.accentColor }}>
                    SELECTED ARCHETYPE
                  </div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display, sans-serif)',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      margin: 0,
                      color: '#ffffff',
                    }}
                  >
                    {selectedStyle.name} // {selectedStyle.archetype}
                  </h2>
                </div>

                {selectedStyle.isPlayable ? (
                  <span style={{ color: '#00ff9d', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                    ● CLEARED
                  </span>
                ) : (
                  <span style={{ color: '#ff3366', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
                    🔒 LOCKED
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.6, margin: 0 }}>
                {selectedStyle.description}
              </p>

              {/* Combat Attribute Sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'KINETIC POWER', val: selectedStyle.stats.power },
                  { label: 'ATTACK VELOCITY', val: selectedStyle.stats.speed },
                  { label: 'BARRIER DEFENSE', val: selectedStyle.stats.defense },
                  { label: 'DNA ADAPTABILITY', val: selectedStyle.stats.adaptability },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        fontFamily: 'var(--font-hud)',
                        color: 'var(--text-secondary, #94a3b8)',
                        marginBottom: '4px',
                      }}
                    >
                      <span>{stat.label}</span>
                      <span style={{ color: selectedStyle.accentColor, fontFamily: 'var(--font-mono)' }}>
                        {stat.val}%
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${stat.val}%`,
                          height: '100%',
                          background: selectedStyle.accentColor,
                          boxShadow: `0 0 8px ${selectedStyle.accentColor}`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Confirm Action */}
              <button
                type="button"
                id="bottom-continue-button"
                onClick={handleContinue}
                disabled={!selectedStyle.isPlayable}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: selectedStyle.isPlayable
                    ? 'linear-gradient(135deg, #00f0ff, #0077ff)'
                    : 'rgba(255, 255, 255, 0.06)',
                  border: selectedStyle.isPlayable
                    ? '1px solid rgba(255, 255, 255, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  color: selectedStyle.isPlayable ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '1rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  cursor: selectedStyle.isPlayable ? 'pointer' : 'not-allowed',
                  boxShadow: selectedStyle.isPlayable
                    ? '0 0 25px rgba(0, 240, 255, 0.4)'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{selectedStyle.isPlayable ? 'DEPLOY MELEE & CONTINUE' : 'STYLE LOCKED'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shakeAlert {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
