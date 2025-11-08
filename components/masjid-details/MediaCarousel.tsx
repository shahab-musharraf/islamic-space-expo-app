import { Theme } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  View,
  ViewToken
} from 'react-native';
// To display videos, you'll need to install this package:
// npx expo install react-native-video
// import { Video } from 'expo-av';
import { useVideoPlayer, VideoView } from 'expo-video';

// --- Get the screen width for the carousel items ---
const { width: screenWidth } = Dimensions.get('window');

// --- Define the props interface ---
interface MediaCarouselProps {
  images?: string[];
  videoUrl: string;
}

// --- Define the structure for our combined media items ---
interface MediaItem {
  type: 'image' | 'video';
  uri: string;
}

// --- Your Component ---
const MediaCarousel: React.FC<MediaCarouselProps> = ({
  images = [
    'https://res.cloudinary.com/dzbahh8ya/image/upload/v1761329057/masjids/u1xnf4dodvpeethryrze.jpg',
    'https://res.cloudinary.com/dzbahh8ya/image/upload/v1761329057/masjids/u1xnf4dodvpeethryrze.jpg',
  ],
  videoUrl = 'http://d23dyx6ukb2s6e.cloudfront.net/v/YmJ29sDqf_E.mp4'
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const { colors } = useTheme() as Theme;

  const player = useVideoPlayer(videoUrl, player => {
    player.pause();
  });

  // const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });   // import useEvent from 'expo'


  // Combine images and videos into a single array
  useEffect(() => {
    const imageItems: MediaItem[] = images.map((url) => ({
      type: 'image',
      uri: url,
    }));
    const videoItems: MediaItem = {
      type: 'video',
      uri: videoUrl,
    }
    setMedia([...imageItems, videoItems]);
  }, []);

  // This config helps FlatList determine which item is currently "viewable"
  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 50, // Item must be 50% visible
  };

  // This callback updates the activeIndex state when the viewable item changes
  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: Array<ViewToken>;
  }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  };

  // We use a ref for the viewability config to prevent re-renders
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  // Renders each slide (Image or Video)
  const renderItem = ({ item }: { item: MediaItem }) => {
    if (item.type === 'image') {
      return (
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.uri }}
            style={styles.media}
            resizeMode="cover"
          />
        </View>
      );
    }

    if (item.type === 'video') {
      return (
          <View style={styles.itemContainer}>
            <VideoView style={styles.media} player={player}  />
            {/* <View style={styles.controlsContainer}> */}
              {/* <Button
                title={isPlaying ? 'Pause' : 'Play'}
                onPress={() => {
                  if (isPlaying) {
                    player.pause();
                  } else {
                    player.play();
                  }
                }}
              /> */}
            {/* </View> */}
          </View>
      );
    }
    return null;
  };

  // Renders a single pagination dot
  const renderDot = (index: number) => (
    <View
      key={index}
      style={[styles.dot, {backgroundColor: index === activeIndex ? colors.TINT : colors.DISABLED_TEXT}]}
    />
  );

  return (
    <View style={styles.container}>
      {media.length > 0 && (
        <>
          <FlatList
            data={media}
            renderItem={renderItem}
            keyExtractor={(_, index) => index.toString()}
            horizontal // Makes the list horizontal
            pagingEnabled // Snaps to each item
            showsHorizontalScrollIndicator={false} // Hides the scrollbar
            viewabilityConfigCallbackPairs={
              viewabilityConfigCallbackPairs.current
            }
            // Optimization: tells FlatList the size of each item
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />
          {/* Pagination Dots Container */}
          <View style={styles.paginationContainer}>
            {media.map((_, index) => renderDot(index))}
          </View>
        </>
      )}
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    height: '100%',
    // We set width here to ensure container doesn't exceed screen
    width: screenWidth,

  },
  itemContainer: {
    width: screenWidth, // Each item takes the full screen width
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  media: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15
  },
  // --- Pagination Styles ---
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute', // Position over the FlatList
    bottom: 10, // 10 pixels from the bottom
    alignSelf: 'center', // Center horizontally
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FFF', // Active dot color
  },
   controlsContainer: {
    padding: 10,
  },
});

export default MediaCarousel;

