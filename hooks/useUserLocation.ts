import { UserAddress, UserLocation, useUserLocationStore } from '@/stores/userLocationStore';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Linking, Platform } from 'react-native';



interface UseUserLocationResult {
  location: UserLocation | null;
  errorMsg: string | null;
  isLoading: boolean;
  fetchLocation: () => Promise<void>;
  handleOpenSettings: () => void;
  handleExitApp: () => void;
  restoreLocation: () => void;
}


export const useUserLocation = (): UseUserLocationResult => {
  const { location, setLocation, restoreLocation } = useUserLocationStore((state) => state);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

   // Helper: fetch address from latitude/longitude
  const getAddressFromCoords = async (lat: number, lng: number): Promise<UserAddress | null> => {
    try {
      const [addr] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      return {
        street: addr.street ?? '',
        city: addr.city ?? '',
        state: addr.region ?? '',
        country: addr.country ?? '',
        postalCode: addr.postalCode ?? '',
        formattedAddress: addr.formattedAddress ?? `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.postalCode || ''}, ${addr.country || ''}`,
      };
    } catch (err) {
      console.warn('Reverse geocode error:', err);
      return null;
    }
  };

  // Fetch location function
  const fetchLocation = useCallback(async () => {
    setIsLoading(true); // start loading
    setErrorMsg(null);
    try {
      // 1️⃣ Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status, 'location status')
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please enable it in settings.');
        return;
      }

      // 2️⃣ Check GPS
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      console.log(servicesEnabled, 'gps on')
      if (!servicesEnabled) {
        if (Platform.OS === 'android') {
          try {
            console.log('fetching')
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
              mayShowUserSettingsDialog: true,
            });
            console.log(loc, 'settinsdafsdf')
            const address = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
            setLocation({ coords: loc.coords, address });
            return;
          } catch {
            setErrorMsg('Please enable GPS!');
            return;
          }
        } else {
          setErrorMsg('Location services are off. Please enable GPS in Settings.');
          return;
        }
      }

      // 3️⃣ Get location
      console.log('fetcing 2')
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      });
      
      console.log(loc, 'location seeint')
      const address = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
      setLocation({ coords: loc.coords, address });

    } catch (err) {
      console.warn('Location error:', err);
      setErrorMsg('Unable to fetch location. Please try again.');
    }
    finally {
      setIsLoading(false); // stop loading in all cases
    }
  }, [setLocation])




  // Restore location on mount, then fetch if needed
  useEffect(() => {
    console.log('hiiiiiiiiiiiiiiiii')
    const init = async () => {
      setIsLoading(true);
      await restoreLocation();

      if (!location) {
        await fetchLocation();
      } else {
        setIsLoading(false);
      }
    };

    if(!location) init();
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenSettings = () => {
    Linking.openSettings().catch(() => {
      setErrorMsg('Unable to open settings. Please open them manually.');
    });
  };

  const handleExitApp = () => {
    if (Platform.OS === 'android') BackHandler.exitApp();
    else Alert.alert('Exit App', 'iOS does not allow apps to exit programmatically. Please close the app manually.');
  };

  return {
    location,
    errorMsg,
    isLoading,
    fetchLocation,
    handleOpenSettings,
    handleExitApp,
    restoreLocation
  };
};
