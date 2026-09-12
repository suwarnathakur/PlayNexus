import { useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'lite';

const THEME_STORAGE_KEY = 'playnexus_theme_mode';

let currentTheme: ThemeMode = 'dark';
let themeListeners: Array<(theme: ThemeMode) => void> = [];

// Initialize theme from localStorage or default to dark
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'dark' || saved === 'lite') {
      currentTheme = saved;
    }
  } catch {}
  document.documentElement.setAttribute('data-theme', currentTheme);
}

export const themeStore = {
  getTheme: () => currentTheme,
  setTheme: (theme: ThemeMode) => {
    currentTheme = theme;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        document.documentElement.setAttribute('data-theme', theme);
      } catch {}
    }
    themeListeners.forEach(listener => listener(currentTheme));
  },
  toggleTheme: () => {
    const next = currentTheme === 'dark' ? 'lite' : 'dark';
    themeStore.setTheme(next);
    return next;
  },
  subscribe: (listener: (theme: ThemeMode) => void) => {
    themeListeners.push(listener);
    return () => {
      themeListeners = themeListeners.filter(l => l !== listener);
    };
  },
};

export const useTheme = () => {
  const [theme, setLocalTheme] = useState<ThemeMode>(themeStore.getTheme());

  useEffect(() => {
    const unsub = themeStore.subscribe(t => {
      setLocalTheme(t);
    });
    return unsub;
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    isLite: theme === 'lite',
    setTheme: themeStore.setTheme,
    toggleTheme: themeStore.toggleTheme,
  };
};
