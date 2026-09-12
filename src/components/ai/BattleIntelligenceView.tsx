import React, { useState } from 'react';
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
  FileCode,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { FightingDNAProfile } from '../../ai/FightingDNA/DNATypes';

interface BattleIntelligenceViewProps {
  dna: FightingDNAProfile;
  matchOutcome?: 'VICTORY' | 'DEFEAT';
  onRematch?: () => void;
  onExit?: () => void;
}

export const BattleIntelligenceView: React.FC<BattleIntelligenceViewProps> = ({
  dna,
  matchOutcome,
  onRematch,
  onExit,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);

  // Timing score: faster reaction = higher score (e.g. 0.20s -> 0.90, 0.45s -> 0.40)
  const timingScore = Math.max(0.1, Math.min(1.0, 1.1 - (dna.reactionTime || 0.28) * 2));

  // Range score: close = 0.9, mid = 0.6, far = 0.3
  const rangeScore = dna.preferredRange === 'close' ? 0.9 : dna.preferredRange === 'mid' ? 0.6 : 0.35;

  // Radar Chart coordinates (5 axes: Aggression, Defense, Mobility, Timing, Range)
  // Center is (150, 150), radius is 100
  const cx = 150;
  const cy = 150;
  const r = 95;

  const points = [
    { label: 'AGGRESSION', val: dna.aggression, angle: -Math.PI / 2 },
    { label: 'DEFENSE', val: dna.defense, angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { label: 'MOBILITY', val: dna.mobility, angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { label: 'TIMING', val: timingScore, angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { label: 'RANGE', val: rangeScore, angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
  ];

  // Helper to compute (x, y) given radius fraction and angle
  const getCoord = (radiusFrac: number, angle: number) => {
    return {
      x: cx + r * radiusFrac * Math.cos(angle),
      y: cy + r * radiusFrac * Math.sin(angle),
    };
  };

  // Polygon path for player DNA values
  const polygonPointsStr = points
    .map((p) => {
      const coord = getCoord(p.val, p.angle);
      return `${coord.x.toFixed(1)},${coord.y.toFixed(1)}`;
    })
    .join(' ');

  // Grid background rings (0.25, 0.5, 0.75, 1.0)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Predictability evaluation
  const predPct = Math.round(dna.predictabilityIndex * 100);
  const getPredictabilityStatus = (val: number) => {
    if (val >= 70) return { label: 'HIGHLY TELEGRAPHED // EASY COUNTER', color: '#ff3366', bg: 'rgba(255, 51, 102, 0.1)' };
    if (val >= 45) return { label: 'MODERATE PATTERN DRIFT // ADAPTABLE', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    return { label: 'ERRATIC & UNPREDICTABLE // ELUSIVE', color: '#00ff9d', bg: 'rgba(0, 255, 157, 0.1)' };
  };
  const predStatus = getPredictabilityStatus(predPct);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 font-mono text-white select-none">
      {/* Top Banner */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.08)] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs tracking-wider">
              <Dna size={14} className="animate-spin" style={{ animationDuration: '8s' }} />
              <span>NEURAL FIGHTING DNA SYNTHESIZED</span>
              {matchOutcome && (
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                    matchOutcome === 'VICTORY'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {matchOutcome}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-widest font-sans uppercase">
              BATTLE INTELLIGENCE
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-xl">
              Real-time telemetry analysis of your offensive cadence, spatial habits, and subconscious combat biases.
            </p>
          </div>

          {/* Archetype Badge */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 text-center min-w-[200px]">
            <div className="text-[10px] text-purple-300 uppercase tracking-widest font-bold">
              COMBAT ARCHETYPE
            </div>
            <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 uppercase mt-1 font-sans">
              {dna.archetype.replace('_', ' ')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              RANGE: <span className="text-cyan-400 uppercase font-bold">{dna.preferredRange}</span> | DODGE: <span className="text-pink-400 uppercase font-bold">{dna.preferredDodge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 5 DNA Core Pillars & Holographic Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart Visualizer (5 columns) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-950/70 border border-slate-800 flex flex-col items-center justify-between backdrop-blur-md relative">
          <div className="w-full flex items-center justify-between text-xs border-b border-slate-800/80 pb-3">
            <span className="font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles size={14} /> PENTAGONAL DNA RADAR
            </span>
            <span className="text-slate-500 text-[10px]">5-AXIS BIOMETRICS</span>
          </div>

          {/* SVG Radar Chart */}
          <div className="relative my-4">
            <svg width={300} height={300} className="overflow-visible">
              {/* Background Concentric Polygon Rings */}
              {rings.map((ringFrac, rIdx) => {
                const ringPoints = points
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
                    stroke="#1e293b"
                    strokeWidth={1}
                    strokeDasharray={rIdx === 3 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis Spoke Lines */}
              {points.map((p, idx) => {
                const outer = getCoord(1.0, p.angle);
                return (
                  <line
                    key={idx}
                    x1={cx}
                    y1={cy}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#1e293b"
                    strokeWidth={1}
                  />
                );
              })}

              {/* Player DNA Filled Polygon */}
              <polygon
                points={polygonPointsStr}
                fill="rgba(0, 240, 255, 0.22)"
                stroke="#00f0ff"
                strokeWidth={2.5}
                className="transition-all duration-700 ease-out"
              />

              {/* Vertex Nodes & Interactive Labels */}
              {points.map((p, idx) => {
                const node = getCoord(p.val, p.angle);
                const labelPos = getCoord(1.22, p.angle);
                return (
                  <g key={idx}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={4.5}
                      fill="#00ff9d"
                      stroke="#05070c"
                      strokeWidth={2}
                      className="transition-all duration-700"
                    />
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 4}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9px"
                      fontWeight="bold"
                      fontFamily="monospace"
                      letterSpacing="0.05em"
                    >
                      {p.label}
                    </text>
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 16}
                      textAnchor="middle"
                      fill="#00f0ff"
                      fontSize="10px"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {Math.round(p.val * 100)}%
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full text-center text-[10px] text-slate-500 border-t border-slate-900 pt-2">
            DNA POLYGON ENVELOPE: <span className="text-emerald-400 font-bold">{Math.round((dna.aggression + dna.defense + dna.mobility + timingScore + rangeScore) * 20)} PTS</span>
          </div>
        </div>

        {/* 5 Core Pillars Breakdown Bars (7 columns) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-3">
            <span className="font-bold tracking-wider text-slate-200">FIGHTING DNA CORE METRICS</span>
            <span className="text-slate-500 text-[10px]">NORMALIZED SCALE (0.00 - 1.00)</span>
          </div>

          <div className="space-y-4">
            {/* 1. Aggression */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <Zap size={14} /> AGGRESSION
                </span>
                <div className="space-x-2">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {dna.totalAttacks} swings // {dna.accuracyPercentage}% accuracy
                  </span>
                  <span className="text-white font-bold text-sm">
                    {dna.aggression.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                  style={{ width: `${Math.round(dna.aggression * 100)}%` }}
                />
              </div>
            </div>

            {/* 2. Defense */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Shield size={14} /> DEFENSE
                </span>
                <div className="space-x-2">
                  <span className="text-slate-400 text-[11px] font-mono">
                    Mitigation discipline
                  </span>
                  <span className="text-white font-bold text-sm">
                    {dna.defense.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  style={{ width: `${Math.round(dna.defense * 100)}%` }}
                />
              </div>
            </div>

            {/* 3. Mobility */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                  <Footprints size={14} /> MOBILITY
                </span>
                <div className="space-x-2">
                  <span className="text-slate-400 text-[11px] font-mono">
                    Prefers {dna.preferredDodge} dodge ({dna.dodgeLeftPercentage}% L / {dna.dodgeRightPercentage}% R)
                  </span>
                  <span className="text-white font-bold text-sm">
                    {dna.mobility.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                  style={{ width: `${Math.round(dna.mobility * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Timing / Reaction Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Clock size={14} /> TIMING / REACTION SPEED
                </span>
                <div className="space-x-2">
                  <span className="text-slate-400 text-[11px] font-mono">
                    Reflex: ~{Math.round(dna.reactionTime * 1000)}ms
                  </span>
                  <span className="text-white font-bold text-sm">
                    {timingScore.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  style={{ width: `${Math.round(timingScore * 100)}%` }}
                />
              </div>
            </div>

            {/* 5. Range Preference */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Crosshair size={14} /> PREFERRED RANGE
                </span>
                <div className="space-x-2">
                  <span className="text-amber-300 font-bold text-xs uppercase">
                    {dna.preferredRange.toUpperCase()} COMBAT
                  </span>
                  <span className="text-white font-bold text-sm">
                    {rangeScore.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                  style={{ width: `${Math.round(rangeScore * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
            <span>AVERAGE COMBO LENGTH: <span className="text-white font-bold">{dna.averageComboLength}x STRIKES</span></span>
            <span>NEURAL ENGINES // READY</span>
          </div>
        </div>
      </div>

      {/* PREDICTABILITY INDEX Spotlight Card */}
      <div
        className="p-6 rounded-3xl border transition-all"
        style={{
          background: 'rgba(10, 15, 26, 0.85)',
          borderColor: predStatus.color,
          boxShadow: `0 0 30px ${predStatus.bg}`,
        }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold tracking-widest uppercase">
              <TrendingUp size={16} color={predStatus.color} />
              <span style={{ color: predStatus.color }}>PREDICTABILITY INDEX</span>
            </div>
            <div className="text-3xl md:text-5xl font-black text-white font-sans">
              {dna.predictabilityIndex.toFixed(2)}{' '}
              <span className="text-base md:text-lg font-mono text-slate-400">
                ({predPct}%)
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-lg">
              {predStatus.label}. This index determines how effectively the AI opponent's upcoming reinforcement layer will pre-buffer counters against your signature combos.
            </p>
          </div>

          {/* Radial progress bar or score pill */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 min-w-[200px]">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
              DODGE BIAS
            </div>
            <div className="text-lg font-bold text-white uppercase">
              {dna.preferredDodge === 'left'
                ? `${dna.dodgeLeftPercentage}% LEFT`
                : dna.preferredDodge === 'right'
                ? `${dna.dodgeRightPercentage}% RIGHT`
                : 'BALANCED 50/50'}
            </div>
            <div className="text-[9px] text-slate-500 mt-1">
              RHYTHM INTERVAL DEVIATION
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Tactical Insights: Top Patterns, Strengths, Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. TOP PATTERNS */}
        <div className="p-6 rounded-3xl bg-slate-950/70 border border-cyan-500/30 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 border-b border-slate-800 pb-2">
            <Dna size={16} />
            <span>TOP OBSERVED PATTERNS</span>
          </div>
          <div className="space-y-2.5">
            {dna.topPatterns.map((pat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 text-xs text-slate-200 flex items-start gap-2.5 hover:border-cyan-500/40 transition-colors"
              >
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold">
                  #{idx + 1}
                </span>
                <span className="leading-relaxed">{pat}</span>
              </div>
            ))}
            {dna.repeatedCombos.map((combo, idx) => (
              <div
                key={`combo-${idx}`}
                className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-300 flex items-start gap-2.5"
              >
                <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-mono text-[10px] font-bold">
                  COMBO
                </span>
                <span className="leading-relaxed">{combo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. STRENGTHS */}
        <div className="p-6 rounded-3xl bg-slate-950/70 border border-emerald-500/30 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 border-b border-slate-800 pb-2">
            <CheckCircle2 size={16} />
            <span>CONFIRMED STRENGTHS</span>
          </div>
          <div className="space-y-2.5">
            {dna.strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-xs text-slate-200 flex items-start gap-2.5 hover:border-emerald-500/40 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0 animate-pulse" />
                <span className="leading-relaxed">{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. WEAKNESSES */}
        <div className="p-6 rounded-3xl bg-slate-950/70 border border-rose-500/30 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-slate-800 pb-2">
            <AlertTriangle size={16} />
            <span>EXPLOITABLE WEAKNESSES</span>
          </div>
          <div className="space-y-2.5">
            {dna.weaknesses.map((weak, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/20 text-xs text-slate-200 flex items-start gap-2.5 hover:border-rose-500/40 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
                <span className="leading-relaxed">{weak}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsible Raw Fighting DNA JSON Viewer */}
      <div className="border border-slate-800 rounded-2xl bg-slate-950/80 overflow-hidden font-mono text-xs">
        <button
          type="button"
          onClick={() => setShowRawJson(!showRawJson)}
          className="w-full flex items-center justify-between p-3 px-4 hover:bg-slate-900 transition-colors text-slate-300"
        >
          <div className="flex items-center gap-2">
            <FileCode size={15} className="text-cyan-400" />
            <span className="font-bold tracking-wider">INSPECT RAW FIGHTING DNA OBJECT</span>
          </div>
          {showRawJson ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showRawJson && (
          <div className="p-4 border-t border-slate-800 max-h-72 overflow-y-auto bg-black/60 text-[11px] text-emerald-400">
            <pre>
              {JSON.stringify(
                {
                  aggression: dna.aggression,
                  defense: dna.defense,
                  mobility: dna.mobility,
                  preferredDodge: dna.preferredDodge,
                  preferredRange: dna.preferredRange,
                  reactionTime: dna.reactionTime,
                  averageComboLength: dna.averageComboLength,
                  predictabilityIndex: dna.predictabilityIndex,
                  repeatedCombos: dna.repeatedCombos,
                  strengths: dna.strengths,
                  weaknesses: dna.weaknesses,
                  archetype: dna.archetype,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Rematch & Navigation Actions */}
      {(onRematch || onExit) && (
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {onRematch && (
            <button
              type="button"
              onClick={onRematch}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
            >
              FIGHT AGAIN & EVOLVE
            </button>
          )}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-sans font-bold text-sm tracking-wider uppercase transition-all cursor-pointer"
            >
              RETURN TO DASHBOARD
            </button>
          )}
        </div>
      )}
    </div>
  );
};
