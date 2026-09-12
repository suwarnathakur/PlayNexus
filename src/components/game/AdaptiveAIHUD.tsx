import React from 'react';
import { Brain, Cpu, ShieldAlert } from 'lucide-react';
import type { CounterStrategy } from '../../ai/adaptive/CounterStrategy';
import type { AdaptiveTacticalEvent } from '../../ai/adaptive/AdaptiveAI';

interface AdaptiveAIHUDProps {
  strategy: CounterStrategy;
  tacticalEvent: AdaptiveTacticalEvent | null;
}

export const AdaptiveAIHUD: React.FC<AdaptiveAIHUDProps> = ({
  strategy,
  tacticalEvent,
}) => {
  const isRecentTactic =
    tacticalEvent && Date.now() - tacticalEvent.timestamp < 2500;

  return (
    <aside
      aria-label="AI Adaptive Telemetry Feed"
      className="fixed top-20 right-4 z-30 max-w-xs w-full font-mono text-xs select-none pointer-events-none"
    >
      <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-rose-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(255,0,85,0.18)] space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Brain size={15} className="text-rose-400" />
            <span className="font-bold text-white tracking-widest text-[11px] font-sans">
              AI LEARNING
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
            NEURAL v2
          </span>
        </div>

        {/* Telemetry Learning Readout */}
        <div className="space-y-1.5 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">DODGE LEFT:</span>
            <span className="text-rose-400 font-bold">
              {Math.round(strategy.dodgeLeftFrequency * 100)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">COMBO:</span>
            <span className="text-amber-400 font-bold truncate max-w-[130px]" title={strategy.comboPatternName}>
              {strategy.comboPatternName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">PREDICTABILITY:</span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                strategy.predictabilityLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {strategy.predictabilityLevel}
            </span>
          </div>
        </div>

        {/* COUNTER-STRATEGY ACTIVE Banner */}
        <div className="p-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-purple-950/80 border border-rose-500/50 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-rose-300 tracking-wider">
            <Cpu size={12} className="animate-spin text-rose-400" style={{ animationDuration: '6s' }} />
            <span>COUNTER-STRATEGY ACTIVE</span>
          </div>
          <div className="text-[10px] text-white font-bold tracking-wide truncate" title={strategy.tacticalDescription}>
            {strategy.tacticalDescription}
          </div>
        </div>

        {/* Live Real-time Trigger Notification */}
        {isRecentTactic && (
          <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-400 text-rose-200 text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
            <ShieldAlert size={14} className="flex-shrink-0 text-rose-300" />
            <span className="truncate">{tacticalEvent.text}</span>
          </div>
        )}

        {/* Tactic Badges */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {strategy.activeTactics.slice(0, 2).map((tactic, idx) => (
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
  );
};
