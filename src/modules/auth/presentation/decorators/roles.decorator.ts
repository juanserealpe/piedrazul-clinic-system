import { SetMetadata } from "@nestjs/common";
import { RoleName } from "../../domain/entities/role.entity.js";

export const ROLES_KEY = "roles";

/**
 * Decorator to specify which roles are allowed to access an endpoint.
 * Usage: @Roles('ADMIN', 'DOCTOR')
 */
export const Roles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
