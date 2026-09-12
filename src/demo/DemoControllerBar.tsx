import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useDemoStore } from './demoStore';
import { useSound } from '../hooks/useSound';

export const DemoControllerBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playSound } = useSound();
  const {
    isDemoMode,
    demoStage,
    adaptationScore,
    adaptationGain,
    disableDemoMode,
    startDemoMatch1,
    injectMatch1Results,
    startDemoMatch2,
    triggerDemoLockIn,
    resolveChallengeSuccess,
    resetDemo,
  } = useDemoStore();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!isDemoMode) return null;

  // Step 1: Simulate Match 1 (Left Dodges) -> Go to Arena
  const handleStep1 = () => {
    playSound('click');
    startDemoMatch1();
    if (location.pathname !== '/arena') {
      navigate('/arena');
    }
  };

  // Step 2: Inject Match 1 Telemetry -> Go to Analysis
  const handleStep2 = () => {
    playSound('granted');
    injectMatch1Results();
    navigate('/analysis');
  };

  // Step 3: Start Match 2 with Counter-Strategy Active -> Go to Arena
  const handleStep3 = () => {
    playSound('scan');
    startDemoMatch2();
    navigate('/arena');
  };

  // Step 4: Trigger Lock-In Challenge in Arena
  const handleStep4 = () => {
    playSound('denied');
    triggerDemoLockIn();
    if (location.pathname !== '/arena') {
      navigate('/arena');
    }
  };

  // Step 5: Complete Adaptation Challenge & Victory
  const handleStep5 = () => {
    playSound('victory');
    resolveChallengeSuccess();
    if (location.pathname !== '/analysis') {
      navigate('/analysis');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '14px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        pointerEvents: 'auto',
      }}
    >
      {/* Collapsed Pill Badge */}
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => {
            playSound('click');
            setIsExpanded(true);
          }}
          title="Click to open Hackathon Demo Controller"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            background: 'rgba(5, 7, 12, 0.92)',
            border: '1px solid rgba(0, 240, 255, 0.5)',
            borderRadius: '24px',
            color: '#ffffff',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 8px #00f0ff' }} />
          <span>HACKATHON DEMO: {demoStage}</span>
          <ChevronDown size={14} color="#00f0ff" />
        </button>
      ) : (
        /* Expanded Controller Panel */
        <div
          style={{
            background: 'rgba(5, 7, 12, 0.96)',
            border: '1.5px solid rgba(0, 240, 255, 0.4)',
            borderRadius: '16px',
            padding: '14px 20px',
            maxWidth: '860px',
            width: '92vw',
            boxShadow: '0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(0, 240, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} color="#00f0ff" />
              <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', fontWeight: 800, color: '#00f0ff', letterSpacing: '0.12em' }}>
                PLAYNEXUS HACKATHON DEMO CONTROLLER
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.66rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(0, 255, 157, 0.15)',
                  border: '1px solid rgba(0, 255, 157, 0.4)',
                  color: '#00ff9d',
                }}
              >
                100% OFFLINE RESILIENT
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  playSound('click');
                  resetDemo();
                }}
                title="Reset Demo to Stage 1"
                style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#94a3b8',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RotateCcw size={12} />
                <span>RESET</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                title="Minimize Controller"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                <ChevronUp size={18} />
              </button>
            </div>
          </div>

          {/* 5-Step Demo Buttons Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {/* Step 1 */}
            <button
              type="button"
              onClick={handleStep1}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: demoStage === 'MATCH_1' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: demoStage === 'MATCH_1' ? '1px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.1)',
                color: demoStage === 'MATCH_1' ? '#00f0ff' : '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#94a3b8' }}>STEP 1</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', fontWeight: 700 }}>MATCH 1 (LEFT DODGE)</div>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={handleStep2}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: demoStage === 'BATTLE_INTEL' ? 'rgba(157, 78, 221, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: demoStage === 'BATTLE_INTEL' ? '1px solid #9d4edd' : '1px solid rgba(255, 255, 255, 0.1)',
                color: demoStage === 'BATTLE_INTEL' ? '#9d4edd' : '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#94a3b8' }}>STEP 2</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', fontWeight: 700 }}>BATTLE INTEL (DNA)</div>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={handleStep3}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: demoStage === 'MATCH_2' ? 'rgba(0, 119, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: demoStage === 'MATCH_2' ? '1px solid #0077ff' : '1px solid rgba(255, 255, 255, 0.1)',
                color: demoStage === 'MATCH_2' ? '#0077ff' : '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#94a3b8' }}>STEP 3</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', fontWeight: 700 }}>MATCH 2 (AI COUNTER)</div>
            </button>

            {/* Step 4 */}
            <button
              type="button"
              onClick={handleStep4}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: demoStage === 'LOCK_IN_CHALLENGE' ? 'rgba(255, 0, 85, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: demoStage === 'LOCK_IN_CHALLENGE' ? '1px solid #ff0055' : '1px solid rgba(255, 255, 255, 0.1)',
                color: demoStage === 'LOCK_IN_CHALLENGE' ? '#ff0055' : '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#94a3b8' }}>STEP 4</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', fontWeight: 700 }}>LOCK-IN (DODGE RIGHT)</div>
            </button>

            {/* Step 5 */}
            <button
              type="button"
              onClick={handleStep5}
              style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: demoStage === 'DEMO_VICTORY' || demoStage === 'COMPLETED' ? 'rgba(0, 255, 157, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: demoStage === 'DEMO_VICTORY' || demoStage === 'COMPLETED' ? '1px solid #00ff9d' : '1px solid rgba(255, 255, 255, 0.1)',
                color: demoStage === 'DEMO_VICTORY' || demoStage === 'COMPLETED' ? '#00ff9d' : '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#94a3b8' }}>STEP 5</div>
              <div style={{ fontFamily: 'var(--font-hud)', fontSize: '0.74rem', fontWeight: 700 }}>VICTORY (+22% ADAPT)</div>
            </button>
          </div>

          {/* Quick Metrics & Exit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '8px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#94a3b8', display: 'flex', gap: '14px' }}>
              <span>ACTIVE STAGE: <strong style={{ color: '#00f0ff' }}>{demoStage}</strong></span>
              <span>ADAPTATION SCORE: <strong style={{ color: '#00ff9d' }}>{adaptationScore}%</strong> {adaptationGain > 0 && `(+${adaptationGain}%)`}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('click');
                disableDemoMode();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff0055',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <X size={12} />
              <span>EXIT DEMO MODE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
