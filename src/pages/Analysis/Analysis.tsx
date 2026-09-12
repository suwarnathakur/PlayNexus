import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Award,
  Dna,
  Activity,
} from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Logo } from '../../components/common/Logo';
import { useTelemetryStore } from '../../store/telemetryStore';
import { BattleIntelligenceView } from '../../components/ai/BattleIntelligenceView';
import { FightingDNA } from '../../ai/FightingDNA/FightingDNA';

export const Analysis: React.FC = () => {
  const navigate = useNavigate();
  const { latestMatch, fightingDNA } = useTelemetryStore();
  const [activeTab, setActiveTab] = useState<'DNA' | 'TELEMETRY'>('DNA');

  // Use fightingDNA from store or fallback
  const activeDNA = fightingDNA || FightingDNA.getDefaultProfile();
  const metrics = latestMatch?.metrics;

  return (
    <div className="min-h-screen bg-[#05070c] text-white p-4 md:p-8 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          {/* Sub-tab switcher */}
          <div className="hidden sm:flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('DNA')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'DNA'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dna size={14} />
              <span>FIGHTING DNA</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TELEMETRY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'TELEMETRY'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={14} />
              <span>TELEMETRY METRICS</span>
            </button>
          </div>

          <GlowButton variant="secondary" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
            <span>BACK TO DASHBOARD</span>
          </GlowButton>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto my-6">
        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden justify-center mb-6 bg-slate-950/80 p-1 rounded-xl border border-slate-800 font-mono text-xs w-fit mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('DNA')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'DNA'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400'
            }`}
          >
            FIGHTING DNA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TELEMETRY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'TELEMETRY'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'text-slate-400'
            }`}
          >
            TELEMETRY METRICS
          </button>
        </div>

        {activeTab === 'DNA' ? (
          <BattleIntelligenceView
            dna={activeDNA}
            matchOutcome={latestMatch?.outcome === 'VICTORY' || latestMatch?.outcome === 'DEFEAT' ? latestMatch.outcome : 'VICTORY'}
            matchDurationSeconds={latestMatch?.durationSeconds || 32}
            matchId={latestMatch?.matchId || 'SESSION-ALPHA-01'}
            onNextFight={() => navigate('/arena')}
            onReplay={() => navigate('/arena')}
            onExit={() => navigate('/')}
          />
        ) : (
          /* ================= TELEMETRY METRICS VIEW ================= */
          <div className="p-6 md:p-8 rounded-3xl bg-slate-950/80 border border-emerald-500/20 backdrop-blur-xl shadow-2xl space-y-8 font-mono">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Activity size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-black font-sans tracking-wider uppercase">
                COMBAT TELEMETRY REPORT
              </h2>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Raw event distributions, timing timestamps, and accuracy logs from match {latestMatch?.matchId || 'SESSION-01'}.
              </p>
            </div>

            {metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Total Attacks</div>
                  <div className="text-xl font-bold text-white mt-1">{metrics.totalAttacks}</div>
                  <div className="text-[10px] text-slate-500">{metrics.successfulAttacks} Hits / {metrics.missedAttacks} Miss</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Accuracy</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{metrics.accuracyPercentage}%</div>
                  <div className="text-[10px] text-slate-500">Hit Connection</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Guard Blocks</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{metrics.blocks}</div>
                  <div className="text-[10px] text-slate-500">Defensive Shields</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Dodges (L / R)</div>
                  <div className="text-xl font-bold text-purple-400 mt-1">{metrics.dodges}</div>
                  <div className="text-[10px] text-slate-500">
                    L: {metrics.dodgeLeftPercentage}% | R: {metrics.dodgeRightPercentage}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Avg Combo</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">{metrics.averageComboLength}x</div>
                  <div className="text-[10px] text-slate-500">Peak Combo: x{metrics.maxCombo}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">Damage Ratio</div>
                  <div className="text-xl font-bold text-rose-400 mt-1">{metrics.totalDamageDealt}</div>
                  <div className="text-[10px] text-slate-500">Dealt / -{metrics.totalDamageReceived} Taken</div>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 pt-4">
              <GlowButton variant="secondary" onClick={() => navigate('/arena')}>
                <RotateCcw size={18} />
                <span>REMATCH IN ARENA</span>
              </GlowButton>
              <GlowButton variant="primary" onClick={() => navigate('/leaderboard')}>
                <Award size={18} />
                <span>VIEW LEADERBOARD</span>
              </GlowButton>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center font-mono text-xs text-slate-500 py-4">
        PLAYNEXUS // BATTLE INTELLIGENCE ENGINE // FIGHTING DNA MODULE v1.0
      </footer>
    </div>
  );
};
