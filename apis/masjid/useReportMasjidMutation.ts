import { useMutation } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useReportMasjidMutation = () => {
  return useMutation({
    mutationFn: async ({ masjidId, reason }: { masjidId: string; reason: string }) => {
      const { data } = await mosqueRequest.post(
        `report/${masjidId}`,
        { reason }
      );
      return data;
    }
  });
};