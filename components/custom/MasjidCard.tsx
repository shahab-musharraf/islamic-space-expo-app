import { Theme } from '@/constants/types';
import { getDisplayDistance } from '@/utils/getDisplayDistance';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/FontAwesome5'; // Example icon




// --- Component Props ---

interface MasjidCardProps {
  _id: string;
  name: string;
  address: string;
  distance: number; // in km
  images: string[]

}

// --- MasjidCard Component ---

export const MasjidCard: React.FC<MasjidCardProps> = ({ 
  _id,
  name, 
  address,
  distance,
  images
}) => {
  const navigation :any = useNavigation();
  const { colors } = useTheme() as Theme;

  // Animation values
  const scale = useSharedValue(1);

  // Animated style for the card container
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Handle press in animation
  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 150 });
  };

  // Handle press out animation
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };

  // Handle navigation
  const handleViewPress = () => {
    navigation.navigate('screens/home/MasjidDetails', { _id, name, images, address, distance });
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.cardContainer, animatedCardStyle, {backgroundColor: colors.CARD}]}>
        <Image 
          source={{ uri: images[0] }}
          style={styles.image}
        />
        <View style={styles.masjidInfo}>
          <View style={styles.nameContainer}>
            <Text style={[{color: colors.TEXT}]}>{name.substring(0, 15)}</Text>
            { distance === null || distance === undefined ? null : 
            <Text style={[{color: colors.TINT, fontSize: 13}]}>[{getDisplayDistance(distance)}]</Text>}
          </View>
          <Text style={[{color: colors.DISABLED_TEXT}]} numberOfLines={2} ellipsizeMode='tail'>{address}</Text>
          <View style={styles.viewButtonContainer}>
            <TouchableOpacity style={[styles.viewButton, {backgroundColor: colors.BUTTON_BG}]} onPress={handleViewPress} >
              <Text style={{color: colors.BUTTON_TEXT}}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 8,
    width:'48%',
    minWidth:140,
    paddingBottom: 7
  },
  image: {
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  masjidInfo: {
    padding: 10,
  },
  chipContainer: {
  // Use a subtle background color from your theme
  // backgroundColor: colors.INPUT_BG, // This is set inline to use the 'colors' prop
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,       // This creates the "pill" or "chip" shape
    alignSelf: 'flex-start', // Stops the chip from stretching to fill the container
  },
  chipText: {
    // Use your theme's accent color
    // color: colors.TINT, // This is set inline to use the 'colors' prop
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  viewButtonContainer: {
    // alignItems: 'center',
    marginTop: 10
  },
  viewButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },

});