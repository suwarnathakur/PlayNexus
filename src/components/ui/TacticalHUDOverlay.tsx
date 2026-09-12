import React from 'react';
import { Shield } from 'lucide-react';

export const TacticalHUDOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 select-none font-sans text-white">
      <div className="grid grid-cols-12 gap-4 items-start w-full">
        <div className="col-span-3 bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" /> Counter-Measures
          </div>
          <ul className="text-xs text-slate-300 space-y-1 font-mono">
            <li>• Data-streams active</li>
            <li>• Data stereos synced</li>
            <li>• Translucent data traces</li>
            <li>• Data mirage: 94%</li>
          </ul>
        </div>

        <div className="col-span-6 flex flex-col items-center gap-2">
          <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-400/50 rounded-lg px-6 py-2 text-center pointer-events-auto">
            <span className="text-xs text-cyan-300 font-mono tracking-widest uppercase">AI Stance Prediction</span>
            <div className="h-8 flex items-end justify-center gap-1 mt-1">
              {[40, 70, 35, 90, 60, 85, 45].map((h, i) => (
                <div key={i} className="w-1.5 bg-cyan-400 rounded-t" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/20 rounded-md px-4 py-1 text-[10px] text-cyan-200 font-mono">
            Threat Vector: Threat-end active
          </div>
        </div>

        <div className="col-span-3 bg-slate-900/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 pointer-events-auto">
          <div className="flex items-center justify-between text-xs font-mono mb-1">
            <span className="text-cyan-400 font-bold">Tactical DNA</span>
            <span className="text-emerald-400">91%</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2">LEFT DODGE: Predictable pattern detected</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full w-[87%]" />
          </div>
        </div>
      </div>

      <div className="flex justify-center my-auto pointer-events-auto">
        <button className="relative group px-12 py-3 bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 border-2 border-cyan-300 rounded-md font-extrabold text-lg text-white shadow-[0_0_25px_rgba(0,210,255,0.6)] hover:shadow-[0_0_40px_rgba(0,210,255,0.9)] transition-all duration-300 active:scale-95">
          <span className="drop-shadow-md tracking-widest">START FIGHT</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 w-full items-end pointer-events-auto">
        <div className="col-span-4 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4">
          <h3 className="text-xs font-bold text-cyan-400 font-mono uppercase mb-2">Player Profile</h3>
          <div className="space-y-1 text-xs text-slate-300">
            <p><span className="text-slate-400">• Preferred Attack:</span> Counter-poke</p>
            <p><span className="text-slate-400">• Secondary Attack:</span> Melee probe</p>
            <p><span className="text-slate-400">• Ultimate Tactic:</span> Cloneay mistim</p>
          </div>
        </div>

        <div className="col-span-5 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4 text-center">
          <div className="flex justify-between items-center text-xs font-mono text-cyan-400 mb-2">
            <span>WEAPON FORGE: R-Scan</span>
            <span className="text-[10px] text-slate-400">EX-MODE</span>
          </div>
          <div className="border border-dashed border-cyan-500/30 rounded py-3 bg-slate-950/40">
            <p className="text-xs font-mono text-cyan-300 font-semibold">ARENA BARRIER TOME STAFF</p>
          </div>
        </div>

        <div className="col-span-3 bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 rounded-xl p-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400 bg-cyan-950/50 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,212,255,0.4)]">
            <span className="text-2xl">⚔️</span>
          </div>
          <span className="text-xs font-bold text-cyan-300">Nyra Fhonora</span>
          <span className="text-[10px] font-mono text-slate-400">View: 3D Animated Avatar</span>
        </div>
      </div>
    </div>
  );
};
