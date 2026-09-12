import React from 'react';
import {
  Lock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
} from 'lucide-react';
import type { DodgeLockEvent } from '../../game/locks/DodgeLockTypes';

interface DodgeLockOverlayProps {
  event: DodgeLockEvent;
}

export const DodgeLockOverlay: React.FC<DodgeLockOverlayProps> = ({ event }) => {
  const {
    state,
    lockedDirection,
    targetDirection,
    detectionPercentage,
    timeRemaining,
    totalTime,
    rightDodgesPerformed,
    hasRewardBuff,
  } = event;

  if (state === 'IDLE' && !hasRewardBuff) return null;

  // Fraction remaining for circular countdown (1.0 down to 0.0)
  const timeProgress = Math.max(0, Math.min(1, timeRemaining / totalTime));
  const strokeDashoffset = 283 * (1 - timeProgress); // Circumference of r=45 is ~283

  return (
    <div className="fixed inset-x-0 top-16 z-40 flex flex-col items-center pointer-events-none select-none font-mono">
      {/* 1. PATTERN DETECTED MODAL / ANNOUNCEMENT */}
      {state === 'PATTERN_DETECTED' && (
        <div className="animate-bounce-in max-w-lg w-full mx-4 p-5 rounded-3xl bg-slate-950/95 border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)] backdrop-blur-xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold tracking-widest uppercase animate-pulse">
            <AlertTriangle size={14} />
            <span>PATTERN DETECTED</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-sans text-white tracking-wider uppercase">
            YOU'VE BEEN DODGING {lockedDirection.toUpperCase()}.
          </h2>

          <div className="text-base md:text-lg font-bold text-amber-400">
            <span className="text-3xl font-black">{detectionPercentage}%</span> OF YOUR DODGES ARE {lockedDirection.toUpperCase()}.
          </div>

          <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 flex items-center justify-center gap-1.5 font-sans">
            <Lock size={13} className="text-amber-400" />
            <span>PREDICTIVE LOCK ENGAGING IN 3... 2... 1...</span>
          </div>
        </div>
      )}

      {/* 2. ADAPTATION LOCK ACTIVE BANNER & COUNTDOWN */}
      {state === 'CHALLENGE_ACTIVE' && (
        <div className="max-w-xl w-full mx-4 p-4 md:p-5 rounded-3xl bg-slate-950/90 border-2 border-cyan-500 shadow-[0_0_40px_rgba(0,240,255,0.3)] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Challenge Description */}
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[10px] font-bold tracking-widest uppercase">
              <Lock size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
              <span>ADAPTATION LOCK ACTIVATED</span>
            </div>

            <div className="text-lg md:text-xl font-black font-sans text-white tracking-wider uppercase">
              SURVIVE 15 SECONDS
            </div>

            <div className="text-xs font-bold text-amber-400 flex items-center justify-center md:justify-start gap-1">
              <span>DODGING ONLY</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-white font-black tracking-widest uppercase flex items-center gap-1">
                {targetDirection.toUpperCase()} <ArrowRight size={12} />
              </span>
            </div>

            <div className="text-[10px] text-slate-400">
              Left Dodge = <span className="text-rose-400 font-bold">FAILURE</span> | Reward = <span className="text-emerald-400 font-bold">+20% DODGE SPEED</span>
            </div>
          </div>

          {/* Right Circular Countdown Timer & Dodge Counter */}
          <div className="flex items-center gap-4">
            {/* Counter badge */}
            <div className="text-center p-2 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-[9px] text-slate-400 uppercase tracking-widest">RIGHT DODGES</div>
              <div className="text-xl font-black text-cyan-400 font-sans mt-0.5">
                {rightDodgesPerformed}
              </div>
            </div>

            {/* Circular Countdown SVG */}
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-100 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black font-sans text-white">
                  {timeRemaining.toFixed(1)}s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHALLENGE SUCCESS STATE */}
      {state === 'CHALLENGE_SUCCESS' && (
        <div className="max-w-lg w-full mx-4 p-5 rounded-3xl bg-slate-950/95 border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)] backdrop-blur-xl text-center space-y-2 animate-bounce-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-xs font-bold tracking-widest uppercase">
            <CheckCircle2 size={15} />
            <span>ADAPTATION OVERRIDE SUCCESSFUL</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-sans text-white tracking-widest uppercase">
            CHALLENGE COMPLETE!
          </h2>

          <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-center gap-2 text-sm font-bold font-sans">
            <Zap size={18} className="text-emerald-400" />
            <span>REWARD ACTIVATED: +20% DODGE SPEED & DRIFT RECOVERY</span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Neural bias shattered // AI counter-prediction disrupted!
          </div>
        </div>
      )}

      {/* 4. CHALLENGE FAILED STATE */}
      {state === 'CHALLENGE_FAILED' && (
        <div className="max-w-lg w-full mx-4 p-5 rounded-3xl bg-slate-950/95 border-2 border-rose-500 shadow-[0_0_50px_rgba(244,63,94,0.4)] backdrop-blur-xl text-center space-y-2 animate-bounce-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-bold tracking-widest uppercase">
            <XCircle size={15} />
            <span>LOCK VIOLATION</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black font-sans text-white tracking-widest uppercase">
            LOCK FAILED
          </h2>

          <div className="text-sm font-bold text-rose-400">
            YOU REVERTED TO A PREDICTABLE {lockedDirection.toUpperCase()} DODGE.
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            AI has recorded your vulnerability // Challenge on cooldown
          </div>
        </div>
      )}

      {/* 5. PASSIVE REWARD BUFF BADGE (when unlocked) */}
      {hasRewardBuff && state === 'IDLE' && (
        <div className="mt-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
          <Zap size={14} className="text-emerald-400" />
          <span>REWARD ACTIVE: +20% DODGE SPEED</span>
        </div>
      )}
    </div>
  );
};
