import { useQuery } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useGetUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"], // cache key
    queryFn: async () => {
      const { data } = await authRequest.get(
        `${process.env.EXPO_PUBLIC_AUTH_SERVICE}/profile`
      );
      return data;
    },
    retry: 5
  });
};
