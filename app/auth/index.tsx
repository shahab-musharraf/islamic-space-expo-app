import authRequest from '@/apis/_helpers/api';
import { useForgotPasswordMutation } from '@/apis/auth/useForgotPasswordMutation';
import { useLoginMutation } from '@/apis/auth/useLoginMutation';
import { useRegisterMutation } from '@/apis/auth/useRegisterMutation';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
// import * as Google from 'expo-auth-session/providers/google';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'LOGIN' | 'REGISTER';

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('LOGIN');

  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [showFPassword, setShowFPassword] = useState(false);
  const [showFCPassword, setShowFCPassword] = useState(false);

  // Forgot password
  const [forgotOpen, setForgotOpen] = useState(false);
  const [fpMobile, setFpMobile] = useState('');
  const [fpDob, setFpDob] = useState<Date | null>(null);
  const [fpPassword, setFpPassword] = useState('');
  const [fpConfirmPassword, setFpConfirmPassword] = useState('');

  const [errors, setErrors] = useState<any>({});

  const slideAnim = useRef(new Animated.Value(0)).current;
  const keyboardHeight = useRef(0);
  const modalSlideAnim = useRef(new Animated.Value(0)).current;

  const { mutateAsync: login, isPending: loginLoading } = useLoginMutation();
  const { mutateAsync: register, isPending: registerLoading } = useRegisterMutation();
  const { mutateAsync: forgotPassword, isPending: fpLoading } =
    useForgotPasswordMutation();

  const isLoading = loginLoading || registerLoading;
  const isKeyboardVisible = useRef(false);

  /* ---------------- GOOGLE LOGIN ---------------- */

  // const [request, response, promptAsync] = Google.useAuthRequest({
  //   androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  //   iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  //   webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  // });

  // useEffect(() => {
  //   if (response?.type === 'success') {
  //     handleGoogleLogin(response.authentication?.accessToken);
  //   }
  // }, [response]);

  const handleGoogleLogin = async (token?: string) => {
    if (!token) return;
    try {
      await authRequest.post(
        `${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/google`,
        { accessToken: token }
      );
    } catch (e: any) {
      Alert.alert(
        'Google Login Failed',
        e?.response?.data?.message || 'Unable to login with Google'
      );
    }
  };

  /* ---------------- KEYBOARD ANIMATION ---------------- */



useEffect(() => {
  if (!forgotOpen) return;

  const showSub = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e) => {
      const lift = Math.min(e.endCoordinates.height * 0.45, 180);

      Animated.timing(modalSlideAnim, {
        toValue: -lift,
        duration: Platform.OS === 'ios' ? e.duration : 250,
        useNativeDriver: true,
      }).start();
    }
  );

  const hideSub = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => {
      Animated.timing(modalSlideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  );

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, [forgotOpen]);


useEffect(() => {
  const showSub = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e) => {
      isKeyboardVisible.current = true; // ✅ ADD HERE

      if (forgotOpen) return;

      keyboardHeight.current = e.endCoordinates.height;
      const lift = Math.min(keyboardHeight.current * 0.35, 140);

      Animated.timing(slideAnim, {
        toValue: -lift,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  );

  const hideSub = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => {
      isKeyboardVisible.current = false; // ✅ ADD HERE

      if (forgotOpen) return;

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  );

  return () => {
    showSub.remove();
    hideSub.remove();
  };
}, [forgotOpen]);




  /* ---------------- PASSWORD VALIDATION ---------------- */

  const validatePassword = (pwd: string) => {
    const missing: string[] = [];
    if (pwd.length < 8) missing.push('at least 8 characters');
    if (!/[A-Za-z]/.test(pwd)) missing.push('a letter');
    if (!/\d/.test(pwd)) missing.push('a number');
    if (!/[^A-Za-z\d]/.test(pwd)) missing.push('a special symbol');
    return missing;
  };

  /* ---------------- VALIDATION ---------------- */

  const validate = () => {
    const e: any = {};

    if (!/^\d{10}$/.test(mobile)) e.mobile = 'Enter a valid 10-digit mobile number';

    if (mode === 'REGISTER') {
      if (!dob) e.dob = 'Date of birth is required';
      if (name && name.trim().length < 3)
        e.name = 'Name must contain at least 3 characters';

      const pwdMissing = validatePassword(password);
      if (pwdMissing.length)
        e.password = `Password must contain ${pwdMissing.join(', ')}`;

      if (!confirmPassword)
        e.confirmPassword = 'Please confirm your password';
      else if (confirmPassword !== password)
        e.confirmPassword = 'Passwords do not match';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validate()) return;

    

    try {
      if (mode === 'LOGIN') {
        await login({ mobile, password });
      } else {
        if(!dob) return;

        const dobString = `${dob.getFullYear()}-${
          String(dob.getMonth() + 1).padStart(2, "0")
        }-${String(dob.getDate()).padStart(2, "0")}`;

        await register({
          mobile,
          password,
          name: name.trim() || undefined,
          dob: dobString,
        });
      }
    } catch (err: any) {
      Alert.alert(
        'Authentication Failed',
        err?.response?.data?.message || 'Something went wrong'
      );
    }
  };

  /* ---------------- FORGOT PASSWORD ---------------- */

  const handleForgotPassword = async () => {
    if (!/^\d{10}$/.test(fpMobile) || !fpDob) {
      Alert.alert('Error', 'Invalid mobile or DOB');
      return;
    }
    if (fpPassword !== fpConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const dobString = `${fpDob.getFullYear()}-${
      String(fpDob.getMonth() + 1).padStart(2, "0")
    }-${String(fpDob.getDate()).padStart(2, "0")}`;

    try {
      await forgotPassword({
        mobile: fpMobile,
        dob: dobString,
        newPassword: fpPassword,
      });
      Alert.alert('Success', 'Password updated');
      setForgotOpen(false);
    } catch (e: any) {
      Alert.alert('Failed', e?.response?.data?.message || 'Reset failed');
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.root}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.logoWrapper}>
            <Image source={require('@/assets/images/logo-text.png')} style={styles.logo} />
          </View>

          <Text style={styles.title}>
            {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(v) => setMobile(v.replace(/[^0-9]/g, ''))}
          />
          {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

          {mode === 'REGISTER' && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Name (Optional)"
                value={name}
                onChangeText={setName}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDobPicker(true)}
              >
                <Text style={{ color: dob ? '#000' : '#999' }}>
                  {dob ? dob.toDateString() : 'Date of Birth'}
                </Text>
              </TouchableOpacity>
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
            </>
          )}

          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {mode === 'REGISTER' && (
            <>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </>
          )}

          {mode === 'LOGIN' && (
            <TouchableOpacity onPress={() => setForgotOpen(true)}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
            {isLoading ? <ActivityIndicator color="#fff" /> : (
              <Text style={styles.primaryText}>
                {mode === 'LOGIN' ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>

          {/* <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>OR</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity
            style={styles.googleBtn}
            // disabled={!request}
            // onPress={() => promptAsync()}
            disabled={true}
            onPress={() => {}}
          >
            <Ionicons name="logo-google" size={18} color="#DB4437" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}>
            <Text style={styles.switchText}>
              {mode === 'LOGIN'
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {showDobPicker && (
        <DateTimePicker
          value={dob || fpDob || new Date(2000, 0, 1)}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, date) => {
            setShowDobPicker(false);
            if (!date) return;
            const localDate = new Date(
              date.getFullYear(),
              date.getMonth(),
              date.getDate()
            );
            if (forgotOpen) setFpDob(localDate);
            else setDob(localDate);
          }}
        />
      )}

      <Modal visible={forgotOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <Animated.View
              style={[
                styles.modalCard,
                { transform: [{ translateY: modalSlideAnim }] },
              ]}
            >
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="number-pad"
              value={fpMobile}
              onChangeText={setFpMobile}
            />

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDobPicker(true)}
            >
              <Text style={{ color: fpDob ? '#000' : '#999' }}>
                {fpDob ? fpDob.toDateString() : 'Date of Birth'}
              </Text>
            </TouchableOpacity>

            <View style={{ position:'relative' }}>
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry={!showFPassword}
                value={fpPassword}
                onChangeText={setFpPassword}
              />

              <View style={{position:'absolute', right: 15, top: 12}}>
                <TouchableOpacity onPress={() => setShowFPassword(!showFPassword)}>
                  <Ionicons name={showFPassword ? 'eye-off-outline' : 'eye-outline'} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ position:'relative' }}>

              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry={!showFCPassword}
                value={fpConfirmPassword}
                onChangeText={setFpConfirmPassword}
              />

              <View style={{position:'absolute', right: 15, top: 12}}>
                  <TouchableOpacity onPress={() => setShowFCPassword(!showFCPassword)}>
                  <Ionicons name={showFCPassword ? 'eye-off-outline' : 'eye-outline'} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleForgotPassword}>
              {fpLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setForgotOpen(false)}>
              <Text style={{ textAlign: 'center', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
                    </Animated.View>
            </KeyboardAvoidingView>
          </View>
        
      </Modal>
    </View>
  );
}

/* ---------------- STYLES (UNCHANGED) ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F8F3' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 22 },
  logoWrapper: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 100, height: 150 },
  title: { fontSize: 22, marginBottom: 10, textAlign: 'center', color: '#1B5E20' },
  input: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 14 },
  primaryBtn: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#fff', fontSize: 16 },
  forgot: { textAlign: 'right', color: '#2E7D32', marginBottom: 10 },
  switchText: { textAlign: 'center', marginTop: 16, color: '#2E7D32' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: '#DDD' },
  or: { marginHorizontal: 8, color: '#777', fontSize: 12 },
  googleBtn: {
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleText: { fontSize: 14, color: '#333' },
  errorText: { fontSize: 12, color: '#D32F2F', marginBottom: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
});
