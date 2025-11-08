// import { useQuery } from "@tanstack/react-query";
// import authRequest from "../_helpers/api";

// export const useSendOtp = (mobile:string) => {
//   return useQuery({
//     queryKey: ["send-otp"],
//     queryFn: async () => {
//       const { data } = await authRequest.post(process.env.EXPO_AUTH_SERVICE + "/send-otp", {mobile});
//       return data;
//     },
//   });
// };


import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: async (mobile: string) => {
      const { data } = await authRequest.post(
        `${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/send-otp`,
        { mobile }
      );
      return data;
    },
    onSuccess: (data) => {},
  onError: (error) => {},

  });
};
