import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetMasjidDetailsToUpdate = (masjidId: string) => {

  const queryKey = [
    `getMasjidDetailsToUpdate/${masjidId}`
  ];

  return useQuery({
    queryKey: queryKey, // cache key
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/${masjidId}/to-update`
      );
      return data;
    },
    enabled: !!masjidId,
    retry: 5
  });
};
