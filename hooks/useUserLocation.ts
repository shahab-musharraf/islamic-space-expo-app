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
  // const fetchLocation = useCallback(async () => {
  //   setIsLoading(true); // start loading
  //   setErrorMsg(null);
  //   console.log('Fetching Location ******************')
  //   try {
  //     // 1️⃣ Request permission
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     console.log('Checking permission status ******************')
  //     if (status !== 'granted') {
  //       console.log('permission not granted ******************')
  //       setErrorMsg('Location permission denied. Please enable it in settings.');
  //       return;
  //     }
  //     console.log('permission is granted ******************')

  //     // 2️⃣ Check GPS
  //     const servicesEnabled = await Location.hasServicesEnabledAsync();
  //     console.log('checking gps is opened or not ******************')
  //     if (!servicesEnabled) {
  //       console.log('gps is not enabled ******************')
  //       if (Platform.OS === 'android') {
  //         try {
  //           console.log('asking to open gps ******************')
  //           const loc = await Location.getCurrentPositionAsync({
  //             accuracy: Location.Accuracy.Balanced,
  //             mayShowUserSettingsDialog: true
  //           });
  //           console.log(loc, 'got the location ******************')
  //           const address = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
  //           setLocation({ coords: loc.coords, address });
  //           return;
  //         } catch {
  //           console.log('catch block while getting location after asked for permission ******************')
  //           setErrorMsg('Please enable GPS!');
  //           return;
  //         }
  //       } else {
  //         console.log('gps is off ******************')
  //         setErrorMsg('Location services are off. Please enable GPS in Settings.');
  //         return;
  //       }
  //     }

  //     console.log('gps was on, getting the location ******************')
  //     // 3️⃣ Get location
  //     const loc = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.High,
  //       mayShowUserSettingsDialog: true,
  //     });
  //     console.log(loc, 'gps was on, got the location ******************')
  //     const address = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
  //     setLocation({ coords: loc.coords, address });

  //   } catch (err) {
  //     console.log('location error ******************')
  //     console.warn('Location error:', err);
  //     setErrorMsg('Unable to fetch location. Please try again.');
  //   }
  //   finally {
  //     setIsLoading(false); // stop loading in all cases
  //   }
  // }, [setLocation])

  const fetchLocation = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    console.log('Fetching Location ******************');

    try {
      // 1️⃣ Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission denied. Please enable it in settings.');
        setIsLoading(false);
        return;
      }
      console.log('Permission granted');

      // 2️⃣ Try to get the last known position (it's fast)
      let loc = await Location.getLastKnownPositionAsync();

      // Check if it's null or too old (e.g., older than 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      if (!loc || loc.timestamp < fiveMinutesAgo) {
        console.log('Last known location is old or null. Fetching new one...');
        
        // 3️⃣ If no good cached location, get the current one
        //    This will prompt for GPS if it's off.
        loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced, // Use Balanced
          mayShowUserSettingsDialog: true,
        });
      } else {
        console.log('Using fast, cached location');
      }

      // 4️⃣ Now we have a location (either cached or new)
      console.log(loc, 'Got the location ******************');
      const address = await getAddressFromCoords(loc.coords.latitude, loc.coords.longitude);
      setLocation({ coords: loc.coords, address });

    } catch (err) {
      console.log('Location error (e.g., user canceled GPS dialog or timeout) ******************');
      console.warn('Location error:', err);
      setErrorMsg('Unable to fetch location. Please enable GPS and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setLocation, getAddressFromCoords]);



  // Restore location on mount, then fetch if needed
  useEffect(() => {
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
