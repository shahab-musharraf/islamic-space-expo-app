import donationRequest from '@/apis/_helpers/donationRequest';
import { useGetMasjidDetailsByMasjidId } from '@/apis/masjid/useGetMasjidDetailsByMasjidId';
import MediaCarousel from '@/components/masjid-details/MediaCarousel';
import { Theme } from '@/constants/types';
import { useRoute, useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import MasjidInfo from '../../../components/masjid-details/MasjidInfo';
import Notifiations from '../../../components/masjid-details/Notifiations';
import PrayerInfo from '../../../components/masjid-details/PrayerInfo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MasjidDetails = () => {
    const route :any = useRoute();
    const { colors } = useTheme() as Theme;
    const [isPaymentLoading, setIsPaymentLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    
    // Access the params passed during navigation
  const { _id, name, address, images, distance, videos } = route.params;

  const { data, isLoading } = useGetMasjidDetailsByMasjidId(_id);

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

  console.log(data, isLoading, 'masjid details')
  return (
    <View style={{ }}>
      {/* {images && images.length > 0 && (
        <Image source={{ uri: images[0] }} style={styles.image} />
      )} */}
      <View style={styles.mediaContainer}>
        <MediaCarousel 
          images = {images}
          videoUrl = {videos && videos?.length ? videos[0] : (!isLoading && data && data?.videos && data?.videos?.length) ?  data?.videos?.[0] : ''}
        />
      </View>
      {/* <ScrollView style={styles.container}>
        <View style={ styles.addressContainer }>
            <Text style={[styles.address, {color: colors.TEXT}]} numberOfLines={2} ellipsizeMode='tail'>{address}</Text>
            <Text style={{ color: colors.TINT }}>[{getDisplayDistance(distance)}]</Text>
            <Text style={{ color: colors.TINT }}>Donation Required</Text>
            <Text style={{ color: colors.TINT }}>Donation received</Text>
        </View>

        <View style={styles.donateButtonContainer}>
          <TouchableOpacity
            style={[styles.donateButton, { backgroundColor: colors.BUTTON_BG }]}
            onPress={handleDonatePress}
          >
            <Text style={[styles.donateButtonText, { color: colors.BUTTON_TEXT }]}>Donate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView> */}

      {/* --- 2. TAB BAR (Unchanged) --- */}
       
       <View>

         <View style={[styles.tabBarContainer, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 0 && [styles.activeTab, { borderBottomColor: colors.BUTTON_BG }]]}
              onPress={() => setActiveTab(0)}
            >
              <Text style={[styles.tabText, { color: colors.TEXT }, activeTab === 0 && [styles.activeTabText, { color: colors.TEXT }]]}>
                Info
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 1 && [styles.activeTab, { borderBottomColor: colors.BUTTON_BG }]]}
              onPress={() => setActiveTab(1)}
            >
              <Text style={[styles.tabText, { color: colors.TEXT }, activeTab === 1 && [styles.activeTabText, { color: colors.TEXT }]]}>
                Prayer Timings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 2 && [styles.activeTab, { borderBottomColor: colors.BUTTON_BG }]]}
              onPress={() => setActiveTab(2)}
            >
              <Text style={[styles.tabText, { color: colors.TEXT }, activeTab === 2 && [styles.activeTabText, { color: colors.TEXT }]]}>
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
            activeTab === 0 ? 
            <MasjidInfo masjid={data}/> :
            activeTab === 1 ?
            <PrayerInfo /> :
            <Notifiations />
          }
       </View>
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
    text: {
      marginVertical: 4,
    },
    donateButtonContainer: {
      alignItems:'center'
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
    }
  })

  export default MasjidDetails