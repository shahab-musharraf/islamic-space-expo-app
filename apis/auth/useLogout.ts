import { showMessage } from "@/utils/functions";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";
import { deleteAccessToken, deleteRefreshToken } from "../_helpers/tokenStorage";

export const useLogoutMutation = () => {
  const navigation :any = useNavigation()
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
      navigation.reset({ index: 0, routes: [{ name: 'auth/index' }] });
      
    },
    onError : (error:any) => {
      showMessage(error.response.data.message || 'Something went wrong')
      alert(error.response.data.message)
    }
  });
};