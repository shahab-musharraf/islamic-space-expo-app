import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useUpdateProfileMutation = (profileId: string | undefined) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await authRequest.put(`/profile/${profileId}`, formData, {
        headers: {
          // Let browser set boundary automatically
          "Content-Type": "multipart/form-data",
        },
      });
      return data;
    },

    onSuccess: (data) => {
      console.log("Profile updated:", data);
    },

    onError: (error) => {
      console.error("Update failed:", error);
    },
  });
};
