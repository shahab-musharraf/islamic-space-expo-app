// utils/getDecodedToken.ts
import { jwtDecode } from 'jwt-decode';

export const decodeJwt = (token: string) => {
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};
