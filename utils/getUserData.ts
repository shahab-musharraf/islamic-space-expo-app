import { getAccessToken } from "@/apis/_helpers/tokenStorage";
import { jwtDecode } from "jwt-decode";

export const getUserData = async () => {
    const accessToken = await getAccessToken();
    if(!accessToken) return null;
    return jwtDecode(accessToken);
}