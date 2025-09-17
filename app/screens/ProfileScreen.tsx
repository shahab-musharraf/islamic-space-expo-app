import { useLogoutMutation } from '@/apis/auth/useLogout';
import { showMessage } from '@/utils/functions';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const user = {
    name: 'Ahmed Khan',
    phone: '+91 98765 43210',
    avatar: 'https://i.pravatar.cc/150?img=12',
  }

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

  


  return (
    <SafeAreaView style={styles.container}>
      
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.info}>{user.name}</Text>
        <Text style={styles.info}>{user.phone}</Text>
      </View>

      {/* Option List */}
      <View style={styles.optionContainer}>
        <TouchableOpacity style={styles.optionRow} onPress={handleUpdateProfile}>
          <View style={styles.iconTextContainer}>
            <FontAwesome5 name="user-edit" size={20} color="blue" style={styles.icon} />
            <Text style={styles.optionText}>Update Profile</Text>
          </View>
          <Feather name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyDonations}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="attach-money" size={24} color="blue" style={styles.icon} />
            <Text style={styles.optionText}>My Donations</Text>
          </View>
          <Feather name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyOrders}>
          <View style={styles.iconTextContainer}>
            <FontAwesome6 name="rectangle-list" size={20} color="blue" style={styles.icon} />
            <Text style={styles.optionText}>My Orders</Text>
          </View>
          <Feather name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyAddresses}>
          <View style={styles.iconTextContainer}>
            <Entypo name="location" size={20} color="blue" style={styles.icon} />
            <Text style={styles.optionText}>My Addresses</Text>
          </View>
          <Feather name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={handleMyWishlists}>
            {/* masjid and products tab */}
          <View style={styles.iconTextContainer}>
            <FontAwesome name="heart" size={20} color="red" style={styles.icon} />
            <Text style={styles.optionText}>My Wishlists</Text> 
          </View>
          <Feather name="chevron-right" size={24} color="black" />
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
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'space-between',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    paddingBlock: 30,
    elevation: 3,
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  info: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  optionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
