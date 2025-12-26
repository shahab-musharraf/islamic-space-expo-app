import { useGetAllFavoriteDetails } from '@/apis/favoriteMosque/useGetAllFavoriteDetails';
import { MasjidCard } from '@/components/custom/MasjidCard';
import { Theme } from '@/constants/types';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FavoriteMasjidsScreen = () => {
  const { colors } = useTheme() as Theme;
  const { data, isLoading, isError, error } = useGetAllFavoriteDetails();

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.TINT} />
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: 'red' }]}>
            {error?.message || 'Failed to load favorite masjids. Please try again.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // No favorites state
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.noDataText, { color: colors.TEXT_SECONDARY }]}>
            No favorite masjids found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render favorite masjids
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.BACKGROUND }]}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <MasjidCard
                {...item}
                latitude={item.latitude}
                longitude={item.longitude}
                isUnderConstruction={item.isUnderConstruction}
                />
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingBottom: 32,
  },
  cardContainer: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default FavoriteMasjidsScreen;