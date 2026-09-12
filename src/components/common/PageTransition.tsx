import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, isActive = true }) => {
  return (
    <div
      style={{
        opacity: isActive ? 1 : 0,
        transform: isActive ? 'scale(1)' : 'scale(0.98)',
        transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
};
