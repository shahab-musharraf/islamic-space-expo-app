import { useFavoriteMasjidStore } from "@/stores/useFavoriteMasjidStore";
import { useUserLocationStore } from "@/stores/userLocationStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { showMessage } from "@/utils/functions";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";
import { deleteAccessToken, deleteRefreshToken } from "../_helpers/tokenStorage";

export const useLogoutMutation = () => {
  const navigation :any = useNavigation();
  const { clearProfile } = useUserProfileStore();
  const { clearLocation } = useUserLocationStore();
  const { reset } = useFavoriteMasjidStore();
  return useMutation({
    mutationFn: async () => {
      const { data } = await authRequest.post(
        `${process.env.EXPO_PUBLIC_AUTH_SERVICE}/auth/logout`
      );
      return data;
    },
    onSuccess: (response) => {                                         
      deleteAccessToken()
      deleteRefreshToken()
      showMessage("Logged Out Successfully!")
      clearLocation();
      clearProfile();
      reset();
      navigation.reset({ index: 0, routes: [{ name: 'auth/index' }] });
      
    },
    onError : (error:any) => {
      showMessage(error.response.data.message || 'Something went wrong')
      deleteAccessToken()
      deleteRefreshToken()
      clearProfile();
      clearLocation();
      reset();
      navigation.reset({ index: 0, routes: [{ name: 'auth/index' }] });
      alert(error.response.data.message)
    }
  });
};