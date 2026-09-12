import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  status?: 'default' | 'active' | 'alert' | 'success';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  style = {},
  status = 'default',
}) => {
  const getBorderColor = () => {
    switch (status) {
      case 'alert':
        return 'var(--status-warning)';
      case 'success':
        return 'var(--status-success)';
      case 'active':
        return 'var(--accent-cyan)';
      default:
        return 'var(--border-subtle)';
    }
  };

  const getGlow = () => {
    switch (status) {
      case 'alert':
        return '0 0 25px rgba(255, 51, 102, 0.25), inset 0 0 15px rgba(255, 51, 102, 0.05)';
      case 'success':
        return '0 0 25px rgba(0, 255, 157, 0.25), inset 0 0 15px rgba(0, 255, 157, 0.05)';
      case 'active':
        return '0 0 30px rgba(0, 240, 255, 0.2), inset 0 0 15px rgba(0, 240, 255, 0.04)';
      default:
        return '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.02)';
    }
  };

  return (
    <div
      className={`cyber-panel ${className}`}
      style={{
        borderColor: getBorderColor(),
        boxShadow: getGlow(),
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
