import { useGetAllFavoriteMosque } from "@/apis/favoriteMosque/useGetAllFavoriteMosque";
import { useGetAllNearbyMasjids } from "@/apis/masjid/useGetAllMasjids";
import { useGetBudgetNeededMasjids } from "@/apis/masjid/useGetBudgetNeededMasjids";
import { BudgetNeededCard } from "@/components/custom/BudgetNeededCard";
import { MasjidCard } from "@/components/custom/MasjidCard";
import FilterSortModal from "@/components/global/FilterSortModal";
import Loader from "@/components/Loader";
import { Theme } from "@/constants/types";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useFavoriteMasjidStore } from "@/stores/useFavoriteMasjidStore";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTheme } from "@react-navigation/native";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// This function converts a noisy string into a sequential regex pattern
const createSequentialRegex = (input: string) => {
  // 1. Remove consecutive duplicates (e.g., 'aaaaa' -> 'a')
  // and convert to lowercase for case-insensitive matching.
  const uniqueSequence = input.toLowerCase().replace(/(.)\1+/g, "$1");

  // 2. Escape any special regex characters in the sequence.
  const escapedSequence = uniqueSequence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // 3. Insert '.*' between every character to allow for
  // zero or more other characters in between.
  const regexString = escapedSequence.split("").join(".*");

  // 4. Create the final case-insensitive regex object.
  return new RegExp(regexString, "i");
};

interface MasjidCardProps {
  _id: string;
  name: string;
  address: string;
  distance: number; // in km
  images: string[];
  videos: string[];
}

interface BudgetNeededMasjidProps {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
  collectedAmount: number;
  images: string[];
  isUnderConstruction: boolean;
  remainingAmount: number;
  totalRequired: number;
}

// Get screen height and define modal height (1/4 of screen)
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
// const MODAL_HEIGHT = SCREEN_HEIGHT / 4;
const MODAL_HEIGHT = SCREEN_HEIGHT ? SCREEN_HEIGHT / 3 : 200;
const PAGE = "1";
const LIMIT = "50";
const RADIUS = "5";

type PrayerLevel = "PAST" | "IMMEDIATE" | "SOON" | "LATER" | "";

const Home = () => {
  // react hooks
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateLocationLoading, setUpdateLocationLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<'global' | 'nearby'>('global');
  const [searchModeSwitching, setSearchModeSwitching] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilter, setAppliedFilter] = useState<{
    salah: string;
    sortBy: "distance" | "salah_time";
    level: PrayerLevel; // optional
  }>({
    salah: "",
    sortBy: "distance",
    level: "",
  });

  const [selectedCity, setSelectedCity] = useState("India");
  const [cityDropdownVisible, setCityDropdownVisible] = useState(false);

  const slideAnim = useRef(new Animated.Value(-MODAL_HEIGHT)).current; // Set up animated value, starting off-screen (top)
  const searchModeAnim = useRef(new Animated.Value(0)).current; // Animation for search mode switch

  // custom hooks and stores
  const { restoreLocation, clearLocation } = useUserLocationStore();
  const { hydrated, setFavorite, isFavorite, favorites } =
    useFavoriteMasjidStore();
  const {
    location,
    errorMsg,
    fetchLocation,
    handleExitApp,
    handleOpenSettings,
    isLoading: locationLoading,
  } = useUserLocation();
  const { colors } = useTheme() as Theme;
  const { data, error, isLoading } = useGetAllNearbyMasjids(
    RADIUS,
    LIMIT,
    PAGE,
    "",
    appliedFilter.salah,
    appliedFilter.sortBy,
    appliedFilter.level
  ); // need to optimize search
  const {
    data: favoriteMosque,
    isLoading: favoriteMosqueLoading,
    isSuccess: favoriteMosqueSuccess,
  } = useGetAllFavoriteMosque(!hydrated);

  const {
    data: budgetNeededMasjids,
    isLoading: budgetNeededLoading,
    error: budgetNeededError,
  } = useGetBudgetNeededMasjids("10", selectedCity);

  useEffect(() => {
    if (favoriteMosqueSuccess && favoriteMosque) {
      setFavorite({
        favorites: favoriteMosque.favoriteMasjids ?? [],
        following: favoriteMosque.followingMasjid ?? null,
      });
    }
  }, [favoriteMosqueSuccess, favoriteMosque]);

  // Close dropdown when clicking outside or after timeout
  useEffect(() => {
    if (cityDropdownVisible) {
      const timer = setTimeout(() => {
        setCityDropdownVisible(false);
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [cityDropdownVisible]);

  const filteredData = useMemo(() => {
    // Create the regex only once per memoization cycle
    const sequentialRegex = createSequentialRegex(searchQuery);

    if (!isLoading && data && data.length && searchQuery && searchMode === 'nearby') {
      // Existing logic for nearby search
      return data.filter(
        (masjid: any) =>
          // Check if the regex pattern is found in the name or address
            sequentialRegex.test(masjid.name) ||
            sequentialRegex.test(masjid.address)
        );
      
    }
    return data;
  }, [isLoading, data, searchQuery, searchMode]);

  // react effects

  // Restore location on mount
  useEffect(() => {
    restoreLocation();
  }, []);

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
  }, [isModalVisible, slideAnim]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchValue);
    }, 500);
    return () =>{
      clearTimeout(timeout)
    }
  }, [searchValue, searchQuery, setSearchValue, setSearchQuery])

  // functions

  const handleUpdateLocation = async () => {
    setUpdateLocationLoading(true);
    await clearLocation();
    await fetchLocation();
    setUpdateLocationLoading(false);
    setIsModalVisible(false);
  };

  const handleSearchModeSwitch = () => {
    if (searchModeSwitching) return; // Prevent multiple presses

    const newMode = searchMode === 'global' ? 'nearby' : 'global';
    setSearchModeSwitching(true);

    // Animate the switch
    Animated.sequence([
      Animated.timing(searchModeAnim, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(searchModeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchMode(newMode);
      searchModeAnim.setValue(0);
      setSearchModeSwitching(false);
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/homepage/logo-light.png")}
          style={{
            width: 100,
            height: 50,
            objectFit: "contain",
          }}
        />

        {/* This is your location bar, now a button */}
        <TouchableOpacity
          style={[
            styles.locationContainer,
            { backgroundColor: colors.BG_SECONDARY },
          ]}
          onPress={() => setIsModalVisible(true)} // Open modal on press
        >
          <Entypo name="location-pin" size={24} color="#cd0a2a" />
          <Text
            style={{ color: colors.text }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location?.address?.formattedAddress}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.paddingContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder={searchMode === "global" ? "Search for Masjid Globally" : "Search for Nearby Masjid"}
            placeholderTextColor={colors.DISABLED_TEXT}
            style={[
              styles.input,
              {
                backgroundColor: colors.BG_SECONDARY,
                color: colors.TEXT,
                flex: 1,
              },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.searchModeButton,
              {
                backgroundColor: colors.BG_SECONDARY,
                transform: [{ scale: searchModeAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.95, 1],
                }) }],
                opacity: searchModeSwitching ? 0.7 : 1,
              }
            ]}
            onPress={handleSearchModeSwitch}
            disabled={searchModeSwitching}
          >
            {searchModeSwitching ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <>
                <Ionicons
                  name={searchMode === 'global' ? 'globe-outline' : 'location-outline'}
                  size={20}
                  color={colors.text}
                />
                <Text style={[styles.searchModeText, { color: colors.text }]}>
                  {searchMode === 'global' ? 'Global' : 'Nearby'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Budget Needed Masjids Section */}
          <View style={styles.budgetSection}>
              <View style={styles.budgetSectionHeader}>
                <View style={styles.budgetSectionTitleRow}>
                  <Text style={[styles.budgetSectionTitle, { color: colors.text }]}>
                    High Donation Needed
                  </Text>
                  <View style={styles.cityDropdownContainer}>
                    <TouchableOpacity
                      style={[styles.cityDropdown, { borderColor: colors.text + '40' }]}
                      onPress={() => setCityDropdownVisible(!cityDropdownVisible)}
                    >
                      <Text style={[styles.cityDropdownText, { color: colors.text }]}>
                        {selectedCity.length > 10 ? selectedCity.substring(0, 7) + '...' : selectedCity}
                      </Text>
                      <View style={styles.dropdownArrow}>
                        <Ionicons
                          name={cityDropdownVisible ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={colors.text}
                        />
                      </View>
                    </TouchableOpacity>
                    {cityDropdownVisible && (
                      <View style={[styles.cityDropdownMenu, { backgroundColor: colors.CARD, borderColor: colors.text + '20' }]}>
                        {["India", "Hyderabad"].map((city) => (
                          <TouchableOpacity
                            key={city}
                            style={styles.cityDropdownItem}
                            onPress={() => {
                              setSelectedCity(city);
                              setCityDropdownVisible(false);
                            }}
                          >
                            <Text style={[styles.cityDropdownItemText, { color: colors.text }]}>
                              {city}
                            </Text>
                            {selectedCity === city && (
                              <Ionicons name="checkmark" size={16} color={colors.text} />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {budgetNeededLoading ? (
                <View style={styles.budgetLoadingContainer}>
                  <ActivityIndicator size="large" color={colors.text} />
                  <Text style={[styles.loadingText, { color: colors.text + '80' }]}>
                    Loading donation needs...
                  </Text>
                </View>
              ) : budgetNeededError ? (
                <View style={styles.budgetLoadingContainer}>
                  <Text style={[styles.loadingText, { color: colors.text + '60' }]}>
                    Failed to load data. Please restart the app.
                  </Text>
                </View>
              ) : budgetNeededMasjids && budgetNeededMasjids.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.budgetCardsContainer}
                >
                  {budgetNeededMasjids.map((masjid: BudgetNeededMasjidProps) => (
                    <BudgetNeededCard
                      key={masjid._id}
                      {...masjid}
                    />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.budgetNoDataContainer}>
                  <Text style={[styles.noDataText, { color: colors.text + '60' }]}>
                    No data found
                  </Text>
                </View>
              )}
            </View>

          <View>
            <View style={styles.nearbySectionLabel}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={[styles.section, { color: colors.text }]}>
                  Nearby Masjids
                </Text>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setFilterModalVisible(true)}
                >
                  <Ionicons name="filter" size={22} color={colors.TINT} />
                </TouchableOpacity>
              </View>
              {(appliedFilter.salah ||
                appliedFilter.level ||
                appliedFilter.sortBy === "salah_time") && (
                <TouchableOpacity
                  onPress={() =>
                    setAppliedFilter({
                      ...appliedFilter,
                      salah: "",
                      level: "",
                      sortBy: "distance",
                    })
                  }
                >
                  <Text style={[{ color: "brown", fontSize: 12 }]}>
                    Clear Filter
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {appliedFilter.salah ? (
              <Text style={[styles.filterMessage, { color: colors.text }]}>
                Showing masjids for{" "}
                <Text style={{ color: "green" }}>{appliedFilter.salah}</Text>
                {appliedFilter.level
                  ? appliedFilter.level === "PAST"
                    ? " whose time is passed"
                    : appliedFilter.level === "IMMEDIATE"
                    ? " whose time is within 5 minutes"
                    : appliedFilter.level === "SOON"
                    ? " whose time in between 5 to 20 minutes"
                    : appliedFilter.level === "LATER"
                    ? " whose time is after 20 minutes"
                    : ""
                  : ""}
              </Text>
            ) : (
              ""
            )}
            {appliedFilter.sortBy === "salah_time" ? (
              <Text style={[styles.filterMessage, { color: colors.text }]}>
                Sorted by Salah Time.
              </Text>
            ) : (
              ""
            )}
          </View>
          {isLoading || locationLoading || favoriteMosqueLoading ? (
            <View style={[
                styles.container,
                { justifyContent: "center", alignItems: "center" },
              ]}>
              <Loader />
            </View>
          ) : error ? (
            <View
              style={[
                styles.container,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <Text style={{ color: colors.text }}>Some Error Occured</Text>
            </View>
          ) : (
            <View>
              {!filteredData || filteredData.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={{ color: "orange", fontSize: 16 }}>
                    No Nearby Masjids Found
                  </Text>
                </View>
              ) : (
                <View style={styles.masjidGrid}>
                  {filteredData.map((masjid: any) => (
                    <View key={masjid._id} style={styles.cardWrapper}>
                      <MasjidCard
                        {...masjid}
                        latitude={masjid.latitude}
                        longitude={masjid.longitude}
                        isUnderConstruction={masjid.isUnderConstruction}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
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
              {errorMsg === "Please enable GPS!" ? (
                <TouchableOpacity
                  style={styles.exitBtn}
                  onPress={handleExitApp}
                >
                  <Text style={styles.modalBtnText}>Exit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={handleOpenSettings}
                >
                  <Text style={styles.modalBtnText}>Open Settings</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.modalBtn} onPress={fetchLocation}>
                <Text style={styles.modalBtnText}>
                  {errorMsg === "Please enable GPS!" ? "Enable" : "Retry"}
                </Text>
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
        onRequestClose={() => { setIsModalVisible(false); }}
      >
        {/* Backdrop: press to close */}
        <View style={styles.addressModalBackdrop}>
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
                ellipsizeMode={"tail"}
              >
                {location?.address?.formattedAddress}
              </Text>
              {/* This Pressable stops the tap from "passing through" to the backdrop */}
              {updateLocationLoading ? (
                <ActivityIndicator color={colors.primary} size={30} />
              ) : (
                <Pressable>
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdateLocation}
                  >
                    <View style={styles.updateButtonContainer}>
                      <FontAwesome6
                        name="location-crosshairs"
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                  </TouchableOpacity>
                </Pressable>
              )}
            </View>
            <View style={styles.closeAddressModalButtonContainer}>
              <TouchableOpacity
                style={styles.closeAddressModalButton}
                onPress={() => setIsModalVisible(false)}
              >
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
              appliedFilter.sortBy === "distance" ? "Distance" : "Salah Time",
            level: appliedFilter.level, // ✅ pass level
          }}
          onApply={({ salah, sortBy, level }) => {
            setAppliedFilter({
              salah: salah || "",
              sortBy: sortBy === "Distance" ? "distance" : "salah_time",
              level: level || "", // ✅ store level (can be undefined)
            });
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 16, // ONLY padding, no height, no flexGrow
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  logoContainer: {
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paddingContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flex: 1,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingInline: 10,
    paddingRight: 30,
    paddingBlock: 5,
    borderRadius: 8,
    maxWidth: "60%",
  },

  filterButton: {
    marginLeft: 8,
    padding: 10,
    borderRadius: 8,
  },

  cardWrapper: {
    position: "relative",
    width: "48%",
  },
  section: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filterMessage: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: "italic",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  nearbySectionLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  budgetSection: {
    marginTop: 15,
    marginBottom: 10,
  },
  budgetSectionHeader: {
    marginBottom: 8,
  },
  budgetSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  budgetSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cityDropdownContainer: {
    position: 'relative',
  },
  cityDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 120,
  },
  cityDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dropdownArrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityDropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    minWidth: 120,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 1000,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cityDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cityDropdownItemText: {
    fontSize: 14,
    flexShrink: 0,
  },
  budgetSectionSubtitle: {
    fontSize: 14,
  },
  budgetCardsContainer: {
    paddingRight: 20,
  },
  budgetLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  budgetNoDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  // --- Modal Styles ---
  addressModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // Dimmed background
  },
  addressModalContainer: {
    // position: 'absolute', // Position at the top
    // top: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 15,
    justifyContent: "space-between",
    height: 400,
  },
  addressModalBox: {
    width: "100%",
    gap: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  updateButton: {
    paddingVertical: 7,
    paddingLeft: 5,
    borderRadius: 10,
    width: "100%",
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  exitBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "gray",
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#e2e2e2",
    color: "#555",
  },
  updateButtonContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  closeAddressModalButtonContainer: { alignItems: "center" },
  closeAddressModalButton: {
    backgroundColor: "brown",
    paddingVertical: 7,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeAddressModalButtonText: { color: "#fff" },

  input: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
    // minWidth: 80,
    justifyContent: 'center',
  },
  searchModeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  masjidGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 20,
  },
});

export default Home;
