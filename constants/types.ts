// types.ts
import type { Theme as NavigationTheme } from '@react-navigation/native';

// --- Base Types ---
type FontStyle = {
  fontFamily: string;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
};

// --- Custom Colors Type ---
// This type includes all the extra colors you defined in app-theme.ts
// (You should ideally get this from your main `theme.ts` file)
type CustomColors = {
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
  // Add any other colors from your 'Colors' object here
};

// --- Main Theme Type ---
// This is our new, complete Theme type.
// It merges the required React Navigation colors with all your custom colors.
export interface Theme extends NavigationTheme {
  colors: NavigationTheme['colors'] & CustomColors;
  fonts: {
    regular: FontStyle;
    medium: FontStyle;
    bold: FontStyle;
    heavy: FontStyle;
  };
}