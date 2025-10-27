import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface UserProfile {
    userId: string;
    profileId: string;
    name: string;
    mobile: string;
    email: string;
    avatar: string;
    role: string;
}

interface UserProfileStore {
    profile: UserProfile | null;
    setProfile: (profile: UserProfile) => void;
    clearProfile: () => void;
    restoreProfile: () => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
    profile: null,
    
    // ✅ set and persist profile
    setProfile: async (profile) => {
        await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
        set({ profile });
    },

    // ✅ clear both state and AsyncStorage
    clearProfile: async () => {
        await AsyncStorage.removeItem("userProfile");
        set({ profile: null });
    },

    // ✅ restore from AsyncStorage on app start
    restoreProfile: async () => {
        const saved = await AsyncStorage.getItem("userProfile");
        if (saved) {
            set({ profile: JSON.parse(saved) });
        }
    },
}));