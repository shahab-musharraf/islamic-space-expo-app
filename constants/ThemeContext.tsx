import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

// 1. Define the shape of your context
type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

// 2. Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Create the Provider component (it must not be 'async')
export const AppThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // 4. Get system theme as the *initial* state
  const systemTheme = useColorScheme() ?? 'light';
  const [theme, setTheme] = useState<'light' | 'dark'>(systemTheme);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // 5. Load the saved theme from storage *after* the component mounts
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
      } finally {
        setIsThemeLoaded(true); // Allow children to render
      }
    };

    loadTheme();
  }, []); // The empty array [] ensures this runs only once

  // 6. Create the function to toggle the theme AND save it
  const toggleTheme = () => {
    setTheme(currentTheme => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Save the new preference to storage
      AsyncStorage.setItem('theme', newTheme).catch(error => {
        console.error('Failed to save theme to storage', error);
      });

      return newTheme;
    });
  };

  // 7. Don't render the app until the theme is loaded to prevent a flash
  if (!isThemeLoaded) {
    return null; // Or your <SplashScreen /> component
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 8. Create a custom hook to use this context easily
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
};