import { useQuery } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useGetAllFavoriteMosque = (enabled:boolean) => {
  return useQuery({
    queryKey: ["useGetAllFavoriteMosque"], // cache key
    queryFn: async () => {
      const { data } = await authRequest.get(
        `/favorites`
      );
      return data;
    },
    enabled,
    retry: 1,
    
  });
};
