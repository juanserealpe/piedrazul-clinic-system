// src/keycloak/keycloak.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AppError } from '../errors/app-error.factory';
import { IKeycloakService } from './keycloak.interface';

@Injectable()
export class KeycloakService implements IKeycloakService {

  private baseUrl = process.env.KEYCLOAK_URL as string;
  private realm = process.env.KEYCLOAK_REALM as string;
  private clientId = process.env.KEYCLOAK_CLIENT_ID as string;
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET as string;

  isUserInRole(userId: string, roleName: string, token: string): Promise<boolean> {
    return axios.get(
      `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    .then(res => res.data.some((r: any) => r.name === roleName))
    .catch(error => {
      this.handleError(error, 'Error checking user role');
    });
  }
  

  private validateEnv() {
    if (!this.baseUrl || !this.realm || !this.clientId || !this.clientSecret) {
      throw AppError.internal('Missing Keycloak environment variables');
    }
  }

  private handleError(error: any, context: string): never {
    const status = error.response?.status;

    switch (status) {
      case 401:
        throw AppError.externalAuthError('Invalid Keycloak credentials');
      case 403:
        throw AppError.externalAuthError('Not enough permissions in Keycloak');
      case 404:
        throw AppError.notFound('Resource not found in Keycloak');
      case 409:
        throw AppError.conflict('Resource already exists');
      default:
        throw AppError.internal('Keycloak error');
    }
  }

  async getToken(): Promise<string> {
    this.validateEnv();

    const params = new URLSearchParams();
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('grant_type', 'client_credentials');

    try {
      const res = await axios.post(
        `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      return res.data.access_token;
    } catch (error) {
      this.handleError(error, 'Error getting token');
    }
  }

  async createUser(id: string, password: string, token: string, email?: string) {
    Logger.log(`Creating user in Keycloak: ${id}`);
    Logger.log(`Using token: ${token.substring(0, 10)}...`);


    try {
      await axios.post(
        `${this.baseUrl}/admin/realms/${this.realm}/users`,
        {
          username: id,
          enabled: true,
          email: email,
          emailVerified: true,
          credentials: [{ type: 'password', value: password, temporary: false }],
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      this.handleError(error, 'Error creating user');
    }
  }

  async getUserById(id: string, token: string) {
    try {
      const res = await axios.get(
        `${this.baseUrl}/admin/realms/${this.realm}/users`,
        {
          params: { username: id },
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return res.data[0];
    } catch (error) {
      this.handleError(error, 'Error getting user');
    }
  }

  async getRole(roleName: string, token: string) {
    try {
      const res = await axios.get(
        `${this.baseUrl}/admin/realms/${this.realm}/roles/${roleName}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data;
    } catch (error) {
      this.handleError(error, `Error getting role ${roleName}`);
    }
  }

  async assignRoles(userId: string, roles: any[], token: string) {
    try {
      await axios.post(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
        roles,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      this.handleError(error, 'Error assigning roles');
    }
  }

  async deleteUser(userId: string, token: string) {
    try {
      await axios.delete(
        `${this.baseUrl}/admin/realms/${this.realm}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
    } catch (error) {
      this.handleError(error, 'Error deleting user');
    }
  }

  async requestToken(params: URLSearchParams) {
  try {
    const res = await axios.post(
      `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`,
      params,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );

    return res.data;
  } catch (error) {
    this.handleError(error, 'Login failed');
  }
}

async login(id: string, password: string) {
  const params = new URLSearchParams();
  params.append('client_id', this.clientId);
  params.append('client_secret', this.clientSecret);
  params.append('grant_type', 'password');
  params.append('username', id);
  params.append('password', password);

  return this.requestToken(params);
}

async refreshToken(refreshToken: string) {
  const params = new URLSearchParams();
  params.append('client_id', this.clientId);
  params.append('client_secret', this.clientSecret);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);

  return this.requestToken(params);
}
}