import donationRequest from '@/apis/_helpers/donationRequest';
import { Theme } from '@/constants/types';
import { getDisplayDistance } from '@/utils/getDisplayDistance';
import { useRoute, useTheme } from '@react-navigation/native';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

const MasjidDetails = () => {
    const route :any = useRoute();
    const { colors } = useTheme() as Theme;
    const [isLoading, setIsLoading] = useState(false);
    // Access the params passed during navigation
  const { _id, name, address, images, distance } = route.params;

  const handleDonatePress = async () => {
    if (isLoading) return;
    setIsLoading(true);

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
            setIsLoading(false);
          }
        })
        .catch((errorData) => {
          // --- Handle Payment Failure/Cancellation ---
          console.log('Razorpay payment failed:', errorData);
          if (errorData.code !== 0) { // 0 is 'Payment Cancelled by User'
             alert(`Error: ${errorData.description}`);
          }
          setIsLoading(false);
        });

    } catch (orderError) {
      // --- Handle Order Creation Failure ---
      console.error('Failed to create order:', orderError);
      alert('Could not initiate donation. Please try again later.');
      setIsLoading(false);
    }
  };

  // const handleDonateButton = () => {
  //   console.log(_id, 'Donate to masjid')
  //   // Handle the donate button press
  //     const options : CheckoutOptions = {
  //     description: 'Credits towards consultation',
  //     image: 'https://i.imgur.com/3g7nmJC.png',
  //     currency: 'INR',
  //     key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '', // Your api key
  //     amount: 5000,
  //     name: 'foo',
  //     order_id: _id, //Replace this with an order_id created using Orders API.
  //     prefill: {
  //       email: 'void@razorpay.com',
  //       contact: '9191919191',
  //       name: 'Razorpay Software'
  //     },
  //     theme: {color: colors.TINT}
  //   }
  //   RazorpayCheckout.open(options).then((data: any) => {
  //     // handle success
  //     alert(`Success: ${data.razorpay_payment_id}`);
  //     console.log(data, 'sucess data')
  //   }).catch((error: any) => {
  //     // handle failure
  //     console.log(error, 'error data')
  //     alert(`Error: ${error.code} | ${error.description}`);
  //   });
  // }
  return (
    <View style={{ }}>
      {images && images.length > 0 && (
        <Image source={{ uri: images[0] }} style={styles.image} />
      )}
      <ScrollView style={styles.container}>
        <View style={ styles.addressContainer }>
            <Text style={[styles.address, {color: colors.TEXT}]} numberOfLines={2} ellipsizeMode='tail'>{address}</Text>
            <Text style={{ color: colors.TINT }}>[{getDisplayDistance(distance)}]</Text>
            {/* <Text style={{ color: colors.TINT }}>Donation Required</Text>
            <Text style={{ color: colors.TINT }}>Donation received</Text> */}
        </View>

        <View style={styles.donateButtonContainer}>
          <TouchableOpacity
            style={[styles.donateButton, { backgroundColor: colors.BUTTON_BG }]}
            onPress={handleDonatePress}
          >
            <Text style={[styles.donateButtonText, { color: colors.BUTTON_TEXT }]}>Donate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default MasjidDetails


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
    image: {
        width: '100%',
        height: 300
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
})