import { useQuery } from '@tanstack/react-query';
import mosqueRequest from './_helpers/mosqueRequest';



export const useGetSecretaryRequestStatus = () => {
  return useQuery({
    queryKey: [`/secretary/request-status/`],
    queryFn: async () => {
      const response = await mosqueRequest.get(`secretary/request-status`);
      return response.data;
    },
  });
};