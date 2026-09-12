import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, ArrowLeft, RotateCcw, Award } from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Logo } from '../../components/common/Logo';

export const Analysis: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#05070c] text-white p-8 flex flex-col justify-between">
      <header className="flex justify-between items-center max-w-6xl w-full mx-auto">
        <Logo size="sm" />
        <GlowButton variant="secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} />
          <span>BACK TO DASHBOARD</span>
        </GlowButton>
      </header>

      <main className="max-w-4xl w-full mx-auto text-center my-12 p-8 border border-emerald-500/20 bg-slate-900/60 rounded-2xl backdrop-blur-md">
        <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4">
          <Dna size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-wider uppercase mb-2">FIGHTING DNA ANALYSIS</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 font-mono">
          [PLACEHOLDER] Post-match AI observation report, telemetry evolution, and counter adaptation metrics.
        </p>

        <div className="flex justify-center gap-4">
          <GlowButton variant="secondary" onClick={() => navigate('/arena')}>
            <RotateCcw size={18} />
            <span>REMATCH IN ARENA</span>
          </GlowButton>
          <GlowButton variant="primary" onClick={() => navigate('/leaderboard')}>
            <Award size={18} />
            <span>VIEW LEADERBOARD</span>
          </GlowButton>
        </div>
      </main>

      <footer className="text-center font-mono text-xs text-slate-500">
        PLAYNEXUS // ROUTE: /analysis
      </footer>
    </div>
  );
};
