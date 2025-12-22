import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllMasjidsNeedCorrections = () => {

  const queryKey = [
    `getAllMasjidsNeedCorrections/`
  ];

  return useQuery({
    queryKey: queryKey, // cache key
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/need-corrections`
      );
      return data;
    },
    retry: 2
  });
};
