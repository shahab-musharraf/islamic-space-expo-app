import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { create } from 'zustand';

interface LocationData {
    latitude: string,
    longitude: string,
    altitude: string,
    accuracy: string,
    mocked: boolean,
    timestamp: Date,

    
}

interface AdressData {
    name: string,
    street: string,
    streetNumber: string,
    district: string,
    city: string,
    state: string,
    country: string,
    pincode: string,
    formattedAddress: string,
    isoCountryCode: string,
    subregion: string,
    timezone: string
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formattedAddress: string;
}

export interface UserLocation {
  coords: Location.LocationObjectCoords
  address: UserAddress | null;
}

interface UserLocationStore {
  location: UserLocation | null;
  setLocation: (location: UserLocation) => Promise<void>;
  clearLocation: () => Promise<void>;
  restoreLocation: () => Promise<void>;
}

export const useUserLocationStore = create<UserLocationStore>((set) => ({
  location: null,

  // ✅ set and persist location
  setLocation: async (location: UserLocation) => {
    await AsyncStorage.setItem('userLocation', JSON.stringify(location));
    set({ location });
  },

  // ✅ clear both state and AsyncStorage
  clearLocation: async () => {
    await AsyncStorage.removeItem('userLocation');
    set({ location: null });
  },

  // ✅ restore from AsyncStorage on app start
  restoreLocation: async () => {
    const saved = await AsyncStorage.getItem('userLocation');
    if (saved) {
      set({ location: JSON.parse(saved) });
    }
  },
}));