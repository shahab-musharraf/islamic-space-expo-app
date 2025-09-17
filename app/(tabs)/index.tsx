
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity } from 'react-native';

const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY'; // Replace with your API key

function usePlacesAutocomplete(query: string, location?: { lat: number; lng: number }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}`;
    url += '&types=geocode|establishment';
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=50000`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => setSuggestions(data.predictions || []))
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));
  }, [query, location]);

  return { suggestions, loading };
}



import { ThemedView } from '@/components/themed-view';
import { useNavigation } from '@react-navigation/native';
import { ImageBackground } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {

    const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [activeField, setActiveField] = useState<'pickup' | 'drop' | null>(null);

  // Use current location for better suggestions
  const latLng = currentLocation ? {
    lat: currentLocation.coords.latitude,
    lng: currentLocation.coords.longitude
  } : undefined;
  const { suggestions, loading } = usePlacesAutocomplete(activeField === 'pickup' ? pickup : drop, latLng);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
      console.log('User current location:', location);
    })();
  }, []);

  // Helper to render suggestions for pickup or drop
  const renderSuggestions = (field: 'pickup' | 'drop', value: string, setValue: (v: string) => void) => (
    activeField === field && value.length > 0 ? (
      <FlatList
        data={suggestions}
        keyExtractor={(item) => item.place_id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.suggestion}
            onPress={() => {
              setValue(item.description);
              setActiveField(null);
            }}
          >
            <Text>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={loading ? <ActivityIndicator /> : null}
        style={styles.suggestionList}
        keyboardShouldPersistTaps="handled"
      />
    ) : null
  );

  const navigation: any = useNavigation();

  const handleNavigateToProfile = () => {
    //  navigation.reset({
    //     index: 0,
    //     routes: [{ name: 'screens/ProfileScreen' }] // ✅ must match <Stack.Screen name="auth" />
    //   });
    navigation.navigate('screens/ProfileScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBox}>
        <ImageBackground
          source={require('@/assets/images/homepage_bg.png')}
          style={styles.topBoxBgImg}
        >
          <View style={styles.profileIconContainer} onTouchEnd={handleNavigateToProfile}>
            <View style={styles.profileIcon}>
              <MaterialIcons name="person" size={30} color="#fff" />
            </View>
          </View>
          <View style={styles.locationContainer}>
            <FlatList
              data={[]}
              ListHeaderComponent={
                <ThemedView style={styles.container}>
                  {/* <ThemedText type="title" style={styles.heading}>Book a Truck</ThemedText> */}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter pickup location"
                    value={pickup}
                    onChangeText={setPickup}
                    onFocus={() => setActiveField('pickup')}
                  />
                  {renderSuggestions('pickup', pickup, setPickup)}
                  <TextInput
                    style={styles.input}
                    placeholder="Enter drop location"
                    value={drop}
                    onChangeText={setDrop}
                    onFocus={() => setActiveField('drop')}
                  />
                  {renderSuggestions('drop', drop, setDrop)}
                </ThemedView>
              }
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
            />
          </View>
        </ImageBackground>
      </View>

      {/* <View style={styles.callBtn}>
        <TouchableOpacity>
          <Text style={styles.heading}>Call </Text>
        </TouchableOpacity>
      </View> */}


    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  topBox: {
    width: '100%',
    height: 360,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  callBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 50,
    elevation: 5,
  },
  topBoxBgImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  profileIconContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    // paddingInline: 20,

  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    backgroundColor: '#fff',
    height: '60%',
    width: '100%',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  suggestionList: {
    position: 'absolute',
    top: 60,
    left: 0,        
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 200,
    elevation: 5,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
})

export default Home;