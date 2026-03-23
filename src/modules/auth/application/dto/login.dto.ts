import { IsEmail, IsNotEmpty } from "class-validator";

/**
 * DTO for user login.
 *
 * Example request body:
 * {
 *   "email": "doctor@piedrazul.com",
 *   "password": "securePass123"
 * }
 */
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}
