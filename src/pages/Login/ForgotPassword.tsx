import React, { useState } from 'react';
import { useSound } from '../../hooks/useSound';

interface ForgotPasswordProps {
  onResetRequested?: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onResetRequested }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { playSound } = useSound();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    playSound('click');
    setShowModal(true);
    if (onResetRequested) onResetRequested();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => {
          setIsHovered(true);
          playSound('hover');
        }}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'var(--font-game)',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: isHovered ? 'var(--color-forest)' : 'var(--text-muted)',
          textTransform: 'uppercase',
          borderBottom: `1.5px dashed ${isHovered ? 'var(--color-forest)' : 'transparent'}`,
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      >
        FORGOT ACCESS CODE?
      </button>

      {/* Futuristic Emergency Recovery Prompt Modal */}
      {showModal && (
        <div
          role="dialog"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(3, 5, 8, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9995,
          }}
        >
          <div
            className="cyber-panel"
            style={{
              padding: '30px',
              maxWidth: '440px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-cyan)', fontSize: '1.2rem' }}>
              ACCESS CODE RECOVERY
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              A quantum override beacon will be dispatched to your registered neural communicator. Demo override code is:
              <strong style={{ color: '#ffffff', display: 'block', margin: '8px 0', fontFamily: 'var(--font-mono)' }}>
                NEXUS-7799
              </strong>
            </p>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setShowModal(false);
              }}
              style={{
                alignSelf: 'flex-end',
                padding: '8px 20px',
                background: 'var(--accent-cyan)',
                border: 'none',
                borderRadius: '6px',
                color: '#000',
                fontFamily: 'var(--font-display)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      )}
    </>
  );
};
