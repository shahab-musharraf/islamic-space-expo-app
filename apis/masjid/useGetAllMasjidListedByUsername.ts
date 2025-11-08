import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllMasjidsListedByUsername = (username:string) => {

  const queryKey = [
    "masjid",
    username
  ];


  return useQuery({
    queryKey: queryKey,

    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/added-by/${username}`
      );
      return data;
    },
    retry: 3
  });
};
