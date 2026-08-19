import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemePalette = 'emerald' | 'teal' | 'obsidian' | 'amber' | 'sapphire';

export interface ThemeConfig {
  id: ThemePalette;
  name: string;
  description: string;
  primaryColor: string;
  accentBadge: string;
  previewBg: string;
  previewAccent: string;
}

export const PALETTES: ThemeConfig[] = [
  {
    id: 'emerald',
    name: 'Emerald Zen',
    description: 'Calming natural greens for mindful recovery',
    primaryColor: '#10b981',
    accentBadge: 'bg-emerald-500',
    previewBg: 'from-emerald-950 to-slate-950',
    previewAccent: 'bg-emerald-500'
  },
  {
    id: 'teal',
    name: 'Pacific Teal',
    description: 'Crisp medical-grade serenity and focus',
    primaryColor: '#14b8a6',
    accentBadge: 'bg-teal-500',
    previewBg: 'from-teal-950 to-slate-950',
    previewAccent: 'bg-teal-500'
  },
  {
    id: 'obsidian',
    name: 'Midnight Slate',
    description: 'Deep minimalist obsidian with violet sheen',
    primaryColor: '#8b5cf6',
    accentBadge: 'bg-violet-500',
    previewBg: 'from-slate-950 to-zinc-950',
    previewAccent: 'bg-violet-500'
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    description: 'Warm, uplifting motivation and vitality',
    primaryColor: '#f59e0b',
    accentBadge: 'bg-amber-500',
    previewBg: 'from-amber-950 to-slate-950',
    previewAccent: 'bg-amber-500'
  },
  {
    id: 'sapphire',
    name: 'Sapphire Blue',
    description: 'Clarity, strength and crystal-clean air',
    primaryColor: '#3b82f6',
    accentBadge: 'bg-blue-500',
    previewBg: 'from-blue-950 to-slate-950',
    previewAccent: 'bg-blue-500'
  }
];

interface ThemeContextType {
  mode: ThemeMode;
  palette: ThemePalette;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePalette) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('quittrack_theme_mode');
    return (saved as ThemeMode) || 'dark';
  });

  const [palette, setPaletteState] = useState<ThemePalette>(() => {
    const saved = localStorage.getItem('quittrack_theme_palette');
    return (saved as ThemePalette) || 'teal';
  });

  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const checkDark = () => {
      if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return mode === 'dark';
    };

    const applyTheme = () => {
      const darkMode = checkDark();
      setIsDark(darkMode);

      const root = document.documentElement;
      const body = document.body;

      if (darkMode) {
        root.classList.add('dark');
        root.classList.remove('light');
        body.classList.add('dark');
        body.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        body.classList.remove('dark');
        body.classList.add('light');
      }

      root.setAttribute('data-palette', palette);
      root.setAttribute('data-theme-mode', mode);
      body.setAttribute('data-palette', palette);
    };

    applyTheme();

    localStorage.setItem('quittrack_theme_mode', mode);
    localStorage.setItem('quittrack_theme_palette', palette);

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [mode, palette]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const setPalette = (newPalette: ThemePalette) => {
    setPaletteState(newPalette);
  };

  const toggleTheme = () => {
    setModeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        palette,
        isDark,
        setMode,
        setPalette,
        toggleTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
