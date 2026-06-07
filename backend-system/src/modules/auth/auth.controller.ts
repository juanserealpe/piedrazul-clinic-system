import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LoginDto } from './dtos/login-dto';
import { LoginResponseDto } from './dtos/login-response-dto';
import { RefreshDto } from './dtos/refresh-dto';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user-dto';
import { UserResponseDto } from './dtos/user-response-dto';
import { JwtGuard } from 'src/common/auth/guards/jwt.guard';
import { Roles } from 'src/common/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/common/auth/guards/roles.guard';

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

  @Get('protected')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  protectedRoute() {
    return { message: 'Ok.' };
  }

  @Get('user-exists/:id')
  async userExists(
    @Param('id') id: string
  ): Promise<{ exists: boolean }> {
    const exists = await this.authService.userExists(id);
    return { exists };
  }
  @Get('all-doctors')
  async getAllDoctors() : Promise<{ id: string; name: string, lastnames: string }[]> {
    return this.authService.getAllDoctors();
  }
  @Get('all-patients')
  async getAllPatients() : Promise<{ id: string; name: string, lastnames: string }[]> {
    return this.authService.getAllPatients();
  }
  @Get('patient/:id')
  async getPatientById(@Param('id') id: string): Promise<{ id: string; name: string, lastnames: string } | null> {
    const a =  await this.authService.getPatientById(id);  
    console.log("GET PATIENT BY ID:", a);
    return a;
  }
}
