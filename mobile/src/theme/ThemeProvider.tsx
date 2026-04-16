// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';

export type ThemeContextProps = {
  colors: ThemeColors;
  scheme: ColorSchemeName;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = Appearance.getColorScheme() ?? 'light';
  const [scheme, setScheme] = useState<ColorSchemeName>(systemScheme);

  const toggleScheme = () => {
    setScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, scheme, toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
