// src/theme/typography.ts
import { TextStyle } from 'react-native';

export const fontFamily = 'Inter'; // ensure Inter is linked via expo-font or react-native-google-fonts

export const typography = {
  h1: {
    fontFamily,
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 40,
    color: 'inherit',
  } as TextStyle,
  h2: {
    fontFamily,
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 36,
    color: 'inherit',
  } as TextStyle,
  body: {
    fontFamily,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: 'inherit',
  } as TextStyle,
  button: {
    fontFamily,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: 'inherit',
  } as TextStyle,
};
