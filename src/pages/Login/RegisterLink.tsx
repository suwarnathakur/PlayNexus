import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

interface RegisterLinkProps {
  onNavigateRegister: () => void;
}

export const RegisterLink: React.FC<RegisterLinkProps> = ({ onNavigateRegister }) => {
  const { playSound } = useSound();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
        fontSize: '0.85rem',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono, monospace)',
          color: 'var(--text-muted, #94a3b8)',
          fontSize: '0.8rem',
        }}
      >
        NEW OPERATIVE?
      </span>
      <button
        type="button"
        onClick={() => {
          playSound('click');
          onNavigateRegister();
        }}
        onMouseEnter={() => playSound('hover')}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--font-hud, monospace)',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--accent-cyan, #00f0ff)',
          padding: 0,
          transition: 'all 0.2s ease',
          outline: 'none',
          letterSpacing: '0.08em',
        }}
      >
        <span>CREATE PLAYER PROFILE</span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};
