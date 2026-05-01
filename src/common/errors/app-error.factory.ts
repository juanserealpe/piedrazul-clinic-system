import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ErrorCodes } from './error-codes';

export const AppError = {

  userAlreadyExists: () =>
    new ConflictException({
      code: ErrorCodes.USER_ALREADY_EXISTS,
      message: 'User already exists',
    }),

  userNotFound: () =>
    new NotFoundException({
      code: ErrorCodes.USER_NOT_FOUND,
      message: 'User not found',
    }),

  roleNotFound: (role: string) =>
    new BadRequestException({
      code: ErrorCodes.ROLE_NOT_FOUND,
      message: `Role ${role} not found`,
    }),

  externalAuthError: (message?: string) =>
    new UnauthorizedException({
      code: ErrorCodes.EXTERNAL_AUTH_ERROR,
      message: message || 'Authentication with external provider failed',
    }),

  forbidden: (message?: string) =>
    new ForbiddenException({
      code: ErrorCodes.FORBIDDEN,
      message: message || 'Access denied',
    }),

  conflict: (message?: string) =>
    new ConflictException({
      code: ErrorCodes.CONFLICT,
      message: message || 'Conflict error',
    }),

  notFound: (message?: string) =>
    new NotFoundException({
      code: ErrorCodes.NOT_FOUND,
      message: message || 'Resource not found',
    }),

  keycloakError: (detail?: string) =>
    new InternalServerErrorException({
      code: ErrorCodes.KEYCLOAK_ERROR,
      message: 'Keycloak error',
      detail,
    }),

  internal: (message?: string) =>
    new InternalServerErrorException({
      code: ErrorCodes.INTERNAL_ERROR,
      message: message || 'Internal server error',
    }),
};