// src/apis/user/useRequestRoleChange.ts
import { useMutation } from '@tanstack/react-query';
import mosqueRequest from './_helpers/mosqueRequest';

export const useRequestRoleChange = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await mosqueRequest.post('secretary/request-access', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
  });
};
