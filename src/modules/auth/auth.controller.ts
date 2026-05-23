import { Body, Controller, Post} from '@nestjs/common';
import { LoginDto } from './dtos/login-dto';
import { LoginResponseDto } from './dtos/login-response-dto';
import { RefreshDto } from './dtos/refresh-dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user-dto';
import { UserResponseDto } from './dtos/user-response-dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) : Promise<UserResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) : Promise<LoginResponseDto> { 
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }
}