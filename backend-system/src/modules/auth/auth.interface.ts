import { LoginDto } from "./dtos/login-dto";
import { LoginResponseDto } from "./dtos/login-response-dto";
import { RefreshDto } from "./dtos/refresh-dto";
import { RegisterUserDto } from "./dtos/register-user-dto";
import { UserResponseDto } from "./dtos/user-response-dto";

export interface IAuthService {
  register(dto: RegisterUserDto): Promise<UserResponseDto>;
  login(dto: LoginDto): Promise<LoginResponseDto>;
  refresh(dto: RefreshDto): Promise<LoginResponseDto>;
  isUserInRole(userId: string, roleName: string): Promise<boolean>;
  userExists(id: string): Promise<boolean>;
  getAllDoctors(): Promise<{ id: string; name: string, lastnames: string }[]>;
  getAllPatients(): Promise<{ id: string; name: string, lastnames: string }[]>;
}