

import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useAddMasjidToFavoriteMutation = () => {
  return useMutation({
    mutationFn: async (masjidId: string) => {
      const { data } = await authRequest.post(
        `favorites/${masjidId}`
      );
      return data;
    }
  });
};
