import { Theme } from "@/constants/types";
import { useNavigation, useTheme } from "@react-navigation/native";
import { Image } from "expo-image";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive dimensions based on screen size
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.42, 190); // Max 190px or 42% of screen width
const CARD_HEIGHT = SCREEN_HEIGHT * 0.26; // 26% of screen height (optimized for compact design)
const IMAGE_HEIGHT = CARD_HEIGHT * 0.42; // 42% of card height for image (balanced)

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
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <Text style={styles.locationText}>{city}, {state}</Text>
        </View>

        {/* Remaining Amount Badge - Positioned absolutely */}
        <View style={[styles.remainingBadge, { backgroundColor: remainingAmount > 0 ? '#FF5722' : '#4CAF50' }]}>
          <Text style={styles.remainingText}>
            {remainingAmount > 0
              ? `₹${remainingAmount.toLocaleString()} needed`
              : 'Goal achieved! 🎉'
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
          style={[styles.viewButton, { backgroundColor: '#2196F3' }]}
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
    padding: 8,
    flex: 1,
    justifyContent: 'flex-start',
  },
  textContent: {
    // flex: 1, // Removed to allow natural height
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    lineHeight: 14,
  },
  address: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 12,
  },
  budgetContainer: {
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 2,
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
    marginBottom: 1,
  },
  collectedText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  neededText: {
    fontSize: 9,
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
    fontSize: 8,
    fontWeight: 'bold',
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 6,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});