import { Theme } from "@/constants/types";
import { useFavoriteMasjidStore } from "@/stores/useFavoriteMasjidStore";
import StarFilledIcon from '@expo/vector-icons/FontAwesome';
import FollowingIcons from '@expo/vector-icons/Ionicons';
import { useNavigation, useTheme } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive dimensions based on screen size
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.42, 190); // Max 190px or 42% of screen width
const CARD_HEIGHT = SCREEN_HEIGHT * 0.32; // Increased from 26% to 32% for better button visibility
const IMAGE_HEIGHT = CARD_HEIGHT * 0.38; // Adjusted to 38% for better proportion

interface BudgetNeededCardProps {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  collectedAmount: number;
  images: string[];
  isUnderConstruction: boolean;
  remainingAmount: number;
  totalRequired: number;
}

export const BudgetNeededCard: React.FC<BudgetNeededCardProps> = ({
  _id,
  name,
  address,
  city,
  state,
  collectedAmount,
  images,
  remainingAmount,
  totalRequired,
}) => {
  const { colors } = useTheme() as Theme;
  const navigation: any = useNavigation();

  const progressPercentage = Math.min((collectedAmount / totalRequired) * 100, 100);

  // Progress bar color logic based on percentage
  const getProgressBarColor = (percentage: number) => {
    if (percentage <= 40) return '#F44336'; // Red
    if (percentage <= 60) return '#FF9800'; // Orange
    if (percentage <= 80) return '#2196F3'; // Blue (achieving)
    return '#4CAF50'; // Green (>80%)
  };

  const progressBarColor = getProgressBarColor(progressPercentage);

  const hydrated = useFavoriteMasjidStore(state => state.hydrated);
  const isFavorite = useFavoriteMasjidStore(state => state.isFavorite(_id));
  const isFollowing = useFavoriteMasjidStore(state => state.isFollowing(_id));

  return (
    <View style={[styles.container, { backgroundColor: colors.CARD, shadowColor: colors.TEXT }]}>
      {/* Masjid Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: images[0] || 'https://via.placeholder.com/150' }}
          style={styles.image}
          contentFit="cover"
          placeholder={require('@/assets/images/homepage/logo-light.png')}
        />
        {hydrated && isFavorite && (
            <View style={styles.favoriteIcon} pointerEvents="none">
                {
                  isFollowing && <FollowingIcons name="checkmark-done-circle-sharp" size={24} color="white" />
                }
                <StarFilledIcon name="star" size={18} color="#FFD700" />
            </View>
          )}
        {/* <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <Text style={styles.locationText}>{city}, {state}</Text>
        </View> */}

        {/* Remaining Amount Badge - Positioned absolutely */}
        <View style={[styles.remainingBadge, { backgroundColor: remainingAmount > 0 ? '#FF5722' : '#4CAF50' }]}>
          <Text style={styles.remainingText}>
            {remainingAmount > 0
              ? `₹${remainingAmount.toLocaleString()} needed`
              : 'Budget achieved! 🎉'
            }
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={[styles.name, { color: colors.TEXT }]} numberOfLines={2}>
            {name}
          </Text>
          <Text style={[styles.address, { color: colors.TEXT + '80' }]} numberOfLines={1}>
            {address}
          </Text>

          {/* Budget Progress */}
          <View style={styles.budgetContainer}>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressPercentage}%`, backgroundColor: progressBarColor }
                ]}
              />
            </View>
            <Text style={[styles.percentageText, { color: progressBarColor }]}>
              {progressPercentage.toFixed(1)}% collected
            </Text>
            <View style={styles.budgetTextContainer}>
              <Text style={[styles.collectedText, { color: colors.TEXT }]}>
                ₹{collectedAmount.toLocaleString()}
              </Text>
              <Text style={[styles.neededText, { color: colors.TEXT + '60' }]}>
                of ₹{totalRequired.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('screens/home/MasjidDetails', { _id })}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    margin: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  imageContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  locationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 120, // Ensure minimum height for content
  },
  textContent: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 16,
  },
  address: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 14,
  },
  budgetContainer: {
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  budgetTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  collectedText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  neededText: {
    fontSize: 13,
  },
  favoriteIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection:'row',
    alignItems:'center',
    gap:3,
    borderRadius: 16,
    zIndex: 10,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  remainingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  remainingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    padding: 2
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: 'green', // Ensure background color is set
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});