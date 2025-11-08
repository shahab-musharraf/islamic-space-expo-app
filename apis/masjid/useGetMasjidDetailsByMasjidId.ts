import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetMasjidDetailsByMasjidId = (masjidId: string) => {

  const queryKey = [
    `nearByMasjids/${masjidId}`
  ];

  return useQuery({
    queryKey: queryKey, // cache key
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/${masjidId}`
      );
      return data;
    },
    retry: 5
  });
};
