import React, { useState } from 'react';
import { useSound } from '../../hooks/useSound';

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  hoverText?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  isLoading = false,
  loadingText = 'PROCESSING...',
  hoverText,
  style = {},
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playSound } = useSound();

  const handleMouseEnter = () => {
    if (disabled || isLoading) return;
    setIsHovered(true);
    playSound('hover');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    playSound('click');
    if (onClick) onClick();
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glow-btn ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: isPrimary ? '16px 32px' : '12px 24px',
        fontFamily: 'var(--font-display)',
        fontSize: isPrimary ? '0.95rem' : '0.85rem',
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: isPrimary ? '#030508' : 'var(--text-primary)',
        background: isPrimary
          ? 'linear-gradient(135deg, #00f0ff 0%, #00c8ff 50%, #7928ca 140%)'
          : isSecondary
          ? 'rgba(15, 23, 42, 0.75)'
          : 'transparent',
        border: isPrimary
          ? 'none'
          : '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: 'var(--border-radius-md)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        boxShadow: isPrimary
          ? isHovered
            ? '0 0 35px rgba(0, 240, 255, 0.7), 0 0 70px rgba(157, 78, 221, 0.4)'
            : '0 0 20px rgba(0, 240, 255, 0.45)'
          : isHovered
          ? '0 0 20px rgba(0, 240, 255, 0.2), inset 0 0 12px rgba(0, 240, 255, 0.08)'
          : 'none',
        transform: isHovered && !disabled && !isLoading ? 'scale(1.02) translateY(-1px)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        outline: 'none',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {/* Dynamic Light Sweep Beam on Hover */}
      {isPrimary && (
        <span
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-60%',
            width: '40%',
            height: '200%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent)',
            transform: isHovered ? 'translateX(450%) rotate(25deg)' : 'translateX(0) rotate(25deg)',
            transition: isHovered ? 'transform 0.75s ease-in-out' : 'none',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Button Content */}
      <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isLoading ? (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid rgba(0,0,0,0.2)',
                borderTopColor: isPrimary ? '#000' : 'var(--accent-cyan)',
                borderRadius: '50%',
                animation: 'rotateClockwise 0.8s linear infinite',
              }}
            />
            <span>{loadingText}</span>
          </>
        ) : isHovered && hoverText ? (
          hoverText
        ) : (
          children
        )}
      </span>
    </button>
  );
};
