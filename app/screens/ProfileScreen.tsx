import { useLogoutMutation } from '@/apis/auth/useLogout';
import { useUpdateProfileMutation } from '@/apis/profile/useUploadAvatar';
import { roles } from '@/constants/roles';
import { useAppTheme } from '@/constants/ThemeContext';
import { Theme } from '@/constants/types';
import { showMessage } from '@/utils/functions';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MasjidIcon, { default as FontAwesome7 } from '@expo/vector-icons/FontAwesome6';
import { default as DashboardIcon } from '@expo/vector-icons/MaterialIcons';
import { useNavigation, useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserProfileStore } from '../../stores/userProfileStore';

const ProfileScreen = () => {
  const { profile, restoreProfile, setProfile } = useUserProfileStore();
  const { theme, toggleTheme } = useAppTheme();
  const { colors } = useTheme() as Theme;
  

  // local states
  const [pickedImage, setPickedImage] = useState<string | null>(null); // preview only until update
  const [editedName, setEditedName] = useState<string>('');
  const [editingName, setEditingName] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isUploadingPreview, setIsUploadingPreview] = useState<boolean>(false); // for camera overlay while uploading

  const changeNameInputRef :any= useRef(null);

  const navigation: any = useNavigation();
  // mutation hook (assumes this returns a react-query mutation that accepts FormData)
  const { mutateAsync: updateProfileMutation } = useUpdateProfileMutation(profile?.profileId);

  useEffect(() => {
    restoreProfile();
  }, [restoreProfile]);

  // keep editedName synced when profile loads/changes
  useEffect(() => {
    setEditedName(profile?.name ?? '');
  }, [profile?.name]);

  const { mutateAsync: logout, isPending: logoutLoader } = useLogoutMutation();

  // pick image and only preview (do not auto upload)
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setPickedImage(uri);
      }
    } catch (err) {
      console.error('Image pick error', err);
      showMessage('Could not open image picker');
    }
  };


  // unified update function: sends name + avatar (if changed)
  const handleUpdateProfile = async () => {
    // guard: need profileId for backend route
    if (!profile?.profileId) {
      showMessage('Profile ID missing. Cannot update.');
      return;
    }

    // nothing to update
    const nameChanged = editedName && editedName !== (profile?.name ?? '');
    const avatarChanged = !!pickedImage;
    if (!nameChanged && !avatarChanged) {
      showMessage('No changes to update.');
      return;
    }

    const formData = new FormData();

    if (nameChanged) {
      formData.append('name', String(editedName));
    }

    if (avatarChanged) {
      // expo-image-picker returns uri like file:///...
      formData.append('avatar', {
        uri: pickedImage,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);
    }

    try {
      setIsUpdating(true);
      // call your mutation
      const response = await updateProfileMutation(formData);

      // response may be the updated profile object or some payload.
      // if backend returns the updated profile, use that, otherwise merge local changes.
      let updatedProfile = { ...(profile ?? {}) } as any;
      if (response && typeof response === 'object') {
        // try to use returned fields if available
        if (response.profileId || response.userId || response.name) {
          // assume whole profile object returned
          updatedProfile = { ...updatedProfile, ...response };
        } else {
          // otherwise, apply local changes
          if (nameChanged) updatedProfile.name = editedName;
          if (avatarChanged) updatedProfile.avatar = pickedImage;
        }
      } else {
        if (nameChanged) updatedProfile.name = editedName;
        if (avatarChanged) updatedProfile.avatar = pickedImage;
      }

      await setProfile(updatedProfile);
      showMessage('Profile updated successfully!');
      // reset preview states
      setPickedImage(null);
      setEditingName(false);
    } catch (err) {
      showMessage('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showMessage('Logged Out Successfully!');
    } catch (error) {
      showMessage('Please try again later.');
    }
  };

  const handleMyDonations = () => {
    // navigation.navigate('screens/donations/MyDonations'); // adjust route name if needed
  };

  const handleMyOrders = () => {
    // navigation.navigate('screens/orders/MyOrders'); // adjust route name if needed
  };

  const handleMyAddresses = () => {
    // navigation.navigate('screens/addresses/MyAddresses'); // adjust route name if needed
  };

  const handleMyWishlists = () => {
    // navigation.navigate('screens/wishlist/MyWishlist'); // adjust route name if needed
  };

  const handleMasjidPanelNavigation = () => {
    navigation.navigate('screens/masjid-panel/MasjidPanelScreen');
  };

  const handleAdminPanelNavigation = () => {
    navigation.navigate('screens/admin-panel/AdminPanelScreen');
  };

  // Compute if anything changed (show Update Profile button)
  const nameChanged = Boolean(editedName && editedName !== (profile?.name ?? ''));
  const avatarChanged = Boolean(pickedImage);
  const hasChanges = nameChanged || avatarChanged;


  useEffect(() => {
  if (editingName && changeNameInputRef.current) {
    setTimeout(() => {
      changeNameInputRef.current?.focus();
    }, 100); // small delay helps on Android
  }
}, [editingName]);

 const handleAddMasjid = () => {
  
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
        <TouchableOpacity onPress={handlePickImage} disabled={isUploadingPreview} style={styles.avatarContainer}>
          {pickedImage || profile?.avatar ? (
            <Image source={{ uri: pickedImage || String(profile?.avatar || '') }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.DISABLED_TEXT, justifyContent: 'center', alignItems: 'center' }]}>
              <FontAwesome7 name="circle-user" size={80} color="#fff" />
            </View>
          )}

          {/* Camera Icon Overlay */}
          <View style={[styles.cameraIconContainer, { backgroundColor: colors.ICON }]}>
            {isUploadingPreview ? <ActivityIndicator size="small" color="#fff" /> : <FontAwesome5 name="camera" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* Name row with edit */}
        <View style={styles.nameRow}>
          {editingName ? (
            <TextInput
              style={{ ...styles.nameInput, color: colors.TEXT }}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Your Name"
              placeholderTextColor={colors.DISABLED_TEXT}
              ref={changeNameInputRef}
            />
          ) : (
            <Text style={{ ...styles.info, color: colors.DISABLED_TEXT }}>{String(editedName ? editedName : profile?.name ? profile.name : 'Your Name')}</Text>
          )}

          {!editingName ?
            <TouchableOpacity onPress={() => setEditingName(true)} style={styles.editIconBtn}>
              <FontAwesome5 name="edit" size={16} color={colors.ICON} />
            </TouchableOpacity>
            : 
            <TouchableOpacity onPress={() => setEditingName(false)} style={styles.editIconBtn}>
              <FontAwesome5 name="check" size={16} color={colors.TINT} />
            </TouchableOpacity>
          }
        </View>

        <Text style={{ ...styles.info, color: colors.DISABLED_TEXT }}>{String(profile?.mobile ?? '')}</Text>
      </View>

      {/* SMALL UPDATE BUTTON (only shown when something changed) */}
      {hasChanges ? (
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProfile} disabled={isUpdating}>
          {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateText}>Update Profile</Text>}
        </TouchableOpacity>
      ) : null}

      {hasChanges && (
  <TouchableOpacity
    style={styles.cancelButton}
    onPress={() => {
      setPickedImage(null);
      setEditedName(profile?.name ?? "");
      setEditingName(false);
    }}
  >
    <Text style={styles.cancelText}>Cancel</Text>
  </TouchableOpacity>
)}

      {/* Option List */}
      <View style={styles.optionContainer}>

        {/* <TouchableOpacity style={styles.optionRow} onPress={handleMyDonations}>
          <View style={styles.iconTextContainer}>
            <MaterialIcons name="attach-money" size={24} color={colors.ICON} style={styles.icon} />
            <Text style={{ ...styles.optionText, color: colors.TEXT }}>My Donations</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.optionRow} onPress={handleMyOrders}>
          <View style={styles.iconTextContainer}>
            <FontAwesome6 name="rectangle-list" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{ ...styles.optionText, color: colors.TEXT }}>My Orders</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity> */}

        {/* <TouchableOpacity style={styles.optionRow} onPress={handleMyAddresses}>
          <View style={styles.iconTextContainer}>
            <Entypo name="location" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{ ...styles.optionText, color: colors.TEXT }}>My Addresses</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity> */}

        <TouchableOpacity style={styles.optionRow} onPress={handleMyWishlists}>
          <View style={styles.iconTextContainer}>
            <FontAwesome name="heart" size={20} color={colors.ICON} style={styles.icon} />
            <Text style={{ ...styles.optionText, color: colors.TEXT }}>My Favorites</Text>
          </View>
          <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
        </TouchableOpacity>

        {profile && String(profile.role || '').split(',').includes(roles.MASJID_SECRETARY) === false ? (
          <TouchableOpacity style={styles.optionRow} onPress={handleAddMasjid}>
            <View style={styles.iconTextContainer}>
              <MasjidIcon name="mosque" size={20} color={colors.ICON} style={styles.icon} />
              <Text style={{ ...styles.optionText, color: colors.TEXT }}>Add a Masjid</Text>
            </View>
            <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
          </TouchableOpacity>
        ) : null}

        {profile && String(profile.role || '').split(',').includes(roles.MASJID_SECRETARY) ? (
          <TouchableOpacity style={styles.optionRow} onPress={handleMasjidPanelNavigation}>
            <View style={styles.iconTextContainer}>
              <MasjidIcon name="mosque" size={20} color={colors.ICON} style={styles.icon} />
              <Text style={{ ...styles.optionText, color: colors.TEXT }}>Masjid Panel</Text>
            </View>
            <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
          </TouchableOpacity>
        ) : null}

        {profile && String(profile.role || '').split(',').includes(roles.ADMIN) ? (
          <TouchableOpacity style={styles.optionRow} onPress={handleAdminPanelNavigation}>
            <View style={styles.iconTextContainer}>
              <DashboardIcon name="dashboard" size={24} color={colors.ICON} style={styles.icon} />
              <Text style={{ ...styles.optionText, color: colors.TEXT }}>Admin Panel</Text>
            </View>
            <Feather name="chevron-right" size={24} color={colors.DISABLED_TEXT} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Logout Button at Bottom Center */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          {logoutLoader ? <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} /> : <Text style={styles.logoutText}>Logout</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
  },
  profileCard: {
    alignItems: 'center',
    marginTop: 10,
  },
  toggleButton: {
    position: 'absolute',
    top: 25,
    right: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  cancelButton: {
  alignSelf: 'center',
  marginTop: 10,
  paddingVertical: 8,
  paddingHorizontal: 22,
  borderRadius: 20,
  backgroundColor: '#999',
},
cancelText: {
  color: '#fff',
  fontWeight: '600',
},
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    borderBottomWidth: 1,
    width: 180,
    fontSize: 18,
    padding: 3,
    marginRight: 8,
  },
  info: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 5,
  },
  editIconBtn: {
    marginLeft: 8,
    padding: 6,
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
    color: '#fff',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    width: 35,
  },

  updateButton: {
    alignSelf: 'center',
    marginTop: 8,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 22,
  },
  updateText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ProfileScreen;


// Updated ProfileScreen with editable avatar + editable name + Update button
// NOTE: Replace API hooks and store logic as per your project.

// import { useLogoutMutation } from '@/apis/auth/useLogout';
// import { useUpdateProfileMutation } from '@/apis/profile/useUploadAvatar';
// import { useAppTheme } from '@/constants/ThemeContext';
// import { Theme } from '@/constants/types';
// import { showMessage } from '@/utils/functions';
// import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
// import { default as FontAwesome7 } from '@expo/vector-icons/FontAwesome6';
// import { useNavigation, useTheme } from '@react-navigation/native';
// import * as ImagePicker from 'expo-image-picker';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, Image, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useUserProfileStore } from '../../stores/userProfileStore';

// const ProfileScreen = () => {
//   const { profile, restoreProfile, setProfile } = useUserProfileStore();
//   const { theme, toggleTheme } = useAppTheme();
//   const { colors } = useTheme() as Theme;
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [editedName, setEditedName] = useState("");
//   const [editingName, setEditingName] = useState(false);
//   const [updatingProfile, setUpdatingProfile] = useState(false);

//   const navigation: any = useNavigation();
//   const { mutateAsync: uploadAvatar } = useUpdateProfileMutation(profile?.profileId);

//   useEffect(() => {
//     restoreProfile();
//     setEditedName(profile?.name || "");
//   }, [restoreProfile]);

//   const { mutateAsync: logout, isPending: logoutLoader } = useLogoutMutation();

//   const handlePickImage = async () => {
//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [1, 1],
//       quality: 0.8,
//     });

//     if (!result.canceled) {
//       const uri = result.assets[0].uri;
//       setSelectedImage(uri);
//     }
//   };

//   const handleUpdateProfile = async () => {
//     try {
//       setUpdatingProfile(true);

//       const formData = new FormData();

//       // Append avatar only if changed
//       if (selectedImage) {
//         formData.append('avatar', {
//           uri: selectedImage,
//           name: 'avatar.jpg',
//           type: 'image/jpeg',
//         } as any);
//       }

//       // Append name only if edited
//       if (editedName && editedName !== profile?.name) {
//         formData.append('name', editedName);
//       }

//       const response = await uploadAvatar(formData);

//       if (response && profile) {
//         const updatedProfile = { ...profile };
//         if (selectedImage) updatedProfile.avatar = selectedImage;
//         if (editedName) updatedProfile.name = editedName;

//         await setProfile(updatedProfile);
//         showMessage('Profile updated successfully!');
//       }
//     } catch (error) {
//       console.error(error);
//       showMessage('Update failed. Try again.');
//     } finally {
//       setUpdatingProfile(false);
//       setEditingName(false);
//       setSelectedImage(null);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await logout();
//       showMessage("Logged Out Successfully!");
//     } catch (error) {
//       showMessage("Please try again later.");
//     }
//   };

//   console.log(selectedImage, 'profile')

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.toggleButton}>
//         <Switch
//           trackColor={{ false: '#767577', true: '#81b0ff' }}
//           thumbColor={theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
//           onValueChange={toggleTheme}
//           value={theme === 'dark'}
//         />
//       </View>

//       {/* PROFILE HEADER */}
//       {profile && <View style={styles.profileHeader}>

//         {/* LEFT → AVATAR */}
//         <TouchableOpacity onPress={handlePickImage} style={styles.avatarWrapper}>
//           {selectedImage || profile?.avatar ? (
//             <Image source={{ uri: selectedImage || profile?.avatar }} style={styles.avatar} />
//           ) : (
//             <View style={[styles.avatar, { backgroundColor: colors.DISABLED_TEXT, justifyContent: 'center', alignItems: 'center' }]}>                <FontAwesome7 name="circle-user" size={60} color="#fff" />
//             </View>
//           )}

//           <View style={[styles.cameraIconContainer, { backgroundColor: colors.ICON }]}>            
//             <FontAwesome5 name="camera" size={14} color="#fff" />
//           </View>
//         </TouchableOpacity>

//         {/* RIGHT → NAME + USERNAME + ROLE */}
//         <View style={styles.infoColumn}>

//           {/* NAME ROW */}
//           <View style={styles.itemRow}>
//             {editingName ? (
//               <TextInput
//                 style={[styles.editInput, { color: colors.TEXT }]}
//                 value={editedName}
//                 onChangeText={setEditedName}
//               />
//             ) : (
//               profile && profile.name ? 
//               <Text style={[styles.infoText, { color: colors.TEXT }]}>{profile?.name}</Text> :
//               <Text style={[styles.infoText, { color: colors.TEXT_SECONDARY }]}>Your Name</Text>
//             )}

//             <TouchableOpacity onPress={() => setEditingName(!editingName)}>
//               <FontAwesome5 name="edit" size={16} color={colors.ICON} />
//             </TouchableOpacity>
//           </View>

//           {/* USERNAME */}
//           <Text style={[styles.infoSubText, { color: colors.DISABLED_TEXT }]}>{profile?.mobile}</Text>

//           {/* ROLE */}
//           <Text style={[styles.infoSubText, { color: colors.DISABLED_TEXT }]}>{profile?.role}</Text>
//         </View>
//       </View>}

//       {/* SMALL UPDATE BUTTON */}
//       {(selectedImage || editedName !== profile?.name) && (
//         <TouchableOpacity style={styles.smallUpdateBtn} onPress={handleUpdateProfile} disabled={updatingProfile}>          
//         {updatingProfile ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.smallUpdateText}>Update</Text>
//           )}
//         </TouchableOpacity>
//       )}

//       <View style={styles.logoutContainer}>
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>          
//           {logoutLoader ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <Text style={styles.logoutText}>Logout</Text>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, marginTop: 20 },
//   toggleButton: { position: 'absolute', top: 25, right: 20 },

//   /* NEW HEADER LAYOUT */
//   profileHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 20,
//     marginBottom: 15,
//   },
//   avatarWrapper: { position: 'relative' },
//   avatar: { width: 90, height: 90, borderRadius: 45 },
//   cameraIconContainer: {
//     position: 'absolute', bottom: 0, right: 0,
//     width: 32, height: 32, borderRadius: 16,
//     justifyContent: 'center', alignItems: 'center',
//     borderWidth: 2, borderColor: '#fff',
//   },

//   infoColumn: { flex: 1, justifyContent: 'center' },
//   itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   editInput: { borderBottomWidth: 1, fontSize: 18, paddingVertical: 2, width: 180 },

//   infoText: { fontSize: 20, fontWeight: '600' },
//   infoSubText: { fontSize: 14, marginTop: 2 },

//   smallUpdateBtn: {
//     alignSelf: 'flex-end', backgroundColor: '#007bff', paddingVertical: 6, paddingHorizontal: 14,
//     borderRadius: 20, marginBottom: 10,
//   },
//   smallUpdateText: { fontSize: 12, color: '#fff', fontWeight: '600' },

//   logoutContainer: { alignItems: 'center', marginTop: 40 },
//   logoutButton: { backgroundColor: 'red', paddingVertical: 15, paddingHorizontal: 80, borderRadius: 30 },
//   logoutText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
// });

// export default ProfileScreen
