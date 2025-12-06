import { useUserLocationStore } from '@/stores/userLocationStore';
import * as Location from 'expo-location';
import { AppleMaps, Coordinates, GoogleMaps } from 'expo-maps';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    Linking,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'; // update path

// ----------------- CONFIG -----------------
// Provide your Google Places API Key here (or via env)
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_ANDROID_API_KEY || ''; // or set string

// Restrict autocomplete to India, remove if global
const AUTOCOMPLETE_COMPONENTS = 'country:in';

// ------------------------------------------

interface PickLocationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLocationPick?: (coords: Coordinates, address: any | null) => void;
  initialLocation?: Coordinates;
}

const INDIA_CENTER: Coordinates = { latitude: 28.6139, longitude: 77.2090 };
const DEFAULT_ZOOM = 14;
const HIGH_ACCURACY_THRESHOLD = 50; // meters

export default function PickLocationModal({
  isVisible,
  onClose,
  onLocationPick,
  initialLocation,
}: PickLocationModalProps) {
  const initialLocationState = initialLocation || INDIA_CENTER;
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | undefined>(initialLocationState);
  const [address, setAddress] = useState<any | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'blocked'>('unknown');

  // search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const mapRef = useRef<any>(null);
  const store = useUserLocationStore();

  // Reset when modal opens/closes
  useEffect(() => {
    if (isVisible) {
      setSelectedLocation(initialLocationState);
      setAddress(null);
      setQuery('');
      setSuggestions([]);
    }
  }, [isVisible]);

  // ---------------- Permission helpers ----------------
  const requestLocationPermission = useCallback(async (): Promise<'granted' | 'denied' | 'blocked'> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        return 'granted';
      } else {
        // Check if user permanently denied (can't know programmatically on all platforms)
        setPermissionStatus('denied');
        return 'denied';
      }
    } catch (err) {
      console.warn('permission request error', err);
      setPermissionStatus('denied');
      return 'denied';
    }
  }, []);

  // Open app settings
  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert('Unable to open settings', 'Please open settings manually and enable location permission.');
    });
  };

  // ---------------- Get current device location ----------------
  const getCurrentLocation = useCallback(async () => {
    Keyboard.dismiss();
    setLoadingLocation(true);

    try {
      let perm = permissionStatus;
      if (perm !== 'granted') {
        perm = await requestLocationPermission();
      }
      if (perm !== 'granted') {
        // permission denied: show actionable message
        setLoadingLocation(false);
        Alert.alert(
          'Permission required',
          'Location permission is required to fetch your current location. Please allow it in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ],
        );
        setPermissionStatus('denied');
        return;
      }

      // Acquire location with timeout + high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        
      });

      // Optional: detect mocked location (platform dependent)
      const mocked = (location as any).mocked ?? false;

      // If accuracy is poor, attempt to request better accuracy
      if (location.coords.accuracy && location.coords.accuracy > HIGH_ACCURACY_THRESHOLD) {
        // try a second time for better accuracy (short retry)
        const retry = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000
        }).catch(() => null);

        if (retry && retry.coords.accuracy && retry.coords.accuracy < location.coords.accuracy) {
          // prefer retry coords
          location.coords.latitude = retry.coords.latitude;
          location.coords.longitude = retry.coords.longitude;
          location.coords.accuracy = retry.coords.accuracy;
        }
      }

      const coords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // update selected location & marker
      setSelectedLocation(coords);

      // move camera smoothly if map supports
      try {
        if (mapRef.current && mapRef.current.setCamera) {
          // expo-maps GoogleMaps.View/AppleMaps.View camera API differences exist; attempt both
          mapRef.current.setCamera({
            center: coords,
            zoom: DEFAULT_ZOOM,
          });
        } else if (mapRef.current && mapRef.current.animateCamera) {
          mapRef.current.animateCamera({ center: coords, zoom: DEFAULT_ZOOM }, { duration: 500 });
        }
      } catch (err) {
        // ignore camera move errors
      }

      // Reverse geocode to get address
      const reverse = await Location.reverseGeocodeAsync([coords.latitude, coords.longitude]);
      const best = reverse && reverse.length ? reverse[0] : null;
      setAddress(best);

      // Persist to store
      const payload = {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude ?? 0,
          accuracy: location.coords.accuracy ?? 0,
          heading: location.coords.heading ?? 0,
          speed: location.coords.speed ?? 0,
        } as Location.LocationObjectCoords,
        address: best
          ? {
              street: best.street || '',
              city: best.city || best.subregion || '',
              state: best.region || '',
              country: best.country || '',
              postalCode: best.postalCode || '',
              formattedAddress: `${best.name ? best.name + ', ' : ''}${best.street ?? ''} ${best.city ?? ''} ${best.region ?? ''} ${best.postalCode ?? ''}`.trim(),
            }
          : null,
      };

      await store.setLocation(payload);

      if (onLocationPick) onLocationPick(coords, best);
    } catch (err: any) {
      console.warn('getCurrentLocation error', err);
      // Distinguish common errors
      const message =
        err?.code === 'E_LOCATION_TIMEOUT' ? 'Timeout while fetching location. Try again.' :
        err?.message ?? 'Unable to get location. Ensure GPS is on and permission granted.';
      Alert.alert('Location Error', message, [{ text: 'OK' }]);
    } finally {
      setLoadingLocation(false);
    }
  }, [permissionStatus, requestLocationPermission, onLocationPick, store]);

  // ---------------- Map click handler ----------------
  const handleMapClick = useCallback(async (event: { coordinates: Coordinates }) => {
    setSelectedLocation(event.coordinates);

    // reverse geocode to get address
    try {
      const rev = await Location.reverseGeocodeAsync([event.coordinates.latitude, event.coordinates.longitude]);
      const best = rev && rev.length ? rev[0] : null;
      setAddress(best);
    } catch (err) {
      console.warn('reverse geocode error', err);
      setAddress(null);
    }
  }, []);

  // ---------------- Search (Google Places Autocomplete) ----------------
  // debounce search to reduce API calls
  const fetchAutocomplete = useCallback(
    debounce(async (text: string) => {
      if (!text || text.trim().length < 2) {
        setSuggestions([]);
        setSearchLoading(false);
        return;
      }

      if (!GOOGLE_PLACES_API_KEY) {
        // search not available
        setSuggestions([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const q = encodeURIComponent(text);
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${q}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_ANDROID_API_KEY}&components=${AUTOCOMPLETE_COMPONENTS}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === 'OK') {
          setSuggestions(json.predictions || []);
        } else {
          console.warn('places autocomplete status', json.status, json.error_message);
          setSuggestions([]);
        }
      } catch (err) {
        console.warn('autocomplete error', err);
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400),
    []
  );

  useEffect(() => {
    setSearchLoading(true);
    fetchAutocomplete(query);
    // cancel on unmount
    return () => {
      fetchAutocomplete.cancel();
    };
  }, [query]);

  const handleSelectSuggestion = useCallback(
    async (prediction: any) => {
      Keyboard.dismiss();
      setSuggestions([]);
      setQuery(prediction.description);
      setSearchLoading(true);

      try {
        if (!GOOGLE_PLACES_API_KEY) {
          Alert.alert('Search unavailable', 'Provide GOOGLE_PLACES_API_KEY to enable search.');
          setSearchLoading(false);
          return;
        }

        // Details API to get lat/lng
        const placeId = prediction.place_id;
        const fields = 'geometry,name,formatted_address,address_component';
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}&fields=geometry,name,formatted_address,address_component`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === 'OK' && json.result && json.result.geometry && json.result.geometry.location) {
          const loc = json.result.geometry.location;
          const coords: Coordinates = { latitude: loc.lat, longitude: loc.lng };
          setSelectedLocation(coords);

          // attempt to construct address from result
          const formatted = json.result.formatted_address || prediction.description;
          const addressObj = {
            name: json.result.name ?? null,
            formattedAddress: formatted,
            // parse address components lightly if available
            raw: json.result,
          };
          setAddress(addressObj);

          // animate camera
          try {
            if (mapRef.current && mapRef.current.setCamera) {
              mapRef.current.setCamera({ center: coords, zoom: DEFAULT_ZOOM });
            }
          } catch (err) {}

        } else {
          Alert.alert('Place details error', 'Unable to get place details. Try again.');
        }
      } catch (err) {
        console.warn('place details error', err);
        Alert.alert('Search Error', 'Failed to fetch place details.');
      } finally {
        setSearchLoading(false);
      }
    },
    []
  );

  // ---------------- Confirm selection ----------------
  const handleSelectLocation = async () => {
    if (!selectedLocation) {
      Alert.alert('No location selected', 'Tap on the map or use Search / Current location.');
      return;
    }

    // Build final payload for store
    try {
      // If we don't have address yet, attempt reverse geocode
      let finalAddress = address;
      if (!finalAddress) {
        try {
          const rev = await Location.reverseGeocodeAsync([selectedLocation.latitude, selectedLocation.longitude]);
          finalAddress = rev && rev.length ? rev[0] : null;
          setAddress(finalAddress);
        } catch (err) {
          finalAddress = null;
        }
      }

      const payload = {
        coords: {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          altitude: 0,
          accuracy: 0,
          heading: 0,
          speed: 0,
        } as Location.LocationObjectCoords,
        address: finalAddress
          ? {
              street: finalAddress.street || '',
              city: finalAddress.city || finalAddress.subregion || '',
              state: finalAddress.region || '',
              country: finalAddress.country || '',
              postalCode: finalAddress.postalCode || '',
              formattedAddress:
                finalAddress.name
                  ? `${finalAddress.name}, ${finalAddress.street ?? ''}, ${finalAddress.city ?? ''}, ${finalAddress.region ?? ''}`.trim()
                  : finalAddress.street
                      ? `${finalAddress.street}, ${finalAddress.city ?? ''}, ${finalAddress.region ?? ''}`.trim()
                      : JSON.stringify(finalAddress),
            }
          : null,
      };

      // Persist to Zustand + AsyncStorage using your store
      await store.setLocation(payload);

      if (onLocationPick) onLocationPick(selectedLocation, finalAddress);

      onClose();
    } catch (err) {
      console.warn('confirm save error', err);
      Alert.alert('Save Error', 'Unable to save selected location.');
    }
  };

  // ---------------- UI Rendering ----------------
  const renderMap = () => {
    const currentCoords = selectedLocation || initialLocationState;
    if (Platform.OS === 'ios') {
      return (
        <AppleMaps.View
          ref={mapRef}
          style={styles.map}
          onMapClick={handleMapClick}
          cameraPosition={{
            ...currentCoords,
            zoom: DEFAULT_ZOOM,
          }}
          markers={[
            {
              coordinates: currentCoords,
              title: 'Selected Location',
              id: 'selected',
            },
          ]}
        />
      );
    } else if (Platform.OS === 'android') {
      return (
        <GoogleMaps.View
          ref={mapRef}
          style={styles.map}
          onMapClick={handleMapClick}
          cameraPosition={{
            coordinates: {
              latitude: currentCoords.latitude ?? INDIA_CENTER.latitude,
              longitude: currentCoords.longitude ?? INDIA_CENTER.longitude,
            },
            zoom: DEFAULT_ZOOM,
          }}
          markers={[
            {
              coordinates: currentCoords,
              title: 'Selected Location',
              id: 'selected',
            },
          ]}
        />
      );
    } else {
      return <Text style={styles.platformText}>Maps are only on Android / iOS</Text>;
    }
  };

  return (
    <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {/* Centered card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📍 Select Location</Text>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Search + Current Location Row */}
          <View style={styles.controlsRow}>
            <View style={styles.searchWrapper}>
              <TextInput
                placeholder={GOOGLE_PLACES_API_KEY ? "Search place or address" : "Search disabled (no API key)"}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                editable={!!GOOGLE_PLACES_API_KEY}
              />
              {searchLoading ? <ActivityIndicator style={{ marginLeft: 8 }} /> : null}
            </View>

            <Pressable
              onPress={getCurrentLocation}
              style={styles.currentBtn}
              accessibilityLabel="Use current location"
            >
              {loadingLocation ? <ActivityIndicator color="#fff" /> : <Text style={styles.currentBtnText}>📡</Text>}
            </Pressable>
          </View>

          {/* Suggestions list */}
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              <FlatList
                data={suggestions}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(i) => i.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectSuggestion(item)} style={styles.suggestionItem}>
                    <Text numberOfLines={1}>{item.description}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Map area */}
          <View style={styles.mapContainer}>{renderMap()}</View>

          {/* Footer: selected coords & confirm */}
          <View style={styles.footer}>
            <Text style={styles.locationText}>
              {selectedLocation && selectedLocation.latitude && selectedLocation.longitude
                ? `${selectedLocation.latitude.toFixed(6)}, ${selectedLocation.longitude.toFixed(6)}`
                : 'Tap map to pick a location'}
            </Text>

            <View style={styles.addressPreview}>
              <Text numberOfLines={2} style={{ textAlign: 'center' }}>
                {address ? (address.formattedAddress || address.formattedAddress || (address.name ?? JSON.stringify(address))) : 'Address will appear here'}
              </Text>
            </View>

            <View style={styles.footerBtns}>
              <Pressable onPress={onClose} style={[styles.footerBtn, styles.cancelBtn]}>
                <Text style={styles.footerBtnText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={handleSelectLocation} style={[styles.footerBtn, styles.confirmBtn]}>
                <Text style={[styles.footerBtnText, { color: '#fff' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '92%',
    maxWidth: 900,
    height: '82%',
    maxHeight: 820,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  closeButton: { padding: 6 },
  closeButtonText: { fontSize: 20, color: '#666' },

  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
  },
  searchInput: { flex: 1, paddingVertical: 6 },
  currentBtn: {
    marginLeft: 8,
    height: 42,
    width: 42,
    borderRadius: 8,
    backgroundColor: '#0a84ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBtnText: { color: '#fff', fontSize: 18 },

  suggestions: {
    maxHeight: 140,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    paddingVertical: 4,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },

  mapContainer: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 240,
  },
  map: {
    flex: 1,
    backgroundColor: '#ddd',
  },

  platformText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
  },
  locationText: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 8,
    color: '#444',
  },
  addressPreview: {
    minHeight: 36,
    justifyContent: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  footerBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f3f3f3',
  },
  confirmBtn: {
    backgroundColor: '#0a84ff',
  },
  footerBtnText: {
    fontWeight: '600',
  },
});
