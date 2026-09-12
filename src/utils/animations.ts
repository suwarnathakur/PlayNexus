// Easing and visual helpers for animations

export const lerp = (start: number, end: number, factor: number): number => {
  return start + (end - start) * factor;
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.min(Math.max(val, min), max);
};

export const randomRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};
