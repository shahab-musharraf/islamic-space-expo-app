import { useLogoutMutation } from '@/apis/auth/useLogout';
import { useAppTheme } from '@/constants/ThemeContext';
import { Theme } from '@/constants/types';
import { showMessage } from '@/utils/functions';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MasjidIcon, { default as FontAwesome6, default as FontAwesome7 } from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useTheme } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserProfileStore } from '../../stores/userProfileStore';

const ProfileScreen = () => {
  const { profile, restoreProfile } = useUserProfileStore();
  const { theme, toggleTheme } = useAppTheme();
  const { colors } = useTheme() as Theme;

  const navigation :any= useNavigation();

  useEffect(() => {
    restoreProfile();
  }, [restoreProfile]);

  // const handleUpdateProfile = async (formData) => {
  //   try {
  //     const response = await fetch("http://localhost:8080/api/profile/123", {
  //       method: "PUT",
  //       headers: {
  //         "Authorization": "Bearer YOUR_ACCESS_TOKEN", // Replace
  //       },
  //       body: formData,
  //     });

  //     const data = await response.json();
  //     console.log("Updated Profile:", data);
  //   } catch (err) {
  //     console.error("Update failed:", err);
  //   }
  // };
  const {mutateAsync: logout, isPending: logoutLoader} = useLogoutMutation();

  const handleUpdateProfile = () => Alert.alert('Navigate', 'Go to Update Profile Screen')
  const handleMyDonations = () => Alert.alert('Navigate', 'Go to My Donations Screen')
  const handleMyOrders = () => Alert.alert('Navigate', 'Go to My Orders Screen')
  const handleLogout = async () => {
    try {
      await logout();
      showMessage("Logged Out Successfully!")
    } catch (error) {
      showMessage("Please try again later.")
    }
  }
  const handleMyAddresses = () => {}
  const handleMyWishlists = () => {}
  const handleMasjidPanel = () => {
    navigation.navigate('screens/masjid-panel/MasjidPanelScreen');
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toggleButton}>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      </View>
      
      {/* Profile Card */}
      <View style={styles.profileCard}>
        {
          profile?.avatar ? 
          <Image
            source={{ uri: profile?.avatar }}
            style={styles.avatar} 
          /> :
          <FontAwesome7 name="circle-user" size={80} color={colors.ICON} />
        }
        <Text style={{...styles.info, color: colors.DISABLED_TEXT}}>{profile?.name || "Your Name"}</Text>
        <Text style={{...styles.info, color: colors.DISABLED_TEXT}}>{profile?.mobile}</Text>

        
      </View>

      {/* Option List */}
      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.optionRow} onPress={handleUpdateProfile}>
          <View style={styles.iconTextContainer}>
            <FontAwesome5 name="user-edit" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{...styles.optionText, color: colors.TEXT}}>Update Profile</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyDonations}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="attach-money" size={24} color={colors.ICON} style={styles.icon} />
            <Text style={{...styles.optionText, color: colors.TEXT}}>My Donations</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyOrders}>
          <View style={styles.iconTextContainer}>
            <FontAwesome6 name="rectangle-list" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{...styles.optionText, color: colors.TEXT}}>My Orders</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyAddresses}>
          <View style={styles.iconTextContainer}>
            <Entypo name="location" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{...styles.optionText, color: colors.TEXT}}>My Addresses</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyWishlists}>
            {/* masjid and products tab */}
          <View style={styles.iconTextContainer}>
            <FontAwesome name="heart" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{...styles.optionText, color: colors.TEXT}}>My Wishlists</Text> 
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMasjidPanel}>
            {/* masjid and products tab */}
          <View style={styles.iconTextContainer}>
            <MasjidIcon name="mosque" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{...styles.optionText, color: colors.TEXT}}>Masjid Panel</Text> 
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>
      </View>

      {/* Logout Button at Bottom Center */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {
            logoutLoader ? 
            <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} /> :
            <Text style={styles.logoutText}>Logout</Text>
          }
          
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
  },
  profileCard: {
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    top: 25,
    right: 20
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 5,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
  },
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    width: 35
  }
})

export default ProfileScreen
