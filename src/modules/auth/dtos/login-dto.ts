import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(100, { message: 'Email too long' })
  email: string;

  @IsString()
  @MaxLength(100, { message: 'Password too long' })
  password: string;
}