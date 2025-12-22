import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllMasjidsForUpdateReview = () => {

  const queryKey = [
    `useGetAllMasjidsForUpdateReview`
  ];

  return useQuery({
    queryKey: queryKey, // cache key
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/new-update-review`
      );
      return data;
    },
    retry: 2
  });
};
