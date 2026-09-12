import { useEffect, useState, useRef } from 'react';

export interface ParallaxCoords {
  x: number; // normalized -1 to 1
  y: number; // normalized -1 to 1
  smoothX: number; // interpolated
  smoothY: number; // interpolated
}

export const useMouseParallax = () => {
  const [coords, setCoords] = useState<ParallaxCoords>({
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
  });

  const targetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Convert to -1 .. 1 from center
      const normX = ((e.clientX / innerWidth) - 0.5) * 2;
      const normY = ((e.clientY / innerHeight) - 0.5) * 2;

      targetRef.current = { x: normX, y: normY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth, innerHeight } = window;
        const normX = ((touch.clientX / innerWidth) - 0.5) * 2;
        const normY = ((touch.clientY / innerHeight) - 0.5) * 2;
        targetRef.current = { x: normX * 0.5, y: normY * 0.5 };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Smooth lerp loop
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const updateSmooth = () => {
      const lerpFactor = 0.06;
      currentRef.current.x = lerp(currentRef.current.x, targetRef.current.x, lerpFactor);
      currentRef.current.y = lerp(currentRef.current.y, targetRef.current.y, lerpFactor);

      setCoords({
        x: targetRef.current.x,
        y: targetRef.current.y,
        smoothX: currentRef.current.x,
        smoothY: currentRef.current.y,
      });

      animFrameRef.current = requestAnimationFrame(updateSmooth);
    };

    animFrameRef.current = requestAnimationFrame(updateSmooth);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return coords;
};
