import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useForgotPasswordMutation = () => {
  return useMutation({
    mutationFn: async (payload: {
      mobile: string;
      dob: string;
      newPassword: string;
    }) => {
      const { data } = await authRequest.post(
        `/auth/forgot-password`,
        payload
      );
      return data;
    },
  });
};