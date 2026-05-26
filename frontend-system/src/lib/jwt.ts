import { jwtDecode } from "jwt-decode";

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
};