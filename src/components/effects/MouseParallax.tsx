import React from 'react';
import { useMouseParallax } from '../../hooks/useMouseParallax';

interface MouseParallaxProps {
  children: (coords: { x: number; y: number; smoothX: number; smoothY: number }) => React.ReactNode;
}

export const MouseParallax: React.FC<MouseParallaxProps> = ({ children }) => {
  const coords = useMouseParallax();
  return <>{children(coords)}</>;
};
