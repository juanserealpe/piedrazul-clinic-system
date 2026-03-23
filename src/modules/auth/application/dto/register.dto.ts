import { RoleName } from "../../domain/entities/role.entity.js";

/**
 * DTO for user registration.
 *
 * Example request body:
 * {
 *   "email": "doctor@piedrazul.com",
 *   "username": "dr_garcia",
 *   "password": "securePass123",
 *   "roles": ["DOCTOR"]
 * }
 */
export class RegisterDto {
  email!: string;
  username!: string;
  password!: string;
  roles!: RoleName[];
}
