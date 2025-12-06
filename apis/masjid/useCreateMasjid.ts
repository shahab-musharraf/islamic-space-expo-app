import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useCreateMasjidMutation = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await mosqueRequest.post(
        `/masjid/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          maxContentLength: 50 * 1024 * 1024, // 50MB limit
        }
      );

      return data;
    },

    onError: (error: any) => {
      // console.error("🔥 MUTATION FAILED:", JSON.stringify(error, null, 2));
      Alert.alert(
        'Alert',
        error.code === 'ECONNABORTED' ? 'Request Timed Out. Please Try Again.' : 
        error.code === 'ERR_NETWORK' ? 'Network Error, Please Try Again Later' : 
        error.code === 'ERR_BAD_REQUEST' ? 'Access Denied! Please Contact Us' :
        error?.response?.data?.message || error.message || 'Network Error, Please Try Again Later'
      );
    },
  });
};
