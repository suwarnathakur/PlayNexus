import React, { useState } from 'react';
import {
  Activity,
  Shield,
  Zap,
  Eye,
  Footprints,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import type { TelemetryEvent, MatchMetrics } from '../../game/telemetry/TelemetryTypes';

interface TelemetryDebugPanelProps {
  events: TelemetryEvent[];
  metrics: MatchMetrics | null;
  onClear?: () => void;
}

export const TelemetryDebugPanel: React.FC<TelemetryDebugPanelProps> = ({
  events,
  metrics,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'STREAM' | 'METRICS'>('STREAM');

  const recentEvents = events.slice(-10).reverse();

  // Action badge style helpers
  const getBadgeStyle = (action: string) => {
    switch (action) {
      case 'attack':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'hit':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'miss':
        return 'bg-slate-700/50 text-slate-400 border-slate-600';
      case 'block':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'dodge':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'damage_received':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm w-full font-mono text-xs select-none">
      {/* Header bar / Minimize toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-3 py-2 bg-slate-950/90 border border-cyan-500/40 rounded-t-xl cursor-pointer hover:bg-slate-900 transition-colors shadow-lg backdrop-blur-md"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Activity size={14} className="text-cyan-400" />
          <span className="font-bold text-white tracking-wider text-[11px]">
            TELEMETRY DEBUG HUD
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[10px]">
            {events.length} EVTS
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 hover:text-white">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="bg-slate-950/90 border-x border-b border-cyan-500/30 rounded-b-xl backdrop-blur-md p-3 shadow-2xl space-y-3">
          {/* Tab buttons */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('STREAM')}
                className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                  activeTab === 'STREAM'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LIVE STREAM
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('METRICS')}
                className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition-all ${
                  activeTab === 'METRICS'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                AI PILLARS
              </button>
            </div>

            {onClear && (
              <button
                type="button"
                onClick={onClear}
                title="Reset Telemetry Data"
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          {/* Tab 1: Live Event Stream */}
          {activeTab === 'STREAM' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold px-1">
                <span>RECENT ACTIONS</span>
                <span>TIME / DETAILS</span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
                {recentEvents.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-[11px] italic">
                    Press WASD, J, K, or SPACE to generate telemetry...
                  </div>
                ) : (
                  recentEvents.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 transition-colors text-[11px]"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded border uppercase text-[9px] font-bold tracking-wider ${getBadgeStyle(
                            e.action
                          )}`}
                        >
                          {e.action}
                          {e.direction ? `:${e.direction}` : ''}
                        </span>
                        {e.combo && e.combo > 1 && (
                          <span className="text-amber-400 text-[10px] font-bold">
                            x{e.combo}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-slate-300 font-medium text-[10px]">
                          {e.details || `${e.damage ? `-${e.damage} HP` : ''}`}
                        </span>
                        {e.intervalSinceLastAction !== undefined && e.intervalSinceLastAction > 0 && (
                          <span className="text-slate-500 text-[9px] block">
                            +{e.intervalSinceLastAction}ms
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Calculated Metrics & AI Pillars */}
          {activeTab === 'METRICS' && metrics && (
            <div className="space-y-3">
              {/* Quick Combat Stats Grid */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase">Attacks / Hits</div>
                  <div className="text-cyan-400 font-bold text-xs">
                    {metrics.totalAttacks} / {metrics.successfulAttacks}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    {metrics.accuracyPercentage}% Acc
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase">Blocks / Dodges</div>
                  <div className="text-indigo-400 font-bold text-xs">
                    {metrics.blocks} / {metrics.dodges}
                  </div>
                  <div className="text-[9px] text-slate-500">
                    L:{metrics.dodgeLeftPercentage}% R:{metrics.dodgeRightPercentage}%
                  </div>
                </div>

                <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[9px] text-slate-400 uppercase">Avg Combo</div>
                  <div className="text-amber-400 font-bold text-xs">
                    {metrics.averageComboLength}x
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Max: x{metrics.maxCombo}
                  </div>
                </div>
              </div>

              {/* 4 Core AI Adaptation Pillars */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                {/* Aggression */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-0.5">
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <Zap size={11} /> AGGRESSION
                    </span>
                    <span className="text-white font-bold">{metrics.aggression}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-300"
                      style={{ width: `${metrics.aggression}%` }}
                    />
                  </div>
                </div>

                {/* Defense */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-0.5">
                    <span className="flex items-center gap-1 text-cyan-400 font-bold">
                      <Shield size={11} /> DEFENSE
                    </span>
                    <span className="text-white font-bold">{metrics.defense}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${metrics.defense}%` }}
                    />
                  </div>
                </div>

                {/* Mobility */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-0.5">
                    <span className="flex items-center gap-1 text-purple-400 font-bold">
                      <Footprints size={11} /> MOBILITY
                    </span>
                    <span className="text-white font-bold">{metrics.mobility}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-300"
                      style={{ width: `${metrics.mobility}%` }}
                    />
                  </div>
                </div>

                {/* Predictability */}
                <div>
                  <div className="flex justify-between items-center text-[10px] mb-0.5">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Eye size={11} /> PREDICTABILITY
                    </span>
                    <span className="text-white font-bold">{metrics.predictability}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-300"
                      style={{ width: `${metrics.predictability}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Footer */}
          <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] text-slate-500">
            <span>PLAYNEXUS LOCAL TELEMETRY</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles size={10} /> ENGINE READY
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
