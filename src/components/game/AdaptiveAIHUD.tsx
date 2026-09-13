import React from 'react';
import { Brain, Cpu, ShieldAlert, AlertTriangle, Crosshair } from 'lucide-react';
import type { CounterStrategy } from '../../ai/adaptive/CounterStrategy';
import type { AdaptiveTacticalEvent } from '../../ai/adaptive/AdaptiveAI';
import { ADAPTATION_LEVEL_LABELS } from '../../ai/adaptive/StrategyTypes';
import { useTelemetryStore } from '../../store/telemetryStore';

interface AdaptiveAIHUDProps {
  strategy: CounterStrategy;
  tacticalEvent: AdaptiveTacticalEvent | null;
  aiState?: string;
}

export const AdaptiveAIHUD: React.FC<AdaptiveAIHUDProps> = ({
  strategy,
  tacticalEvent,
  aiState = 'ENGAGED',
}) => {
  const { fightingDNA, adaptationLevel, aiConfidence, detectedPatterns } = useTelemetryStore();

  const isRecentTactic =
    tacticalEvent && Date.now() - tacticalEvent.timestamp < 3200;

  const topPattern = detectedPatterns[0];
  const confidencePercent = Math.round((strategy.adaptationConfidence || aiConfidence || 0.5) * 100);
  const aggressionPercent = Math.round((fightingDNA?.aggression || 0.65) * 100);
  const predictabilityPercent = Math.round((fightingDNA?.predictabilityIndex || 0.55) * 100);

  const adaptationName = ADAPTATION_LEVEL_LABELS[strategy.adaptationLevel ?? adaptationLevel ?? 0];

  return (
    <>
      {/* 1. PLAYER-FACING TACTICAL WARNING BANNER */}
      {/* Appears when AI detects high confidence habit (e.g. dodge left or combo) */}
      {(strategy.adaptationLevel >= 2 || (topPattern && topPattern.confidence >= 0.70)) && (
        <div
          style={{
            position: 'fixed',
            top: '82px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 40,
            pointerEvents: 'none',
          }}
          className="animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/90 border border-rose-500/70 shadow-[0_0_30px_rgba(244,63,94,0.4)] backdrop-blur-md">
            <AlertTriangle size={18} className="text-rose-400 animate-pulse flex-shrink-0" />
            <div className="text-left font-mono">
              <div className="text-[10px] tracking-widest text-rose-400 font-bold uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                ⚠ PATTERN DETECTED // AI HAS LEARNED YOUR HABIT
              </div>
              <div className="text-[12px] text-white font-black tracking-wider uppercase">
                {strategy.counterDodge === 'COUNTER_LEFT'
                  ? 'PREDICTING LEFT DODGE // FLANK INTERCEPT ARMED'
                  : strategy.counterDodge === 'COUNTER_RIGHT'
                  ? 'PREDICTING RIGHT DODGE // OFF-AXIS ARMED'
                  : strategy.antiComboTactics
                  ? `PREDICTING ${strategy.comboPatternName} // AUTO-PARRY ARMED`
                  : 'COUNTER-STRATEGY ACTIVE'}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[10px] font-bold font-mono">
              {confidencePercent}% CONFIDENCE
            </span>
          </div>
        </div>
      )}

      {/* 2. PLAYNEXUS AI CORE DEVELOPER HUD */}
      <aside
        aria-label="PLAYNEXUS AI CORE"
        style={{
          position: 'fixed',
          top: '135px',
          right: '24px',
          width: '290px',
          zIndex: 35,
          pointerEvents: 'none',
        }}
        className="font-mono text-xs select-none"
      >
        <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-rose-500/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.85)] space-y-2.5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <Brain size={15} className="text-rose-400" />
              <span className="font-bold text-white tracking-widest text-[11px] font-sans">
                PLAYNEXUS AI CORE
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
              LVL {strategy.adaptationLevel ?? adaptationLevel} // {adaptationName}
            </span>
          </div>

          {/* AI Core Telemetry Readout Table */}
          <div className="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">STATE:</span>
              <span className="text-cyan-400 font-bold tracking-wider uppercase">
                {aiState}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">ADAPTATION:</span>
              <span className="text-rose-400 font-bold">
                LEVEL {strategy.adaptationLevel ?? adaptationLevel} ({adaptationName})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">PLAYER PATTERN:</span>
              <span className="text-amber-400 font-bold truncate max-w-[140px]" title={topPattern?.type || 'OBSERVING'}>
                {strategy.counterDodge === 'COUNTER_LEFT'
                  ? 'DODGE LEFT'
                  : strategy.counterDodge === 'COUNTER_RIGHT'
                  ? 'DODGE RIGHT'
                  : topPattern?.type
                  ? topPattern.type.replace('PREFERRED_', '').replace('_', ' ')
                  : 'OBSERVING'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">CONFIDENCE:</span>
              <span className="text-emerald-400 font-bold">
                {confidencePercent}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">PLAYER AGGRESSION:</span>
              <span className="text-rose-300 font-bold">
                {aggressionPercent}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">PREDICTABILITY:</span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  predictabilityPercent >= 65
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {predictabilityPercent}% ({strategy.predictabilityLevel || 'MODERATE'})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">TARGET:</span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Crosshair size={11} className="text-rose-400" /> PLAYER
              </span>
            </div>
          </div>

          {/* CURRENT STRATEGY Banner */}
          <div className="p-2 rounded-xl bg-gradient-to-r from-rose-950/90 to-purple-950/90 border border-rose-500/50 text-left space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-rose-300 tracking-wider">
              <div className="flex items-center gap-1.5">
                <Cpu size={12} className="animate-spin text-rose-400" style={{ animationDuration: '6s' }} />
                <span>CURRENT STRATEGY</span>
              </div>
              <span className="text-emerald-400 text-[9px] font-bold">ACTIVE</span>
            </div>
            <div className="text-[10px] text-white font-bold tracking-wide truncate" title={strategy.tacticalDescription}>
              {strategy.tacticalDescription}
            </div>
          </div>

          {/* Real-time Tactical Trigger Banner */}
          {isRecentTactic && (
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-400 text-rose-200 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
              <ShieldAlert size={14} className="flex-shrink-0 text-rose-300" />
              <span className="truncate">{tacticalEvent.text}</span>
            </div>
          )}

          {/* Active Tactical Badges */}
          <div className="flex flex-wrap gap-1 pt-0.5">
            {(strategy.activeTactics ?? []).slice(0, 2).map((tactic, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9px] truncate max-w-full"
              >
                • {tactic}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};
