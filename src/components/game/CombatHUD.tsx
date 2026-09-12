import React from 'react';
import { ArrowLeft, Activity, Swords, Zap, RotateCcw, Award, Dna } from 'lucide-react';
import { GlowButton } from '../common/GlowButton';
import { HealthBar } from './HealthBar';

interface CombatHUDProps {
  playerHp: number;
  playerMaxHp: number;
  playerCodename: string;
  playerState: string;

  enemyHp: number;
  enemyMaxHp: number;
  enemyState: string;

  comboCount: number;
  lastDamageEvent: { text: string; isCrit?: boolean; id: number } | null;

  isVictory: boolean;
  isDefeat: boolean;

  onExit: () => void;
  onRestartMatch: () => void;
  onNavigateAnalysis?: () => void;

  onAttackPress?: () => void;
  onBlockPress?: () => void;
  onDodgePress?: () => void;
}

export const CombatHUD: React.FC<CombatHUDProps> = ({
  playerHp,
  playerMaxHp,
  playerCodename,
  playerState,
  enemyHp,
  enemyMaxHp,
  enemyState,
  comboCount,
  lastDamageEvent,
  isVictory,
  isDefeat,
  onExit,
  onRestartMatch,
  onNavigateAnalysis,
  onAttackPress,
  onBlockPress,
  onDodgePress,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 32px',
        pointerEvents: 'none',
      }}
    >
      {/* ================= TOP ROW: HEADER, HEALTH BARS & COMBO COUNTER ================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {/* Navigation & Telemetry Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <GlowButton variant="secondary" onClick={onExit}>
              <ArrowLeft size={16} />
              <span>EXIT ARENA</span>
            </GlowButton>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px',
              background: 'rgba(5, 7, 15, 0.85)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '20px',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.74rem',
              color: 'var(--accent-cyan, #00f0ff)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Activity size={14} className="animate-pulse" />
            <span>COMBAT SIMULATION // MELEE ENGAGED</span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--text-muted, #94a3b8)' }}>
            SECTOR: 07 // TOKYO NEON RUINS
          </div>
        </div>

        {/* Health Bars: Player vs AI Opponent */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '24px',
            alignItems: 'center',
            maxWidth: '1100px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* PLAYER HP */}
          <HealthBar
            label={`PLAYER: ${playerCodename}`}
            currentHp={playerHp}
            maxHp={playerMaxHp}
            colorGradient="linear-gradient(90deg, #00f0ff, #0077ff)"
            glowColor="#00f0ff"
            statusBadge={playerState !== 'NORMAL' ? playerState : undefined}
          />

          {/* Center VS Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              background: 'rgba(255, 51, 102, 0.15)',
              border: '1px solid rgba(255, 51, 102, 0.5)',
              borderRadius: '8px',
              fontFamily: 'var(--font-display, sans-serif)',
              fontWeight: 900,
              fontSize: '1.2rem',
              color: '#ff3366',
              letterSpacing: '0.12em',
            }}
          >
            VS
          </div>

          {/* AI HP */}
          <HealthBar
            label="NEXUS AI // ARCHON"
            currentHp={enemyHp}
            maxHp={enemyMaxHp}
            colorGradient="linear-gradient(90deg, #9d4edd, #ff3366)"
            glowColor="#ff3366"
            statusBadge={enemyState !== 'NORMAL' ? enemyState : undefined}
            isReversed
          />
        </div>

        {/* Dynamic Combo & Damage Feedback Banner */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '44px',
          }}
        >
          {comboCount > 0 && (
            <div
              key={comboCount}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 18px',
                background: 'rgba(255, 204, 0, 0.15)',
                border: '1.5px solid #ffcc00',
                borderRadius: '20px',
                fontFamily: 'var(--font-display, sans-serif)',
                fontSize: '1.25rem',
                fontWeight: 900,
                letterSpacing: '0.14em',
                color: '#ffcc00',
                boxShadow: '0 0 20px rgba(255, 204, 0, 0.4)',
                animation: 'comboPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <Zap size={18} />
              <span>COMBO x{comboCount}</span>
            </div>
          )}

          {lastDamageEvent && (
            <div
              key={lastDamageEvent.id}
              style={{
                marginTop: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.85rem',
                fontWeight: 800,
                color: lastDamageEvent.isCrit ? '#ff3366' : '#00ff9d',
                textShadow: `0 0 10px ${lastDamageEvent.isCrit ? '#ff3366' : '#00ff9d'}`,
                animation: 'damageFade 0.7s ease-out forwards',
              }}
            >
              {lastDamageEvent.text}
            </div>
          )}
        </div>
      </div>

      {/* ================= BOTTOM ROW: CONTROLS DISPLAY & ACTIONS ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '12px 28px',
            background: 'rgba(5, 8, 16, 0.92)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '16px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            pointerEvents: 'auto',
          }}
        >
          {/* Movement Keys */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              MOVE:
            </span>
            {['W', 'A', 'S', 'D'].map((key) => (
              <span
                key={key}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                {key}
              </span>
            ))}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)' }} />

          {/* Combat Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Attack Button / Indicator */}
            <button
              type="button"
              id="combat-attack-btn"
              onClick={onAttackPress}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'rgba(0, 240, 255, 0.12)',
                border: '1px solid #00f0ff',
                borderRadius: '8px',
                color: '#00f0ff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              <span style={{ background: '#00f0ff', color: '#000', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                J
              </span>
              <span>ATTACK</span>
            </button>

            {/* Block Button / Indicator */}
            <button
              type="button"
              id="combat-block-btn"
              onClick={onBlockPress}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'rgba(157, 78, 221, 0.12)',
                border: '1px solid #9d4edd',
                borderRadius: '8px',
                color: '#9d4edd',
                fontFamily: 'var(--font-display)',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              <span style={{ background: '#9d4edd', color: '#000', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                K
              </span>
              <span>BLOCK</span>
            </button>

            {/* Dodge Button / Indicator */}
            <button
              type="button"
              id="combat-dodge-btn"
              onClick={onDodgePress}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'rgba(0, 255, 157, 0.12)',
                border: '1px solid #00ff9d',
                borderRadius: '8px',
                color: '#00ff9d',
                fontFamily: 'var(--font-display)',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              <span style={{ background: '#00ff9d', color: '#000', padding: '1px 5px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                SPACE
              </span>
              <span>DODGE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MATCH OUTCOME OVERLAYS ================= */}
      {(isVictory || isDefeat) && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: isVictory ? 'rgba(5, 15, 20, 0.92)' : 'rgba(20, 5, 10, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="cyber-panel"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '48px 36px',
              borderRadius: '24px',
              background: 'rgba(10, 15, 26, 0.96)',
              border: `2px solid ${isVictory ? '#00ff9d' : '#ff0055'}`,
              boxShadow: `0 0 60px ${isVictory ? 'rgba(0, 255, 157, 0.35)' : 'rgba(255, 0, 85, 0.35)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '24px',
              animation: 'outcomePop 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Outcome Trophy / Skull Icon */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: isVictory ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 0, 85, 0.15)',
                border: `2px solid ${isVictory ? '#00ff9d' : '#ff0055'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 30px ${isVictory ? '#00ff9d' : '#ff0055'}`,
              }}
            >
              {isVictory ? <Award size={44} color="#00ff9d" /> : <Swords size={44} color="#ff0055" />}
            </div>

            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: '3.2rem',
                  fontWeight: 900,
                  letterSpacing: '0.14em',
                  color: isVictory ? '#00ff9d' : '#ff0055',
                  textShadow: `0 0 30px ${isVictory ? '#00ff9d' : '#ff0055'}`,
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                {isVictory ? 'VICTORY' : 'DEFEAT'}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  marginTop: '8px',
                  letterSpacing: '0.1em',
                }}
              >
                {isVictory
                  ? 'AI OPPONENT OVERRIDDEN // COMBAT TELEMETRY SYNCHRONIZED'
                  : 'OPERATIVE SHIELD COLLAPSED // AI ADAPTIVE PROFILE UPDATED'}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '8px' }}>
              <button
                type="button"
                id="outcome-restart-btn"
                onClick={onRestartMatch}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                <RotateCcw size={16} />
                <span>FIGHT AGAIN</span>
              </button>

              <button
                type="button"
                id="outcome-analysis-btn"
                onClick={onNavigateAnalysis || onExit}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  borderRadius: '12px',
                  background: isVictory ? 'linear-gradient(135deg, #00f0ff, #00ff9d)' : 'linear-gradient(135deg, #ff0055, #9d4edd)',
                  border: 'none',
                  color: isVictory ? '#000000' : '#ffffff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  letterSpacing: '0.08em',
                }}
              >
                <Dna size={16} />
                <span>BATTLE INTELLIGENCE</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes comboPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes damageFade {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-16px); opacity: 0; }
        }
        @keyframes outcomePop {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
