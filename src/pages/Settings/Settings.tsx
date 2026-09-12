import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { GlowButton } from '../../components/common/GlowButton';
import { Logo } from '../../components/common/Logo';

export const Settings: React.FC = () => {
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

      <main className="max-w-4xl w-full mx-auto text-center my-12 p-8 border border-slate-700 bg-slate-900/60 rounded-2xl backdrop-blur-md">
        <div className="inline-flex p-4 rounded-full bg-slate-800 text-slate-300 mb-4">
          <SettingsIcon size={40} />
        </div>
        <h1 className="text-3xl font-black tracking-wider uppercase mb-2">SYSTEM SETTINGS</h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 font-mono">
          [PLACEHOLDER] Configure neural audio, camera scanning, speech recognition, and visual graphics quality.
        </p>

        <div className="flex justify-center gap-4">
          <GlowButton variant="primary" onClick={() => navigate('/')}>
            <span>SAVE & RETURN HOME</span>
          </GlowButton>
        </div>
      </main>

      <footer className="text-center font-mono text-xs text-slate-500">
        PLAYNEXUS // ROUTE: /settings
      </footer>
    </div>
  );
};
