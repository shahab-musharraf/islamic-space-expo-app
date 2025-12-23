import { useQuery } from "@tanstack/react-query";
import mosqueRequest from "../_helpers/mosqueRequest";

export const useGetBudgetNeededMasjids = (limit: string = "10", city: string = "India") => {
  const queryKey = [
    "budgetNeededMasjids",
    limit,
    city
  ];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data } = await mosqueRequest.get(
        `/masjid/budget-needed?limit=${limit}&city=${encodeURIComponent(city)}`
      );
      return data;
    },
    retry: 3,
  });
};