

import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useUpdateOtpMutation = () => {
  return useMutation({
    mutationFn: async (mobile: string) => {
      const { data } = await authRequest.post(
        `${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/send-otp`,
        { mobile }
      );
      return data;
    },
    onSuccess: (data) => console.log('Mutation success:', data),
  onError: (error) => console.error('Mutation error:', error),

  });
};
