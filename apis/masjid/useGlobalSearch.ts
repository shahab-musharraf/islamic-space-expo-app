import { useQuery } from '@tanstack/react-query';
import mosqueRequest from '../_helpers/mosqueRequest';

export interface GlobalSearchResult {
  _id: string;
  name: string;
  address: string;
  image: string | null;
}

export const useGlobalSearch = (search: string) => {
  return useQuery<GlobalSearchResult[]>({
    queryKey: ['globalSearch', search],
    queryFn: async () => {
      const response = await mosqueRequest.get('/masjid/global-search', {
        params: { q: search },
      });
      return response.data;
    },
    enabled: search.trim().length > 2, // Only search if more than 2 chars
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};