/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsArray, IsEnum, IsEmail, IsString, MinLength } from "class-validator";
import { RoleName } from "../../domain/entities/role.entity";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsArray()
  @IsEnum(RoleName, { each: true })
  roles!: RoleName[];
}
