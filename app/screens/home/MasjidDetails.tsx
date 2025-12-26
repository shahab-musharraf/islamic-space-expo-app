import donationRequest from '@/apis/_helpers/donationRequest';
import { useAddMasjidToFavoriteMutation } from '@/apis/favoriteMosque/useAddMasjidToFavoriteMutation';
import { useRemoveMasjidFromFavoriteMutation } from '@/apis/favoriteMosque/useRemoveMasjidFromFavoriteMutation';
import { useToggleFollowMajisMutation } from '@/apis/favoriteMosque/useToggleFollowMajisMutation';
import { useGetMasjidDetailsByMasjidId } from '@/apis/masjid/useGetMasjidDetailsByMasjidId';
import MediaCarousel from '@/components/masjid-details/MediaCarousel';
import { Theme } from '@/constants/types';
import { useFavoriteMasjidStore } from '@/stores/useFavoriteMasjidStore';
import StarOutlineIcon from '@expo/vector-icons/Feather';
import StarFilledIcon from '@expo/vector-icons/FontAwesome';
import FollowingIcons from '@expo/vector-icons/Ionicons';
import { useRoute, useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import MasjidInfo from '../../../components/masjid-details/MasjidInfo';
import Notifiations from '../../../components/masjid-details/Notifiations';
import PrayerInfo from '../../../components/masjid-details/PrayerInfo';

const Colors = {
  PRIMARY: '#4CAF50',
  DANGER: '#F44336',
  WARNING: '#FF9800',
  TEXT: '#333333',
  SUBTEXT: '#666666',
  CARD_BG: '#FFFFFF',
  SHADOW_COLOR: '#000000',
  INFO: '#1E88E5',
  MUTED: '#F2F4F7',
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MasjidDetails = () => {
    const route :any = useRoute();
    const { hydrated, isFavorite, isFollowing, setFavorite, favorites, following, reset } = useFavoriteMasjidStore();
    const { mutate: addMasjidToFavorite, isPending: addMasjidToFavoriteLoading } = useAddMasjidToFavoriteMutation();
    const { mutate: removeMasjidFromFavorite, isPending: removeMasjidFromFavoriteLoading } = useRemoveMasjidFromFavoriteMutation();
    const { mutate: toggleFollow, isPending: toggleFollowLoading } = useToggleFollowMajisMutation()
    const { colors } = useTheme() as Theme;
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    // Access the params passed during navigation
  const { _id, name, address,  } = route.params;

  const { data, isLoading, isError, isRefetching } = useGetMasjidDetailsByMasjidId(_id);

  const handleDirectionsPress = () => {
    if (data?.latitude && data?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${data.latitude},${data.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleDonatePress = async () => {
    if (isPaymentLoading) return;
    setIsPaymentLoading(true);

    try {
      // --- STEP 1: Create the Order ---
      // Call your NestJS backend to create a Razorpay order
      console.log('Creating donation order...');
      const { data: orderResponse } = await donationRequest.post('/donation/create-order', {
        amount: 10000,
        currency: 'INR',
        masjidId: _id,
      });

      // The backend returns { key, orderId, amount, currency }
      
      // --- STEP 2: Configure Razorpay Checkout ---
      const options = {
        description: 'Donation to Masjid',
        image: 'https://i.imgur.com/3g7nmJC.png', // Your app's logo
        currency: orderResponse.currency,
        key: orderResponse.key, // Your public Razorpay Key
        amount: orderResponse.amount, // Amount in paise (from backend)
        order_id: orderResponse.orderId, // The crucial order_id
        name: 'Islamic Space', // Your App Name
        prefill: {
          email: 'testuser@example.com', // Get this from your user's profile
          contact: '9876543210',        // Get this from your user's profile
          name: 'Test User',
        },
        theme: { color: '#007AFF' }, // Your app's theme color
      };

      // --- STEP 3: Open the Razorpay Modal ---
      RazorpayCheckout.open(options)
        .then(async (successData) => {
          // --- STEP 4: Payment is Successful, Now VERIFY ---
          // successData = { razorpay_payment_id, razorpay_order_id, razorpay_signature }
          console.log('Payment successful. Verifying with server...');
          
          try {
            await donationRequest.post('/donation/verify', {
              razorpay_order_id: successData.razorpay_order_id,
              razorpay_payment_id: successData.razorpay_payment_id,
              razorpay_signature: successData.razorpay_signature,
            });

            // --- STEP 5: All Done! ---
            console.log('Verification successful!');
            alert('Thank you for your donation!');
            // onDonationSuccess(); // Call the success callback

          } catch (verifyError) {
            console.error('Payment Verification Failed:', verifyError);
            alert('Your payment was successful but verification failed. Please contact support.');
          } finally {
            setIsPaymentLoading(false);
          }
        })
        .catch((errorData) => {
          // --- Handle Payment Failure/Cancellation ---
          console.log('Razorpay payment failed:', errorData);
          if (errorData.code !== 0) { // 0 is 'Payment Cancelled by User'
             alert(`Error: ${errorData.description}`);
          }
          setIsPaymentLoading(false);
        });

    } catch (orderError) {
      // --- Handle Order Creation Failure ---
      console.error('Failed to create order:', orderError);
      alert('Could not initiate donation. Please try again later.');
      setIsPaymentLoading(false);
    }
  };

  

  // const handleAddToFavorite = () => {
  //   if(!_id) return;
    
  //   try {
  //     addMasjidToFavorite(_id, {
  //       onSuccess: (data) => {
  //         if(!data.success) return;
  //         console.log(data, 'added masjid to favorite response')
  //         setFavorite({following: data.following ? data.masjidId : following, favorites: [...favorites, data.masjidId]})
  //         Alert.alert("This masjid has been added to you favorite")
  //       }
  //     });
  //   } catch (error) {
      
  //   }
  //   console.log('add to favorite', _id);
  // }

  const handleAddToFavorite = () => {
  if (!_id) return;

  Alert.alert(
    "Add to Favorites",
    "Are you sure you want to add this masjid to your favorites?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          addMasjidToFavorite(_id, {
            onSuccess: (data) => {
              if (!data.success) return;
              setFavorite({
                following: data.following ? data.masjidId : following,
                favorites: [...favorites, data.masjidId],
              });
              Alert.alert("Added to favorites");
            },
          });
        },
      },
    ]
  );
};

  const handleRemoveFromFavorite = () => {
  if (!_id) return;

  Alert.alert(
    "Remove Favorite",
    "Do you really want to remove this masjid from your favorites?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeMasjidFromFavorite(_id, {
            onSuccess: (data) => {
              if (!data.success) return;
              setFavorite({
                following: data.following ? null : following,
                favorites: favorites.filter(id => id !== data.masjidId),
              });
              Alert.alert("Removed from favorites");
            },
          });
        },
      },
    ]
  );
};

  const handleToggleFollow = () => {
  const follow = isFollowing(_id);

  Alert.alert(
    follow ? "Unfollow Masjid" : "Follow Masjid",
    follow
      ? "Are you sure you want to unfollow this masjid?"
      : "Do you want to follow this masjid?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: follow ? "Unfollow" : "Follow",
        onPress: () => {
          toggleFollow(
            { follow: !follow, masjidId: _id },
            {
              onSuccess: (data) => {
                if (!data || !data.success) return;
                setFavorite({
                  favorites,
                  following: data.following ? data.masjidId : null,
                });
              },
            }
          );
        },
      },
    ]
  );
};




  if (isLoading || isRefetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.INFO} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.DANGER }}>Error loading data. Please try again.</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.SUBTEXT }}>No Masjids awaiting review.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* {images && images.length > 0 && (
        <Image source={{ uri: images[0] }} style={styles.image} />
      )} */}
      <View style={styles.mediaContainer}>
        <MediaCarousel 
          images = {data ? data.images : []}
          videoUrl = {data && data.videos ? data.videos[0] : ''}
        />

        {/* Overlay Icons */}
        <View style={styles.overlayIconsContainer}>
          {data?.isUnderConstruction && (
            <View style={styles.constructionIcon}>
              <FollowingIcons name="construct" size={20} color="#FFA500" />
            </View>
          )}
          {data?.latitude && data?.longitude && (
            <TouchableOpacity
              style={styles.directionIcon}
              onPress={handleDirectionsPress}
            >
              <FollowingIcons name="navigate" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionContainer}>
        {/* Follow Button */}
        {isFavorite(_id) && <TouchableOpacity
          onPress={handleToggleFollow}
          activeOpacity={0.85}
          style={[
            styles.followButton,
            isFollowing(_id) ? styles.following : styles.follow,
          ]}
          disabled={toggleFollowLoading}
        >
          <Text
            style={[
              styles.followText,
              isFollowing(_id) ? styles.followingText : styles.followTextActive,
            ]}
          >
            {
              toggleFollowLoading ? <ActivityIndicator color={"black"} size={14}/> : isFollowing(_id) ? "Following" : "Follow"
            }
          </Text>
        </TouchableOpacity>}

        {/* Favorite Icon */}
        <TouchableOpacity
          onPress={isFavorite(_id) ? handleRemoveFromFavorite : handleAddToFavorite}
          activeOpacity={0.85}
          style={styles.favoriteIcon}
          disabled={addMasjidToFavoriteLoading || removeMasjidFromFavoriteLoading}
        >
          {
          addMasjidToFavoriteLoading || removeMasjidFromFavoriteLoading ? <ActivityIndicator color={"white"}  size={20}/> :
          isFavorite(_id) ? (
            <StarFilledIcon name="star" size={18} color="#FFD700" />
          ) : (
            <StarOutlineIcon name="star" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      </View>
      

         <View style={[styles.tabBarContainer, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 0 && [styles.activeTab, { borderBottomColor: colors.BUTTON_BG }]]}
              onPress={() => setActiveTab(0)}
            >
              <Text style={[styles.tabText, { color: colors.TEXT }, activeTab === 0 && [styles.activeTabText, { color: colors.TEXT }]]}>
                Info
              </Text>
            </TouchableOpacity>
            
            {!data?.isUnderConstruction && (
              <TouchableOpacity
                style={[styles.tab, activeTab === 1 && [styles.activeTab, { borderBottomColor: colors.BUTTON_BG }]]}
                onPress={() => setActiveTab(1)}
              >
                <Text style={[styles.tabText, { color: colors.TEXT}, activeTab === 1 && [styles.activeTabText, { color: colors.TEXT }]]}>
                  Prayer Timings
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.tab, (data?.isUnderConstruction ? activeTab === 1 : activeTab === 2) && [styles.activeTab, { borderBottomColor: colors.BUTTON_BG }]]}
              onPress={() => setActiveTab(data?.isUnderConstruction ? 1 : 2)}
            >
              <Text style={[styles.tabText, { color: colors.TEXT }, (data?.isUnderConstruction ? activeTab === 1 : activeTab === 2) && [styles.activeTabText, { color: colors.TEXT }]]}>
                Notifications
              </Text>
            </TouchableOpacity>
          </View>

          {
            isLoading ? 
       
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={colors.TINT} size={50}/>
            </View> :
            !data ? 
            <View style={styles.noDataFoundContainer}>
              <Text style={{ color: 'red' }}>No data found</Text>
            </View> :
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 0 && <MasjidInfo masjid={data} />}
              {activeTab === 1 && !data?.isUnderConstruction && <PrayerInfo prayerInfo={data?.prayerInfo} />}
              {(data?.isUnderConstruction ? activeTab === 1 : activeTab === 2) && <Notifiations />}
            </ScrollView>
          }
       </View>
  )
}



const styles = StyleSheet.create({
  container: {
    padding: 16,
    overflow: 'hidden',
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
    address: {
      maxWidth: '70%',
      
    },
  favoriteContainer: {

    position: 'absolute',
    top: 10,
    right: 16,
    flexDirection: 'row',
    justifyContent:'center'
  },
  followBtn: {},
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    text: {
      marginVertical: 4,
    },
    donateButtonContainer: {
      alignItems:'center'
    },
    actionContainer: {
  position: "absolute",
  top: 12,
  right: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 8, // spacing between button & icon
},

followButton: {
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 18,
  borderWidth: 1,
  minWidth: 90,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

follow: {
  backgroundColor: "#1DA1F2",
  borderColor: "#1DA1F2",
},

following: {
  backgroundColor: "rgba(255,255,255,0.95)",
  borderColor: "#ddd",
},

followText: {
  fontSize: 13,
  fontWeight: "600",
},

followTextActive: {
  color: "#fff",
},

followingText: {
  color: "#333",
},

favoriteIcon: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "rgba(0,0,0,0.55)",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},

    donateButton: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 24,
    },
    donateButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    tabBarContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderBottomWidth: 1,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomWidth: 2,
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
    },
    activeTabText: {
      fontWeight: '700',
    },
    loaderContainer: {
      height: 300,
      maxHeight: SCREEN_HEIGHT/2,
      justifyContent:'center'
    },
    mediaContainer:{
      height: 300,
      maxHeight: SCREEN_HEIGHT/2
    },
    noDataFoundContainer: {
      height: 300,
      maxHeight: SCREEN_HEIGHT/2,
      justifyContent:'center',
      alignItems:'center'
    },
    button: {
      // paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 60,
    },
    overlayIconsContainer: {
      position: 'absolute',
      top: 16,
      left: 16,
      flexDirection: 'row',
      gap: 8,
    },
    constructionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    directionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
  })

  export default MasjidDetails