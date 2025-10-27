// app-theme.ts
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Colors } from './theme'; // Assuming this is where your Colors.light/dark live
import type { Theme } from './types';

export const MyDefaultTheme: Theme = {
  ...DefaultTheme,
  // fonts: {
  //   // ... define your fonts here
  // },
  colors: {
    ...DefaultTheme.colors, // Start with React Navigation defaults
    ...Colors.light,        // Spread ALL your custom light colors

    // --- Override the 6 required keys ---
    primary: Colors.light.TINT,
    background: Colors.light.BACKGROUND,
    card: Colors.light.CARD,
    text: Colors.light.TEXT,
    border: Colors.light.ICON_SECONDARY,
    notification: Colors.light.TINT,
  },
};

export const MyDarkTheme: Theme = {
  ...DarkTheme,
  // fonts: {
  //   // ... define your fonts here
  // },
  colors: {
    ...DarkTheme.colors, // Start with React Navigation defaults
    ...Colors.dark,      // Spread ALL your custom dark colors

    // --- Override the 6 required keys ---
    primary: Colors.dark.TINT,
    background: Colors.dark.BACKGROUND,
    card: Colors.dark.CARD,
    text: Colors.dark.TEXT,
    border: Colors.dark.ICON_SECONDARY,
    notification: Colors.dark.TINT,
  },
};