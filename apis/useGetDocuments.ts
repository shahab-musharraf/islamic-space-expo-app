import { useQuery } from '@tanstack/react-query';
import authRequest from './_helpers/api';

export interface Document {
  name: string;
  url: string;
}

export const useGetDocuments = () => {
  return useQuery<Document[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await authRequest.get('/documents');
      return response.data;
    },
  });
};