import { useUserProfileStore } from "@/stores/userProfileStore";
import { showMessage } from "@/utils/functions";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";
import { setAccessToken, setRefreshToken } from "../_helpers/tokenStorage";

type RegisterPayload = {
  mobile: string;
  password: string;
  dob: string;
  name?: string;
};

export const useRegisterMutation = () => {
    const navigation :any = useNavigation()
    const {setProfile} = useUserProfileStore();
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await authRequest.post(
        `/auth/register`,
        payload
      );
      return data;
    },
    onSuccess: (response) => {
    if(!response.profile){
        return;
        }

        setAccessToken(response.accessToken);
        setRefreshToken(response.refreshToken);
        setProfile(response.profile);
        showMessage("Logged In Successfully!")
        navigation.reset({ index: 0, routes: [{ name: '(tabs)' }] });
    },
    onError : (error:any) => {
        console.log(error, 'error while registering...')
        showMessage(error.response.data.message || 'Something went wrong')
        // alert(error.response.data.message)
    }
});
};

