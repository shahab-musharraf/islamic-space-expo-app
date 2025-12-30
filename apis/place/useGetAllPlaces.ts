import { useQuery } from '@tanstack/react-query';
import mosqueRequest from '../_helpers/mosqueRequest';



export const useGetAllPlaces = () => {
  return useQuery({
    queryKey: ['place'],
    queryFn: async () => {
      const response = await mosqueRequest.get('/place');
      return response.data;
    },
  });
};