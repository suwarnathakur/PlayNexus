import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TacticalHUDOverlay: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 select-none font-sans text-white">
      <div className="flex-1 flex items-center justify-center pointer-events-auto">
        <button
          type="button"
          onClick={() => navigate('/character-select')}
          className="relative group px-12 py-3 bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 border-2 border-cyan-300 rounded-md font-extrabold text-lg text-white shadow-[0_0_25px_rgba(0,210,255,0.6)] hover:shadow-[0_0_40px_rgba(0,210,255,0.9)] transition-all duration-300 active:scale-95"
        >
          <span className="drop-shadow-md tracking-widest">LET&apos;S PLAY</span>
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
