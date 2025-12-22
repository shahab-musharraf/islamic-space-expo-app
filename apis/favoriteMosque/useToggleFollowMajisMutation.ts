

import { useMutation } from "@tanstack/react-query";
import authRequest from "../_helpers/api";

export const useToggleFollowMajisMutation = () => {
  return useMutation({
    mutationFn: async ({masjidId, follow} : {masjidId: string, follow: boolean}) => {
      const { data } = await authRequest.post(
        `favorites/follow-toggle/${masjidId}`, null, {params: {follow}}
      );
      return data;
    }
  });
};
