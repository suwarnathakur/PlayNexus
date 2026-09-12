import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useSound } from '../../hooks/useSound';

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  isValid?: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoComplete?: string;
  rightElement?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  icon,
  error,
  isValid = false,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  autoComplete = 'off',
  rightElement,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { playSound } = useSound();

  const handleFocus = () => {
    setIsFocused(true);
    playSound('focus');
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    playSound('typing');
    onChange(e);
  };

  const hasError = Boolean(error);
  const showValid = isValid && !hasError && value.length > 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        position: 'relative',
      }}
      className={hasError ? 'input-error-shake' : ''}
    >
      {/* Dynamic Floating / Technical Label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-hud)',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '0.16em',
          color: hasError
            ? 'var(--status-warning)'
            : isFocused
            ? 'var(--accent-cyan)'
            : 'var(--text-secondary)',
          textTransform: 'uppercase',
          transition: 'color 0.2s ease',
        }}
      >
        <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <span>{isFocused ? '▶' : '▷'}</span>
          <span>{label}</span>
        </label>
        {showValid && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--status-success)',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Check size={12} /> VERIFIED
          </span>
        )}
      </div>

      {/* Input Outer Box with Laser Beam & Glow */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-glass-input)',
          border: `1px solid ${
            hasError
              ? 'var(--status-warning)'
              : isFocused
              ? 'var(--accent-cyan)'
              : showValid
              ? 'var(--status-success)'
              : 'rgba(255, 255, 255, 0.1)'
          }`,
          borderRadius: 'var(--border-radius-sm)',
          boxShadow: hasError
            ? '0 0 16px var(--status-warning-glow)'
            : isFocused
            ? '0 0 20px rgba(0, 240, 255, 0.35), inset 0 0 10px rgba(0, 240, 255, 0.05)'
            : 'none',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Left Icon with Glow when Focused */}
        {icon && (
          <div
            style={{
              padding: '0 12px 0 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: hasError
                ? 'var(--status-warning)'
                : isFocused
                ? 'var(--accent-cyan)'
                : 'var(--text-muted)',
              filter: isFocused ? 'drop-shadow(0 0 6px var(--accent-cyan))' : 'none',
              transition: 'color 0.2s ease, filter 0.2s ease',
            }}
          >
            {icon}
          </div>
        )}

        {/* Text Input */}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: icon ? '14px 14px 14px 0' : '14px 14px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.92rem',
            color: '#ffffff',
            letterSpacing: '0.04em',
          }}
        />

        {/* Right Element (e.g. show/hide password) */}
        {rightElement && (
          <div style={{ paddingRight: '12px', display: 'flex', alignItems: 'center' }}>
            {rightElement}
          </div>
        )}

        {/* Scanning Laser Line (moves across on focus) */}
        {isFocused && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '2px',
              width: '100%',
              background: hasError
                ? 'linear-gradient(90deg, transparent, var(--status-warning), transparent)'
                : 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
              animation: 'scanLaser 1.8s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--status-warning)',
            letterSpacing: '0.06em',
            animation: 'fadeIn 0.2s ease-in',
          }}
        >
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      <style>{`
        .input-error-shake {
          animation: shakeAlert 0.35s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
