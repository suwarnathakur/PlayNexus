import React, { useState, useEffect } from 'react';
import { ArrowRight, Swords } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { useTheme } from '../../store/themeStore';

interface LoginButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onHoverStateChange?: (isHovered: boolean) => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  isLoading = false,
  disabled = false,
  onClick,
  onHoverStateChange,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverTextStep, setHoverTextStep] = useState<string | null>(null);
  const { playSound } = useSound();
  const { isDark } = useTheme();

  useEffect(() => {
    let timeout: number;
    if (isHovered && !isLoading) {
      setHoverTextStep('CONNECTING TO ARENA...');
      timeout = window.setTimeout(() => {
        setHoverTextStep('ENTER THE ARENA [RANKED]');
      }, 300);
    } else {
      setHoverTextStep(null);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isHovered, isLoading]);

  const handleMouseEnter = () => {
    if (disabled || isLoading) return;
    setIsHovered(true);
    playSound('hover');
    if (onHoverStateChange) onHoverStateChange(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHoverStateChange) onHoverStateChange(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || isLoading) {
      e.preventDefault();
      return;
    }
    playSound('click');
    if (onClick) onClick();
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        padding: '2.5px',
        borderRadius: 'var(--border-radius-md)',
        background: isHovered
          ? 'linear-gradient(90deg, #ff0077, #00f0ff, #fbbf24, #ff0077)'
          : isDark
          ? 'linear-gradient(90deg, rgba(0, 240, 255, 0.6), rgba(157, 78, 221, 0.6))'
          : 'linear-gradient(90deg, rgba(0, 102, 255, 0.7), rgba(245, 158, 11, 0.7))',
        backgroundSize: '300% 100%',
        animation: 'energyConduitFlow 2.8s linear infinite',
        boxShadow: isHovered
          ? '0 0 35px rgba(0, 240, 255, 0.7), 0 0 70px rgba(255, 0, 119, 0.4)'
          : '0 0 20px rgba(0, 240, 255, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && !disabled && !isLoading ? 'scale(1.025)' : 'scale(1)',
      }}
    >
      <button
        type="submit"
        disabled={disabled || isLoading}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '18px 28px',
          background: isDark
            ? 'linear-gradient(135deg, #00f0ff 0%, #0099ff 55%, #7928ca 120%)'
            : 'linear-gradient(135deg, #0066ff 0%, #0284c7 60%, #4f46e5 120%)',
          border: 'none',
          borderRadius: 'calc(var(--border-radius-md) - 2.5px)',
          fontFamily: 'var(--font-display)',
          fontSize: '1.05rem',
          fontWeight: 900,
          letterSpacing: '0.12em',
          color: '#ffffff',
          textTransform: 'uppercase',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          outline: 'none',
          overflow: 'hidden',
          textShadow: '0 0 8px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Animated Light Blade Sweep */}
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-60%',
            width: '40%',
            height: '200%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent)',
            transform: isHovered ? 'translateX(500%) rotate(25deg)' : 'translateX(0) rotate(25deg)',
            transition: isHovered ? 'transform 0.75s ease-in-out' : 'none',
            pointerEvents: 'none',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {isLoading ? (
            <>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2.5px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'rotateClockwise 0.8s linear infinite',
                }}
              />
              <span>INITIALIZING ARENA GATE...</span>
            </>
          ) : (
            <>
              <Swords size={20} strokeWidth={2.5} />
              <span>
                {hoverTextStep ? hoverTextStep : 'ENTER THE ARENA [RANKED]'}
              </span>
              <ArrowRight
                size={20}
                strokeWidth={3}
                style={{
                  transform: isHovered ? 'translateX(7px)' : 'translateX(0)',
                  transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </>
          )}
        </div>
      </button>
    </div>
  );
};
