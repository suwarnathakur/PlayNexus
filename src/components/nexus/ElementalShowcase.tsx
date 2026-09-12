import React, { useState } from 'react';
import { Flame, Droplets, Trees, Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useTheme } from '../../store/themeStore';
import flameImg from '../../assets/images/flame_creature.jpg';
import riverImg from '../../assets/images/river_creature.jpg';
import forestImg from '../../assets/images/forest_creature.jpg';

export interface ElementalCreature {
  id: string;
  name: string;
  element: 'FLAME' | 'RIVER' | 'FOREST';
  title: string;
  image: string;
  color: string;
  glowColor: string;
  bgGradient: string;
  stats: {
    attack: number;
    health: number;
    speed: number;
  };
  specialAbility: string;
  lore: string;
}

export const CREATURES: ElementalCreature[] = [
  {
    id: 'flame',
    name: 'IGNIS',
    element: 'FLAME',
    title: 'INFERNO GUARDIAN',
    image: flameImg,
    color: '#ff5b36',
    glowColor: 'rgba(255, 91, 54, 0.65)',
    bgGradient: 'linear-gradient(180deg, rgba(255, 91, 54, 0.18) 0%, rgba(20, 10, 8, 0.9) 100%)',
    stats: { attack: 96, health: 84, speed: 92 },
    specialAbility: 'METEOR AURA',
    lore: 'Born from volcanic heartstones, channeling pure combustion energy into explosive attacks.',
  },
  {
    id: 'river',
    name: 'AQUA',
    element: 'RIVER',
    title: 'CRYSTAL TIDE MYSTIC',
    image: riverImg,
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    bgGradient: 'linear-gradient(180deg, rgba(56, 189, 248, 0.18) 0%, rgba(8, 16, 25, 0.9) 100%)',
    stats: { attack: 88, health: 95, speed: 94 },
    specialAbility: 'TSUNAMI SURGE',
    lore: 'Spiritual guardians of sacred crystal lagoons, manipulating water droplets to heal and strike.',
  },
  {
    id: 'forest',
    name: 'SYLVA',
    element: 'FOREST',
    title: 'ANCIENT GROVE SENTINEL',
    image: forestImg,
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.65)',
    bgGradient: 'linear-gradient(180deg, rgba(34, 197, 94, 0.18) 0%, rgba(8, 22, 14, 0.9) 100%)',
    stats: { attack: 90, health: 98, speed: 86 },
    specialAbility: 'NATURE SHIELD',
    lore: 'Keepers of the sacred enchanted valley balance, wielding floral magic and deep roots.',
  },
];

interface ElementalShowcaseProps {
  onSelectCreature?: (creature: ElementalCreature) => void;
  activeCreatureId?: string;
}

export const ElementalShowcase: React.FC<ElementalShowcaseProps> = ({
  onSelectCreature,
  activeCreatureId = 'flame',
}) => {
  const [selectedId, setSelectedId] = useState<string>(activeCreatureId);
  const { playSound } = useSound();
  const { isDark } = useTheme();

  const handleSelect = (creature: ElementalCreature) => {
    setSelectedId(creature.id);
    playSound('click');
    playSound('granted');
    if (onSelectCreature) onSelectCreature(creature);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: '680px',
      }}
    >
      {/* Heading matching the Dribbble video: "What are Chumbi" / "Choose Your Guardian" */}
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(5, 150, 105, 0.12)',
            borderRadius: 'var(--border-radius-pill)',
            border: '1px solid var(--color-forest)',
            color: 'var(--color-forest)',
            fontFamily: 'var(--font-game)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            marginBottom: '10px',
          }}
        >
          <Sparkles size={14} />
          <span>MYTHICAL CREATURE COMBAT</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: '2.8rem',
            fontWeight: 800,
            color: isDark ? '#ffffff' : '#0a1a12',
            letterSpacing: '0.02em',
            lineHeight: 1.15,
          }}
        >
          Choose Your <span style={{ color: 'var(--color-flame)' }}>Elemental</span> Guardian
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.96rem',
            color: isDark ? 'var(--text-sub)' : '#475569',
            marginTop: '8px',
            lineHeight: 1.6,
          }}
        >
          Mythical guardians of the lush enchanted valley. They form spiritual bonds with fighters and adapt in the combat arena.
        </p>
      </div>

      {/* 3 Elemental Creature Cards (Flame, River, Forest) — Exactly as in the Dribbble video */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {CREATURES.map(creature => {
          const isSelected = creature.id === selectedId;
          const getIcon = () => {
            switch (creature.element) {
              case 'FLAME':
                return <Flame size={16} color="#ffffff" />;
              case 'RIVER':
                return <Droplets size={16} color="#ffffff" />;
              case 'FOREST':
                return <Trees size={16} color="#ffffff" />;
            }
          };

          return (
            <div
              key={creature.id}
              onClick={() => handleSelect(creature)}
              onMouseEnter={() => playSound('hover')}
              className="chumbi-card"
              style={{
                cursor: 'pointer',
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '14px',
                background: isSelected
                  ? creature.bgGradient
                  : isDark
                  ? 'rgba(12, 22, 16, 0.75)'
                  : 'rgba(255, 255, 255, 0.85)',
                border: `2.5px solid ${isSelected ? creature.color : 'var(--border-card)'}`,
                boxShadow: isSelected
                  ? `0 16px 40px rgba(0, 0, 0, 0.4), 0 0 35px ${creature.glowColor}`
                  : 'none',
                transform: isSelected ? 'scale(1.03) translateY(-4px)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Creature Image with Floating Bobbing Motion */}
              <div
                style={{
                  position: 'relative',
                  width: '135px',
                  height: '135px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Glowing Aura Ring Behind Creature */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '10px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${creature.color} 0%, transparent 70%)`,
                    opacity: isSelected ? 0.65 : 0.25,
                    filter: 'blur(12px)',
                    animation: 'auraPulse 3s ease-in-out infinite',
                  }}
                />

                {/* Animated Creature Avatar */}
                <img
                  src={creature.image}
                  alt={creature.name}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'contain',
                    borderRadius: '50%',
                    filter: isSelected
                      ? `drop-shadow(0 0 16px ${creature.color})`
                      : 'none',
                    animation: isSelected
                      ? 'floatCreature 3.4s ease-in-out infinite'
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}
                />
              </div>

              {/* Elemental Title Banner (Matching Dribbble Video typography: FLAME, RIVER, FOREST) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-game)',
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: isSelected ? creature.color : isDark ? '#ffffff' : '#0f2017',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: creature.color,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 10px ${creature.color}`,
                    }}
                  >
                    {getIcon()}
                  </span>
                  <span>{creature.element}</span>
                </div>

                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: isDark ? 'var(--text-muted)' : '#64748b',
                    textTransform: 'uppercase',
                  }}
                >
                  {creature.title}
                </span>
              </div>

              {/* Mini Power Metrics */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  paddingTop: '8px',
                  borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: isDark ? 'var(--text-sub)' : '#334155',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Zap size={13} color={creature.color} /> {creature.stats.attack}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Heart size={13} color="#ff3366" /> {creature.stats.health}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Shield size={13} color="var(--color-gold)" /> {creature.stats.speed}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
