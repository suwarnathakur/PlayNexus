import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

interface RememberPlayerProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const RememberPlayer: React.FC<RememberPlayerProps> = ({
  checked,
  onChange,
  disabled = false,
}) => {
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const { playSound } = useSound();

  const handleToggle = () => {
    if (disabled) return;
    const next = !checked;
    onChange(next);
    playSound('click');

    if (next) {
      setShowSavedNotification(true);
      setTimeout(() => {
        setShowSavedNotification(false);
      }, 2000);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={handleToggle}
        disabled={disabled}
        onMouseEnter={() => playSound('hover')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          background: 'transparent',
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          padding: 0,
          outline: 'none',
        }}
      >
        {/* Futuristic Glowing Checkbox Box */}
        <div
          style={{
            position: 'relative',
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: checked ? 'rgba(0, 240, 255, 0.2)' : 'rgba(15, 23, 42, 0.6)',
            border: `1.5px solid ${checked ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.2)'}`,
            boxShadow: checked ? '0 0 12px rgba(0, 240, 255, 0.6)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {checked && (
            <Check
              size={13}
              color="var(--accent-cyan)"
              strokeWidth={3}
              style={{ animation: 'checkPop 0.25s ease-out' }}
            />
          )}
        </div>

        {/* Label Text */}
        <span
          style={{
            fontFamily: 'var(--font-game)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text-main)',
            textTransform: 'uppercase',
            transition: 'color 0.2s ease',
          }}
        >
          REMEMBER PLAYER
        </span>
      </button>

      {/* "PLAYER PROFILE SAVED" Micro-animation badge */}
      {showSavedNotification && (
        <span
          style={{
            position: 'absolute',
            left: '165px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--status-success)',
            background: 'rgba(0, 255, 157, 0.1)',
            border: '1px solid rgba(0, 255, 157, 0.4)',
            padding: '2px 8px',
            borderRadius: '10px',
            letterSpacing: '0.1em',
            animation: 'fadeInOut 2s ease forwards',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          ● PROFILE SAVED
        </span>
      )}

      <style>{`
        @keyframes checkPop {
          0% { transform: scale(0.4); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); }
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-6px); }
          20% { opacity: 1; transform: translateX(0); }
          80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};
