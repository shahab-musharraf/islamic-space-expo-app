import { useMutation, useQueryClient } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

// Define the arguments the mutate function will accept
interface VerifyMasjidArgs {
  masjidId: string;
  verify: boolean;
  reason: string;
}

export const useVerifyMasjidMutation = () => {
  // Get the query client to invalidate lists after a successful action
  const queryClient = useQueryClient();

  return useMutation({
    // 1. The mutation function receives the arguments from the component
    mutationFn: async ({ masjidId, verify, reason }: VerifyMasjidArgs) => {
      const { data } = await mosqueRequest.post(
        `/masjid/${masjidId}/verify`, 
        { verify, reason }
      );
      return data;
    },
    
    // 2. Invalidate the list of masjids to verify upon success
    onSuccess: () => {
      // Assuming your list of masjids to verify uses this key
      queryClient.invalidateQueries({ queryKey: ['masjidsToVerify'] }); 
      // You may also want to invalidate the 'verifiedMasjids' list
    },

    // Optional: Add logic for error handling here (onError)
  });
};