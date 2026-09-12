import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { Scanline } from '../../components/effects/Scanline';
import { GlowButton } from '../../components/common/GlowButton';
import { useAuth } from '../../hooks/useAuth';
import { useSound } from '../../hooks/useSound';
import { CameraWeaponScanner } from '../../components/scanner/CameraWeaponScanner';
import type { ScannedWeaponResult } from '../../services/api';
import {
  Swords,
  ArrowLeft,
  Camera,
  Activity,
  Zap,
  Sparkles,
  Play,
} from 'lucide-react';

export const PreFight: React.FC = () => {
  const navigate = useNavigate();
  const { player } = useAuth();
  const { playSound } = useSound();

  // Weapon Loadout state (Defaults to Tome of Wisdom from Book scan)
  const [selectedWeapon, setSelectedWeapon] = useState<string>('TOME OF WISDOM');
  const [weaponType, setWeaponType] = useState<string>('Staff');
  const [weaponBonus, setWeaponBonus] = useState<string>('+15% Ability Power');
  const [detectedItem, setDetectedItem] = useState<string>('Book');
  const [weaponRarity, setWeaponRarity] = useState<string>('MYTHICAL');
  const [weaponPerk, setWeaponPerk] = useState<string>('BOOK SYNTHESIS // +15% Ability Power (Staff)');

  // Camera Scanner modal state
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Cinematic Arena Transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [warpCountdown, setWarpCountdown] = useState(3);

  // Restore saved loadout on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('playnexus_equipped_weapon');
      if (stored) {
        const parsed: ScannedWeaponResult = JSON.parse(stored);
        setSelectedWeapon(parsed.weapon);
        setWeaponType(parsed.type);
        setWeaponBonus(parsed.bonus);
        setDetectedItem(parsed.detectedItem);
        setWeaponRarity(parsed.rarity || 'LEGENDARY');
        setWeaponPerk(`${parsed.detectedItem.toUpperCase()} SYNTHESIS // ${parsed.bonus} (${parsed.type})`);
      } else {
        // Seed initial default loadout
        const defaultWeapon: ScannedWeaponResult = {
          detectedItem: 'Book',
          weapon: 'Tome of Wisdom',
          type: 'Staff',
          bonus: '+15% Ability Power',
          powerBonusPercent: 15,
          lore: 'Ancient codex inscribed with arcane quantum telemetry, amplifying strike resonance.',
          rarity: 'MYTHICAL',
          source: 'DEFAULT_SYNTHESIS',
        };
        localStorage.setItem('playnexus_equipped_weapon', JSON.stringify(defaultWeapon));
      }
    } catch {
      // Ignored
    }
  }, []);

  const handleEquipWeapon = (weapon: ScannedWeaponResult) => {
    setSelectedWeapon(weapon.weapon);
    setWeaponType(weapon.type);
    setWeaponBonus(weapon.bonus);
    setDetectedItem(weapon.detectedItem);
    setWeaponRarity(weapon.rarity);
    setWeaponPerk(`${weapon.detectedItem.toUpperCase()} SYNTHESIS // ${weapon.bonus} (${weapon.type})`);

    try {
      localStorage.setItem('playnexus_equipped_weapon', JSON.stringify(weapon));
    } catch {
      // Ignored
    }
  };

  const handleReady = () => {
    playSound('granted');
    setIsTransitioning(true);

    // 3-second cinematic countdown warp into 3D arena
    let current = 3;
    setWarpCountdown(3);

    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setWarpCountdown(current);
        playSound('pulse');
      } else {
        clearInterval(interval);
        playSound('scan');
        setTimeout(() => {
          navigate('/arena');
        }, 400);
      }
    }, 700);
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

      {/* Cyber Ambient Nebula Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '75vw',
          height: '500px',
          background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.08) 0%, rgba(157, 78, 221, 0.08) 45%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

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
          gap: '24px',
        }}
      >
        {/* ================= HEADER ================= */}
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
                  color: 'var(--status-success, #00ff9d)',
                  letterSpacing: '0.14em',
                }}
              >
                PRE-FIGHT LOBBY // MATCH READY
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
                COMBAT LOADOUT & OPPONENT TELEMETRY
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <GlowButton variant="secondary" onClick={() => navigate('/character-select')}>
              <ArrowLeft size={16} />
              <span>BACK TO STYLES</span>
            </GlowButton>
          </div>
        </header>

        {/* ================= PAGE TITLE ================= */}
        <div style={{ textAlign: 'center', margin: '4px 0 12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 14px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '20px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.72rem',
              color: 'var(--accent-cyan, #00f0ff)',
              letterSpacing: '0.14em',
              marginBottom: '8px',
            }}
          >
            <Activity size={13} className="animate-pulse" />
            <span>NEURAL ENCOUNTER // ROUND 01</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            PRE-COMBAT SYNC & ROOM SCAN
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body, sans-serif)',
              fontSize: '0.92rem',
              color: 'var(--text-secondary, #94a3b8)',
              marginTop: '4px',
            }}
          >
            Verify your operative loadout and scan your physical room for experimental weapon synthesis.
          </p>
        </div>

        {/* ================= PLAYER VS AI MATCHUP GRID ================= */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) auto minmax(320px, 1fr)',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          {/* ================= PLAYER CARD ================= */}
          <div
            className="cyber-panel"
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'rgba(10, 15, 26, 0.85)',
              border: '1.5px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 0 30px rgba(0, 240, 255, 0.15)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.72rem',
                  color: 'var(--accent-cyan, #00f0ff)',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                OPERATIVE // CHALLENGER
              </span>

              <span
                style={{
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.78rem',
                  color: '#00ff9d',
                  fontWeight: 700,
                }}
              >
                LEVEL 14 // TITAN III
              </span>
            </div>

            {/* Fighter Name & Style */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  margin: 0,
                  color: '#ffffff',
                  letterSpacing: '0.04em',
                }}
              >
                {player?.codename || 'CYBER_STRIKER'}
              </h2>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.78rem',
                  color: 'var(--accent-cyan, #00f0ff)',
                  marginTop: '2px',
                }}
              >
                FIGHTING STYLE: MELEE BRAWLER
              </div>
            </div>

            {/* Health Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontFamily: 'var(--font-hud)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>OPERATIVE INTEGRITY</span>
                <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>100 HP // 100%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #00f0ff, #0077ff)', boxShadow: '0 0 10px #00f0ff' }} />
              </div>
            </div>

            {/* Selected Weapon Box with Scanned Real-World Metadata */}
            <div
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(157, 78, 221, 0.08) 100%)',
                border: '1.5px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  EQUIPPED WEAPON:
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.64rem',
                    color: '#000000',
                    background: '#00ff9d',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                  }}
                >
                  {weaponRarity}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
                  {selectedWeapon}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#00f0ff', fontWeight: 700 }}>
                  TYPE: {weaponType.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 255, 157, 0.1)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0, 255, 157, 0.25)' }}>
                <Zap size={14} color="#00ff9d" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: '#00ff9d', fontWeight: 700 }}>
                  BONUS: {weaponBonus}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  ({detectedItem} detected)
                </span>
              </div>
            </div>
          </div>

          {/* ================= VS CENTER PILLAR ================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'radial-gradient(circle at center, rgba(255, 51, 102, 0.25) 0%, rgba(10, 15, 26, 0.95) 75%)',
                border: '2px solid rgba(255, 51, 102, 0.6)',
                boxShadow: '0 0 25px rgba(255, 51, 102, 0.4), inset 0 0 15px rgba(255, 51, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 900,
                color: '#ff3366',
                letterSpacing: '0.12em',
              }}
            >
              VS
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.14em',
                textAlign: 'center',
              }}
            >
              ROUND 01
            </div>
          </div>

          {/* ================= AI CARD ================= */}
          <div
            className="cyber-panel"
            style={{
              padding: '28px',
              borderRadius: '20px',
              background: 'rgba(10, 15, 26, 0.85)',
              border: '1.5px solid rgba(255, 51, 102, 0.4)',
              boxShadow: '0 0 30px rgba(255, 51, 102, 0.15)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.72rem',
                  color: '#ff3366',
                  background: 'rgba(255, 51, 102, 0.1)',
                  border: '1px solid rgba(255, 51, 102, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                NEURAL CORE // DEFENDER
              </span>

              <span
                style={{
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.78rem',
                  color: 'var(--accent-violet)',
                  fontWeight: 700,
                }}
              >
                TIER: APEX AUTONOMOUS
              </span>
            </div>

            {/* AI Name & Personality */}
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  margin: 0,
                  color: '#ff3366',
                  letterSpacing: '0.04em',
                }}
              >
                NEXUS AI // ARCHON
              </h2>
              <div
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.78rem',
                  color: 'var(--accent-violet)',
                  marginTop: '2px',
                }}
              >
                PERSONALITY: RUTHLESS STRATEGIST // ADAPTIVE
              </div>
            </div>

            {/* Intelligence Status */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontFamily: 'var(--font-hud)', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>INTELLIGENCE STATUS</span>
                <span style={{ color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>SYNAPSE SYNC: 99.4%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '99.4%', height: '100%', background: 'linear-gradient(90deg, #9d4edd, #ff3366)', boxShadow: '0 0 10px #ff3366' }} />
              </div>
            </div>

            {/* Strategy Status Box */}
            <div
              style={{
                padding: '14px 16px',
                background: 'rgba(255, 51, 102, 0.05)',
                border: '1px dashed rgba(255, 51, 102, 0.35)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  STRATEGY PROTOCOL:
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#ff3366', fontWeight: 700 }}>
                  OBSERVING
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                PREDATORY COUNTER-STRIKE
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Detects repeated player jabs and automatically calibrates parry timing.
              </div>
            </div>
          </div>
        </div>

        {/* ================= ARENA CARD ================= */}
        <div
          className="cyber-panel"
          style={{
            padding: '20px 24px',
            background: 'rgba(10, 15, 26, 0.8)',
            border: '1px solid rgba(0, 255, 157, 0.25)',
            borderRadius: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--status-success, #00ff9d)', letterSpacing: '0.14em' }}>
              ARENA SELECTION // CONFIRMED
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 0' }}>
              SECTOR 07 // TOKYO NEON RUINS
            </h3>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              ENVIRONMENT
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: '#e2e8f0', marginTop: '2px' }}>
              Rooftop Combat Ring // Rain-Slick Metal // High-Voltage Neon Hazards
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
              ARENA STATUS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#00ff9d', marginTop: '2px', fontWeight: 700 }}>
              GRAVITY: 1.0G // SPECTATORS: 14,209 ACTIVE
            </div>
          </div>
        </div>

        {/* ================= BOTTOM ACTIONS: SCAN ROOM & READY ================= */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: '8px',
          }}
        >
          {/* Action 1: SCAN ROOM FOR WEAPON */}
          <button
            type="button"
            id="scan-room-button"
            onClick={() => {
              playSound('scan');
              setIsCameraScannerOpen(true);
            }}
            onMouseEnter={() => playSound('hover')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 28px',
              background: 'rgba(157, 78, 221, 0.12)',
              border: '1.5px solid rgba(157, 78, 221, 0.5)',
              borderRadius: '12px',
              color: '#ffffff',
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '0.92rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(157, 78, 221, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Camera size={18} color="#9d4edd" />
            <span>SCAN ROOM FOR WEAPON</span>
          </button>

          {/* Action 2: READY (Main CTA) */}
          <button
            type="button"
            id="ready-button"
            onClick={handleReady}
            onMouseEnter={() => playSound('hover')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 50%, #7b2cbf 100%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              borderRadius: '14px',
              color: '#ffffff',
              fontFamily: 'var(--font-display, sans-serif)',
              fontSize: '1.2rem',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 0 35px rgba(0, 240, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.4)',
              transition: 'all 0.25s ease',
            }}
          >
            <Swords size={22} />
            <span>READY</span>
            <Play size={18} fill="#ffffff" />
          </button>
        </div>
      </div>

      {/* ================= REAL BROWSER CAMERA WEAPON SCANNER MODAL ================= */}
      <CameraWeaponScanner
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onEquip={handleEquipWeapon}
      />

      {/* ================= CINEMATIC ARENA WARP TRANSITION ================= */}
      {isTransitioning && (
        <div
          role="alertdialog"
          aria-label="Arena Warp Transition"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(3, 5, 8, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px dashed #00f0ff',
                animation: 'spinSlow 3s linear infinite',
              }}
            />
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3rem',
                fontWeight: 900,
                color: '#00f0ff',
                textShadow: '0 0 25px #00f0ff',
              }}
            >
              {warpCountdown}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.2rem',
                fontWeight: 900,
                letterSpacing: '0.14em',
                color: '#ffffff',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              WARPING TO 3D ARENA
            </h2>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                color: 'var(--accent-cyan)',
                marginTop: '8px',
                letterSpacing: '0.18em',
              }}
            >
              SYNCHRONIZING COMBAT SENSORS // SECTOR 07
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scannerSweep {
          0% { top: 10px; opacity: 0.8; }
          50% { top: 160px; opacity: 1; }
          100% { top: 10px; opacity: 0.8; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
