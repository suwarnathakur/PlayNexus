import React from 'react';
import {
  CloudSun,
  Lock,
  Award,
  Crosshair,
} from 'lucide-react';

export const PlayNexusArenaUI: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden font-sans select-none text-cyan-50">
      
      {/* ---------------- 3D BACKGROUND ARENA LAYER ---------------- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Background Atmosphere Image / Canvas Placement */}
        <div 
          className="w-full h-full bg-cover bg-center brightness-75 contrast-125 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/rd-gg/ACRwjatS5FB5kPoPK_KkF5lt9aMpUGbftpKUhRq4zR4qQ4O3w1ywMQyTnffOsFrHC3hCReEigYjNBreiOBMqacrqwKTpc4iiAsAnoEho5kt1WQO3AQDYbCw7cZksH73Ex0Awh67QsBZeatoGhHR049EGzq4GA1ogO2S_wFMDeiSke0n3nGW2bPDuCBjLPZYmhwhrAWXHtct9D86SNNjIhfn7C-ruARsYeLJf4VjrbSkCX77s3HGanD0GUjukuTdxuEkQvH-2_T982VaO4ZBfEKJ5VaSacLj73-q3nq9JqXQEeI6r5hsYqEP28Q9suUdfZ95tQxNUZBhfR5MPkAoELcLXEHsNRHejbwq_q-F4bhJuRLe6B8P4Wm3AhB3pHSKH8-aQqnRpL6Jm2iRJ07VLcTjqywGEWOSiEm3LvJAvWjPAiVYulQzY13beuhk5hjzkpuOvIPVB0Tx_x-KEo_aJpcB5T__jQCvGgcW50bblDc14OPKG6P0iY1iE9Bdd7VhcfhYhkPwOVDBOwTpUH94xVXtL7TJ4fgJuFSQvUwABddbU6YZ0ZZtLsyZafm7IBvD3MPNKVJUTjvPBQL9F40C5ZkII_gFwcupXHjZN3IHSVXAGAns8jnOYE-1aNeVe7_E_8z2ferFMBV-fBJzACABzOwx2QJ_u87ERrR-JtU8e7-ZVYc6KmWGU6seLNhDQU7CB-iWlslhnU7XNdyPaUVK6KsbuA36JCqwx6hTopJeSUl3Q2BJK3bsbu5L8M7E8tBck5POXOyPErKGpzhdTWc-xxmObuDdgpK8ZOOKUpHHDTzMnj9kRyLRGbsHO2xhdaGv-J8CorCEd-HwxQl92CHnmwzw9dnBZ61fZfmWLsgem39uyZ11vIYdoDS2UpuF3DHHt3COaHF7WnfQy--O1vlmbkBDVXI95M4MThbFpOtOif0aGdCl28uFn5mNgG84QbribI9jDsdmE25bS4WfNoa-iTJed882LuEhh7twi0QPLVCSVn7zJF-a11z5Dmig814C1uYwCu0_5xKRztt8uuaFvcTo83lXRnwVjyerf4xeQuj6Z6t1y-t4StpDuO1jyojDoM-7VnWym4DpySB6A4NCQWPSaHmeIP0kkvMdWKWT8_1FEaOFHauIeO62Y0JOSZc0B6rCmt_uXoMo-6AivvfHnYE0ZfomfOrCXAzVrUcmkLrz0NNLGhOE0WDEDcncbM_Q7667Zs2D4inFwv3Xj-sFbPDnmBR8ZB3BmJCtrp45MEz5bCxs5YX6LGP0MK-9w2Kwh0KW3jOLqxCqXVwuYOpldNrpsxYIbdQehR7f0pk9BRhg0Gbp3Qfo4Qn8bfT0GM68H1RYtuxcvp2WxZi66weCp32_wIxJq1t-tHpNh-7YFHQtifTaXc-TLeewJC2HGJ9seClAaH1Cmu4KQyuQ2f9XZwTuWlak1LJpd4SWs8PY=s1024-rj')`
          }}
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/90" />
      </div>

      {/* ---------------- MAIN HOLOGRAPHIC HUD OVERLAY ---------------- */}
      <div className="relative z-10 w-full h-full p-4 flex flex-col justify-between backdrop-blur-[1px]">
        
        {/* ================= TOP SECTION ================= */}
        <div className="grid grid-cols-12 gap-4 items-start">
          <div className="col-span-6 flex justify-end items-center gap-3 pr-4" />
          <div className="col-span-6 flex justify-end items-center gap-3 pr-4">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-cyan-500/20 px-3 py-1 rounded-full text-xs font-mono text-cyan-300">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" /> Weather API: 18:42:15 | NW 14km/h
            </div>
          </div>
        </div>

        {/* ================= MIDDLE SECTION ================= */}
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3" />

          {/* Center Column: Prominent CTA */}
          <div className="col-span-6 flex flex-col items-center justify-center pointer-events-auto">
            <button className="relative group px-16 py-4 bg-linear-to-r from-cyan-600 via-teal-500 to-cyan-600 border-2 border-cyan-300 rounded-lg font-black text-xl text-white tracking-widest shadow-[0_0_35px_rgba(0,210,255,0.7)] hover:shadow-[0_0_50px_rgba(0,210,255,1)] transition-all duration-300 active:scale-95 uppercase">
              <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">START FIGHT</span>
              <div className="absolute inset-0 bg-cyan-400/20 rounded-lg blur-md group-hover:opacity-100 opacity-50 transition-opacity" />
            </button>
          </div>

          {/* Panel 4: Adaptation Lock Escape Challenge */}
          <div className="col-span-3 flex justify-end">
            <div className="w-full bg-slate-950/75 border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_15px_rgba(6,182,212,0.15)] pointer-events-auto">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-400" /> Adaptation Lock</span>
                <span className="text-[10px] text-amber-400 font-mono">CHALLENGE</span>
              </div>
              <p className="text-xs text-slate-300 mb-3">
                Escape Requirement: Perform <strong className="text-cyan-300">3 successful RIGHT dodges</strong> in sequence.
              </p>
              <button className="w-full py-2 bg-linear-to-r from-emerald-600 to-teal-600 border border-emerald-400/50 rounded text-xs font-bold tracking-wider uppercase text-white hover:brightness-125 transition">
                Attempt Escape
              </button>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="grid grid-cols-12 gap-4 items-end pointer-events-auto">
          
          {/* Bottom Left: Player Profile & Level Badge */}
          <div className="col-span-5 bg-slate-950/85 border border-cyan-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-4">
              {/* Character Avatar */}
              <div className="relative w-16 h-16 rounded-lg border-2 border-cyan-400 overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <img 
                  src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80" 
                  alt="Player Profile Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Player Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-cyan-200">Saumya Singh</h3>
                  {/* Level Badge */}
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-[10px] font-bold text-white border border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                    <Award className="w-3 h-3" /> Lvl 50 Ninja Honoree
                  </span>
                </div>
                
                {/* Preferred Attacks List */}
                <div className="mt-2 text-xs text-slate-300 font-mono space-y-0.5">
                  <p><span className="text-cyan-400">• Preferred:</span> Counter-poke</p>
                  <p><span className="text-cyan-400">• Secondary:</span> Melee probe</p>
                  <p><span className="text-cyan-400">• Ultimate:</span> Cloneay mistim</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right: Weapon Forge Schematic */}
          <div className="col-span-7 bg-slate-950/85 border border-cyan-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex justify-between items-center text-xs font-mono text-cyan-400 mb-2 border-b border-cyan-500/20 pb-1">
              <span className="font-bold flex items-center gap-2"><Crosshair className="w-4 h-4" /> WEAPON FORGE: R-Scan</span>
              <span className="text-emerald-400">STATUS: READY</span>
            </div>

            <div className="relative border border-dashed border-cyan-500/30 rounded-lg p-4 bg-slate-900/40 flex items-center justify-between">
              {/* Schematic Blueprint Silhouette */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-12 bg-cyan-950/40 border border-cyan-500/30 rounded flex items-center justify-center font-mono text-[10px] text-cyan-300">
                  SCHEMATIC
                </div>
                <div className="text-xs font-mono space-y-1">
                  <p className="text-cyan-300 font-bold">ARENA BARRIER: TOME STAFF</p>
                  <p className="text-[10px] text-slate-400">Class: Futuristic Hybrid Catalyst</p>
                </div>
              </div>

              {/* Interactive Action */}
              <button className="px-4 py-2 bg-cyan-950 border border-cyan-400 text-cyan-300 rounded text-xs font-mono font-bold hover:bg-cyan-900 transition shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                EQUIP ITEM
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};