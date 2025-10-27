import { useUserProfileStore } from "@/stores/userProfileStore";
import { showMessage } from "@/utils/functions";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";
import { setAccessToken, setRefreshToken } from "../_helpers/tokenStorage";

export const useVerifyOtpMutation = () => {
  const navigation :any = useNavigation()
  const {setProfile} = useUserProfileStore();
  return useMutation({
    mutationFn: async ({mobile,  otp}:{mobile:string, otp:string}) => {
      const { data } = await authRequest.post(
        `${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/verify-otp-login`,
        { mobile, otp }
      );
      return data;
    },
    onSuccess: (response) => {
      setAccessToken(response.accessToken);
      setRefreshToken(response.refreshToken);
      setProfile(response.profile);
      console.log(response, 'response from useVerifyOtpMutation')
      showMessage("Logged In Successfully!")
      navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });
    },
    onError : (error:any) => {
      showMessage(error.response.data.message || 'Something went wrong')
      // alert(error.response.data.message)
    }
  });
};