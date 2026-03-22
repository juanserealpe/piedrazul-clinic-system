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
    email!: string;
    password!: string;
}
