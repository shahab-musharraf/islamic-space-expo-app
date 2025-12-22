import { useMutation, useQueryClient } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

// Define the arguments the mutate function will accept
interface RejectMasjidUpdate {
  masjidId: string;
  reason: string;
}

export const useRejectUpdateMasjidMutation = () => {
  // Get the query client to invalidate lists after a successful action
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The mutation function receives the arguments from the component
    mutationFn: async ({ masjidId, reason }: RejectMasjidUpdate) => {
      const { data } = await mosqueRequest.post(
        `masjid/reject-update/${masjidId}`, 
        { reason }
      );
      return data;
    },
  });
};