import { Theme } from '@/constants/types';
import { useFavoriteMasjidStore } from '@/stores/useFavoriteMasjidStore';
import { getDisplayDistance } from '@/utils/getDisplayDistance';
import StarFilledIcon from '@expo/vector-icons/FontAwesome';
import FollowingIcons from '@expo/vector-icons/Ionicons';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/* ------------------ TYPES ------------------ */

interface MasjidCardProps {
  _id: string;
  name: string;
  address: string;
  distance: number;
  images: string[];
  videos: string[];

  color?: string | null;
  isUpcoming?: boolean;
  timeDiff?: string | null;
  prayerTime?: string | null;
  selectedPrayer?: string | null;
}

/* ------------------ COMPONENT ------------------ */

export const MasjidCard: React.FC<MasjidCardProps> = ({
  _id,
  name,
  address,
  distance,
  images,
  videos,
  color,
  isUpcoming,
  prayerTime,
  timeDiff,
  selectedPrayer,
}) => {
  const navigation: any = useNavigation();
  const { colors } = useTheme() as Theme;

  const scale = useSharedValue(1);
  const { hydrated, isFavorite, isFollowing } = useFavoriteMasjidStore();

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };

  const handleViewPress = () => {
    navigation.navigate('screens/home/MasjidDetails', {
      _id,
      name,
      images,
      address,
      distance,
      videos,
    });
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.cardContainer,
          animatedCardStyle,
          { backgroundColor: colors.CARD },
        ]}
      >
        {/* IMAGE */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: images[0] }} style={styles.image} />

          {hydrated && isFavorite(_id) && (
            <View style={styles.favoriteIcon} pointerEvents="none">
                {
                  isFollowing(_id) && <FollowingIcons name="checkmark-done-circle-sharp" size={24} color="white" />
                }
                <StarFilledIcon name="star" size={18} color="#FFD700" />
            </View>
          )}

          {/* PRAYER BADGE (TIME DIFF / TIME) */}
          {color && (
            <View style={[styles.overlayBanner, { backgroundColor: 'white' }]}>
              <Text style={[styles.overlayText, {textTransform: 'capitalize', color}]}>
                {/* {isUpcoming ? timeDiff : prayerTime} */}
                {selectedPrayer + " : " + prayerTime}
              </Text>
            </View>
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.masjidInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.nameText, { color: colors.TEXT }]}
              numberOfLines={1}
            >
              {name}
            </Text>

            {distance !== null && distance !== undefined && (
              <Text style={[styles.distanceText, { color: colors.TINT }]}>
                {getDisplayDistance(distance)}
              </Text>
            )}
          </View>

          <Text
            style={[styles.addressText, { color: colors.DISABLED_TEXT }]}
            numberOfLines={2}
          >
            {address}
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.viewButton, { backgroundColor: colors.BUTTON_BG }]}
            onPress={handleViewPress}
          >
            <Text
              style={[styles.viewButtonText, { color: colors.BUTTON_TEXT }]}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

/* ------------------ STYLES ------------------ */

const styles = StyleSheet.create({
  cardContainer: {
    width: '48%',
    minWidth: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },

  imageWrapper: {
    position: 'relative',
  },

  image: {
    width: '100%',
    height: 110,
    resizeMode: 'cover',
  },

  overlayBanner: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  overlayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  directionBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  directionIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  masjidInfo: {
    padding: 10,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  nameText: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },

  distanceText: {
    fontSize: 12,
    fontWeight: '600',
  },

    favoriteIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection:'row',
    alignItems:'center',
    gap:5,

    // backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    // padding: 6,

    zIndex: 10,
  },


  addressText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },

  prayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  prayerName: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  prayerTime: {
    fontSize: 12,
    fontWeight: '600',
  },

  viewButton: {
    marginTop: 6,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  viewButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
