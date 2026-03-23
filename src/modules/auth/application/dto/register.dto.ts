/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsArray,
  IsEnum,
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsDateString,
} from "class-validator";
import { RoleName } from "../../domain/entities/role.entity";
import { GenderEnum } from "../../domain/enums/gender.enum";

export class RegisterDto {
  // Información de la cuenta
  @IsEmail() email!: string;
  @IsString() username!: string;
  @IsString() @MinLength(6) password!: string;
  @IsArray() @IsEnum(RoleName, { each: true }) roles!: RoleName[];
  @IsString() id!: string;

  // Información personal del usuario
  @IsString() names!: string;
  @IsString() lastnames!: string;
  @IsEnum(GenderEnum) gender!: GenderEnum;
  @IsString() phone_number!: string;
  @IsDateString() born_date!: string;

  // Información de disponibilidad del doctor (opcional)
  @IsOptional()
  @IsArray()
  availability?: {
    date: string; // "YYYY-MM-DD"
    startTime: string; // "08:00"
    endTime: string; // "12:00"
    appointmentDuration: number; // minutos
  }[];

  @IsOptional()
  averageAppointmentDuration?: number;
}
