import React, { useState, useEffect, useMemo } from 'react';
import {
  Dna,
  Zap,
  Shield,
  Footprints,
  Clock,
  Crosshair,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Share2,
  RotateCcw,
  Swords,
  ChevronRight,
  Check,
  Cpu,
  Flame,
} from 'lucide-react';
import type { FightingDNAProfile } from '../../ai/FightingDNA/DNATypes';
import { StrategyEngine } from '../../ai/adaptive/StrategyEngine';
import { useSound } from '../../hooks/useSound';
import { useDemoStore } from '../../demo/demoStore';

interface BattleIntelligenceViewProps {
  dna: FightingDNAProfile;
  matchOutcome?: 'VICTORY' | 'DEFEAT';
  matchDurationSeconds?: number;
  matchId?: string;
  onNextFight?: () => void;
  onReplay?: () => void;
  onExit?: () => void;
}

export const BattleIntelligenceView: React.FC<BattleIntelligenceViewProps> = ({
  dna,
  matchOutcome = 'VICTORY',
  matchDurationSeconds = 32,
  matchId = 'SESSION-ALPHA-01',
  onNextFight,
  onReplay,
}) => {
  const { playSound } = useSound();
  const [copiedShare, setCopiedShare] = useState(false);
  const [radarAnimated, setRadarAnimated] = useState(false);

  // Trigger radar expansion on mount
  useEffect(() => {
    const timer = setTimeout(() => setRadarAnimated(true), 120);
    return () => clearTimeout(timer);
  }, []);

  // Format match duration (MM:SS)
  const formattedDuration = useMemo(() => {
    const totalSec = Math.max(1, Math.round(matchDurationSeconds));
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [matchDurationSeconds]);

  // Derived Adaptive Strategy from StrategyEngine
  const counterStrategy = useMemo(() => {
    return StrategyEngine.generateStrategy(dna);
  }, [dna]);

  // Timing score normalized (0.1 to 1.0)
  const timingScore = Math.max(0.15, Math.min(1.0, 1.15 - (dna.reactionTime || 0.28) * 2));

  // Range score normalized (0.1 to 1.0)
  const rangeScore = dna.preferredRange === 'close' ? 0.9 : dna.preferredRange === 'medium' || (dna.preferredRange as any) === 'mid' ? 0.65 : 0.4;

  // Radar Chart Geometry (5 axes)
  const cx = 160;
  const cy = 160;
  const r = 105;

  const axes = [
    { label: 'AGGRESSION', val: dna.aggression, angle: -Math.PI / 2, icon: Zap, color: '#f43f5e' },
    { label: 'DEFENSE', val: dna.defense, angle: -Math.PI / 2 + (2 * Math.PI) / 5, icon: Shield, color: '#00f0ff' },
    { label: 'MOBILITY', val: dna.mobility, angle: -Math.PI / 2 + (4 * Math.PI) / 5, icon: Footprints, color: '#a855f7' },
    { label: 'TIMING', val: timingScore, angle: -Math.PI / 2 + (6 * Math.PI) / 5, icon: Clock, color: '#00ff9d' },
    { label: 'RANGE', val: rangeScore, angle: -Math.PI / 2 + (8 * Math.PI) / 5, icon: Crosshair, color: '#ffaa00' },
  ];

  const getCoord = (radiusFrac: number, angle: number) => ({
    x: cx + r * radiusFrac * Math.cos(angle),
    y: cy + r * radiusFrac * Math.sin(angle),
  });

  const targetPolygonStr = axes
    .map((p) => {
      const scale = radarAnimated ? p.val : 0.1;
      const coord = getCoord(scale, p.angle);
      return `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`;
    })
    .join(' ');

  const rings = [0.25, 0.5, 0.75, 1.0];

  // Predictability evaluation
  const predVal = dna.predictabilityIndex ?? 0.78;
  const predLevel = predVal >= 0.7 ? 'HIGH' : predVal >= 0.45 ? 'MODERATE' : 'LOW';
  const predColor = predVal >= 0.7 ? '#ff0055' : predVal >= 0.45 ? '#ffaa00' : '#00ff9d';

  // Specific Patterns Detected (as requested in prompt)
  const dodgeLeftPct = dna.dodgeLeftPercentage ?? 76;
  const patternDodgeText =
    dna.preferredDodge === 'left' || dodgeLeftPct >= 55
      ? `DODGE LEFT — ${dodgeLeftPct}%`
      : dna.preferredDodge === 'right'
      ? `DODGE RIGHT — ${dna.dodgeRightPercentage ?? 72}%`
      : 'BALANCED DODGE CADENCE — 50%';

  const comboPatternText = dna.repeatedCombos?.[0]
    ? `${dna.repeatedCombos[0]} — ${Math.round(dna.accuracyPercentage || 68)}%`
    : 'LIGHT-LIGHT-HEAVY — 68%';

  const rangePatternText =
    dna.preferredRange === 'long' || (dna.preferredRange as any) === 'far'
      ? 'LONG RANGE PREFERENCE'
      : dna.preferredRange === 'close'
      ? 'CLOSE-QUARTERS AGGRESSOR'
      : 'MID-RANGE TACTICAL SPACING';

  // Share handler
  const handleShare = () => {
    playSound('granted');
    const summary = `⚡ PLAYNEXUS BATTLE INTELLIGENCE ⚡\nMatch Result: ${matchOutcome} (${formattedDuration})\nArchetype: ${dna.archetype}\nPredictability: ${predVal.toFixed(2)} (${predLevel})\nTop Patterns:\n• ${patternDodgeText}\n• ${comboPatternText}\n• ${rangePatternText}\nCounter-Strategy: "The opponent will now exploit your preferred dodge direction."`;

    navigator.clipboard.writeText(summary).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }).catch(() => {});
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        fontFamily: 'var(--font-mono, monospace)',
        color: '#ffffff',
        userSelect: 'none',
      }}
    >
      {/* ================= HERO BANNER: "THE AI STUDIED YOU." ================= */}
      <div
        className="cyber-panel"
        style={{
          position: 'relative',
          padding: '36px 40px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, rgba(10, 15, 28, 0.95) 0%, rgba(18, 10, 30, 0.92) 100%)',
          border: '2px solid rgba(0, 240, 255, 0.45)',
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.15), inset 0 0 30px rgba(0, 240, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
        }}
      >
        {/* Background Atmosphere Nebula */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(157, 78, 221, 0.18) 0%, rgba(0, 240, 255, 0.08) 50%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Meta Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '20px',
                fontSize: '0.74rem',
                color: '#00f0ff',
                letterSpacing: '0.14em',
                fontWeight: 700,
              }}
            >
              <Cpu size={14} className="animate-spin" style={{ animationDuration: '6s' }} />
              <span>NEURAL ADAPTIVE MATRIX // POST-MATCH ANALYSIS</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
                SESSION: <span style={{ color: '#ffffff', fontWeight: 700 }}>{matchId}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  color: '#ffffff',
                }}
              >
                <Clock size={13} color="#00ff9d" />
                <span>DURATION: <strong style={{ color: '#00ff9d' }}>{formattedDuration}</strong></span>
              </div>
            </div>
          </div>

          {/* Ominous Main Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-hud, monospace)',
                  fontSize: '0.85rem',
                  color: '#ff3366',
                  letterSpacing: '0.2em',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                TACTICAL SYNTHESIS COMPLETE
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display, sans-serif)',
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  margin: 0,
                  lineHeight: 1.05,
                  color: '#ffffff',
                  textShadow: '0 0 40px rgba(0, 240, 255, 0.4)',
                }}
              >
                THE AI STUDIED YOU.
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body, sans-serif)',
                  fontSize: '0.96rem',
                  color: 'var(--text-secondary, #94a3b8)',
                  marginTop: '10px',
                  maxWidth: '680px',
                  lineHeight: 1.5,
                }}
              >
                Every dodge vector, attack timing cadence, and combo reflex has been parsed into your biometric Fighting DNA. The opponent's neural model has already evolved to counter your habits.
              </p>
            </div>

            {/* Victory / Defeat Badge */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 36px',
                borderRadius: '20px',
                background:
                  matchOutcome === 'VICTORY'
                    ? 'linear-gradient(135deg, rgba(0, 255, 157, 0.15) 0%, rgba(0, 240, 255, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 0, 85, 0.15) 0%, rgba(157, 78, 221, 0.15) 100%)',
                border: matchOutcome === 'VICTORY' ? '2px solid #00ff9d' : '2px solid #ff0055',
                boxShadow:
                  matchOutcome === 'VICTORY'
                    ? '0 0 35px rgba(0, 255, 157, 0.35)'
                    : '0 0 35px rgba(255, 0, 85, 0.35)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: matchOutcome === 'VICTORY' ? '#00ff9d' : '#ff0055',
                  letterSpacing: '0.16em',
                  fontWeight: 800,
                }}
              >
                ROUND OUTCOME
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.6rem',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  color: matchOutcome === 'VICTORY' ? '#00ff9d' : '#ff0055',
                  textShadow:
                    matchOutcome === 'VICTORY'
                      ? '0 0 25px rgba(0, 255, 157, 0.6)'
                      : '0 0 25px rgba(255, 0, 85, 0.6)',
                }}
              >
                {matchOutcome}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#ffffff', opacity: 0.85 }}>
                MATCH TIME: {formattedDuration}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CORE FIGHTING DNA: RADAR CHART + 5 PILLARS ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Animated Radar Chart */}
        <div
          className="cyber-panel"
          style={{
            padding: '30px',
            borderRadius: '24px',
            background: 'rgba(10, 15, 28, 0.88)',
            border: '1.5px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.1)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.82rem', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} /> 5-AXIS FIGHTING DNA RADAR
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)' }}>BIOMETRIC ENVELOPE</span>
          </div>

          {/* SVG Animated Radar */}
          <div style={{ position: 'relative', width: '320px', height: '320px', margin: '16px 0' }}>
            <svg width={320} height={320} style={{ overflow: 'visible' }}>
              {/* Concentric Reference Rings */}
              {rings.map((ringFrac, rIdx) => {
                const ringPoints = axes
                  .map((p) => {
                    const coord = getCoord(ringFrac, p.angle);
                    return `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`;
                  })
                  .join(' ');
                return (
                  <polygon
                    key={rIdx}
                    points={ringPoints}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth={1}
                    strokeDasharray={rIdx === 3 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Spoke lines from center to outer points */}
              {axes.map((p, idx) => {
                const outer = getCoord(1.0, p.angle);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="rgba(0, 240, 255, 0.18)"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Animated Player DNA Polygon */}
              <polygon
                points={targetPolygonStr}
                fill="rgba(0, 240, 255, 0.22)"
                stroke="#00f0ff"
                strokeWidth={2.5}
                style={{
                  transition: 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.5))',
                }}
              />

              {/* Vertex Nodes & Readouts */}
              {axes.map((p, idx) => {
                const scale = radarAnimated ? p.val : 0.1;
                const node = getCoord(scale, p.angle);
                const labelPos = getCoord(1.22, p.angle);

                return (
                  <g key={idx}>
                    {/* Node circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={5}
                      fill="#00ff9d"
                      stroke="#050811"
                      strokeWidth={2}
                      style={{ transition: 'all 1.1s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    />

                    {/* Label & Value */}
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9px"
                      fontWeight="bold"
                      fontFamily="var(--font-mono, monospace)"
                      letterSpacing="0.08em"
                    >
                      {p.label}
                    </text>
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 17}
                      textAnchor="middle"
                      fill={p.color}
                      fontSize="11px"
                      fontWeight="bold"
                      fontFamily="var(--font-hud, monospace)"
                    >
                      {Math.round(p.val * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div style={{ width: '100%', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-secondary, #94a3b8)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
            COMBAT ARCHETYPE: <strong style={{ color: '#00ff9d', letterSpacing: '0.08em' }}>{dna.archetype.replace('_', ' ')}</strong>
          </div>
        </div>

        {/* 5 Fighting DNA Pillars (Progress Bars) */}
        <div
          className="cyber-panel"
          style={{
            padding: '30px',
            borderRadius: '24px',
            background: 'rgba(10, 15, 28, 0.88)',
            border: '1.5px solid rgba(157, 78, 221, 0.3)',
            boxShadow: '0 0 40px rgba(157, 78, 221, 0.1)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px' }}>
            <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.82rem', fontWeight: 800, color: '#9d4edd', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Dna size={16} /> FIGHTING DNA METRIC BREAKDOWN
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>NORMALIZED (0.00 – 1.00)</span>
          </div>

          {/* 1. Aggression */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontWeight: 700 }}>
                <Zap size={14} /> AGGRESSION
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{dna.aggression.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round(dna.aggression * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #f97316, #f43f5e)',
                  boxShadow: '0 0 10px #f43f5e',
                  transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          {/* 2. Defense */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00f0ff', fontWeight: 700 }}>
                <Shield size={14} /> DEFENSE
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{dna.defense.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round(dna.defense * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0077ff, #00f0ff)',
                  boxShadow: '0 0 10px #00f0ff',
                  transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          {/* 3. Mobility */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontWeight: 700 }}>
                <Footprints size={14} /> MOBILITY
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{dna.mobility.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round(dna.mobility * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  boxShadow: '0 0 10px #a855f7',
                  transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          {/* 4. Timing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00ff9d', fontWeight: 700 }}>
                <Clock size={14} /> TIMING (REACTION SPEED)
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{timingScore.toFixed(2)} (~{Math.round((dna.reactionTime || 0.28) * 1000)}ms)</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round(timingScore * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #14b8a6, #00ff9d)',
                  boxShadow: '0 0 10px #00ff9d',
                  transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>

          {/* 5. Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ffaa00', fontWeight: 700 }}>
                <Crosshair size={14} /> RANGE ({dna.preferredRange.toUpperCase()})
              </span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{rangeScore.toFixed(2)}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${Math.round(rangeScore * 100)}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #eab308, #ffaa00)',
                  boxShadow: '0 0 10px #ffaa00',
                  transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= PREDICTABILITY INDEX SPOTLIGHT ================= */}
      <div
        className="cyber-panel"
        style={{
          padding: '28px 36px',
          borderRadius: '24px',
          background: 'rgba(10, 15, 28, 0.92)',
          border: `2px solid ${predColor}`,
          boxShadow: `0 0 40px ${predColor}33`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: predColor, fontWeight: 800, letterSpacing: '0.14em' }}>
            <TrendingUp size={16} />
            <span>PREDICTABILITY INDEX CALIBRATION</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
              {predVal.toFixed(2)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1.2rem',
                fontWeight: 900,
                color: predColor,
                background: `${predColor}22`,
                padding: '4px 12px',
                borderRadius: '8px',
                border: `1px solid ${predColor}`,
                letterSpacing: '0.1em',
              }}
            >
              {predLevel}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.4 }}>
            Neural predictability score reflects repetitive dodge angles and rhythmic attack intervals. At <strong>{predVal.toFixed(2)} ({predLevel})</strong>, the AI opponent can accurately anticipate counter-opportunities before your strikes connect.
          </p>
        </div>

        {/* Dodge & Cadence Bias Pill */}
        <div
          style={{
            padding: '16px 24px',
            borderRadius: '16px',
            background: 'rgba(5, 8, 16, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            minWidth: '220px',
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.12em' }}>PRIMARY COMBAT DRIFT</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 900, color: '#00f0ff', marginTop: '4px' }}>
            {patternDodgeText}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#00ff9d', marginTop: '4px' }}>
            {comboPatternText}
          </div>
        </div>
      </div>

      {/* ================= 3-COLUMN TACTICAL INTEL: PATTERNS, WEAKNESSES, STRENGTHS ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* 1. PATTERNS DETECTED */}
        <div
          className="cyber-panel"
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'rgba(10, 15, 28, 0.85)',
            border: '1.5px solid rgba(0, 240, 255, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, color: '#00f0ff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
            <Crosshair size={16} />
            <span>PATTERNS DETECTED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Dodge Left */}
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(0, 240, 255, 0.08)', border: '1px solid rgba(0, 240, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 700 }}>{patternDodgeText}</span>
              <span style={{ fontSize: '0.7rem', color: '#00f0ff', background: 'rgba(0, 240, 255, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>TELEGRAPHED</span>
            </div>

            {/* Light-Light-Heavy */}
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(157, 78, 221, 0.08)', border: '1px solid rgba(157, 78, 221, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 700 }}>{comboPatternText}</span>
              <span style={{ fontSize: '0.7rem', color: '#9d4edd', background: 'rgba(157, 78, 221, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>COMBO CADENCE</span>
            </div>

            {/* Range Preference */}
            <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 170, 0, 0.08)', border: '1px solid rgba(255, 170, 0, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.84rem', color: '#ffffff', fontWeight: 700 }}>{rangePatternText}</span>
              <span style={{ fontSize: '0.7rem', color: '#ffaa00', background: 'rgba(255, 170, 0, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>SPATIAL HABIT</span>
            </div>
          </div>
        </div>

        {/* 2. WEAKNESSES */}
        <div
          className="cyber-panel"
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'rgba(10, 15, 28, 0.85)',
            border: '1.5px solid rgba(255, 0, 85, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, color: '#ff0055', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
            <AlertTriangle size={16} />
            <span>WEAKNESSES</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(dna.weaknesses && dna.weaknesses.length > 0
              ? dna.weaknesses
              : [
                  'High left dodge bias; vulnerable to sweeping off-axis strikes',
                  'Predictable attack recovery intervals permit AI auto-parry buffering',
                ]
            ).map((weak, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 0, 85, 0.08)',
                  border: '1px solid rgba(255, 0, 85, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  color: '#fda4af',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff0055', marginTop: '6px', flexShrink: 0 }} />
                <span>{weak}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. STRENGTHS */}
        <div
          className="cyber-panel"
          style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'rgba(10, 15, 28, 0.85)',
            border: '1.5px solid rgba(0, 255, 157, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', fontWeight: 800, color: '#00ff9d', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px' }}>
            <CheckCircle2 size={16} />
            <span>STRENGTHS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(dna.strengths && dna.strengths.length > 0
              ? dna.strengths
              : [
                  'High offensive pace disrupts basic AI approach states',
                  'Rapid repositioning out of melee threat range',
                ]
            ).map((str, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 157, 0.08)',
                  border: '1px solid rgba(0, 255, 157, 0.25)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  color: '#6ee7b7',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff9d', marginTop: '6px', flexShrink: 0 }} />
                <span>{str}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= AI COUNTER-STRATEGY ACTIVATION CARD ================= */}
      <div
        className="cyber-panel"
        style={{
          padding: '32px 36px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(25, 12, 40, 0.95) 0%, rgba(10, 20, 36, 0.95) 100%)',
          border: '2px solid rgba(255, 170, 0, 0.6)',
          boxShadow: '0 0 50px rgba(255, 170, 0, 0.2), inset 0 0 20px rgba(255, 170, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Flame size={20} color="#ffaa00" />
            <span
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '0.9rem',
                fontWeight: 900,
                color: '#ffaa00',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              AI COUNTER-STRATEGY
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: '#000000',
              background: '#ffaa00',
              padding: '3px 10px',
              borderRadius: '4px',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}
          >
            ROUND 2 ACTIVE PROTOCOL
          </span>
        </div>

        {/* Prompt Specific Directive Quote */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderLeft: '4px solid #ffaa00',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '0.04em',
          }}
        >
          "The opponent will now exploit your preferred dodge direction."
        </div>

        {/* Concrete Tactics List */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.78rem' }}>
            <strong style={{ color: '#00f0ff' }}>TACTICAL FOCUS:</strong> {counterStrategy.tacticalDescription}
          </div>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.78rem' }}>
            <strong style={{ color: '#00ff9d' }}>PARRY BIAS:</strong> Anticipates {counterStrategy.targetComboPattern} combo finisher
          </div>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', fontSize: '0.78rem' }}>
            <strong style={{ color: '#a855f7' }}>ADAPTATION LEVEL:</strong> {Math.round((counterStrategy.adaptationConfidence || 0.88) * 100)}% Confidence
          </div>
        </div>
      </div>

      {/* ================= CALL TO ACTION BUTTONS: NEXT FIGHT, REPLAY, SHARE ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '8px',
          paddingBottom: '24px',
        }}
      >
        {/* REPLAY */}
        <button
          type="button"
          id="battle-intel-replay-button"
          onClick={onReplay}
          style={{
            padding: '16px 32px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
          }}
        >
          <RotateCcw size={18} />
          <span>REPLAY</span>
        </button>

        {/* NEXT FIGHT (Main CTA - Starts Adaptive Match 2) */}
        <button
          type="button"
          id="battle-intel-next-fight-button"
          onClick={() => {
            if (useDemoStore.getState().isDemoMode) {
              useDemoStore.getState().startDemoMatch2();
            }
            onNextFight?.();
          }}
          style={{
            padding: '18px 48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #0077ff 50%, #7b2cbf 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.7)',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 900,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 0 45px rgba(0, 240, 255, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
          }}
        >
          <Swords size={22} />
          <span>NEXT FIGHT</span>
          <ChevronRight size={22} strokeWidth={3} />
        </button>

        {/* SHARE */}
        <button
          type="button"
          id="battle-intel-share-button"
          onClick={handleShare}
          style={{
            padding: '16px 32px',
            borderRadius: '14px',
            background: copiedShare ? 'rgba(0, 255, 157, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            border: copiedShare ? '1.5px solid #00ff9d' : '1.5px solid rgba(255, 255, 255, 0.25)',
            color: copiedShare ? '#00ff9d' : '#ffffff',
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
          }}
        >
          {copiedShare ? <Check size={18} /> : <Share2 size={18} />}
          <span>{copiedShare ? 'COPIED TO CLIPBOARD!' : 'SHARE'}</span>
        </button>
      </div>
    </div>
  );
};
