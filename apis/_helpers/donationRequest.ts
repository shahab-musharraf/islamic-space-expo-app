import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
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

const EXPO_DONATION_SERVICE = process.env.EXPO_PUBLIC_DONATION_SERVICE;
const EXPO_AUTH_SERVICE = process.env.EXPO_PUBLIC_AUTH_SERVICE;

const donationRequest = axios.create({
  baseURL: EXPO_DONATION_SERVICE,
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

// ------------------------
// ✅ Request Interceptor
// ------------------------
donationRequest.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    // Ensure headers exist
    config.headers = config.headers || {};

    // If access token exists
    if (accessToken) {
      const decoded = decodeJwt(accessToken);

      // If expired, refresh it
      if (decoded?.exp && Date.now() >= decoded.exp * 1000) {
        try {
          if (!refreshToken) throw new Error("Missing refresh token");

          const res = await axios.post(`${EXPO_AUTH_SERVICE}/auth/refresh`, {
            refreshToken,
          });

          const newAccessToken = res.data?.accessToken;
          const newRefreshToken = res.data?.refreshToken;

          if (newAccessToken) {
            await setAccessToken(newAccessToken);
            accessToken = newAccessToken;
          }

          if (newRefreshToken && newRefreshToken !== refreshToken) {
            await setRefreshToken(newRefreshToken);
          }
        } catch (err) {
          await deleteAccessToken();
          await deleteRefreshToken();
          router.replace("/auth");
          return Promise.reject("Session expired. Please login again.");
        }
      }

      // Attach token to request
      (config.headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------
// ✅ Response Interceptor
// ------------------------
donationRequest.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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

        if (newRefreshToken && newRefreshToken !== refreshToken) {
          await setRefreshToken(newRefreshToken);
        }

        if (newAccessToken) {
          await setAccessToken(newAccessToken);
          originalRequest.headers = originalRequest.headers || {};
          (originalRequest.headers as Record<string, string>)["Authorization"] = `Bearer ${newAccessToken}`;
          return donationRequest(originalRequest); // 🔁 Retry original request
        }
      } catch (err) {
        await deleteAccessToken();
        await deleteRefreshToken();
        router.replace("/auth");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default donationRequest;
