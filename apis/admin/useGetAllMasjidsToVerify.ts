import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllMasjidsToVerify = () => {

  const queryKey = [
    `getMasjidDetailsToVerify/`
  ];

  return useQuery({
    queryKey: queryKey, // cache key
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/to-verify`
      );
      return data;
    },
    retry: 5
  });
};
