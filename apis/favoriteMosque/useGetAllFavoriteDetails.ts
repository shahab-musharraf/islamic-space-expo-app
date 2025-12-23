import { useFavoriteMasjidStore } from "@/stores/useFavoriteMasjidStore";
import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetAllFavoriteDetails = () => {
  const { favorites } = useFavoriteMasjidStore();


  return useQuery({
    queryKey: ["favoriteMasjidDetails", favorites], // 🔑 depend on favorites
    enabled: Array.isArray(favorites) && favorites.length > 0, // ✅ correct way
    retry: 1,

    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        "/masjid/favorites/details",
         {
          params: {
            masjidIds: favorites, // ✅ sent as query params
          },
        }
      );
      return data;
    },
  });
};
