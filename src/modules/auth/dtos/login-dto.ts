import { IsEmail, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class LoginDto {

  @IsString()
  @MinLength(6, { message: 'User ID is required' })
  @MaxLength(11, { message: 'User ID too long' })
  id: string;

  @IsString()
  @MaxLength(100, { message: 'Password too long' })
  password: string;
}