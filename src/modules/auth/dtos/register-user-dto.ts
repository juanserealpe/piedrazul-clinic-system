import { IsEmail, IsString, MinLength, Matches, IsOptional, IsArray, IsEnum, ArrayNotEmpty, ArrayMaxSize, IsIn, MaxLength, IsDateString } from 'class-validator';

export class RegisterUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(100, { message: 'Email too long' })
  @MinLength(5, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password too short' })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Password must contain 1 uppercase and 1 number',
  })
  @MaxLength(100, { message: 'Password too long' })
  password: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Roles must not be empty' })
  @ArrayMaxSize(5, { message: 'Too many roles provided' }) 
  @IsString({ each: true })
  @IsIn(['ADMIN', 'PATIENT', 'SCHEDULER', 'DOCTOR'], {
  each: true,
  message: 'Invalid role',
  })
  roles: string[];

  @IsString()
  @MinLength(2, { message: 'Names too short' })
  @MaxLength(50, { message: 'Names too long' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'Names can only contain letters and spaces',
  })
  names!: string;

  @IsString()
  @MinLength(2, { message: 'Lastnames too short' })
  @MaxLength(50, { message: 'Lastnames too long' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'Lastnames can only contain letters and spaces',
  })
  lastnames!: string;

  @IsIn(['F', 'M', 'OTHER'], {
    message: 'Invalid gender',
  })
  gender!: string;

  @IsString()
  @Matches(/^\+?[0-9]{7,15}$/, {
    message: 'Invalid phone number format',
  })
  phone_number!: string;

  @IsDateString({}, {
    message: 'Invalid date format (ISO required)',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be YYYY-MM-DD',
  })
  born_date!: string;
}