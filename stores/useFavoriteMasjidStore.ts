import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FavoriteStore = {
  favorites: string[];
  following: string | null;
  hydrated: boolean;

  /* ---------- setters ---------- */
  setFavorite: (data: {
    favorites: string[];
    following: string | null;
  }) => void;

  /* ---------- helpers ---------- */
  isFavorite: (masjidId: string) => boolean;
  isFollowing: (masjidId: string) => boolean;

  /* ---------- reset ---------- */
  reset: () => void;
};

export const useFavoriteMasjidStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      /* ---------- initial state ---------- */
      favorites: [],
      following: null,
      hydrated: false,

      /* ---------- setters ---------- */
      setFavorite: ({ favorites, following }) =>
        set({
          favorites,
          following,
          hydrated: true,
        }),

      /* ---------- helpers ---------- */
      isFavorite: (masjidId) =>
        get().favorites.includes(masjidId),

      isFollowing: (masjidId) =>
        get().following === masjidId,

      /* ---------- logout / cleanup ---------- */
      reset: () =>
        set({
          favorites: [],
          following: null,
          hydrated: false,
        }),
    }),
    {
      name: 'favorite-masjid-store', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
