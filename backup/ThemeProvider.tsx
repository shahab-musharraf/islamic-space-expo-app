import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DarkTheme,
    DefaultTheme,
    Theme as NavigationTheme
} from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// --- 1. DEFINE YOUR TYPES ---

// Base type for a font style
type FontStyle = {
  fontFamily: string;
  fontWeight:
    | 'normal' | 'bold' | '100' | '200' | '300' | '400'
    | '500' | '600' | '700' | '800' | '900';
};

// All your custom colors
type CustomColors = {
  // Your custom keys from app-theme.ts
  TINT: string;
  BACKGROUND: string;
  CARD: string;
  TEXT: string;
  ICON_SECONDARY: string;
  BG_SECONDARY: string;
  TEXT_SECONDARY: string;
  DISABLED_TEXT: string;
  BUTTON_BG: string;
  BUTTON_TEXT: string;
  DISABLED_BUTTON_BG: string;
  DISABLED_BUTTON_TEXT: string;
  INPUT_BG: string;
  INPUT_TEXT: string;
  DISABLED_INPUT_BG: string;
  DISABLED_INPUT_TEXT: string;
  ICON: string;
  DISABLED_ICONS: string;
};

// The final, complete AppTheme type
export type AppTheme = NavigationTheme & {
  colors: NavigationTheme['colors'] & CustomColors;
  fonts: {
    regular: FontStyle;
    medium: FontStyle;
    bold: FontStyle;
    heavy: FontStyle;
  };
};

// The type for the context's value
type ThemeContextType = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

// --- 2. DEFINE YOUR THEME OBJECTS ---
// TODO: Fill these in with your real font/color values

const AppLightTheme: AppTheme = {
  ...DefaultTheme,
  dark: false,
  fonts: {
    // TODO: Add your font definitions
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
  colors: {
    ...DefaultTheme.colors,
    // --- React Navigation Overrides ---
    primary: '#007AFF', // Your TINT
    background: '#F2F2F7', // Your BACKGROUND
    card: '#FFFFFF', // Your CARD
    text: '#000000', // Your TEXT
    border: '#C6C6C8', // Your ICON_SECONDARY
    notification: '#FF3B30', // Your TINT
    // --- Custom Colors (Light) ---
    TINT: '#007AFF',
    BACKGROUND: '#F2F2F7',
    CARD: '#FFFFFF',
    TEXT: '#000000',
    ICON_SECONDARY: '#C6C6C8',
    BG_SECONDARY: '#FFFFFF',
    TEXT_SECONDARY: '#6B7280',
    DISABLED_TEXT: '#9CA3AF',
    BUTTON_BG: '#007AFF',
    BUTTON_TEXT: '#FFFFFF',
    DISABLED_BUTTON_BG: '#D1D5DB',
    DISABLED_BUTTON_TEXT: '#9CA3AF',
    INPUT_BG: '#FFFFFF',
    INPUT_TEXT: '#000000',
    DISABLED_INPUT_BG: '#E5E7EB',
    DISABLED_INPUT_TEXT: '#9CA3AF',
    ICON: '#000000',
    DISABLED_ICONS: '#9CA3AF',
  },
};

const AppDarkTheme: AppTheme = {
  ...DarkTheme,
  dark: true,
  fonts: {
    // TODO: Add your font definitions
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
  colors: {
    ...DarkTheme.colors,
    // --- React Navigation Overrides ---
    primary: '#0A84FF', // Your TINT
    background: '#000000', // Your BACKGROUND
    card: '#1C1C1E', // Your CARD
    text: '#FFFFFF', // Your TEXT
    border: '#38383A', // Your ICON_SECONDARY
    notification: '#FF453A', // Your TINT
    // --- Custom Colors (Dark) ---
    TINT: '#0A84FF',
    BACKGROUND: '#000000',
    CARD: '#1C1C1E',
    TEXT: '#FFFFFF',
    ICON_SECONDARY: '#38383A',
    BG_SECONDARY: '#1C1C1E',
    TEXT_SECONDARY: '#9CA3AF',
    DISABLED_TEXT: '#6B7280',
    BUTTON_BG: '#0A84FF',
    BUTTON_TEXT: '#FFFFFF',
    DISABLED_BUTTON_BG: '#374151',
    DISABLED_BUTTON_TEXT: '#6B7280',
    INPUT_BG: '#1C1C1E',
    INPUT_TEXT: '#FFFFFF',
    DISABLED_INPUT_BG: '#374151',
    DISABLED_INPUT_TEXT: '#6B7280',
    ICON: '#FFFFFF',
    DISABLED_ICONS: '#6B7280',
  },
};

// --- 3. CREATE THE CONTEXT & PROVIDER ---

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Get the system theme
  const systemTheme = useColorScheme() ?? 'light';
  
  // State to hold the *current mode* ('light' or 'dark')
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(systemTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load the saved theme from storage on app mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeMode(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
      } finally {
        setIsThemeLoaded(true); // Allow children to render
      }
    };
    loadTheme();
  }, []);

  // Memoize the toggle function for performance
  const toggleTheme = React.useCallback(() => {
    setThemeMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Save the new preference to storage
      AsyncStorage.setItem('theme', newMode).catch(error => {
        console.error('Failed to save theme to storage', error);
      });
      return newMode;
    });
  }, []);

  // Select the correct *theme object* based on the current mode
  const theme = themeMode === 'dark' ? AppDarkTheme : AppLightTheme;

  // Don't render the app until the theme is loaded to prevent a flash
  if (!isThemeLoaded) {
    return null; // Or your <SplashScreen /> component
  }

  // The value to provide to children
  const value = {
    theme,
    isDark: themeMode === 'dark',
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// --- 4. CREATE THE CUSTOM HOOK ---

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within an AppThemeProvider');
  }
  return context;
};