export interface IKeycloakService {
  getToken(): Promise<string>;
  createUser(email: string, password: string, token: string): Promise<void>;
  getUserByEmail(email: string, token: string): Promise<any>;
  getRole(roleName: string, token: string): Promise<any>;
  assignRoles(userId: string, roles: any[], token: string): Promise<void>;
  deleteUser(userId: string, token: string): Promise<void>;
  login(email: string, password: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
  isUserInRole(userId: string, roleName: string, token: string): Promise<boolean>;
}