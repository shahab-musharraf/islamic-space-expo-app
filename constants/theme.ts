/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// export const Colors = {
//   light: {
//     // text: '#11181C',
//     text: '#fff',
//     // background: '#fff',
//     background: '#081028',
//     bg_secondary: '#0b1739',
//     tint: tintColorLight,
//     icon: '#687076',
//     tabIconDefault: '#687076',
//     tabIconSelected: tintColorLight,
//   },
//   dark: {
//     text: '#ECEDEE',
//     background: '#151718',
//     bg_secondary: '#0b1739',
//     tint: tintColorDark,
//     icon: '#9BA1A6',
//     tabIconDefault: '#9BA1A6',
//     tabIconSelected: tintColorDark,
//   },
// };

const tintColor = '#4C6EF5'; // A strong, modern blue accent

export const Colors = {
  light: {
    // Backgrounds
    BACKGROUND: '#F7F8FC',     // Very light, slightly cool gray
    BG_SECONDARY: '#FFFFFF',   // Pure white for secondary panels
    CARD: '#FFFFFF',           // Pure white for cards and modals

    // Text
    TEXT: '#1A1D21',           // Strong, dark gray (near black)
    TEXT_SECONDARY: '#5A6472', // Medium gray for subheadings, descriptions
    DISABLED_TEXT: '#ADB5BD',  // Light gray for disabled states
    
    // Buttons
    BUTTON_BG: tintColor,          // Primary accent color
    BUTTON_TEXT: '#FFFFFF',        // White text on buttons
    DISABLED_BUTTON_BG: '#CED4DA', // Light gray for disabled buttons
    DISABLED_BUTTON_TEXT: '#ADB5BD',// Light gray for disabled button text

    // Inputs
    INPUT_BG: '#F1F3F5',       // Light gray for input fields
    INPUT_TEXT: '#1A1D21',       // Main text color for input
    DISABLED_INPUT_BG: '#E9ECEF',   // Lighter gray for disabled inputs
    DISABLED_INPUT_TEXT: '#ADB5BD',// Disabled text color

    // Icons
    ICON: '#5A6472',           // Medium gray, same as secondary text
    ICON_SECONDARY: '#9DA5B1', // Lighter gray for less prominent icons
    DISABLED_ICONS: '#ADB5BD', // Disabled icon color

    // System
    TINT: tintColor,
    TAB_ICON_DEFAULT: '#9DA5B1',
    TAB_ICON_SELECTED: tintColor,
  },
  dark: {
    // Backgrounds
    BACKGROUND: '#0B132B',     // Deep, rich navy blue (almost black)
    BG_SECONDARY: '#1C2541',   // Dark blue-gray for secondary panels
    CARD: '#1C2541',           // Dark blue-gray for cards and modals

    // Text
    TEXT: '#F8F9FA',           // Bright, near-white
    TEXT_SECONDARY: '#A7B0BE', // Light gray-blue for subheadings
    DISABLED_TEXT: '#5A6472',  // Muted gray for disabled states
    
    // Buttons
    BUTTON_BG: tintColor,          // Primary accent color (pops on dark bg)
    BUTTON_TEXT: '#FFFFFF',        // White text on buttons
    DISABLED_BUTTON_BG: '#343A40', // Dark, muted gray
    DISABLED_BUTTON_TEXT: '#5A6472',// Muted gray for disabled button text

    // Inputs
    INPUT_BG: '#1C2541',       // Same as card background
    INPUT_TEXT: '#F8F9FA',       // Main text color for input
    DISABLED_INPUT_BG: '#3A506B',   // Muted, dark blue-gray
    DISABLED_INPUT_TEXT: '#5A6472',// Disabled text color

    // Icons
    ICON: '#A7B0BE',           // Light gray-blue, same as secondary text
    ICON_SECONDARY: '#5A6472', // Muted gray for less prominent icons
    DISABLED_ICONS: '#5A6472', // Disabled icon color

    // System
    TINT: tintColor,
    TAB_ICON_DEFAULT: '#5A6472',
    TAB_ICON_SELECTED: tintColor,
  },
};


export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
