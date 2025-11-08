import axios, { AxiosError, AxiosResponse } from "axios";
import { router } from "expo-router";
import { decodeJwt } from "./getDecodedToken";
import {
  deleteAccessToken,
  deleteRefreshToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./tokenStorage";

const EXPO_AUTH_SERVICE = process.env.EXPO_PUBLIC_AUTH_SERVICE;

const authRequest = axios.create({
  baseURL: EXPO_AUTH_SERVICE,
  timeout: 5000,
  headers: {
    Accept: "application/json",
  },
});

// ✅ Request Interceptor
authRequest.interceptors.request.use(
  async (config: any) => {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (accessToken) {
      const decoded = decodeJwt(accessToken);
      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        try {
          const res = await axios.post(`${EXPO_AUTH_SERVICE}/auth/refresh`, {
            refreshToken,
          });

          const newAccessToken = res.data?.accessToken;
          const newRefreshToken = res.data?.refreshToken;
          if (newAccessToken) {
            await setAccessToken(newAccessToken);
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newAccessToken}`,
            };
          }
          if(newRefreshToken && newRefreshToken !== refreshToken){
            await setRefreshToken(newRefreshToken);
          }



        } catch (err) {
          await deleteAccessToken();
          await deleteRefreshToken();
          // RootNavigation.navigate("Login"); // 👈 Navigate manually
          return Promise.reject("Session expired. Please login again.");
        }
      } else {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor with Retry
authRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) throw new Error("Missing refresh token");

        const res = await axios.post(`${EXPO_AUTH_SERVICE}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data?.accessToken;
        const newRefreshToken = res.data?.refreshToken;
        
        if(newRefreshToken && newRefreshToken !== refreshToken){
            await setRefreshToken(newRefreshToken);
          }
        if (newAccessToken) {
          await setAccessToken(newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return authRequest(originalRequest); // 🔁 Retry original request
        }
        
      } catch (err) {
        await deleteAccessToken();
        await deleteRefreshToken();
        router.replace('/auth')
      }
    }

    return Promise.reject(error);
  }
);

export default authRequest;
