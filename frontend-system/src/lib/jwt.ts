/*import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  id?: string;

  roles?: string[];

  realm_access?: {
    roles: string[];
  };

  exp: number;
}

export const decodeToken = (token: string) => {
  return jwtDecode<JwtPayload>(token);
};*/
import { jwtDecode } from "jwt-decode";

export interface JwtPayload {
  id?: string;
  preferred_username?: string;
  sub?: string;
  roles?: string[];
  realm_access?: {
    roles: string[];
  };
  exp: number;
}

export const decodeToken = (token: string) => {
  const decoded = jwtDecode<JwtPayload>(token);
  if (!decoded.id && decoded.preferred_username) {
    decoded.id = decoded.preferred_username;
  }
  return decoded;
};