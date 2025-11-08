import { decodeJwt } from '@/apis/_helpers/getDecodedToken';
import {
  deleteAccessToken,
  deleteRefreshToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken
} from '@/apis/_helpers/tokenStorage';
import Loader from '@/components/Loader';
import { useUserLocationStore } from '@/stores/userLocationStore';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { setJSExceptionHandler } from 'react-native-exception-handler';


// -------------------------
// 1️⃣ Global JS Error Handler
// -------------------------
setJSExceptionHandler((error, isFatal) => {
  Alert.alert(
    'Something went wrong',
    error.message || 'Unknown error',
    [{ text: 'OK' }],
  );

  // optional: log to server
  console.log('JS Exception:', error, isFatal);
}, true);

const Index = () => {
  const navigation: any = useNavigation();
  const { restoreLocation } = useUserLocationStore();
  
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      console.log(accessToken, refreshToken, 'token found')

      if (accessToken) {
        const decoded = decodeJwt(accessToken);
        const isExpired = decoded?.exp && Date.now() >= decoded.exp * 1000;
        if (!isExpired) {
          console.log('token is valid, restoring location')
          await restoreLocation();
          console.log('location restored, navigating to tabs/index')
          navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });

          return;
        }
        console.log('access token expired')
      }

      // Try refreshing the token
      if (refreshToken) {
        try {
          console.log('trying refresh')
          const response = await axios.post(`${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/refresh`, {
            refreshToken,
          });
          
          const newAccessToken = response.data?.accessToken;
          const newRefreshToken = response.data?.refreshToken;

          console.log(newAccessToken, newRefreshToken, 'got new token')

          if (newAccessToken) {
            await setAccessToken(newAccessToken);
            if (newRefreshToken && newRefreshToken !== refreshToken) {
              await setRefreshToken(newRefreshToken);
            }

            console.log('restoring location')
            await restoreLocation();
            navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });
            return;
          }
        } catch (err) {
        }
      }


      console.log('deleting token')
      // Not authenticated
      await deleteAccessToken();
      await deleteRefreshToken();
      // router.replace('/auth/index')
      navigation.reset({
        index: 0,
        routes: [{ name: 'auth/index' }] // ✅ must match <Stack.Screen name="auth" />
      });
    };

    checkAuth();
  }, []);

  return <Loader />;
};

export default Index;
