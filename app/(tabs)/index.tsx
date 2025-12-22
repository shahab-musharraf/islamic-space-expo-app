import { useGetAllFavoriteMosque } from '@/apis/favoriteMosque/useGetAllFavoriteMosque';
import { useGetAllNearbyMasjids } from '@/apis/masjid/useGetAllMasjids';
import { MasjidCard } from '@/components/custom/MasjidCard';
import FilterSortModal from '@/components/global/FilterSortModal';
import Loader from '@/components/Loader';
import { Theme } from '@/constants/types';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useFavoriteMasjidStore } from '@/stores/useFavoriteMasjidStore';
import { useUserLocationStore } from '@/stores/userLocationStore';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import StarFilledIcon from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// <StarOutlineIcon name="star" size={24} color="black" />
// <StarFilledIcon name="star" size={24} color="black" />

// This function converts a noisy string into a sequential regex pattern
const createSequentialRegex = (input:string) => {
    // 1. Remove consecutive duplicates (e.g., 'aaaaa' -> 'a')
    // and convert to lowercase for case-insensitive matching.
    const uniqueSequence = input.toLowerCase().replace(/(.)\1+/g, '$1');

    // 2. Escape any special regex characters in the sequence.
    const escapedSequence = uniqueSequence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 3. Insert '.*' between every character to allow for 
    // zero or more other characters in between.
    const regexString = escapedSequence.split('').join('.*');

    // 4. Create the final case-insensitive regex object.
    return new RegExp(regexString, 'i');
};

interface MasjidCardProps {
  _id: string;
  name: string;
  address: string;
  distance: number; // in km
  images: string[];
  videos: string[];

}

// Get screen height and define modal height (1/4 of screen)
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// const MODAL_HEIGHT = SCREEN_HEIGHT / 4;
const MODAL_HEIGHT = SCREEN_HEIGHT ? SCREEN_HEIGHT/3: 200;
const PAGE = '1';
const LIMIT = '20';
const RADIUS = '50';

type PrayerLevel = 'PAST' | 'IMMEDIATE' | 'SOON' | 'LATER' | '';

const Home = () => {
  
  // react hooks
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateLocationLoading, setUpdateLocationLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<{
    salah: string;
    sortBy: 'distance' | 'salah_time';
    level: PrayerLevel; // optional
  }>({
    salah: '',
    sortBy: 'distance',
    level: '',
  });


  const slideAnim = useRef(new Animated.Value(-MODAL_HEIGHT)).current;      // Set up animated value, starting off-screen (top)
  
  // custom hooks and stores
  const { restoreLocation , clearLocation } = useUserLocationStore();
  const { hydrated, setFavorite, isFavorite, favorites } = useFavoriteMasjidStore();
  const { location, errorMsg, fetchLocation, handleExitApp, handleOpenSettings, isLoading:locationLoading } = useUserLocation();
  const { colors } = useTheme() as Theme ;
  const { data, error, isLoading } = useGetAllNearbyMasjids(RADIUS, LIMIT, PAGE, '', appliedFilter.salah, appliedFilter.sortBy, appliedFilter.level);   // need to optimize search
  const { data: favoriteMosque, isLoading: favoriteMosqueLoading, isSuccess: favoriteMosqueSuccess } = useGetAllFavoriteMosque(!hydrated)

  useEffect(() => {
    if (favoriteMosqueSuccess && favoriteMosque) {
      setFavorite({
        favorites: favoriteMosque.favoriteMasjids ?? [],
        following: favoriteMosque.followingMasjid ?? null,
      });
    }
  }, [favoriteMosqueSuccess, favoriteMosque])


  const filteredData = useMemo(() => {
    // Create the regex only once per memoization cycle
    const sequentialRegex = createSequentialRegex(searchQuery);

    if (!isLoading && data && data.length && searchQuery) {
        return data.filter((masjid:any) => 
            // Check if the regex pattern is found in the name or address
            sequentialRegex.test(masjid.name) || 
            sequentialRegex.test(masjid.address)
        );
    }
    return data;
  }, [isLoading, data, searchQuery])


  // react effects

  // Restore location on mount
  useEffect(() => {
    restoreLocation()
  }, [])
  

  // Handle animation logic
  useEffect(() => {
    if (isModalVisible) {
      // Slide IN
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to top of the screen (y: 0)
        duration: 300,
        useNativeDriver: true, // Smooth native animation
      }).start();
    } else {
      // Slide OUT
      Animated.timing(slideAnim, {
        toValue: -MODAL_HEIGHT, // Slide back off-screen (y: -MODAL_HEIGHT)
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isModalVisible, slideAnim])

  
  // functions

  const handleUpdateLocation = async () => {
    setUpdateLocationLoading(true)
    await clearLocation();
    await fetchLocation();
    setUpdateLocationLoading(false)
    setIsModalVisible(false);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
  };




  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/homepage/logo-light.png')}
          style={{
            width: 100,
            height: 50,
            objectFit: 'contain'
          }}
        />

        {/* This is your location bar, now a button */}
        <TouchableOpacity
          style={[styles.locationContainer, { backgroundColor: colors.BG_SECONDARY }]}
          onPress={() => setIsModalVisible(true)} // Open modal on press
        > 
          <Entypo name="location-pin" size={24} color="#cd0a2a" />
          <Text style={{ color: colors.text,  }} numberOfLines={1} ellipsizeMode="tail">{location?.address?.formattedAddress}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.paddingContainer}>
        <View style={{flexDirection: 'row'}}>
          <TextInput 
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search for Masjids"
            placeholderTextColor={colors.DISABLED_TEXT}
            style={[styles.input, { backgroundColor: colors.BG_SECONDARY, color: colors.TEXT, flex: 1}]}
          />

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={22} color={colors.TEXT} />
          </TouchableOpacity>
        </View>



      

        {isLoading || locationLoading || favoriteMosqueLoading ?
          <View style={{ alignItems: 'center', justifyContent: 'center', height: '95%' }}>
                <Loader />
              </View>
          :
          error ? (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={{ color: colors.text }}>Some Error Occured</Text>
            </SafeAreaView>
          ): 
          <View>
          {
            !filteredData || (filteredData && filteredData?.length === 0) ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', height: '95%' }}>
                <Text style={{ color: 'orange', fontSize: 16 }}>No Nearby Masjids Found</Text>
              </View>
            ) : 
            <ScrollView style={styles.masjidListContainer} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>  
              {filteredData?.map((masjid : MasjidCardProps) => (
                  <View key={masjid._id} style={styles.cardWrapper}>
                    <MasjidCard
                      {...masjid}
                      />
                    {hydrated && isFavorite(masjid._id) && (
                      <View style={styles.favoriteIcon} pointerEvents="none">
                          <StarFilledIcon name="star" size={18} color="#FFD700" />
                      </View>
                    )}
                  </View>
            ))}
            </ScrollView>
          }
        </View>}

      </View>


      {/* ❌ Modal for location errors */}
      <Modal
        visible={!!errorMsg}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>{errorMsg}</Text>
              <View style={styles.modalButtons}>
                { errorMsg === "Please enable GPS!" ? 
                  <TouchableOpacity style={styles.exitBtn} onPress={handleExitApp}>
                    <Text style={styles.modalBtnText}>Exit</Text>
                  </TouchableOpacity> :
                  <TouchableOpacity style={styles.modalBtn} onPress={handleOpenSettings}>
                    <Text style={styles.modalBtnText}>Open Settings</Text>
                  </TouchableOpacity>
                }
                <TouchableOpacity style={styles.modalBtn} onPress={fetchLocation}>
                  <Text style={styles.modalBtnText}>{errorMsg === "Please enable GPS!" ? "Enable" : "Retry"}</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. The Modal for updating the location */}
      <Modal
        animationType="fade" // "fade" for the backdrop, we handle the slide
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        {/* Backdrop: press to close */}
        <View style={styles.addressModalBackdrop} >
          
          {/* 7. The Animated Container that slides */}
          <Animated.View
            style={[
              styles.addressModalContainer,
              {
                backgroundColor: colors.card,
                height: MODAL_HEIGHT,
                transform: [{ translateY: slideAnim }], // Apply animation
              },
            ]}
          >
            <View style={styles.addressModalBox}>
              <Text
                style={styles.disabledInput}
                numberOfLines={3}
                ellipsizeMode={'tail'}
                
              >{location?.address?.formattedAddress}</Text>
              {/* This Pressable stops the tap from "passing through" to the backdrop */}
              {
                updateLocationLoading ? 
                <ActivityIndicator color={colors.primary} size={30}/> :
                <Pressable>
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateLocation}
                  >
                    
                      <View style={styles.updateButtonContainer}>
                        <FontAwesome6 name="location-crosshairs" size={24} color={colors.primary} />
                      </View>
                    
                  </TouchableOpacity>
                </Pressable>
              }
            </View>
            <View style={styles.closeAddressModalButtonContainer}>
              <TouchableOpacity style={styles.closeAddressModalButton} onPress={closeModal}>
                <Text style={styles.closeAddressModalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      {filterModalVisible && (
  <FilterSortModal
    visible={filterModalVisible}
    onClose={() => setFilterModalVisible(false)}
    initialData={{
      salah: appliedFilter.salah,
      sortBy:
        appliedFilter.sortBy === 'distance'
          ? 'Distance'
          : 'Salah Time',
      level: appliedFilter.level, // ✅ pass level
    }}
    onApply={({ salah, sortBy, level }) => {
      setAppliedFilter({
        salah: salah || '',
        sortBy:
          sortBy === 'Distance'
            ? 'distance'
            : 'salah_time',
        level : level || '', // ✅ store level (can be undefined)
      });
    }}
  />
)}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: {paddingRight: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflowX:'hidden'},
  paddingContainer: {
    padding: 20
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingInline: 10,
    paddingRight: 30,
    paddingBlock: 5,
    borderRadius: 8,
    maxWidth:'60%',
  },

  filterButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 8,
  },

  cardWrapper: {
    position: 'relative',
    width: '48%',
  },

  favoriteIcon: {
    position: 'absolute',
    top: 3,
    right: 16,

    // backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    // padding: 6,

    zIndex: 10,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  // --- Modal Styles ---
  addressModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dimmed background
  },
  addressModalContainer: {
    // position: 'absolute', // Position at the top
    // top: 0,
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 15,
    justifyContent: 'space-between',
    height: 400
  },
  addressModalBox: {
    width: '100%',
    gap: 10,
    alignItems: 'center', 
    flexDirection: 'row',
  },
  updateButton: {
    paddingVertical: 7,
    paddingLeft: 5,
    borderRadius: 10,
    width: '100%',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: 'gray',
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: '#e2e2e2', color: '#555'},
  updateButtonContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  closeAddressModalButtonContainer: { alignItems:'center' },
  closeAddressModalButton: { backgroundColor: 'brown', paddingVertical: 7, paddingHorizontal: 20, borderRadius: 8,  },
  closeAddressModalButtonText: { color: '#fff' },

  input: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, fontSize: 16  },
  masjidListContainer: {paddingVertical: 30, },

});

export default Home;
