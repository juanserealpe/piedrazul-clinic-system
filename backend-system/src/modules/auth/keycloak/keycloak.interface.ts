export interface IKeycloakService {
  getToken(): Promise<string>;
  createUser(email: string, password: string, token: string): Promise<void>;
  getUserById(id: string, token: string): Promise<any>;
  getRole(roleName: string, token: string): Promise<any>;
  assignRoles(userId: string, roles: any[], token: string): Promise<void>;
  deleteUser(userId: string, token: string): Promise<void>;
  login(id: string, password: string): Promise<any>;
  refreshToken(refreshToken: string): Promise<any>;
}