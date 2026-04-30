import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from './dtos/login-dto';
import { LoginResponseDto } from './dtos/login-response-dto';
import { RefreshDto } from './dtos/refresh-dto';
import { RolesGuard } from 'src/common/auth/guards/roles.guard';
import { JwtGuard } from 'src/common/auth/guards/jwt.guard';
import { Roles } from 'src/common/auth/decorators/roles.decorator';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user-dto';
import { UserResponseDto } from './dtos/user-response-dto';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
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