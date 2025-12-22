import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useUpdatePrayerTimingsMutation = () => {
  return useMutation({
    mutationFn: async ({ masjidId, prayerInfo }: { masjidId: string; prayerInfo: any }) => {
      const { data } = await mosqueRequest.put(
        `/masjid/update-prayer-info/${masjidId}`,
        prayerInfo,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return data;
    },

    onError: (error: any) => {
      const backendError =
        error?.response?.data?.error ||   // ❗ your backend sends "error"
        error?.response?.data?.message || // fallback if backend ever sends message
        error.message;

      Alert.alert(
        "Alert",
        error.code === "ECONNABORTED"
          ? "Request Timed Out. Please Try Again."
          : error.code === "ERR_NETWORK"
          ? "Network Error, Please Try Again Later"
          : error.code === "ERR_BAD_REQUEST"
          ? backendError                     // show backend-specific error
          : backendError || "Something went wrong"
      );
    }
  });
};
