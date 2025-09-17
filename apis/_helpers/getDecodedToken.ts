// utils/getDecodedToken.ts
import { jwtDecode } from 'jwt-decode';

export const decodeJwt = (token: string) => {
  try {
    console.log(jwtDecode(token), 'Decoded access token -- getDecodedToken.ts')
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};
