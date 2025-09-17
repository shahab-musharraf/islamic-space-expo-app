import { useSendOtpMutation } from '@/apis/auth/useSendOtp';
import { useVerifyOtpMutation } from '@/apis/auth/useVerifyOtp';
import ResendTimer from '@/components/ResendTimer';
import { showMessage } from '@/utils/functions';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [bottomAnim] = useState(new Animated.Value(0));
  const [mobile, setMobile] = useState('');
  const navigation: any = useNavigation();
  const [otpSent, setOtpSent] = useState(false);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    // const [timer, setTimer] = useState(60);
      const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      Animated.timing(bottomAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      Animated.timing(bottomAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const bottomOffset = bottomAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Platform.OS === 'android' ? 150 : 250], // you can tweak the offset
  });

  
  const { mutateAsync: sendOtp, isPending:sendOtpLoader } = useSendOtpMutation();
  const {mutateAsync: verifyOtp, isPending:verifyLoading} = useVerifyOtpMutation();

  const handleSendOtp = async () => {
    // Handle OTP sending logic here
    if (mobile.length !== 10) {
      showMessage("Please enter 10 digits mobile number");
      return;
    }

    try {
      const response = await sendOtp(mobile);
      if (response) {
        showMessage(response);
        setOtpSent(true);
      }
    } catch (err: any) {
      showMessage(err?.response?.data || 'Failed to send OTP');
      alert(err?.response?.data || 'Failed to send OTP')
    }
  };

  const handleMobileChange = (value: string) => {
    if(value.length > 10) return; // Limit to 10 digits
    // Allow only numbers
    setMobile(value.replace(/[^0-9]/g, '')); // Allow only numbers
  };


//   verify otp functions
  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      Keyboard.dismiss();
    }
  };

const handleResend = () => {
  
    showMessage('OTP resent');
    setOtp(['', '', '', '', '', '']);
    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100); // slight delay ensures input ref is ready
  
};

  const handleVerify = async () => {
    if (otp.join('').length < 6) {
      showMessage('Enter full 6-digit OTP');
      return;
    }
   await verifyOtp({mobile, otp: otp.join('')});

    inputs.current[0]?.focus();
    setOtp(['','','','','',''])
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        // source={{
        //   uri: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1350&q=80',
        // }}
        source={require('../../assets/images/bg.png')}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* Dark overlay for reducing image opacity */}
        <View style={styles.overlay} />

        <StatusBar style="light" />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Welcome to EzyWheel</Text>
          <Text style={styles.tagline}>India’s #1 truck & machinery booking app</Text>
        </View>

        {!otpSent ? <Animated.View
          style={[
            styles.content,
            {
              // transform: [{ translateY: Animated.multiply(bottomAnim, -80) }],
              marginBottom: bottomOffset,
            },
          ]}
        >
            <View style={styles.verifyContainer}>
            <Text style={styles.appName}>Get Started!</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone Number"
              keyboardType="phone-pad"
              placeholderTextColor="#aaa"
              value={mobile}
              onChangeText={(value) => handleMobileChange(value)}
            />
            {sendOtpLoader ? 
            <ActivityIndicator size="large" color="#000" style={{ marginLeft: 10 }} />:
            <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
              <AntDesign  size={24} color="#fff" />
            </TouchableOpacity>}
          </View>

          <Text style={styles.terms}>
            By continuing, I agree to the{' '}
            <Text style={styles.link}>terms & conditions</Text> and{' '}
            <Text style={styles.link}>privacy policy</Text>.
          </Text>
        </Animated.View> : <Animated.View style={[styles.content, { marginBottom: bottomOffset }]}>
          <View style={styles.verifyContainer}>
            <Text style={styles.appName}>Verify OTP</Text>
            <View style={styles.editRow}>
                <Text style={styles.tagline}>Enter the 6-digit code sent to {mobile} </Text>
                <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => {
                        Alert.alert(
                        'Edit Mobile Number',
                        'Are you sure you want to change your mobile number?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                            text: 'Yes',
                            onPress: () => {
                                setOtpSent(false); // 👈 Go back to phone input
                            },
                            },
                        ]
                        );
                    }}
                    >
                    <AntDesign name="edit" size={18} color="#007BFF" />
                </TouchableOpacity>
            </View>
          </View>
            <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => {inputs.current[i] = ref}}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(value, i)}
                onKeyPress={({ nativeEvent }) => {
                    if (
                    nativeEvent.key === 'Backspace' &&
                    otp[i] === '' &&
                    i > 0
                    ) {
                    inputs.current[i - 1]?.focus();
                    }
                }}
                autoFocus={i === 0}
                />

            ))}
          </View>

          <View style={styles.resendAndVerifyContainer}>
            <View style={styles.resendTimer}>
                <ResendTimer onResend={handleResend} /> 
            </View>
            {verifyLoading ?
             <ActivityIndicator size="large" color="#fff" style={{ marginLeft: 10 }} /> :
             <TouchableOpacity style={styles.button} onPress={handleVerify}>
                <AntDesign  size={24} color="#fff"  />
            </TouchableOpacity>}
          </View>

        </Animated.View>}
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  overlay: {
  ...StyleSheet.absoluteFillObject, // fills the entire background
  backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the 0.5 for desired opacity
  zIndex: 1,
},
  background: {
    flex: 1,
    width: width,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    width: '100%',
    zIndex: 2, // Ensure it appears above the overlay
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  content: {
    backgroundColor: 'rgba(0,0,0, 0.5)',
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    padding: 24,
    paddingTop: 30,
    alignItems: 'center',
    height: height * 0.4,
    zIndex: 2, // Ensure it appears above the overlay
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    width: '100%',
    paddingLeft: 20,
    paddingRight: 15,
    paddingVertical: 5,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    height: 40,
    width: 40,
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  terms: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  link: {
    color: '#00aced',
    textDecorationLine: 'underline',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#fff',
    width: 40,
    height: 50,
    textAlign: 'center',
    fontSize: 20,
    borderRadius: 10,
    color: '#000',
  },
    verifyContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        flexWrap: 'wrap',
    },

        editIcon: {
        marginLeft: 8,
        padding: 4,
    },
    resendAndVerifyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    resendTimer: {
        alignSelf: 'flex-start',
    },
});
