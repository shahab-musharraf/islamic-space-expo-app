import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetBudgetNeededMasjids = (limit: string = "10") => {
  const queryKey = [
    "budgetNeededMasjids",
    limit
  ];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/budget-needed?limit=${limit}`
      );
      return data;
    },
    retry: 3,
  });
};