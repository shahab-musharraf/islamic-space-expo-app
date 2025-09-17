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
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

const Index = () => {
  const navigation: any = useNavigation();
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      console.log(accessToken)

      if (accessToken) {
        const decoded = decodeJwt(accessToken);
        const isExpired = decoded?.exp && Date.now() >= decoded.exp * 1000;
        if (!isExpired) {
          navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });
          return;
        }
      }

      // Try refreshing the token
      if (refreshToken) {
        console.log('checking refresh token')
        try {
          console.log(refreshToken, process.env.EXPO_PUBLIC_AUTH_SERVICE)
          const response = await axios.post(`${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/refresh`, {
            refreshToken,
          });
          
          const newAccessToken = response.data?.accessToken;
          const newRefreshToken = response.data?.refreshToken;
          console.log(response, newAccessToken, newRefreshToken)

          if (newAccessToken) {
            await setAccessToken(newAccessToken);
            if (newRefreshToken && newRefreshToken !== refreshToken) {
              await setRefreshToken(newRefreshToken);
            }

            navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });
            return;
          }
        } catch (err) {
          console.log('deleting token')
          console.log("Refresh failed", err);
        }
      }

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
