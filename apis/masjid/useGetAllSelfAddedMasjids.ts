import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllSelfAddedMasjids = () => {

  const queryKey = [
    "masjid/self-added"
  ];


  return useQuery({
    queryKey: queryKey,

    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `masjid/self-added`
      );
      return data;
    },
    retry: 3
  });
};
