// src/theme/colors.ts
export const lightColors = {
  primary: 'hsl(210, 85%, 45%)', // vibrant blue
  secondary: 'hsl(340, 70%, 55%)', // techy pink
  background: 'hsl(0, 0%, 98%)',
  surface: 'hsl(0, 0%, 100%)',
  textPrimary: 'hsl(210, 15%, 20%)',
  textSecondary: 'hsl(210, 10%, 40%)',
  border: 'hsl(210, 10%, 85%)',
  shadow: 'rgba(0,0,0,0.1)',
};

export const darkColors = {
  primary: 'hsl(210, 85%, 55%)',
  secondary: 'hsl(340, 70%, 65%)',
  background: 'hsl(210, 15%, 10%)',
  surface: 'hsl(210, 10%, 15%)',
  textPrimary: 'hsl(0, 0%, 95%)',
  textSecondary: 'hsl(0, 0%, 70%)',
  border: 'hsl(210, 10%, 25%)',
  shadow: 'rgba(0,0,0,0.5)',
};

export type ThemeColors = typeof lightColors;
