import { useMutation, useQueryClient } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

// Define the arguments the mutate function will accept
interface ApproveMasjidUpdate {
  masjidId: string;
}

export const useApproveUpdateMasjidMutation = () => {
  // Get the query client to invalidate lists after a successful action
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The mutation function receives the arguments from the component
    mutationFn: async ({ masjidId }: ApproveMasjidUpdate) => {
      const { data } = await mosqueRequest.post(
        `masjid/aprrove-update/${masjidId}`,
      );
      return data;
    },

    // Optional: Add logic for error handling here (onError)
  });
};