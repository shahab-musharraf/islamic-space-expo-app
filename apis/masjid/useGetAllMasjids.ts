import { useUserLocationStore } from "@/stores/userLocationStore";
import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllNearbyMasjids = (radius:string, limit: string, page: string, search:string) => {

  const { location } = useUserLocationStore();

  // 1. THE FIX: The queryKey MUST include all variables
  // that the query depends on.
  const queryKey = [
    "nearByMasjids",
    location?.coords.latitude,
    location?.coords.longitude,
    radius,
    limit,
    page,
    search,
  ];


  return useQuery({
    queryKey: queryKey, // cache key
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/all?latitude=${location?.coords.latitude}&longitude=${location?.coords.longitude}&radius=${radius}&limit=${limit}&page=${page}&search=${search}`
      );
      return data;
    },
    enabled: !!location?.coords.latitude && !!location.coords.longitude,
    retry: 5
  });
};
