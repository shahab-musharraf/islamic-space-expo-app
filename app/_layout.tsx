
import { MyDarkTheme, MyDefaultTheme } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppThemeProvider, useAppTheme } from '../constants/ThemeContext'; // 👈 Adjust path


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});


function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { theme } = useAppTheme(); // 👈 Use your new hook
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={theme === 'dark' ? MyDarkTheme : MyDefaultTheme}>
      
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/ProfileScreen" options={{ headerShown: false }} />
          <Stack.Screen name="screens/masjid-panel/MasjidPanelScreen" options={{ headerShown: true, headerTitle: "Masjid Panel" }} />
          <Stack.Screen name="screens/admin-panel/AdminPanelScreen" options={{ headerShown: true, headerTitle: "Admin Panel" }} />
          <Stack.Screen name="screens/masjid-panel/AddMasjidScreen" options={
            ({route}:any) => ({ headerTitle: route?.params?.masjidId ? 'Update Masjid' : 'Add Masjid' , headerShown: true, headerTitleAlign: 'center'})
          } />
          <Stack.Screen name="screens/global/PrayerTimingScreen" options={{ headerTitle: 'Update Salah Timings' , headerShown: true, headerTitleAlign: 'center'}
          } />
          <Stack.Screen name="screens/masjid-panel/MasjidDetailsScreenPrivate" options={
            ({route}:any) => ({ headerTitle: route?.params?.name || 'Masjid Details' , headerShown: true, headerTitleAlign: 'center'})
          } />
          <Stack.Screen name="screens/home/MasjidDetails" options={
            ({route}:any) => ({ headerTitle: route?.params?.name || 'Masjid Details' , headerShown: true, headerTitleAlign: 'center'})
          } />
          <Stack.Screen name="screens/home/FavoriteMasjidsScreen" options={{ headerTitle: 'My Favorite Masjids' , headerShown: true, headerTitleAlign: 'center'}} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={theme === "dark" ? 'light' : 'dark'}/>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </AppThemeProvider>
  );
}