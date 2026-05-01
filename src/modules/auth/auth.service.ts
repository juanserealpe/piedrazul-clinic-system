import { Injectable } from '@nestjs/common';
import { Console } from 'console';
import { AppError } from 'src/common/errors/app-error.factory';
import { LoginDto } from './dtos/login-dto';
import { LoginResponseDto } from './dtos/login-response-dto';
import { RefreshDto } from './dtos/refresh-dto';
import { IAuthService } from './auth.interface';
import { UserRepository } from './persistence/user.repository';
import { UserMapper } from './persistence/user.mapper';
import { KeycloakService } from 'src/common/keycloak/keycloak.service';
import { RegisterUserDto } from './dtos/register-user-dto';
import { UserResponseDto } from './dtos/user-response-dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly kc: KeycloakService,
    private readonly userRepo: UserRepository
  ) {}

async login(dto: LoginDto): Promise<LoginResponseDto> {
  try {
    const tokens = await this.kc.login(dto.id, dto.password);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  } catch {
    this.logger.error('Invalid credentials');
    throw AppError.externalAuthError('Invalid credentials');
  }
}

async register(dto: RegisterUserDto): Promise<UserResponseDto> {
  const token = await this.kc.getToken();
  await this.ensureUserNotExists(dto.id, token);
  const roles = await this.validateRoles(dto.roles || [], token);
  const user = await this.createUserInKeycloak(dto, token);
  await this.saveUserOrRollback(dto, user.id, token);
  await this.assignRolesOrRollback(user.id, roles, token);
  return this.buildResponse(user, roles);
}

async refresh(dto: RefreshDto): Promise<LoginResponseDto> {
  try {
    Logger.log(`Refresh token attempt for token: ${dto.refreshToken}`);
    const res = await this.kc.refreshToken(dto.refreshToken);
    Logger.log(`Token refreshed successfully`);
    return {
      accessToken: res.access_token,
      refreshToken: res.refresh_token,
    };
  } catch {
    this.logger.error('Invalid refresh token');
    throw AppError.externalAuthError('Invalid refresh token');
  }
}

private async validateRoles(roleNames: string[], token: string) {
  Logger.log(`Validating roles: ${roleNames.join(', ')}`);
  const roles = await Promise.all(
    roleNames.map(async (name) => {
      try {
        Logger.log(`Validating role: ${name}`);
        return await this.kc.getRole(name, token);
      } catch {
        Logger.error(`Role not found: ${name}`);
        throw AppError.roleNotFound(name);
      }
    }),
  );
  return roles;
}

private async ensureUserNotExists(id: string, token: string) {
    Logger.log(`Checking if user exists: ${id}`);
    const exists = await this.kc.getUserById(id, token).catch(() => null);
    if (exists) {
      Logger.error(`User already exists: ${id}`);
      throw AppError.userAlreadyExists();
    }
}

private async createUserInKeycloak(dto: RegisterUserDto, token: string) {
  Logger.log(`Creating user in Keycloak: ${dto.id}`);
    await this.kc.createUser(dto.id, dto.password, token, dto.email);
    Logger.log(`User created in Keycloak: ${dto.id}`);
    const user = await this.kc.getUserById(dto.id, token);
    Logger.log(`User retrieved from Keycloak: ${user.id}`);
    if (!user) {
      Logger.error(`User not found after creation: ${dto.id}`);
      throw AppError.userNotFound();
    }

    return user;
}

private async saveUserOrRollback(dto: RegisterUserDto, userId: string, token: string) {
  Logger.log(`Saving user in DB: ${userId}`);
  try {
    await this.userRepo.create(
      UserMapper.toOrm({
        id: dto.id,
        uuid: userId,
        email: dto.email || '',
        names: dto.names,
        lastnames: dto.lastnames,
        gender: dto.gender,
        phoneNumber: dto.phone_number,
        bornDate: new Date(dto.born_date),
      })
    );
  } catch {
    await this.kc.deleteUser(userId, token);
    throw AppError.internal('Database error');
  }
  Logger.log(`User saved in DB successfully: ${userId}`);
}

private async assignRolesOrRollback(userId: string, roles: any[], token: string) {
  Logger.log(`Assigning roles to user: ${userId}`);
  try {
    if (roles.length) {
      Logger.log(`Assigning roles to user: ${userId}`);
      await this.kc.assignRoles(userId, roles, token);
      Logger.log(`Roles assigned successfully to user: ${userId}`);
    }
  } catch {
    Logger.error(`Role assignment failed for user: ${userId}`);
     await this.kc.deleteUser(userId, token);
     throw AppError.keycloakError('Role assignment failed');
  }
}

private buildResponse(user: any, roles: any[]): UserResponseDto {
  Logger.log(`Building response for user: ${user.id}`);
  return {
    keycloakId: user.id,
    email: user.email,
    roles: roles.map(r => r.name),
  };
}

}