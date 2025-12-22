

import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useRemoveMasjidFromFavoriteMutation = () => {
  return useMutation({
    mutationFn: async (masjidId: string) => {
      const { data } = await authRequest.delete(
        `favorites/${masjidId}`
      );
      return data;
    }
  });
};
